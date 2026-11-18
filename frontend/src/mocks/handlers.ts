import { http, HttpResponse } from "msw";
import type { Product } from "../api/products";

let products: Product[] = [
	{ id: 1, name: "Paracetamol 1g", national_code: "650001", price: "2.50", stock: 40 },
	{ id: 2, name: "Ibuprofeno 600mg", national_code: "650002", price: "3.90", stock: 25 },
	{ id: 3, name: "Omeoprazol 20mg", national_code: "650003", price: "4.80", stock: 12 },
];

let nextId = 4;

export const handlers = [
	http.get("*/products", () => HttpResponse.json(products)),

	http.get("*/products/search/:busqueda", ({ params }) => {
		const { busqueda } = params;
		const filteredProducts = products.filter((p) => 
			p.national_code?.includes(String(busqueda)) || p.name.toLocaleLowerCase().includes(String(busqueda).toLowerCase())
		);
		return HttpResponse.json(filteredProducts);
	}),

	http.post("*/products", async ({ request }) => {
		const body = (await request.json()) as any;
		const product = {id: nextId++, ...body, price: Number(body.price).toFixed(2)};
		products.push(product);
		return HttpResponse.json(product, { status: 201 });
	}),

	http.put("*/products/:id", async ({ request, params }) => {
		const body = (await request.json()) as any;
		const id = Number(params.id);
		products = products.map((p) => 
			p.id = id ? { ...p, ...body, price: Number(body.price).toFixed(2) } : p
		);
		return HttpResponse.json(products.find((p) => p.id === id));
	}),

	http.delete("*/products/:id" , ({ params }) => {
		products = products.filter((p) => p.id !== Number(params.id));
		return new HttpResponse(null, { status: 204 });
	}),
];