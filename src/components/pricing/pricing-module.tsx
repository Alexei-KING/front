"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Search, Plus, Printer, Trash2,
    Loader2, Package, User, ShoppingCart,
    Building2
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function PricingModule() {
    const { data: session, status } = useSession();

    const [products, setProducts] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [cart, setCart] = useState<any[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string>("");

    const fetchData = useCallback(async () => {
        const token = session?.user?.accessToken;
        if (!token) return;
        setLoading(true);
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const [resP, resC] = await Promise.all([
                fetch(`${API_URL}/products`, { headers }),
                fetch(`${API_URL}/clients`, { headers })
            ]);
            const pJson = await resP.json();
            const cJson = await resC.json();
            setProducts(pJson.data || pJson || []);
            setClients(cJson.data || cJson || []);
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    }, [session]);

    useEffect(() => {
        if (status === "authenticated") fetchData();
    }, [status, fetchData]);

    const filteredProducts = useMemo(() => {
        if (!Array.isArray(products)) return [];
        return products.filter(p => (p.nombre_producto || p.name || "").toLowerCase().includes(searchTerm.toLowerCase()));
    }, [products, searchTerm]);

    const addToQuote = (product: any) => {
        setCart(prev => {
            const exists = prev.find(p => p.id === product.id);
            if (exists) return prev.map(p => p.id === product.id ? { ...p, qty: p.qty + 1 } : p);
            return [...prev, { id: product.id, name: product.nombre_producto || product.name, price: Number(product.precio_venta || product.price || 0), qty: 1 }];
        });
    };

    const removeItem = (id: number) => setCart(prev => prev.filter(p => p.id !== id));

    const total = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.qty), 0), [cart]);
    const formatCurrency = (val: number) => `Bs. ${val.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`;

    const selectedClient = useMemo(() => clients.find(c => String(c.id) === selectedClientId), [clients, selectedClientId]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-black" />
            <p className="text-slate-400 font-black uppercase tracking-[0.3em]">Cargando Sistema</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-20 max-w-[1400px] mx-auto px-4">
            {/* CSS DE IMPRESIÓN MEJORADO - FUERZA VISIBILIDAD DEL TOTAL */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { size: A4; margin: 0; }
                    body * { visibility: hidden !important; }
                    #print-section, #print-section * { visibility: visible !important; }
                    #print-section {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 210mm;
                        min-height: 297mm;
                        padding: 15mm;
                        background: white !important;
                        display: block !important;
                    }
                    .no-print { display: none !important; }
                }
            `}} />

            {/* INTERFAZ DE USUARIO (SE OCULTA AL IMPRIMIR) */}
            <div className="no-print space-y-8">
                <div className="flex justify-between items-end pb-6 border-b">
                    <div>
                        <h2 className="text-5xl font-black tracking-tighter uppercase italic text-slate-900">Quoter.</h2>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Módulo de Presupuestos Profesionales</p>
                    </div>
                    <Button
                        className="bg-black text-white px-10 h-16 rounded-2xl font-black shadow-2xl transition-all hover:scale-105 active:scale-95 border-b-4 border-slate-700"
                        onClick={handlePrint}
                        disabled={cart.length === 0}
                    >
                        <Printer className="mr-3 h-5 w-5 text-emerald-400" /> IMPRIMIR PRESUPUESTO
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* LISTA DE PRODUCTOS */}
                    <div className="lg:col-span-2">
                        <Card className="border-none shadow-2xl overflow-hidden bg-white rounded-[2.5rem]">
                            <CardHeader className="bg-slate-50/50 border-b p-8">
                                <div className="relative">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <Input
                                        placeholder="Buscar producto..."
                                        className="pl-14 h-16 bg-white border-slate-200 rounded-[1.2rem] text-lg"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 max-h-[600px] overflow-auto">
                                <Table>
                                    <TableHeader className="bg-slate-50 sticky top-0 z-10">
                                        <TableRow>
                                            <TableHead className="font-black px-8 py-5">PRODUCTO</TableHead>
                                            <TableHead className="font-black text-right">PRECIO</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredProducts.map(p => (
                                            <TableRow key={p.id} className="hover:bg-slate-50">
                                                <TableCell className="px-8 py-5 font-bold">{p.nombre_producto || p.name}</TableCell>
                                                <TableCell className="text-right font-mono font-bold">{formatCurrency(Number(p.precio_venta || p.price))}</TableCell>
                                                <TableCell className="text-right px-8">
                                                    <Button size="icon" variant="outline" onClick={() => addToQuote(p)}><Plus /></Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                    {/* LADO DERECHO: CLIENTE Y CARRITO */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="bg-black text-white p-6">
                                <CardTitle className="text-lg flex items-center gap-2 font-black"><ShoppingCart /> RESUMEN</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <Select onValueChange={setSelectedClientId} value={selectedClientId}>
                                    <SelectTrigger className="h-14 font-bold"><SelectValue placeholder="Seleccione Cliente" /></SelectTrigger>
                                    <SelectContent>
                                        {clients.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.fullname || c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>

                                <div className="space-y-4">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border">
                                            <div className="text-sm font-bold">{item.qty}x {item.name}</div>
                                            <button onClick={() => removeItem(item.id)} className="text-red-400"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4 border-t text-right">
                                    <p className="text-xs font-black text-slate-400 uppercase">Total Estimado</p>
                                    <p className="text-3xl font-black">{formatCurrency(total)}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* SECCIÓN DE IMPRESIÓN (OCULTA EN PANTALLA, VISIBLE AL IMPRIMIR) */}
            <div id="print-section" className="hidden">
                {/* CABECERA */}
                <div className="flex justify-between items-start border-b-[6px] border-black pb-8 mb-10">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-black rounded-xl flex items-center justify-center">
                            <Building2 className="text-emerald-400 h-10 w-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black uppercase">Papelería C.A.</h1>
                            <p className="text-xs font-bold text-slate-500">RIF: J-00000000-0 | Zona Industrial</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Fecha de Emisión</p>
                        <p className="text-lg font-mono font-bold">{new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {/* INFO CLIENTE */}
                <div className="grid grid-cols-2 gap-10 mb-10">
                    <div className="p-6 bg-slate-100 rounded-3xl">
                        <p className="text-[10px] font-black uppercase mb-2">Cliente:</p>
                        <p className="text-xl font-black uppercase">{selectedClient?.fullname || selectedClient?.name || "Cliente Particular"}</p>
                        <p className="text-sm font-bold text-slate-600">RIF/CI: {selectedClient?.taxId || selectedClient?.rif || "N/A"}</p>
                    </div>
                    <div className="p-6 border-2 border-slate-100 rounded-3xl">
                        <p className="text-[10px] font-black uppercase mb-2">Vigencia:</p>
                        <p className="text-sm font-bold italic">Válido por 72 horas. Precios sujetos a cambios según tasa oficial.</p>
                    </div>
                </div>

                {/* TABLA DE PRODUCTOS */}
                <div className="min-h-[400px]">
                    <Table>
                        <TableHeader className="border-b-2 border-black">
                            <TableRow>
                                <TableHead className="text-black font-black uppercase text-xs">Cant</TableHead>
                                <TableHead className="text-black font-black uppercase text-xs">Descripción</TableHead>
                                <TableHead className="text-black font-black uppercase text-xs text-right">Unitario</TableHead>
                                <TableHead className="text-black font-black uppercase text-xs text-right">Subtotal</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cart.map(item => (
                                <TableRow key={item.id} className="border-slate-100">
                                    <TableCell className="font-mono font-bold">{item.qty}</TableCell>
                                    <TableCell className="font-bold uppercase text-xs">{item.name}</TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(item.price)}</TableCell>
                                    <TableCell className="text-right font-black">{formatCurrency(item.price * item.qty)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* TOTAL FINAL - EL "BLOQUE" QUE NECESITAS */}
                <div className="mt-auto pt-10 border-t-4 border-black flex justify-between items-end">
                    <div className="max-w-xs">
                        <p className="text-[9px] font-bold text-slate-400 uppercase italic leading-tight">
                            Este documento es un presupuesto informativo y no representa una factura fiscal. La disponibilidad de los productos se garantiza solo al confirmar el pago.
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-4">Total Presupuestado</span>
                        <div className="bg-black text-white px-10 py-6 rounded-2xl mt-2">
                            <span className="text-4xl font-black italic">{formatCurrency(total)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}