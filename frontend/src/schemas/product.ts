import * as z from "zod";

export const productSchema = z.object ({
	name: z
		.string()
		.trim()
		.min(1, "El nombre es obligatorio")
		.max(100, "Máximo 100 caracteres"),
	national_code: z
		.string()
		.trim()
		.length(6, "El CN debe tener 6 dígitos")
		.regex(/^[0-9]+$/, "El CN solo puede contener números"),
	price: z
		.number({ error: "Introduce un precio válido"})
		.positive("El precio debe ser mayor que 0")
		.max(99999.99, "Precio demsaiado alto")
		.refine(
			(v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-8,
			"Máximo 2 decimales"
		),
	stock: z
		.number({ error: "Introduce un stock válido" })
		.int("El stock debe ser un número entero")
		.nonnegative("El stock no puede ser negativo"),
});

export type ProductFormValues = z.infer<typeof productSchema>;