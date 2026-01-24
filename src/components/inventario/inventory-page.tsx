"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ProductForm from "./form-productos";
import { EstadisticasInventario } from "./estadisticas-inventario";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Package,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle
} from "lucide-react";

import type { Product } from "../../app/(protected)/types/produc";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// Interfaz local para Categoría
interface Category {
  id: number;
  name: string;
}

export default function TablaInventarioEjemplo() {
  const { data: session, status } = useSession();

  const [productos, setProductos] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]); // Estado para categorías
  const [loading, setLoading] = useState(true);

  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("all");
  const [mostrarStockBajo, setMostrarStockBajo] = useState(false);

  // Modales
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productoABorrar, setProductoABorrar] = useState<Product | null>(null);
  const [borrando, setBorrando] = useState(false);

  const [paginaActual, setPaginaActual] = useState(1);
  const [productosPorPagina, setProductosPorPagina] = useState(10);

  // --- 1. CARGAR DATOS (Productos y Categorías) ---
  const fetchData = useCallback(async () => {
    if (status !== "authenticated" || !session?.user?.accessToken) return;

    try {
      setLoading(true);

      // Llamada paralela a Productos y Categorías (usando tu ruta /categorys)
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`${API_URL}/products`, {
          headers: { Authorization: `Bearer ${session.user.accessToken}` },
        }),
        fetch(`${API_URL}/categorys`, { // <--- Ruta original
          headers: { Authorization: `Bearer ${session.user.accessToken}` },
        })
      ]);

      // Manejo de sesión
      if (productsRes.status === 401 || categoriesRes.status === 401) {
        await signIn();
        return;
      }

      // Procesar Categorías
      if (categoriesRes.ok) {
        const catData = await categoriesRes.json();
        setCategoriesList(Array.isArray(catData.data) ? catData.data : (Array.isArray(catData) ? catData : []));
      }

      // Procesar Productos
      if (!productsRes.ok) throw new Error("Error cargando productos");

      const prodData = await productsRes.json();
      const listaBackend = Array.isArray(prodData) ? prodData : (prodData.data || []);

      const productosMapeados = listaBackend.map((item: any) => ({
        id: item.id,
        nombre_producto: item.name || item.nombre_producto || "Sin Nombre",
        // Aquí extraemos el nombre de la categoría del objeto relacionado
        categoria: item.category?.name || item.category?.nombre || "General",
        stock_actual: Number(item.stock ?? item.stock_actual ?? 0),
        stock_minimo: Number(item.minStock ?? item.stock_minimo ?? 0),
        precio_venta: Number(item.price ?? item.precio_venta ?? 0),
        marca: item.brand || "Genérico", // Si tienes campo marca
      }));

      setProductos(productosMapeados);

    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  }, [session, status]);

  // --- 2. BORRAR PRODUCTO ---
  const confirmarBorrado = async () => {
    if (!productoABorrar || !session?.user?.accessToken) return;
    setBorrando(true);
    try {
      const response = await fetch(`${API_URL}/products/${productoABorrar.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${session.user.accessToken}` },
      });

      if (!response.ok) throw new Error("Error al eliminar");

      setProductos((prev) => prev.filter((p) => p.id !== productoABorrar.id));
      setProductoABorrar(null);
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar el producto");
    } finally {
      setBorrando(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchData();
    else if (status === "unauthenticated") setLoading(false);
  }, [status, fetchData]);

  // --- FILTROS ---
  const productosFiltrados = productos.filter((producto) => {
    const busqueda = terminoBusqueda.toLowerCase();
    const coincideTexto = producto.nombre_producto.toLowerCase().includes(busqueda);
    // Comparamos el nombre de la categoría del producto con el seleccionado
    const coincideCategoria = categoriaSeleccionada === "all" || producto.categoria === categoriaSeleccionada;
    const coincideStock = !mostrarStockBajo || producto.stock_actual <= producto.stock_minimo;
    return coincideTexto && coincideCategoria && coincideStock;
  });

  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
  const indiceInicio = (paginaActual - 1) * productosPorPagina;
  const productosPaginados = productosFiltrados.slice(indiceInicio, indiceInicio + productosPorPagina);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6 fade-in duration-500">
      <EstadisticasInventario productos={productos} />

      <Card className="shadow-sm border-none bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-gray-800">Inventario General</CardTitle>
              <CardDescription>Gestión y control de existencias en tiempo real</CardDescription>
            </div>
            <Button onClick={() => setIsFormOpen(true)} className="bg-primary shadow-md hover:shadow-lg transition-all">
              <Plus className="h-4 w-4 mr-2" /> Nuevo Producto
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre..."
                value={terminoBusqueda}
                onChange={(e) => setTerminoBusqueda(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>

            {/* SELECT DINÁMICO DE CATEGORÍAS */}
            <Select value={categoriaSeleccionada} onValueChange={setCategoriaSeleccionada}>
              <SelectTrigger className="w-full sm:w-48 bg-white">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categoriesList.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={mostrarStockBajo ? "destructive" : "outline"}
              onClick={() => setMostrarStockBajo(!mostrarStockBajo)}
              className={mostrarStockBajo ? "bg-red-50 text-red-600 border-red-200" : "bg-white"}
            >
              <AlertTriangle className={`h-4 w-4 mr-2 ${mostrarStockBajo ? "text-red-600" : ""}`} />
              {mostrarStockBajo ? "Viendo Stock Bajo" : "Filtrar Stock Bajo"}
            </Button>
          </div>

          <div className="rounded-lg border bg-white overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold">Producto</TableHead>
                  <TableHead className="font-semibold">Categoría</TableHead>
                  <TableHead className="font-semibold">Stock</TableHead>
                  <TableHead className="font-semibold">Precio</TableHead>
                  <TableHead className="text-right font-semibold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && productos.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground"><Loader2 className="inline h-6 w-6 animate-spin" /> Cargando...</TableCell></TableRow>
                ) : productosPaginados.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-10 w-10 opacity-20" />
                      <span>No se encontraron productos.</span>
                    </div>
                  </TableCell></TableRow>
                ) : (
                  productosPaginados.map((producto) => (
                    <TableRow key={producto.id} className="group hover:bg-gray-50 transition-colors">
                      <TableCell>
                        <div className="font-medium text-gray-900">{producto.nombre_producto}</div>
                        <div className="text-xs text-gray-500 uppercase">{producto.marca}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal bg-gray-100 text-gray-600">
                          {producto.categoria}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${producto.stock_actual <= producto.stock_minimo ? "text-red-600" : "text-emerald-600"}`}>
                            {producto.stock_actual}
                          </span>
                          {producto.stock_actual <= producto.stock_minimo && (
                            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" title="Stock Crítico" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        Bs. {producto.precio_venta.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-600 hover:bg-blue-50" onClick={() => handleEdit(producto)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setProductoABorrar(producto)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4 px-2">
            <div className="text-xs text-muted-foreground">
              Página {paginaActual} de {totalPaginas || 1}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPaginaActual(p => Math.max(1, p - 1))} disabled={paginaActual === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))} disabled={paginaActual === totalPaginas}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MODAL BORRADO */}
      <Dialog open={!!productoABorrar} onOpenChange={(open) => !open && setProductoABorrar(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" /> Eliminar Producto
            </DialogTitle>
            <DialogDescription>
              ¿Eliminar <strong>{productoABorrar?.nombre_producto}</strong>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProductoABorrar(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmarBorrado} disabled={borrando}>
              {borrando ? <Loader2 className="animate-spin h-4 w-4" /> : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ProductForm
        isOpen={isFormOpen}
        onCloseAction={() => { setIsFormOpen(false); setEditingProduct(null); }}
        editingProduct={editingProduct}
        onSuccessAction={fetchData}
      />
    </div>
  );
}