
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
    Search,
    Plus,
    Pencil,
    Trash2,
    Package,
    Boxes,
    X,
    Save,
    LoaderCircle,
    AlertCircle,
    CheckCircle2,
    PackageOpen,
} from "lucide-react";
import axios from "axios";
import type { z } from "zod";

import {
    getProducts,
    getProductsByNameOrNationalCode,
    createProduct,
    updateProduct,
    deleteProduct,
    type Product,
} from "../api/products";

import { useDebounce } from "../hooks/useDebounce";
import { productSchema } from "../schemas/product";

type ProductFormValues = z.infer<typeof productSchema>;

const empty: ProductFormValues = {
    name: "",
    national_code: "",
    price: undefined as unknown as number,
    stock: 0,
};

export default function Products() {
    const [search, setSearch] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);

    const debouncedSearch = useDebounce(search.trim(), 300);
    const qc = useQueryClient();

    // Formulario
    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors },
    } = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: empty,
        mode: "onTouched",
    });

    // Obtener productos
    const { data, isLoading, error } = useQuery({
        queryKey: ["products", debouncedSearch],
        queryFn: () =>
            debouncedSearch
                ? getProductsByNameOrNationalCode(debouncedSearch)
                : getProducts(),
        placeholderData: keepPreviousData,
    });

    // Actualizar listado
    const refresh = () =>
        qc.invalidateQueries({ queryKey: ["products"] });

    // Crear / actualizar producto
    const save = useMutation({
        mutationFn: (values: ProductFormValues) =>
            editingId
                ? updateProduct(editingId, values)
                : createProduct(values),

        onSuccess: () => {
            refresh();
            reset(empty);
            setEditingId(null);
        },

        onError: (error) => {
            if (
                axios.isAxiosError(error) &&
                error.response?.status === 409
            ) {
                setError("national_code", {
                    type: "server",
                    message:
                        error.response.data?.error ??
                        "Este código nacional ya existe",
                });
            }
        },
    });

    // Error general
    const saveError =
        save.isError &&
        !(
            axios.isAxiosError(save.error) &&
            save.error.response?.status === 409
        )
            ? axios.isAxiosError(save.error)
                ? save.error.response?.data?.error ??
                  "Error al guardar el producto"
                : "Error al guardar el producto"
            : null;

    // Eliminar producto
    const remove = useMutation({
        mutationFn: deleteProduct,
        onSuccess: refresh,
    });

    // Preparar edición
    const startEdit = (product: Product) => {
        save.reset();

        setEditingId(product.id);

        reset({
            name: product.name,
            national_code: product.national_code,
            price: Number(product.price),
            stock: Number(product.stock),
        });
    };

    // Cancelar edición
    const cancelEdit = () => {
        setEditingId(null);
        reset(empty);
        save.reset();
    };

    // Enviar formulario
    const onSubmit = (values: ProductFormValues) => {
        save.mutate(values);
    };

    // Estadísticas del listado actual
    const totalProducts = data?.length ?? 0;

    const totalStock =
        data?.reduce((total, product) => total + Number(product.stock), 0) ?? 0;

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">

            <div className="mx-auto max-w-7xl space-y-8">

                {/* CABECERA */}
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
                            <Package size={17} />
                            Gestión de inventario
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Productos
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Administra tus productos, precios y existencias.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <Boxes size={19} />
                        </div>

                        <div>
                            <p className="text-xs text-slate-500">
                                Productos encontrados
                            </p>
                            <p className="text-lg font-bold text-slate-900">
                                {totalProducts}
                            </p>
                        </div>
                    </div>
                </div>

                {/* TARJETAS DE ESTADÍSTICAS */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Productos
                                </p>
                                <p className="mt-2 text-2xl font-bold text-slate-900">
                                    {totalProducts}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                    Registros del listado actual
                                </p>
                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <Package size={23} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Unidades en stock
                                </p>
                                <p className="mt-2 text-2xl font-bold text-slate-900">
                                    {totalStock.toLocaleString("es-ES")}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                    Unidades del listado actual
                                </p>
                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <Boxes size={23} />
                            </div>
                        </div>
                    </div>

                </div>

                {/* FORMULARIO */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">

                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                            editingId
                                ? "bg-amber-50 text-amber-600"
                                : "bg-blue-50 text-blue-600"
                        }`}>
                            {editingId ? <Pencil size={19} /> : <Plus size={21} />}
                        </div>

                        <div>
                            <h2 className="font-semibold text-slate-900">
                                {editingId ? "Editar producto" : "Nuevo producto"}
                            </h2>
                            <p className="text-xs text-slate-500">
                                {editingId
                                    ? "Modifica los datos del producto seleccionado."
                                    : "Introduce los datos para añadir un producto al inventario."}
                            </p>
                        </div>

                    </div>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        noValidate
                        className="space-y-5 p-6"
                    >

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                            {/* NOMBRE */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Nombre del producto
                                </label>

                                <input
                                    {...register("name")}
                                    placeholder="Ej. Paracetamol 1g"
                                    className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                                        errors.name
                                            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                                    }`}
                                />

                                {errors.name && (
                                    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                                        <AlertCircle size={13} />
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            {/* CN */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Código nacional (CN)
                                </label>

                                <input
                                    {...register("national_code")}
                                    placeholder="Ej. 123456"
                                    className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                                        errors.national_code
                                            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                                    }`}
                                />

                                {errors.national_code && (
                                    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                                        <AlertCircle size={13} />
                                        {errors.national_code.message}
                                    </p>
                                )}
                            </div>

                            {/* PRECIO */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Precio
                                </label>

                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register("price", {
                                            valueAsNumber: true,
                                        })}
                                        placeholder="0.00"
                                        className={`w-full rounded-xl border bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                                            errors.price
                                                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                                : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                                        }`}
                                    />

                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                                        €
                                    </span>
                                </div>

                                {errors.price && (
                                    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                                        <AlertCircle size={13} />
                                        {errors.price.message}
                                    </p>
                                )}
                            </div>

                            {/* STOCK */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Stock inicial
                                </label>

                                <input
                                    type="number"
                                    {...register("stock", {
                                        valueAsNumber: true,
                                    })}
                                    placeholder="0"
                                    className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                                        errors.stock
                                            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                                    }`}
                                />

                                {errors.stock && (
                                    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                                        <AlertCircle size={13} />
                                        {errors.stock.message}
                                    </p>
                                )}
                            </div>

                        </div>

                        {/* ERROR GENERAL */}
                        {saveError && (
                            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                <AlertCircle size={17} />
                                {saveError}
                            </div>
                        )}

                        {/* BOTONES */}
                        <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-5 sm:flex-row">

                            {editingId && (
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                                >
                                    <X size={17} />
                                    Cancelar
                                </button>
                            )}

                            <button
                                type="submit"
                                disabled={save.isPending}
                                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {save.isPending ? (
                                    <LoaderCircle size={17} className="animate-spin" />
                                ) : editingId ? (
                                    <Save size={17} />
                                ) : (
                                    <Plus size={18} />
                                )}

                                {save.isPending
                                    ? "Guardando..."
                                    : editingId
                                        ? "Guardar cambios"
                                        : "Crear producto"}
                            </button>

                        </div>

                    </form>
                </div>

                {/* LISTADO */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    {/* CABECERA DEL LISTADO */}
                    <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center">

                        <div>
                            <h2 className="font-semibold text-slate-900">
                                Listado de productos
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Consulta y administra los productos registrados.
                            </p>
                        </div>

                        <div className="relative w-full sm:max-w-xs">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                placeholder="Buscar por nombre o CN..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                            />
                        </div>

                    </div>

                    {/* TABLA */}
                    <div className="overflow-x-auto">

                        <table className="w-full min-w-175 text-left text-sm">

                            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Producto</th>
                                    <th className="px-6 py-4 font-semibold">Código nacional</th>
                                    <th className="px-6 py-4 font-semibold">Precio</th>
                                    <th className="px-6 py-4 font-semibold">Stock</th>
                                    <th className="px-6 py-4 text-right font-semibold">Acciones</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">

                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center">
                                            <LoaderCircle
                                                size={25}
                                                className="mx-auto animate-spin text-blue-600"
                                            />
                                            <p className="mt-3 text-sm text-slate-500">
                                                Cargando productos...
                                            </p>
                                        </td>
                                    </tr>

                                ) : error ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center">
                                            <AlertCircle
                                                size={28}
                                                className="mx-auto text-red-500"
                                            />
                                            <p className="mt-3 font-medium text-slate-700">
                                                Error al cargar los productos
                                            </p>
                                            <p className="mt-1 text-sm text-slate-400">
                                                Comprueba tu conexión e inténtalo de nuevo.
                                            </p>
                                        </td>
                                    </tr>

                                ) : data && data.length > 0 ? (

                                    data.map((product) => (
                                        <tr
                                            key={product.id}
                                            className={`transition hover:bg-slate-50 ${
                                                editingId === product.id
                                                    ? "bg-blue-50/60"
                                                    : ""
                                            }`}
                                        >

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                                        <Package size={19} />
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-slate-800">
                                                            {product.name}
                                                        </p>
                                                        <p className="mt-0.5 text-xs text-slate-400">
                                                            ID #{product.id}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 font-mono text-xs text-slate-600">
                                                    {product.national_code}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 font-semibold text-slate-800">
                                                {Number(product.price).toFixed(2)} €
                                            </td>

                                            <td className="px-6 py-4">
                                                {Number(product.stock) <= 0 ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                                        Sin stock
                                                    </span>
                                                ) : Number(product.stock) <= 5 ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                        {product.stock} unidades
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                                                        <CheckCircle2 size={13} />
                                                        {product.stock} unidades
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">

                                                    <button
                                                        type="button"
                                                        onClick={() => startEdit(product)}
                                                        title="Editar producto"
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (
                                                                window.confirm(
                                                                    `¿Seguro que quieres eliminar ${product.name}?`
                                                                )
                                                            ) {
                                                                remove.mutate(product.id);
                                                            }
                                                        }}
                                                        disabled={remove.isPending}
                                                        title="Eliminar producto"
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>

                                                </div>
                                            </td>

                                        </tr>
                                    ))

                                ) : (

                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center">
                                            <PackageOpen
                                                size={35}
                                                className="mx-auto text-slate-300"
                                            />

                                            <p className="mt-3 font-medium text-slate-700">
                                                No se encontraron productos
                                            </p>

                                            <p className="mt-1 text-sm text-slate-400">
                                                {search
                                                    ? "Prueba con otro nombre o código nacional."
                                                    : "Todavía no has añadido ningún producto."}
                                            </p>
                                        </td>
                                    </tr>

                                )}

                            </tbody>
                        </table>
                    </div>

                    {/* PIE DE TABLA */}
                    <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
                        <p className="text-xs text-slate-500">
                            Mostrando <span className="font-semibold text-slate-700">{totalProducts}</span> productos
                        </p>
                    </div>

                </div>

            </div>
        </div>
    );
}
