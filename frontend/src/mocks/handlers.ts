import { http, HttpResponse } from "msw";
import type { Product } from "../api/products";

let products: Product[] = [
  { id: 1, name: "Paracetamol 1g", national_code: "650001", price: "2.50", stock: 40 },
  { id: 2, name: "Ibuprofeno 600mg", national_code: "650002", price: "3.90", stock: 25 },
  { id: 3, name: "Omeprazol 20mg", national_code: "650003", price: "4.80", stock: 12 },
];
let nextId = 4;

const clean = (v: unknown) => String(v ?? "").trim();

const isDuplicated = (cn: string, excludeId?: number) =>
  cn !== "" &&
  products.some(
    (p) => p.id !== excludeId && p.national_code?.toLowerCase() === cn.toLowerCase()
  );

const conflict = () =>
  HttpResponse.json({ error: "Ya existe un producto con ese CN" }, { status: 409 });

export const handlers = [
  http.get("*/products/search/:busqueda", ({ params }) => {
    const q = clean(params.busqueda).toLowerCase();
    const result = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.national_code ?? "").toLowerCase().includes(q)
    );
    return HttpResponse.json(result);
  }),

  http.get("*/products", () => HttpResponse.json(products)),

  http.post("*/products", async ({ request }) => {
    const body = (await request.json()) as any;
    const cn = clean(body.national_code);
    if (isDuplicated(cn)) return conflict();

    const product: Product = {
      id: nextId++,
      name: clean(body.name),
      national_code: cn || null,
      price: Number(body.price).toFixed(2),
      stock: Number(body.stock),
    };
    products.push(product);
    return HttpResponse.json(product, { status: 201 });
  }),

  http.put("*/products/:id", async ({ request, params }) => {
    const id = Number(params.id);
    const body = (await request.json()) as any;
    const cn = clean(body.national_code);
    if (!products.some((p) => p.id === id)) {
      return HttpResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    if (isDuplicated(cn, id)) return conflict();

    const updated: Product = {
      id,
      name: clean(body.name),
      national_code: cn || null,
      price: Number(body.price).toFixed(2),
      stock: Number(body.stock),
    };
    products = products.map((p) => (p.id === id ? updated : p));
    return HttpResponse.json(updated);
  }),

  http.delete("*/products/:id", ({ params }) => {
    products = products.filter((p) => p.id !== Number(params.id));
    return new HttpResponse(null, { status: 204 });
  }),
];