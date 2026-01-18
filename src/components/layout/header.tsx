"use client";

import { Badge } from "@/components/ui/badge";

const modules = [
  { id: "dashboard", name: "Dashboard" },
  { id: "admin/inventario", name: "Inventario" },
  { id: "pricing", name: "Precios y Cotización" },
  { id: "sales", name: "Facturación" },
  /*{ id: "purchases", name: "Compras" },*/
  { id: "accounts", name: "Cuentas por Cobrar" },
  { id: "users", name: "Usuarios" },
  { id: "reports", name: "Reportes" },
];
export interface HeaderProps {
  activeModule: string;
  user: { name?: string | null; username?: string | null };
}

function Header({ activeModule, user }: HeaderProps) {
  console.log("Dashboard user:", user);
  return (
    <header className="bg-card border-b border-border p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-geist font-semibold text-card-foreground">
            {modules.find((m) => m.id === activeModule)?.name || "Dashboard"}
          </h2>
          <p className="text-shadow-neutral-400 ">
            Sistema integral de gestión para papelería
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-manrope text-muted-foreground">
              Tasa del día
            </p>
            <p className="font-geist font-semibold">
              {/* 1 USD = {current?.usd_to_ves || "150"} Bs */}
            </p>
          </div>
          <Badge
            variant="secondary"
            className="font-manrope text-stone-50 pl-2 text-1xl bg-teal-700"
          >
            {user?.username || user?.name || "Usuario"}
          </Badge>
        </div>
      </div>
    </header>
  );
}
export default Header;
