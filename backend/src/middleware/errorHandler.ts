import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
	constructor(public status: number, message: string) {
		super(message);
	}
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
	if (err instanceof AppError) {
		return res.status(err.status).json({error: err.message});
	}

	if (err instanceof ZodError) {
		return res
			.status(400)
			.json({ error: "Datos no válidos", details: err.issues });
	}

	if (err?.code === "23505") {
		const message = 
			err.constraint === "products_national_code_key"
			? "Ya existe un producto con ese CN"
			: "Ya existe un registro con ese valor";
		return res.status(409).json({ error: message });
	}

	// JSON mal formado en el cuerpo de la petición
	if (err?.type === "entity.parse.failed") {
		return res.status(400).json({ error: "JSON no válido" });
	}

	// NOT NULL o CHECK violados
	if (err?.code === "23502" || err?.code === "23514") {
		return res.status(400).json({ error: "Datos no válidos" });
	}

	// Clave foránea (cuando haya ventas o pedidos asociados)
	if (err?.code === "23503") {
		return res
		.status(409)
		.json({ error: "No se puede completar: hay registros asociados" });
	}

	console.error(err);
	res.status(500).json({ error: "Error del servidor" });
};