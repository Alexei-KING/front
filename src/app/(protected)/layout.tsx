"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-context";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

// --- MÓDULOS DEL SISTEMA ---
import DashboardStats from "@/components/dashboard/dashboard-start";
import SalesBillingModule from "@/components/sales/sales-billing-module";
import PricingModule from "@/components/pricing/pricing-module";
import AccountsReceivable from "@/components/accounts/accounts-receivable";
import UsersManagement from "@/components/users/users-management"; // <-- Verifica esta ruta
import ReportsDashboard from "@/components/reports/reports-dashboard";
import InventoryModule from "@/components/inventario/inventory-page";

export default function DashboardLayout() {
  const { user, logout, isLoading } = useAuth();
  const [activeModule, setActiveModule] = useState("dashboard");

  // 1. PROTECCIÓN DE RUTA
  useEffect(() => {
    if (!isLoading && !user) {
      redirect("/login");
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-manrope text-muted-foreground animate-pulse">
            Iniciando sistema integral...
          </p>
        </div>
      </div>
    );
  }

  // 2. LÓGICA DE RENDERIZADO (SPA)
  const renderModule = () => {
    switch (activeModule) {
      case "dashboard":
        return <DashboardStats />;
      case "sales":
        return <SalesBillingModule />;
      case "pricing":
        return <PricingModule />;
      case "accounts":
        return <AccountsReceivable />;
      case "users":
        // Solo permitimos renderizar si es ADMIN o si quieres que todos lo vean
        return <UsersManagement />;
      case "reports":
        return <ReportsDashboard />;
      case "admin/inventario":
      case "ADMINISTRADOR/inventario":
        return <InventoryModule />;
      default:
        return <DashboardStats />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-geist">
      {/* --- NAVEGACIÓN LATERAL --- */}
      <Sidebar
        activeModule={activeModule}
        onModuleChangeAction={(id) => setActiveModule(id)}
        user={{
          name: user?.name ?? "Usuario",
          // Si quieres probar la vista de usuarios, asegúrate de que el rol sea ADMIN aquí
          role: (user?.role as any) ?? "ADMIN",
        }}
        onLogoutAction={logout}
      />

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          activeModule={activeModule}
          user={{
            name: user?.name ?? "Usuario",
            username: user?.username ?? "",
          }}
        />

        <main className="flex-1 overflow-auto bg-slate-50/50">
          <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {renderModule()}
          </div>
        </main>
      </div>
    </div>
  );
}