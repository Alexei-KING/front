"use client";

import { useEffect, useState } from "react";

type Producto = {
  id: number;
  nombre_producto: string;
  descripcion: string;
  marca: string;
  categoria: string;
  subcategoria: string;
  stock_actual: number;
  precio_compra: string;
  precio_venta: string;
  unidades_por_bulto: number;
  fecha_actualizacion: string;
};

export default function FacturacionProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/inventario/listar-inventory/"
        );
        if (!response.ok) throw new Error("Error al cargar productos");
        const data = await response.json();
        setProductos(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Lista de Productos</h2>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Nombre</th>
              <th className="border px-2 py-1">Marca</th>
              <th className="border px-2 py-1">Categoría</th>
              <th className="border px-2 py-1">Subcategoría</th>
              <th className="border px-2 py-1">Stock</th>
              <th className="border px-2 py-1">Precio Venta</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id}>
                <td className="border px-2 py-1">{p.id}</td>
                <td className="border px-2 py-1">{p.nombre_producto}</td>
                <td className="border px-2 py-1">{p.marca}</td>
                <td className="border px-2 py-1">{p.categoria}</td>
                <td className="border px-2 py-1">{p.subcategoria}</td>
                <td className="border px-2 py-1">{p.stock_actual}</td>
                <td className="border px-2 py-1">{p.precio_venta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
