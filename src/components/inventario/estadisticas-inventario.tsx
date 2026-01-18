import { Card, CardContent } from "@/components/ui/card";
import { Package, AlertTriangle } from "lucide-react";

type Product = {
  stock_actual: number;
  stock_minimo: number;
  precio_venta: number;
  categoria: string;
  // Puedes agregar más campos si los necesitas
};
interface EstadisticasInventarioProps {
  productos: Product[];
}

export function EstadisticasInventario({
  productos,
}: EstadisticasInventarioProps) {
  const stockBajoCount = productos.filter((p) => p.stock_actual <= 3).length;
  const valorTotal = productos.reduce(
    (sum, p) => sum + p.stock_actual * p.precio_venta,
    0
  );
  const categoriasCount = [...new Set(productos.map((p) => p.categoria))]
    .length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Productos</p>
              <p className="text-2xl font-bold">{productos.length}</p>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Stock Bajo</p>
              <p className="text-2xl font-bold text-destructive">
                {stockBajoCount}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div>
            <p className="text-sm text-muted-foreground">Valor Total</p>
            <p className="text-2xl font-bold">
              Bs. {valorTotal.toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div>
            <p className="text-sm text-muted-foreground">Categorías</p>
            <p className="text-2xl font-bold">{categoriasCount}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
