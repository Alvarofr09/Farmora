import { errorHandler } from './middleware/errorHandler';
import express from "express";
import cors from "cors";
import "dotenv/config";

import products from "./routes/products";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/products", products);

app.use((_req, res) => res.status(404).json({ error: "Ruta no encontrada" }));
app.use(errorHandler);

app.listen(process.env.PORT || 3001, () =>
	console.log("API en http://localhost:3001")
);