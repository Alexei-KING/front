"use server";

import { articuloSchema } from "@/app/(protected)/zod/formArticulos";
import type { ArticuloInput } from "@/app/(protected)/zod/formArticulos";

const BASE_URL = `http://localhost:8000/api/inventario/productos/`;

export default async function newArticulo(
  values: ArticuloInput,
  editingId?: number
) {
  // Validar con Zod
  const parsed = articuloSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      message: "Datos inválidos: " + JSON.stringify(parsed.error.issues),
    };
  }

  const url = editingId ? `${BASE_URL}${editingId}/` : BASE_URL;
  const method = editingId ? "PUT" : "POST";

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsed.data),
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        success: false,
        message: `Error al guardar el artículo: ${text}`,
      };
    }

    return {
      success: true,
      message: editingId
        ? "Artículo actualizado exitosamente"
        : "Artículo creado exitosamente",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Error inesperado",
    };
  }
}
