import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(100, "Máximo 100 caracteres"),
  national_code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "El CN debe tener 6 dígitos"),
  price: z
    .number()
    .positive("El precio debe ser mayor que 0")
    .max(99999.99, "Precio demasiado alto")
    .refine(
      (v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-8,
      "Máximo 2 decimales"
    ),
  stock: z
    .number()
    .int("El stock debe ser un número entero")
    .nonnegative("El stock no puede ser negativo"),
});

export const idSchema = z.coerce.number().int().positive();