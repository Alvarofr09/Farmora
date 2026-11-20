import { Router } from "express";
import { pool } from "../db/pool";
import { AppError } from "../middleware/errorHandler";
import { asyncHandler } from "../middleware/asyncHandler";
import { idSchema, productSchema } from "../schemas/product";

const router = Router();

// Escapa % _ \ para que el usuario no use comodines de ILIKE
const escapeLike = (value: string) => value.replace(/[\\%_]/g, "\\$&");

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const { rows } = await pool.query("SELECT * FROM products ORDER BY id");
    res.json(rows);
  })
);

router.get(
  "/search/:busqueda",
  asyncHandler(async (req, res) => {
    const term = `%${escapeLike(String(req.params.busqueda).trim())}%`;
    const { rows } = await pool.query(
      `SELECT * FROM products
       WHERE name ILIKE $1 OR national_code ILIKE $1
       ORDER BY id`,
      [term]
    );
    res.json(rows);
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = productSchema.parse(req.body);
    const { rows } = await pool.query(
      `INSERT INTO products (name, national_code, price, stock)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [data.name, data.national_code, data.price, data.stock]
    );
    res.status(201).json(rows[0]);
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const data = productSchema.parse(req.body);
    const { rows } = await pool.query(
      `UPDATE products
       SET name = $1, national_code = $2, price = $3, stock = $4
       WHERE id = $5 RETURNING *`,
      [data.name, data.national_code, data.price, data.stock, id]
    );
    if (!rows[0]) throw new AppError(404, "Producto no encontrado");
    res.json(rows[0]);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const { rowCount } = await pool.query(
      "DELETE FROM products WHERE id = $1",
      [id]
    );
    if (!rowCount) throw new AppError(404, "Producto no encontrado");
    res.status(204).end();
  })
);

export default router;