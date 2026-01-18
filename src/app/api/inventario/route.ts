import { NextResponse } from "next/server";

// 1. Interfaz del Producto (Asegúrate de que coincida con tu DTO de NestJS)
export interface Product {
  id: number;
  nombre_producto: string;
  marca?: string;
  categoria: string;
  subcategoria?: string;
  descripcion?: string;
  stock_actual: number;
  precio_venta: number;
}

// 2. Función para obtener datos reales del Backend (NestJS)
async function getData(): Promise<Product[]> {
  const response = await fetch("http://localhost:4000/api/inventory", {
    cache: 'no-store', 
  });

  if (!response.ok) {
    throw new Error("No se pudo obtener la información del servidor NestJS");
  }

  return response.json();
}

// 3. Handler GET: Responde a las solicitudes del Frontend
export async function GET() {
  try {
    const data = await getData();

    return NextResponse.json(data, {
      status: 200,
    });
  } catch (error) {
    console.error("Error en la conexión con NestJS:", error);
    
    return NextResponse.json(
      { error: "Error al conectar con el servidor de inventario" },
      { status: 500 }
    );
  }
}