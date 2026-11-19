import { Router } from "express";
import { z }  from "zod";
import { pool } from "../db/pool";
import errorHandler = require("../middleware/errorHandler");

const router = Router();

const productSchema = z.object({
	name: z.string().min(1),
	national_code: z.string().optional(),
	price: z.coerce.number().nonnegative(),
	stock: z.coerce.number().int().nonnegative().default(0),
});

router.get("/", async (_req, res) => {
	const { rows } = await pool.query("SELECT * FROM products ORDER BY id");
	res.json(rows);
});

router.get("/search/:busqueda", async (req, res) => {
	const { rows } = await pool.query("SELECT * FROM products WHERE national_code ILIKE $1 OR name ILIKE $1", [`%${req.params.busqueda}%`]);
	res.json(rows);
});

router.post("/" , async (req, res) => {
	const data = productSchema.parse(req.body);
	const { rows } = await pool.query(
		`INSERT INTO products (name, national_code, price, stock)
		VALUES ($1, $2, $3, $4) RETURNING *`,
		[data.name, data.national_code, data.price, data.stock]
	);
	res.status(201).json(rows[0]);
});

router.put("/:id", async (req, res) =>  {
	const data = productSchema.partial().parse(req.body);
	const { rows } = await pool.query(
		`UPDATE products SET name=$1, national_code=$2, price=$3, stock=$4
		WHERE id=$5 RETURNING *`,
		[data.name, data.national_code?.trim(), data.price, data.stock, req.params.id]
	);
	if (!rows[0]) throw new errorHandler.AppError(404, "Producto no encontrado");
	res.json(rows[0]);
});

router.delete("/:id", async (req, res) => {
	await pool.query("DELETE FROM products WHERE id=$1", [req.params.id]);
	res.status(204).end();
});

export default router;