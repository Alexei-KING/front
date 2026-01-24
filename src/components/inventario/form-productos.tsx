"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Product } from "../../app/(protected)/types/produc";
import { Loader2, Save } from "lucide-react";

<<<<<<< HEAD
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// Interfaz para las categorías que vienen de TU api
interface Category {
  id: number;
  name: string;
}
=======
// Configuración centralizada
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const CATEGORIAS = ["Papel", "Escritura", "Archivo", "Oficina", "Escolar"];
>>>>>>> 8cccc43d8bd31a1e93c709de33c34516c5fafa72

interface ProductFormProps {
  isOpen: boolean;
  onCloseAction: () => void;
  editingProduct?: Product | null;
  onSuccessAction: () => void;
}

export default function ProductForm({
  isOpen,
  onCloseAction,
  editingProduct,
  onSuccessAction,
}: ProductFormProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

<<<<<<< HEAD
  // Estado para almacenar las categorías traídas de la API
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);

  // ESTADO DEL FORMULARIO
  const initialState = {
    nombre_producto: "",
    categoryId: "", // Guardamos el ID como string para el Select
=======
  // ESTADO LIMPIO: Solo lo que el Backend permite guardar
  const initialState = {
    nombre_producto: "",
    categoria: "",
>>>>>>> 8cccc43d8bd31a1e93c709de33c34516c5fafa72
    stock_actual: 0,
    stock_minimo: 5,
    precio_venta: 0,
  };

  const [formData, setFormData] = useState(initialState);

<<<<<<< HEAD
  // 1. CARGAR CATEGORIAS DESDE LA API (Tal cual como la tienes: /categorys)
  useEffect(() => {
    if (isOpen && session?.user?.accessToken) {
      fetch(`${API_URL}/categorys`, { // <--- OJO: Ruta original 'categorys'
        headers: { Authorization: `Bearer ${session.user.accessToken}` },
      })
        .then((res) => res.json())
        .then((res) => {
          // Tu API devuelve { message: "...", data: [...] } o directamente el array
          const data = res.data || res;
          setCategoriesList(Array.isArray(data) ? data : []);
        })
        .catch((err) => console.error("Error cargando categorías:", err));
    }
  }, [isOpen, session]);

  // 2. CARGAR DATOS AL EDITAR
  useEffect(() => {
    if (isOpen) {
      if (editingProduct) {
        // Buscamos el ID de la categoría basado en el nombre (si el producto trae el nombre)
        // O idealmente, tu endpoint de productos debería devolver el categoryId.
        // Aquí asumimos un mapeo simple o que editingProduct ya trae el ID.

        // Nota: Si editingProduct solo trae el nombre de la categoría, intentamos buscarla en la lista
        const foundCat = categoriesList.find(c => c.name === editingProduct.categoria);

        setFormData({
          nombre_producto: editingProduct.nombre_producto,
          categoryId: foundCat ? foundCat.id.toString() : "",
=======
  // Cargar datos al editar
  useEffect(() => {
    if (isOpen) {
      if (editingProduct) {
        setFormData({
          nombre_producto: editingProduct.nombre_producto,
          categoria: editingProduct.categoria,
>>>>>>> 8cccc43d8bd31a1e93c709de33c34516c5fafa72
          stock_actual: editingProduct.stock_actual,
          stock_minimo: editingProduct.stock_minimo,
          precio_venta: editingProduct.precio_venta,
        });
      } else {
        setFormData(initialState);
      }
    }
<<<<<<< HEAD
  }, [isOpen, editingProduct, categoriesList]); // Añadido categoriesList para re-sincronizar si llegan tarde
=======
  }, [isOpen, editingProduct]);
>>>>>>> 8cccc43d8bd31a1e93c709de33c34516c5fafa72

  const handleSubmit = async () => {
    if (!session?.user?.accessToken) return alert("Sesión expirada");

<<<<<<< HEAD
    if (formData.nombre_producto.length < 3) return alert("El nombre debe tener al menos 3 letras");
    if (!formData.categoryId) return alert("Selecciona una categoría");
=======
    // Validaciones simples
    if (formData.nombre_producto.length < 3) return alert("El nombre debe tener al menos 3 letras");
    if (!formData.categoria) return alert("Selecciona una categoría");
>>>>>>> 8cccc43d8bd31a1e93c709de33c34516c5fafa72
    if (formData.precio_venta <= 0) return alert("El precio debe ser mayor a 0");

    setLoading(true);

    try {
      const isEditing = !!editingProduct;
      const url = isEditing
        ? `${API_URL}/products/${editingProduct.id}`
        : `${API_URL}/products`;

      const method = isEditing ? "PATCH" : "POST";

<<<<<<< HEAD
=======
      // --- TRADUCCIÓN (FRONTEND -> BACKEND) ---
      // Calculamos el ID de la categoría (1, 2, 3...) basado en la selección
      const categoryIndex = CATEGORIAS.indexOf(formData.categoria);
      const categoryIdParaEnviar = categoryIndex >= 0 ? categoryIndex + 1 : 1;

      // PAYLOAD LIMPIO: Solo enviamos lo que el backend acepta
>>>>>>> 8cccc43d8bd31a1e93c709de33c34516c5fafa72
      const payload = {
        name: formData.nombre_producto,
        price: Number(formData.precio_venta),
        stock: Number(formData.stock_actual),
        minStock: Number(formData.stock_minimo),
<<<<<<< HEAD
        categoryId: Number(formData.categoryId), // Enviamos el ID real de la API
      };

      console.log("📤 Enviando a la API:", payload);
=======
        categoryId: categoryIdParaEnviar,
      };

      console.log("📤 Guardando:", payload);
>>>>>>> 8cccc43d8bd31a1e93c709de33c34516c5fafa72

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
<<<<<<< HEAD
        // Manejo robusto de errores de NestJS
        const msg = Array.isArray(errorData.message)
          ? errorData.message.join(", ")
          : errorData.message || errorData.error;
        throw new Error(msg || "Error al procesar");
      }

      onSuccessAction();
      onCloseAction();
=======
        const msg = Array.isArray(errorData.message) ? errorData.message.join(", ") : errorData.message;
        throw new Error(msg || "Error al procesar");
      }

      onSuccessAction(); // Recargar tabla
      onCloseAction();   // Cerrar modal
>>>>>>> 8cccc43d8bd31a1e93c709de33c34516c5fafa72

    } catch (error: any) {
      console.error(error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCloseAction}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
          <DialogDescription>
<<<<<<< HEAD
            Los datos se guardarán directamente en la base de datos.
=======
            Ingrese los datos básicos del inventario.
>>>>>>> 8cccc43d8bd31a1e93c709de33c34516c5fafa72
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
<<<<<<< HEAD
=======

>>>>>>> 8cccc43d8bd31a1e93c709de33c34516c5fafa72
          {/* Nombre */}
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre del Producto</Label>
            <Input
              id="name"
              value={formData.nombre_producto}
              onChange={(e) => setFormData({ ...formData, nombre_producto: e.target.value })}
              placeholder="Ej: Resma de Papel"
              autoFocus
            />
          </div>

<<<<<<< HEAD
          {/* Categoría y Precio */}
=======
          {/* Categoría y Precio (en fila) */}
>>>>>>> 8cccc43d8bd31a1e93c709de33c34516c5fafa72
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Categoría</Label>
              <Select
<<<<<<< HEAD
                value={formData.categoryId}
                onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {categoriesList.length === 0 ? (
                    <SelectItem value="0" disabled>Cargando categorías...</SelectItem>
                  ) : (
                    categoriesList.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))
                  )}
=======
                value={formData.categoria}
                onValueChange={(val) => setFormData({ ...formData, categoria: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
>>>>>>> 8cccc43d8bd31a1e93c709de33c34516c5fafa72
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">Precio (Bs)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.precio_venta}
                onChange={(e) => setFormData({ ...formData, precio_venta: Number(e.target.value) })}
              />
            </div>
          </div>

<<<<<<< HEAD
          {/* Stocks */}
=======
          {/* Stock Actual y Mínimo (en fila) */}
>>>>>>> 8cccc43d8bd31a1e93c709de33c34516c5fafa72
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="stock">Stock Actual</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock_actual}
                onChange={(e) => setFormData({ ...formData, stock_actual: Number(e.target.value) })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="minStock">Stock Mínimo</Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                value={formData.stock_minimo}
                onChange={(e) => setFormData({ ...formData, stock_minimo: Number(e.target.value) })}
              />
            </div>
          </div>
<<<<<<< HEAD
=======

>>>>>>> 8cccc43d8bd31a1e93c709de33c34516c5fafa72
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCloseAction} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-primary">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Guardar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}