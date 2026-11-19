import "dotenv/config";
import { Pool, types } from "pg";

types.setTypeParser(1700, (value) => parseFloat(value));

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });