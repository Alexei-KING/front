import { z } from "zod";

export const articuloSchema = z.object({
  id: z.number().optional(),
  nombre_producto: z.string().min(1, "Nombre requerido"),
  descripcion: z.string().optional().nullable(),
  marca: z.string().optional().nullable(),
  categoria: z.string().min(1, "Categoría requerida"),
  subcategoria: z.string().optional().nullable(),
  stock_actual: z.number().int().nonnegative().optional(),
  stock_minimo: z.number().int().nonnegative().optional(),
  precio_compra: z.number().nonnegative().optional(),
  precio_venta: z.number().nonnegative().optional(),
  unidades_por_bulto: z.number().int().nonnegative().optional(),
  fecha_actualizacion: z.string().optional().nullable(),
});

export type ArticuloInput = z.infer<typeof articuloSchema>;
