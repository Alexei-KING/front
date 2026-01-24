"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    TrendingUp, ShoppingBag, DollarSign,
    Loader2, Printer, UserCheck, BarChart3, Activity,
    RefreshCcw, Clock, AlertCircle
} from "lucide-react";
import {
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Cell,
    Legend, LabelList
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function ReportsDashboard() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [stats, setStats] = useState<any>({
        salesTrend: [],
        inventoryData: [],
        kpis: { monthlySales: 0, totalOrders: 0, totalUsers: 0, avgTicket: 0 }
    });

    // --- FUNCIÓN DE CARGA DINÁMICA ---
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

            // 1. Tendencia de Ventas (MEJORADA PARA BARRAS)
            const last7Days = [...Array(7)].map((_, i) => {
                const d = new Date(); d.setDate(d.getDate() - i);
                return d.toLocaleDateString();
            }).reverse();

            const trend = last7Days.map(date => {
                const daySales = sales.filter((s: any) => new Date(s.createdAt).toLocaleDateString() === date);
                return {
                    name: date.split('/')[0] + '/' + date.split('/')[1], // Formato DD/MM
                    fechaCompleta: date,
                    monto: daySales.reduce((acc: number, s: any) => acc + Number(s.total), 0),
                    cantidad: daySales.length
                };
            });

            // 2. Inventario con Semáforo de Control
            const inventoryData = products.slice(0, 10).map((p: any) => {
                const stock = Number(p.stock_actual || p.stock || 0);
                return {
                    name: (p.nombre_producto || p.name).substring(0, 15),
                    fullProduct: p.nombre_producto || p.name,
                    stock: stock,
                    fill: stock <= 5 ? "#ef4444" : stock <= 15 ? "#f59e0b" : "#000000"
                };
            });

            const totalRevenue = sales.reduce((acc: number, s: any) => acc + Number(s.total), 0);

            setStats({
                salesTrend: trend,
                inventoryData,
                kpis: {
                    monthlySales: totalRevenue,
                    totalOrders: sales.length,
                    totalUsers: users.length,
                    avgTicket: sales.length > 0 ? totalRevenue / sales.length : 0
                }
            });
            setLastUpdate(new Date());
        } catch (e) {
            console.error("Error actualizando datos:", e);
        } finally {
            setLoading(false);
        }
    }, [session]);

    // EFECTO: Carga inicial y auto-refresco cada 60 segundos
    useEffect(() => {
        loadAllAnalytics();
        const interval = setInterval(loadAllAnalytics, 60000);
        return () => clearInterval(interval);
    }, [loadAllAnalytics]);

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-black" />
            <p className="mt-4 font-bold uppercase tracking-widest text-slate-400">Actualizando Métricas...</p>
        </div>
    );

    return (
        <div className="space-y-8 font-geist max-w-[1400px] mx-auto pb-20">
            {/* ESTILOS DE IMPRESIÓN */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { size: A4; margin: 10mm; }
                    body * { visibility: hidden; }
                    #printable-report, #printable-report * { visibility: visible; }
                    #printable-report { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                    .card-print { break-inside: avoid; border: 1px solid #eee !important; box-shadow: none !important; }
                }
            `}} />

            {/* BARRA DINÁMICA DE ESTADO */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print px-4">
                <div>
                    <h2 className="text-5xl font-black tracking-tighter text-black uppercase italic">Live Stats</h2>
                    <div className="flex items-center gap-2 text-slate-400 mt-2">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs font-bold uppercase tracking-widest">
                            Última sincronización: {lastUpdate.toLocaleTimeString()}
                        </span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button onClick={loadAllAnalytics} variant="outline" className="border-2 border-black font-bold hover:bg-black hover:text-white rounded-xl">
                        <RefreshCcw className="mr-2 h-4 w-4" /> REFRESCAR
                    </Button>
                    <Button onClick={() => window.print()} className="bg-black text-white px-8 rounded-xl font-bold shadow-2xl">
                        <Printer className="mr-2 h-4 w-4" /> IMPRIMIR
                    </Button>
                </div>
            </div>

            <div id="printable-report" className="space-y-8 p-2">

                {/* KPI SECTION */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <CardKPI title="Total Ingresos" value={`Bs. ${stats.kpis.monthlySales.toLocaleString()}`} icon={DollarSign} sub="Flujo total acumulado" />
                    <CardKPI title="Ticket Promedio" value={`Bs. ${stats.kpis.avgTicket.toFixed(2)}`} icon={Activity} sub="Promedio por pedido" />
                    <CardKPI title="Ventas Totales" value={stats.kpis.totalOrders} icon={ShoppingBag} sub="Transacciones hoy" />
                    <CardKPI title="Vendedores" value={stats.kpis.totalUsers} icon={UserCheck} sub="Personal en sistema" />
                </div>

                {/* GRÁFICO 1: VENTAS POR FECHA (AHORA EN BARRAS PARA MEJOR LECTURA) */}
                <Card className="border-none shadow-xl card-print">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Histórico de Ventas Diarias</CardTitle>
                        </div>
                        <Badge className="bg-black text-white font-mono text-[9px]">Últimos 7 Días</Badge>
                    </CardHeader>
                    <CardContent className="h-[380px] pt-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.salesTrend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} fontStyle="bold" />
                                <YAxis axisLine={false} tickLine={false} fontSize={12} width={60} />
                                {/* TOOLTIP MEJORADO */}
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-black text-white p-4 rounded-2xl shadow-2xl border border-white/10">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{data.fechaCompleta}</p>
                                                    <div className="space-y-1">
                                                        <p className="text-lg font-black text-emerald-400">Bs. {data.monto.toLocaleString()}</p>
                                                        <p className="text-xs font-bold text-slate-300">{data.cantidad} Pedidos cerrados</p>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="monto" fill="#000000" radius={[6, 6, 0, 0]} barSize={40}>
                                    <LabelList dataKey="monto" position="top" formatter={(val: any) => val > 0 ? `Bs.${val.toFixed(0)}` : ''} style={{ fontSize: '10px', fontWeight: 'bold', fill: '#64748b' }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* GRÁFICO 2: INVENTARIO (CON MÁS INFORMACIÓN) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="border-none shadow-xl card-print">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Monitor de Stock Crítico</CardTitle>
                            <AlertCircle className="h-4 w-4 text-red-500 animate-pulse" />
                        </CardHeader>
                        <CardContent className="h-[350px] pt-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.inventoryData} layout="vertical" margin={{ left: 20, right: 40 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={100} fontSize={10} axisLine={false} tickLine={false} fontStyle="bold" />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-black text-white p-3 rounded-xl border border-white/10 shadow-2xl">
                                                        <p className="text-xs font-bold mb-1">{data.fullProduct}</p>
                                                        <p className="text-xl font-black">Stock: {data.stock}</p>
                                                        <Badge className={`mt-2 ${data.stock <= 5 ? 'bg-red-500' : 'bg-orange-500 text-black'}`}>
                                                            {data.stock <= 5 ? 'REPOSICIÓN INMEDIATA' : 'STOCK BAJO'}
                                                        </Badge>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="stock" radius={[0, 6, 6, 0]} barSize={20}>
                                        <LabelList dataKey="stock" position="right" style={{ fontSize: '12px', fontWeight: '900', fill: '#000' }} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* RESUMEN EJECUTIVO DINÁMICO */}
                    <Card className="bg-black text-white border-none shadow-2xl p-10 flex flex-col justify-center relative overflow-hidden card-print">
                        <div className="absolute -right-10 -top-10 h-40 w-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
                        <h3 className="text-3xl font-black tracking-tighter mb-4 italic uppercase">Análisis del <br /> Sistema</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            El sistema ha detectado <span className="text-white font-bold">{stats.inventoryData.filter((i: any) => i.stock <= 5).length} productos en estado crítico</span>.
                            La facturación total de hoy asciende a <span className="text-emerald-400 font-bold">Bs. {stats.kpis.monthlySales.toLocaleString()}</span>.
                            Se recomienda revisar las compras pendientes para los rubros marcados en rojo en el monitor de stock.
                        </p>
                        <div className="flex gap-4">
                            <Badge className="bg-white text-black font-black">Estamos OK</Badge>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function CardKPI({ title, value, icon: Icon, sub, info }: any) {
    return (
        <Card title={info} className="border-none shadow-lg relative overflow-hidden group hover:shadow-2xl transition-all duration-300 card-print">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-black group-hover:w-full group-hover:opacity-5 transition-all duration-500" />
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{value}</h3>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">{sub}</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl text-black group-hover:bg-black group-hover:text-white transition-all shadow-inner">
                        <Icon className="h-5 w-5" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
