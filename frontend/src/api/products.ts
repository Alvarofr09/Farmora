import axios from "axios";

const client = axios.create({ baseURL: import.meta.env.VITE_API_URL });

export type Product = {
	id: number;
	name: string;
	national_code: string | null;
	price: string; // PostgreSQL returns numeric as string
	stock: number;
}

export const getProducts = () =>
	client.get<Product[]>("/products").then((r) => r.data);

export type ProductInput = {
	name: string;
	national_code?: string;
	price: number;
	stock: number;
}

export const getProductsByNameOrNationalCode = (busqueda: string) =>
	client.get<Product[]>(`/products/search/${encodeURIComponent(busqueda)}`).then((r) => r.data);

export const createProduct = (data: ProductInput) => 
	client.post<Product>("/products", data).then((r) => r.data);

export const updateProduct = (id: number, data: ProductInput) => 
	client.put<Product>(`/products/${id}`, data).then ((r) => r.data);

export const deleteProduct = (id: number) => client.delete(`/products/${id}`);