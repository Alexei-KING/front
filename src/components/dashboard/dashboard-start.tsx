"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp, ShoppingBag, DollarSign,
  Loader2, Printer, UserCheck, Activity,
  RefreshCcw, Clock, AlertCircle, Sparkles,
  ArrowUpRight, Users
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function ReportsDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [stats, setStats] = useState<any>({
    kpis: { monthlySales: 0, totalOrders: 0, totalUsers: 0, lowStockCount: 0 },
    insights: []
  });

  // --- LÓGICA DE CARGA DE DATOS ---
  const loadAllAnalytics = useCallback(async () => {
    const token = session?.user?.accessToken;
    if (!token) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [resS, resP, resU] = await Promise.all([
        fetch(`${API_URL}/sales`, { headers }),
        fetch(`${API_URL}/products`, { headers }),
        fetch(`${API_URL}/users`, { headers })
      ]);

      const sales = (await resS.json()).data || [];
      const products = (await resP.json()).data || [];
      const users = (await resU.json()).data || [];

      const totalRevenue = sales.reduce((acc: number, s: any) => acc + Number(s.total), 0);
      const lowStockItems = products.filter((p: any) => Number(p.stock_actual || p.stock) < 10);

      // Generar frases para el efecto de escritura (Typewriter)
      const insightsList = [
        `Bienvenido, ${session?.user?.name || 'Administrador'}. Iniciando auditoría...`,
        `Rendimiento actual: Se han procesado ${sales.length} pedidos con éxito.`,
        `Alerta: ${lowStockItems.length} productos están por debajo del stock mínimo.`,
        `Ingresos totales acumulados: Bs. ${totalRevenue.toLocaleString()}.`,
        `Análisis: El ticket promedio se mantiene en Bs. ${(totalRevenue / (sales.length || 1)).toFixed(2)}.`,
        `Seguridad: Hay ${users.length} usuarios autorizados operando el sistema.`
      ];

      setStats({
        insights: insightsList,
        kpis: {
          monthlySales: totalRevenue,
          totalOrders: sales.length,
          totalUsers: users.length,
          lowStockCount: lowStockItems.length
        }
      });
      setLastUpdate(new Date());
    } catch (e) {
      console.error("Error cargando reportes:", e);
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Auto-actualización cada 45 segundos
  useEffect(() => {
    loadAllAnalytics();
    const interval = setInterval(loadAllAnalytics, 45000);
    return () => clearInterval(interval);
  }, [loadAllAnalytics]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-black" />
      <p className="mt-4 font-bold uppercase tracking-widest text-slate-400">Sincronizando Auditoría...</p>
    </div>
  );

  // Mapeo de datos para las tarjetas inferiores
  const cardsData = [
    {
      title: "Ventas del Mes",
      value: `Bs. ${stats.kpis.monthlySales.toLocaleString()}`,
      change: "+12.5% vs mes anterior",
      icon: DollarSign,
      color: "text-emerald-600",
    },
    {
      title: "Pedidos Realizados",
      value: stats.kpis.totalOrders.toString(),
      change: "Ventas cerradas hoy",
      icon: ShoppingBag,
      color: "text-blue-600",
    },
    {
      title: "Clientes / Usuarios",
      value: stats.kpis.totalUsers.toString(),
      change: "Registrados en sistema",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Stock Crítico",
      value: stats.kpis.lowStockCount.toString(),
      change: "Requieren reposición",
      icon: AlertCircle,
      color: stats.kpis.lowStockCount > 0 ? "text-red-500 animate-pulse" : "text-slate-400",
    },
  ];

  return (
    <div className="space-y-10 font-geist max-w-[1400px] mx-auto pb-20">
      {/* CSS DE IMPRESIÓN */}
      <style dangerouslySetInnerHTML={{
        __html: `
                @media print {
                    @page { size: A4; margin: 15mm; }
                    body * { visibility: hidden; }
                    #printable-area, #printable-area * { visibility: visible; }
                    #printable-area { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                    .card { break-inside: avoid; border: 1px solid #eee !important; box-shadow: none !important; }
                }
            `}} />

      {/* CABECERA DINÁMICA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print px-4">
        <div className="space-y-1">
          <h2 className="text-5xl font-black tracking-tighter text-black uppercase italic">Dashboard</h2>
          <div className="flex items-center gap-2 text-slate-400 mt-2">
            <Clock className="h-3 w-3" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Live Sync: {lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* CONTENIDO PARA PANTALLA E IMPRESIÓN */}
      <div id="printable-area" className="space-y-10 px-4">

        {/* TARJETA INTELIGENTE (TYPEWRITER) - OCUPA TODO EL ANCHO ARRIBA */}
        <Card className="border-none shadow-2xl bg-black text-white relative overflow-hidden group p-2 card">
          <div className="absolute -right-20 -top-20 h-64 w-64 bg-emerald-500/10 rounded-full blur-[100px] group-hover:bg-emerald-500/20 transition-all duration-1000"></div>
          <CardContent className="p-10 h-full flex flex-col justify-center min-h-[180px]">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Smart Audit Analysis</span>
            </div>
            <div className="max-w-3xl">
              <TypewriterEffect messages={stats.insights} />
            </div>
            <div className="mt-8 flex items-center gap-4 no-print">
              <Badge className="bg-emerald-500/10 text-emerald-400 border-none font-bold px-4">IA ACTIVA</Badge>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Procesando datos en tiempo real...</span>
            </div>
          </CardContent>
        </Card>

        {/* GRILLA DE TARJETAS (REEMPLAZA A LOS GRÁFICOS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cardsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-none shadow-xl hover:translate-y-[-5px] transition-all duration-300 group card bg-white">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest font-manrope">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-black font-geist mt-2 tracking-tighter text-slate-900">
                        {stat.value}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                        <p className="text-[10px] text-emerald-500 font-bold uppercase">
                          {stat.change}
                        </p>
                      </div>
                    </div>
                    <div className={`p-4 bg-slate-50 rounded-2xl group-hover:bg-black group-hover:text-white transition-all duration-500 shadow-inner`}>
                      <Icon className={`h-7 w-7 ${stat.color} group-hover:text-white`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* SECCIÓN ADICIONAL: ESTADO GLOBAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-3 border-none shadow-xl p-8 bg-slate-50/50 card">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 bg-black rounded-lg text-white">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="font-black uppercase tracking-tighter text-xl">Estado Operativo de la Empresa</h3>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-4xl">
              Este reporte consolida el rendimiento de ventas y el estado actual de los almacenes. Los valores mostrados son calculados a partir de las transacciones registradas hasta el <span className="font-bold text-black">{new Date().toLocaleString()}</span>.
              Se recomienda al administrador revisar las notificaciones de stock crítico para evitar interrupciones en la facturación diaria.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTE: EFECTO DE ESCRITURA (TYPEWRITER) ---
function TypewriterEffect({ messages }: { messages: string[] }) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);

  useEffect(() => {
    if (messages.length === 0) return;

    if (subIndex === messages[index].length + 1 && !reverse) {
      setTimeout(() => setReverse(true), 3000); // Tiempo que se queda el texto escrito
      return;
    }

    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % messages.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, reverse ? 30 : 60); // Velocidad de borrado vs escritura

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, messages]);

  return (
    <h4 className="text-2xl md:text-3xl font-bold font-mono leading-tight tracking-tighter text-emerald-400 min-h-[80px]">
      {messages.length > 0
        ? `> ${messages[index].substring(0, subIndex)}${subIndex < messages[index].length ? '█' : ''}`
        : '> Inicializando análisis de datos...'}
    </h4>
  );
}