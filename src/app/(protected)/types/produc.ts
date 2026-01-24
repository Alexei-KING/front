export interface Product {
  id: number;
  nombre_producto: string;
  descripcion: string;
  marca: string;
  categoria: string;
  subcategoria: string;
  stock_actual: number;
  stock_minimo: number;
  precio_compra: number;
  precio_venta: number;
  unidades_por_bulto?: number;
  // peso?: number;
  // volumen?: number;
  // ubicacion_fisica: string;
  fecha_actualizacion: string;
}
