"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";

// Componentes de UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

// Iconos
import { DollarSign, CheckCircle, Loader2, Phone, AlertCircle, TrendingDown, Receipt, History } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function AccountsReceivable() {
    const { data: session } = useSession();

    const [debtors, setDebtors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // 1. CARGAR DESDE EL HISTORIAL DE VENTAS
    const fetchDebtorsFromHistory = useCallback(async () => {
        if (!session?.user?.accessToken) return;
        setLoading(true);
        try {
            // Buscamos en el historial de ventas
            const res = await fetch(`${API_URL}/sales`, {
                headers: { "Authorization": `Bearer ${session.user.accessToken}` }
            });
            const data = await res.json();
            const allSales = Array.isArray(data) ? data : (data.data || []);

            /**
             * LÓGICA: 
             * 1. Filtramos solo ventas a CRÉDITO (ID 6).
             * 2. Obtenemos los clientes de esas ventas.
             * 3. Solo mostramos si el cliente AÚN tiene deuda activa en su perfil.
             */
            const clientsWithCreditSales = allSales
                .filter((sale: any) =>
                    sale.paymentMethodId === 6 ||
                    sale.paymentMethod?.name?.toLowerCase() === "crédito"
                )
                .map((sale: any) => sale.client);

            // Eliminar duplicados y filtrar por deuda real > 0
            const uniqueDebtors = Array.from(new Map(clientsWithCreditSales.map((c: any) => [c.id, c])).values())
                .filter((client: any) => client && Number(client.debt || client.deuda) > 0);

            setDebtors(uniqueDebtors);
        } catch (error) {
            console.error("Error cargando deudores desde historial:", error);
        } finally {
            setLoading(false);
        }
    }, [session]);

    useEffect(() => {
        fetchDebtorsFromHistory();
    }, [fetchDebtorsFromHistory]);

    // 2. TOTALES
    const totalDebt = useMemo(() => {
        return debtors.reduce((acc, c) => acc + Number(c.debt || c.deuda || 0), 0);
    }, [debtors]);

    const formatCurrency = (val: number) => `Bs. ${val.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`;

    const handleOpenPayment = (client: any) => {
        setSelectedClient(client);
        setPaymentAmount("");
        setIsPaymentModalOpen(true);
    };

    // 3. PROCESAR PAGO (ABONO)
    const processPayment = async () => {
        if (!paymentAmount || Number(paymentAmount) <= 0 || !selectedClient) return;

        setIsProcessing(true);
        try {
            const res = await fetch(`${API_URL}/clients/${selectedClient.id}/pay`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.user?.accessToken}`
                },
                body: JSON.stringify({ amount: Number(paymentAmount) })
            });

            if (res.ok) {
                // Al refrescar, si la deuda bajó a 0, el filter lo sacará de la lista automáticamente
                await fetchDebtorsFromHistory();
                setIsPaymentModalOpen(false);
                setPaymentAmount("");
                setSelectedClient(null);
            }
        } catch (error) {
            console.error("Error al procesar pago:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading && debtors.length === 0) {
        return (
            <div className="h-96 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin h-12 w-12 text-black" />
                <p className="text-slate-400 font-black uppercase tracking-widest animate-pulse">Analizando historial de créditos...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 font-geist max-w-[1200px] mx-auto pb-20">
            {/* HEADER */}
            <div className="flex justify-between items-end border-b pb-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter uppercase italic text-slate-900 flex items-center gap-3">
                        <History className="h-8 w-8 text-emerald-500" /> Cobranzas.
                    </h2>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2 text-red-500">
                        Basado en Historial de Créditos
                    </p>
                </div>
                <Badge className="bg-red-50 text-red-600 border-red-100 px-6 py-2 rounded-2xl font-black text-xs uppercase shadow-sm">
                    {debtors.length} Deudores Detectados
                </Badge>
            </div>

            {/* CARD DE TOTAL */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-900 border-none shadow-2xl rounded-[2.5rem] overflow-hidden group">
                    <CardContent className="p-8 relative">
                        <TrendingDown className="absolute right-6 top-6 h-12 w-12 text-emerald-500/10 group-hover:scale-110 transition-transform" />
                        <div className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-2">Total Pendiente en Historial</div>
                        <div className="text-5xl font-black text-white tracking-tighter italic">
                            {formatCurrency(totalDebt)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* LISTADO DE CLIENTES QUE DEBEN */}
            <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="px-8 font-black uppercase text-[11px] py-5">Cliente</TableHead>
                                <TableHead className="font-black uppercase text-[11px]">Contacto</TableHead>
                                <TableHead className="text-right font-black uppercase text-[11px]">Deuda Total</TableHead>
                                <TableHead className="text-right px-8 font-black uppercase text-[11px]">Acción</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {debtors.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-48 text-center">
                                        <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4 opacity-20" />
                                        <p className="text-slate-300 font-black uppercase text-xs tracking-widest italic">
                                            No se encontraron créditos pendientes en el historial.
                                        </p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                debtors.map((client) => (
                                    <TableRow key={client.id} className="hover:bg-slate-50/80 transition-colors">
                                        <TableCell className="px-8 py-6">
                                            <div className="font-black text-slate-900 uppercase text-base">{client.fullname || client.name}</div>
                                            <div className="text-[10px] text-slate-400 font-mono mt-1">RIF: {client.taxId || client.rif || 'N/A'}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase bg-slate-100 w-fit px-3 py-1 rounded-lg">
                                                <Phone className="h-3 w-3 text-emerald-500" /> {client.phone || 'S/N'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="text-xl font-black text-red-600 tracking-tighter italic">
                                                {formatCurrency(Number(client.debt || client.deuda))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right px-8">
                                            <Button
                                                onClick={() => handleOpenPayment(client)}
                                                className="bg-black text-white rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-lg border-b-4 border-slate-700 h-12 px-6"
                                            >
                                                <Receipt className="h-4 w-4 mr-2 text-emerald-400" /> ABONAR
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* MODAL DE COBRO */}
            <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                <DialogContent className="max-w-[450px] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden font-geist">
                    <DialogHeader className="bg-slate-900 text-white p-10">
                        <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter">Registrar Pago.</DialogTitle>
                        <DialogDescription className="text-emerald-400 font-black uppercase text-[10px] tracking-widest mt-2">
                            Abono para: {selectedClient?.fullname || selectedClient?.name}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-10 space-y-8">
                        <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-red-800 uppercase tracking-widest mb-1">Saldo Actual</p>
                                <p className="text-2xl font-black text-red-600 font-mono italic">
                                    {formatCurrency(Number(selectedClient?.debt || selectedClient?.deuda || 0))}
                                </p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-red-200" />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Monto del Recibo</Label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xl">Bs.</span>
                                <Input
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    placeholder="0,00"
                                    className="h-20 pl-14 text-3xl font-black text-emerald-600 rounded-[1.5rem] border-slate-200 focus:ring-black bg-slate-50/50 shadow-inner"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-10 pt-0">
                        <Button
                            onClick={processPayment}
                            disabled={isProcessing || !paymentAmount || Number(paymentAmount) <= 0}
                            className="w-full h-20 bg-black text-white rounded-[1.5rem] font-black text-xl shadow-2xl hover:bg-slate-800 transition-all active:scale-95 border-b-8 border-emerald-500"
                        >
                            {isProcessing ? (
                                <Loader2 className="animate-spin h-6 w-6" />
                            ) : (
                                <><CheckCircle className="mr-3 h-6 w-6 text-emerald-400" /> CONFIRMAR ABONO</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}