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
const CATEGORIAS = ["Papel", "Escritura", "Archivo", "Oficina", "Escolar"];

export default function TablaInventarioEjemplo() {
  const { data: session, status } = useSession();

  const [productos, setProductos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("all");
  const [mostrarStockBajo, setMostrarStockBajo] = useState(false);

  // Modales
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Estado para el Modal de Borrado
  const [productoABorrar, setProductoABorrar] = useState<Product | null>(null);
  const [borrando, setBorrando] = useState(false);

  const [paginaActual, setPaginaActual] = useState(1);
  const [productosPorPagina, setProductosPorPagina] = useState(10);

  // --- 1. CARGAR DATOS ---
  const fetchProductos = useCallback(async () => {
    if (status !== "authenticated" || !session?.user?.accessToken) return;

    try {
      const response = await fetch(`${API_URL}/products`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.accessToken}`,
        },
      });

      // Manejo automático de sesión vencida
      if (response.status === 401) {
        console.log("Sesión vencida, redirigiendo...");
        await signIn();
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const listaBackend = Array.isArray(data) ? data : (data.data || []);

      const productosMapeados = listaBackend.map((item: any) => ({
        id: item.id,
        nombre_producto: item.nombre_producto || item.name || "Sin Nombre",
        descripcion: item.descripcion || item.description || "",
        marca: item.marca || item.brand || "Genérico",
        categoria: typeof item.category === 'object' ? item.category?.name : (item.categoria || item.category || "General"),
        subcategoria: item.subcategoria || item.subcategory || "",
        stock_actual: Number(item.stock_actual ?? item.stock ?? 0),
        stock_minimo: Number(item.stock_minimo ?? item.minStock ?? 0),
        precio_compra: Number(item.precio_compra ?? item.purchasePrice ?? 0),
        precio_venta: Number(item.precio_venta ?? item.price ?? 0),
        unidades_por_bulto: Number(item.unidades_por_bulto ?? 0),
        fecha_actualizacion: item.fecha_actualizacion || "",
      }));

      setProductos(productosMapeados);
    } catch (error) {
      console.error("Error cargando inventario:", error);
    } finally {
      setLoading(false);
    }
  }, [session, status]);

  // --- 2. BORRAR PRODUCTO ---
  const solicitarBorrado = (producto: Product) => {
    setProductoABorrar(producto);
  };

  const confirmarBorrado = async () => {
    if (!productoABorrar || !session?.user?.accessToken) return;

    setBorrando(true);
    try {
      // USAMOS LA RUTA CORRECTA DIRECTAMENTE: /products (Plural)
      const response = await fetch(`${API_URL}/products/${productoABorrar.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${session.user.accessToken}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Error desconocido" }));
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      // Éxito: Quitamos de la lista local
      setProductos((prev) => prev.filter((p) => p.id !== productoABorrar.id));
      setProductoABorrar(null);

    } catch (error: any) {
      console.error(error);
      alert(`No se pudo eliminar: ${error.message}`);
    } finally {
      setBorrando(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchProductos();
    else if (status === "unauthenticated") setLoading(false);
  }, [status, fetchProductos]);

  // --- FILTROS Y RENDER ---
  const productosFiltrados = productos.filter((producto) => {
    const busqueda = terminoBusqueda.toLowerCase();
    const coincideTexto =
      producto.nombre_producto?.toLowerCase().includes(busqueda) ||
      producto.marca?.toLowerCase().includes(busqueda);
    const coincideCategoria = categoriaSeleccionada === "all" || producto.categoria === categoriaSeleccionada;
    const coincideStock = !mostrarStockBajo || producto.stock_actual <= producto.stock_minimo;

    return coincideTexto && coincideCategoria && coincideStock;
  });

  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
  const indiceInicio = (paginaActual - 1) * productosPorPagina;
  const productosPaginados = productosFiltrados.slice(indiceInicio, indiceInicio + productosPorPagina);

  useEffect(() => { setPaginaActual(1); }, [terminoBusqueda, categoriaSeleccionada, mostrarStockBajo]);
  const cambiarPagina = (pag: number) => { if (pag >= 1 && pag <= totalPaginas) setPaginaActual(pag); };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  if (status === "loading") return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

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
                placeholder="Buscar por nombre, marca..."
                value={terminoBusqueda}
                onChange={(e) => setTerminoBusqueda(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
            <Select value={categoriaSeleccionada} onValueChange={setCategoriaSeleccionada}>
              <SelectTrigger className="w-full sm:w-48 bg-white"><SelectValue placeholder="Categoría" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {CATEGORIAS.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
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
                  <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground">Sincronizando...</TableCell></TableRow>
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
                            onClick={() => solicitarBorrado(producto)}
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
              <Button variant="outline" size="sm" onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => cambiarPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MODAL DE CONFIRMACIÓN */}
      <Dialog open={!!productoABorrar} onOpenChange={(open) => !open && setProductoABorrar(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Eliminar Producto
            </DialogTitle>
            <DialogDescription className="pt-2">
              ¿Estás seguro que deseas eliminar <strong>{productoABorrar?.nombre_producto}</strong>?
              <br /><br />
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setProductoABorrar(null)} disabled={borrando}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmarBorrado} disabled={borrando}>
              {borrando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Eliminando...
                </>
              ) : (
                "Sí, Eliminar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ProductForm
        isOpen={isFormOpen}
        onCloseAction={handleCloseForm}
        editingProduct={editingProduct}
        onSuccessAction={fetchProductos}
      />
    </div>
  );
}