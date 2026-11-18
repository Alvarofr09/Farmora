import express from "express";
import cors from "cors";
import products from "./routes/products";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/products", products);

app.listen(process.env.PORT || 3001, () =>
	console.log("API en http://localhost:3001")
);