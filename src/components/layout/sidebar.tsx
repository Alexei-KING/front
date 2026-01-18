"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  Menu,
  X,
  Home,
  Settings,
  BarChart3,
  CreditCard,
  Truck,
  LogOut,
} from "lucide-react";

export const modules = [
  { id: "dashboard", name: "Dashboard", icon: Home, color: "bg-primary" },
  {
    id: "admin/inventario",
    name: "Inventario",
    icon: Package,
    color: "bg-black",
  },
  {
    id: "pricing",
    name: "Precios y Cotización",
    icon: DollarSign,
    color: "bg-black",
  },
  {
    id: "sales",
    name: "Facturación",
    icon: ShoppingCart,
    color: "bg-black",
  },
  /*{ id: "purchases", name: "Compras", icon: Truck, color: "bg-chart-4" },*/
  {
    id: "accounts",
    name: "Cuentas por Cobrar",
    icon: CreditCard,
    color: "bg-black",
  },
  { id: "users", name: "Usuarios", icon: Users, color: "bg-black" },
  { id: "reports", name: "Reportes", icon: BarChart3, color: "bg-black" },
];

interface SidebarProps {
  activeModule: string;
  onModuleChangeAction: (moduleId: string) => void;
  user: {
    name?: string | null;
    role?: "VENDEDOR" | "ADMIN" | "SUPERVISOR" | null;
  };
  onLogoutAction: () => void;
}

export default function Sidebar({
  activeModule,
  onModuleChangeAction,
  user,
  onLogoutAction,
}: SidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div
      className={`${
        sidebarOpen ? "w-64" : "w-16"
      } transition-all duration-300 bg-sidebar border-r border-sidebar-border flex flex-col`}
    >
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          {sidebarOpen && (
            <h1 className="font-geist font-semibold text-lg text-sidebar-foreground">
              Papelería Sistema
            </h1>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {sidebarOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <nav className="flex-1 p-2">
        {modules.map((module) => {
          const Icon = module.icon;
          if (module.id === "users" && user.role !== "ADMIN") {
            return null;
          }
          return (
            <Button
              key={module.id}
              variant={activeModule === module.id ? "default" : "ghost"}
              className={`w-full justify-start mb-1 ${
                activeModule === module.id
                  ? `${module.color} text-white`
                  : "text-sidebar-foreground hover:bg-gray-400 "
              }`}
              onClick={() => onModuleChangeAction(module.id)}
            >
              <Icon className="h-4 w-4" />
              {sidebarOpen && (
                <span className="ml-2 font-manrope">{module.name}</span>
              )}
            </Button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-2">
        {sidebarOpen && (
          <div className="mb-2">
            <p className="text-xs text-sidebar-foreground/70 font-manrope">
              Sesión activa
            </p>
            <p className="text-sm font-geist font-medium text-sidebar-foreground">
              {user.name}
            </p>
            <Badge variant="outline" className="text-xs font-manrope mt-1">
              {user.role === "ADMIN"
                ? "Administrador"
                : user.role === "SUPERVISOR"
                ? "Supervisor"
                : "Vendedor"}
            </Badge>
          </div>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-red-600 hover:text-white"
          onClick={onLogoutAction}
        >
          <LogOut className="h-4 w-4" />
          {sidebarOpen && (
            <span className="ml-2 font-manrope">Cerrar Sesión</span>
          )}
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-gray-400 hover:text-sidebar-accent-foreground"
        >
          <Settings className="h-4 w-4" />
          {sidebarOpen && (
            <span className="ml-2 font-manrope">Configuración</span>
          )}
        </Button>
      </div>
    </div>
  );
}
