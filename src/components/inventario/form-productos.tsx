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

// Configuración centralizada
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const CATEGORIAS = ["Papel", "Escritura", "Archivo", "Oficina", "Escolar"];

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

  // ESTADO LIMPIO: Solo lo que el Backend permite guardar
  const initialState = {
    nombre_producto: "",
    categoria: "",
    stock_actual: 0,
    stock_minimo: 5,
    precio_venta: 0,
  };

  const [formData, setFormData] = useState(initialState);

  // Cargar datos al editar
  useEffect(() => {
    if (isOpen) {
      if (editingProduct) {
        setFormData({
          nombre_producto: editingProduct.nombre_producto,
          categoria: editingProduct.categoria,
          stock_actual: editingProduct.stock_actual,
          stock_minimo: editingProduct.stock_minimo,
          precio_venta: editingProduct.precio_venta,
        });
      } else {
        setFormData(initialState);
      }
    }
  }, [isOpen, editingProduct]);

  const handleSubmit = async () => {
    if (!session?.user?.accessToken) return alert("Sesión expirada");

    // Validaciones simples
    if (formData.nombre_producto.length < 3) return alert("El nombre debe tener al menos 3 letras");
    if (!formData.categoria) return alert("Selecciona una categoría");
    if (formData.precio_venta <= 0) return alert("El precio debe ser mayor a 0");

    setLoading(true);

    try {
      const isEditing = !!editingProduct;
      const url = isEditing
        ? `${API_URL}/products/${editingProduct.id}`
        : `${API_URL}/products`;

      const method = isEditing ? "PATCH" : "POST";

      // --- TRADUCCIÓN (FRONTEND -> BACKEND) ---
      // Calculamos el ID de la categoría (1, 2, 3...) basado en la selección
      const categoryIndex = CATEGORIAS.indexOf(formData.categoria);
      const categoryIdParaEnviar = categoryIndex >= 0 ? categoryIndex + 1 : 1;

      // PAYLOAD LIMPIO: Solo enviamos lo que el backend acepta
      const payload = {
        name: formData.nombre_producto,
        price: Number(formData.precio_venta),
        stock: Number(formData.stock_actual),
        minStock: Number(formData.stock_minimo),
        categoryId: categoryIdParaEnviar,
      };

      console.log("📤 Guardando:", payload);

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
        const msg = Array.isArray(errorData.message) ? errorData.message.join(", ") : errorData.message;
        throw new Error(msg || "Error al procesar");
      }

      onSuccessAction(); // Recargar tabla
      onCloseAction();   // Cerrar modal

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
            Ingrese los datos básicos del inventario.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">

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

          {/* Categoría y Precio (en fila) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Categoría</Label>
              <Select
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

          {/* Stock Actual y Mínimo (en fila) */}
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