import { NextResponse } from "next/server";
import { getData as getInventoryData, Product } from "@/app/api/inventario/route";


interface SaleItem {
  nombre_producto: string;
  cantidad: number;
  precio_unitario: number; 
}

interface Sale {
  id: string;
  cliente: string;
  monto_total: number;
  divisa: string;
  fecha: string;
  estado: "Pagada" | "Pendiente" | "Anulada";
  tipo_pago: "contado" | "credito";
  vendedor: string;
  items: SaleItem[];
}

type SalesResponse = Sale[];



const mockSales: SalesResponse = [
  {
    id: "F-001234",
    cliente: "Empresa ABC",
    monto_total: 0, 
    divisa: "VES",
    fecha: "2024-01-15",
    estado: "Pagada",
    tipo_pago: "contado",
    vendedor: "Juan Pérez",
    items: [
      { nombre_producto: "Resma de Papel", cantidad: 10, precio_unitario: 0 }, 
      { nombre_producto: "Bolígrafos Azules", cantidad: 50, precio_unitario: 0 },
    ],
  },
  {
    id: "F-001235",
    cliente: "Colegio XYZ",
    monto_total: 0,
    divisa: "VES",
    fecha: "2024-01-15",
    estado: "Pendiente",
    tipo_pago: "credito",
    vendedor: "María González",
    items: [{ nombre_producto: "Cuaderno Universitario", cantidad: 25, precio_unitario: 0 }],
  },
  {
    id: "F-001236",
    cliente: "Oficina 123",
    monto_total: 0,
    divisa: "VES",
    fecha: "2024-01-14",
    estado: "Pagada",
    tipo_pago: "contado",
    vendedor: "Carlos Rodríguez",
    items: [{ nombre_producto: "Resma de Papel", cantidad: 5, precio_unitario: 0 }],
  },
];


export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 400));
  
  try {
    const inventory: Product[] = await getInventoryData(); 

    const salesData = mockSales.map(sale => {
      let total = 0;
      
      const updatedItems = sale.items.map(item => {
        const product = inventory.find((p: Product) => p.nombre_producto === item.nombre_producto);
        
        if (product) {
          item.precio_unitario = product.precio_venta;
        } 
        
        total += item.cantidad * item.precio_unitario;
        return item;
      });

      return {
        ...sale,
        items: updatedItems,
        monto_total: total, 
      };
    });


    return NextResponse.json({
      success: true,
      data: salesData,
      total: salesData.length,
    });
  } catch (error) {
    console.error("Error al obtener datos de ventas:", error);
    return NextResponse.json(
      { error: "Error al obtener los datos de ventas" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const body: Omit<Sale, "id" | "fecha" | "monto_total"> & { items: Omit<SaleItem, "precio_unitario">[] } = await request.json();

  await new Promise((resolve) => setTimeout(resolve, 600));

  try {
    const inventory: Product[] = await getInventoryData(); 
    let finalSaleTotal = 0;
    const finalSaleItems: SaleItem[] = [];

    for (const itemRequest of body.items) {
      
      const productInStock = inventory.find(
        (p: Product) => p.nombre_producto === itemRequest.nombre_producto
      );

      if (!productInStock) {
        return NextResponse.json(
          { success: false, message: `Producto "${itemRequest.nombre_producto}" no encontrado en el inventario.` },
          { status: 404 }
        );
      }

      if (productInStock.stock_actual < itemRequest.cantidad) {
        return NextResponse.json(
          {
            success: false,
            message: `Stock insuficiente para "${itemRequest.nombre_producto}". Stock actual: ${productInStock.stock_actual}.`,
          },
          { status: 400 }
        );
      }

      productInStock.stock_actual -= itemRequest.cantidad;
      
      const unitPrice = productInStock.precio_venta;
      finalSaleTotal += itemRequest.cantidad * unitPrice;
      
      finalSaleItems.push({
          nombre_producto: itemRequest.nombre_producto,
          cantidad: itemRequest.cantidad,
          precio_unitario: unitPrice, 
      });
    }

    const newSale: Sale = {
      id: `F-${String(mockSales.length + 1001).padStart(6, "0")}`,
      ...body,
      items: finalSaleItems, 
      monto_total: finalSaleTotal, 
      fecha: new Date().toISOString().split("T")[0],
    };

    mockSales.push(newSale);

    return NextResponse.json({
      success: true,
      data: newSale,
      message: "Venta registrada exitosamente y stock actualizado.",
    });
  } catch (error) {
    console.error("Error al procesar la venta y actualizar inventario:", error);
    return NextResponse.json(
      { error: "Error interno al procesar la solicitud" },
      { status: 500 }
    );
  }
}