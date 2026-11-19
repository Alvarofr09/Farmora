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

	console.error(err);
	res.status(500).json({ error: "Error del servidor" });
};