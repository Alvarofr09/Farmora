import { useState } from "react";
import axios from "axios";
import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
	getProducts, getProductsByNameOrNationalCode, createProduct, updateProduct, deleteProduct, type Product,
} from "../api/products";
import { useDebounce } from "../hooks/useDebounce";

const empty = { name: "", national_code: "", price: "", stock:"0" };

export default function Products() {
	const [form, setForm] = useState(empty);
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search.trim(), 300);
	const [editingId, setEditingId] = useState<number | null>(null);

	const qc = useQueryClient();
	const { data, isLoading, error } = useQuery({
		queryKey: ["products", debouncedSearch],
		queryFn: () => ( debouncedSearch ? getProductsByNameOrNationalCode(debouncedSearch) : getProducts() ),
		placeholderData: keepPreviousData,
	});
	

	const refresh = () => qc.invalidateQueries({ queryKey: ["products"]});

	const save = useMutation({
		mutationFn: () => {
			const payload = {
				name: form.name,
				national_code: form.national_code || undefined,
				price: Number(form.price),
				stock: Number(form.stock),
			};
			return editingId
				? updateProduct(editingId, payload)
				: createProduct(payload);
		},
		onSuccess: () => {
			refresh();
			setForm(empty);
			setEditingId(null);
		}
	});

	const saveError = save.isError
		? axios.isAxiosError(save.error)
			? save.error.response?.data?.error ?? "Error al guardar el producto"
			: "Error al guardar el producto"
		: null;

	const remove = useMutation({ mutationFn: deleteProduct, onSuccess: refresh });

	const startEdit = (p: Product) => {
		save.reset();
		setEditingId(p.id);
		setForm({
			name: p.name,
			national_code: p.national_code || "",
			price: p.price,
			stock: String(p.stock),
		});
	};

	return (
		<>
			<input
				type="text"
				placeholder="Buscar producto..."
				value={search}
				onChange={(e) => setSearch(e.target.value)}
			/>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					save.mutate();
				}}
			>
				<input placeholder="Nombre" required value={form.name}
					onChange={(e) => setForm({ ...form, name: e.target.value })} />
				<input placeholder="CN" required value={form.national_code}
					onChange={(e) => {setForm({ ...form, national_code: e.target.value }); save.reset()}} />
				<input placeholder="Precio" type="number" step="0.01" required
					value={form.price}
					onChange={(e) => setForm({ ...form, price: e.target.value })} />
				<input placeholder="Stock" type="number" required
					value={form.stock}
					onChange={(e) => setForm({ ...form, stock: e.target.value })} />
				<button type="submit">{editingId ? "Guardar Cambios" : "Crear Producto"}</button>
				{editingId && (
					<button type="button" onClick={() => { setEditingId(null); setForm(empty); save.reset();}}>
						Cancelar
					</button>
				)}
			</form>
			<p className="text-muted">
				{saveError && <p className="text-muted">{saveError}</p>}
			</p>
			<table>
				<thead>
					<tr>
						<th>Nombre</th>
						<th>CN</th>
						<th>Precio</th>
						<th>Stock</th>
						<th>Acciones</th>
					</tr>
				</thead>
				{isLoading ? (
					<tbody>
						<tr><td colSpan={5}>Cargando...</td></tr>
					</tbody>
				) : error ? (
					<tbody>
						<tr><td colSpan={5}>Error al cargar los productos</td></tr>
					</tbody>
				) : data && data.length > 0 ? (
					<tbody>
						{data.map((p) => (
							<tr key={p.id}>
								<td>{p.name}</td>
								<td>{p.national_code}</td>
								<td>{Number(p.price).toFixed(2)} €</td>
								<td>{p.stock}</td>
								<td>
									<button onClick={() => startEdit(p)}>Editar</button>
									<button onClick={() => remove.mutate(p.id)}>Borrar</button>
								</td>
							</tr>
						))}
					</tbody>
				) : (
					<tbody>
						<tr><td colSpan={6}>No se encontraron productos.</td></tr>
					</tbody>
				)}
			</table>
		</>
	)
}