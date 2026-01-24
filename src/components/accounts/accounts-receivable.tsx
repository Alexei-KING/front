"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";

// Componentes de UI (Asegúrate de tenerlos o usa tus versiones)
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

// Iconos
import { 
  CheckCircle, 
  Loader2, 
  Phone, 
  AlertCircle, 
  TrendingDown, 
  Receipt, 
  History, 
  Wallet, 
  Search, 
  RefreshCw,
  User
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function AccountsReceivable() {
    const { data: session, status } = useSession();

    const [debtors, setDebtors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Estados para el Modal de Pago
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // --- 1. CARGAR CLIENTES Y FILTRAR DEUDORES ---
    const fetchDebtors = useCallback(async () => {
        if (status !== "authenticated" || !session?.user?.accessToken) return;

        setLoading(true);
        try {
            // Solicitamos TODOS los clientes. Tu backend ya incluye 'creditProfile' gracias a eager: true
            const res = await fetch(`${API_URL}/clients`, {
                headers: { "Authorization": `Bearer ${session.user.accessToken}` }
            });

            if (res.ok) {
                const response = await res.json();
                // Tu backend devuelve: { message: '...', data: [...] }
                const allClients = Array.isArray(response) ? response : (response.data || []);

                console.log("Todos los clientes:", allClients);

                // --- FILTRO CRÍTICO ---
                // Solo guardamos en el estado a los que tienen deuda > 0.01
                const activeDebtors = allClients.filter((client: any) => {
                    const profile = client.creditProfile;
                    // Verificamos que tenga perfil y que la deuda sea positiva
                    if (!profile || !profile.isActive) return false;
                    return Number(profile.currentDebt) > 0.01; 
                });

                setDebtors(activeDebtors);
            }
        } catch (error) {
            console.error("Error cargando cartera:", error);
        } finally {
            setLoading(false);
        }
    }, [session, status]);

    useEffect(() => {
        fetchDebtors();
    }, [fetchDebtors]);

    // --- 2. FILTRO DE BÚSQUEDA (Visual) ---
    const filteredDebtors = useMemo(() => {
        if (!searchTerm) return debtors;
        const lowerTerm = searchTerm.toLowerCase();
        return debtors.filter(d => 
            d.fullname?.toLowerCase().includes(lowerTerm) || 
            d.taxId?.toLowerCase().includes(lowerTerm)
        );
    }, [debtors, searchTerm]);

    // Calcular deuda total mostrada
    const totalDebt = useMemo(() => {
        return debtors.reduce((acc, c) => acc + Number(c.creditProfile?.currentDebt || 0), 0);
    }, [debtors]);

    // Formateador de moneda
    const formatCurrency = (val: number) => `Bs. ${val.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`;

    // --- MANEJADORES DEL MODAL ---
    const handleOpenPayment = (client: any) => {
        setSelectedClient(client);
        setPaymentAmount("");
        setIsPaymentModalOpen(true);
    };

    // --- 3. PROCESAR EL ABONO (Conecta con tu PATCH) ---
    const processPayment = async () => {
        if (!paymentAmount || Number(paymentAmount) <= 0 || !selectedClient) return;

        setIsProcessing(true);
        try {
            // Endpoint corregido: PATCH /clients/:id/payment
            const res = await fetch(`${API_URL}/clients/${selectedClient.id}/payment`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.user?.accessToken}`
                },
                body: JSON.stringify({ abono: Number(paymentAmount) })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Error al procesar el pago");
            }

            // ÉXITO: Recargamos la lista. 
            // Si el cliente pagó todo, su deuda será 0 y desaparecerá de la lista automáticamente.
            await fetchDebtors(); 
            
            setIsPaymentModalOpen(false);
            setPaymentAmount("");
            setSelectedClient(null);

        } catch (error: any) {
            console.error("Error en pago:", error);
            alert("Error: " + error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    // --- RENDERIZADO ---

    if (loading && debtors.length === 0) {
        return (
            <div className="h-96 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin h-12 w-12 text-slate-800" />
                <p className="text-slate-400 font-bold uppercase tracking-widest animate-pulse">Consultando Buró de Crédito...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 font-sans max-w-[1200px] mx-auto pb-20 fade-in">
            {/* ENCABEZADO */}
            <div className="flex flex-col md:flex-row justify-between items-end border-b pb-6 gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <History className="h-8 w-8 text-emerald-600" /> Cuentas por Cobrar
                    </h2>
                    <p className="text-slate-500 font-medium text-sm mt-1">
                        Gestión de abonos y saldos pendientes
                    </p>
                </div>
                
                <div className="flex flex-col items-end gap-3">
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={fetchDebtors} title="Actualizar lista">
                            <RefreshCw className="h-4 w-4 mr-2" /> Actualizar
                        </Button>
                        <Badge variant="secondary" className="px-3 py-1 text-xs uppercase font-bold">
                            {debtors.length} Deudores Activos
                        </Badge>
                    </div>
                    <div className="relative w-72">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                         <Input 
                            placeholder="Buscar por nombre o RIF..." 
                            className="pl-9 bg-white shadow-sm" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                         />
                    </div>
                </div>
            </div>

            {/* TARJETA DE TOTAL */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-900 border-none shadow-xl text-white md:col-span-1">
                    <CardContent className="p-6 relative overflow-hidden">
                        <div className="absolute right-4 top-4 opacity-10">
                            <TrendingDown size={60} />
                        </div>
                        <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Total en la Calle</div>
                        <div className="text-4xl font-bold tracking-tight">
                            {formatCurrency(totalDebt)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* TABLA DE DEUDORES */}
            <Card className="border shadow-sm overflow-hidden bg-white">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="px-6 py-4 font-bold text-slate-700">Cliente / RIF</TableHead>
                                <TableHead className="font-bold text-slate-700">Contacto</TableHead>
                                <TableHead className="text-right font-bold text-slate-700">Deuda Actual</TableHead>
                                <TableHead className="text-right px-6 font-bold text-slate-700">Acción</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredDebtors.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <CheckCircle className="h-10 w-10 mb-2 text-emerald-500 opacity-50" />
                                            <p className="font-medium">No se encontraron deudas pendientes.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredDebtors.map((client) => (
                                    <TableRow key={client.id} className="hover:bg-slate-50 transition-colors">
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                    <User size={16} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900">{client.fullname}</div>
                                                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                                                        {client.taxId || 'SIN RIF'}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-slate-600 text-sm">
                                                <Phone className="h-3 w-3 text-emerald-600" /> 
                                                {client.phone || 'N/A'}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1 truncate max-w-[150px]">
                                                {client.address}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="text-lg font-bold text-red-600">
                                                {formatCurrency(Number(client.creditProfile?.currentDebt || 0))}
                                            </div>
                                            <div className="text-[10px] text-slate-400">
                                                Límite: {formatCurrency(Number(client.creditProfile?.creditLimit || 0))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right px-6">
                                            <Button
                                                onClick={() => handleOpenPayment(client)}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                                size="sm"
                                            >
                                                <Wallet className="h-4 w-4 mr-2" /> Abonar
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* MODAL DE ABONO */}
            <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Receipt className="h-5 w-5 text-emerald-600" /> 
                            Registrar Abono
                        </DialogTitle>
                        <DialogDescription>
                            Ingrese el monto a descontar de la deuda.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-6">
                        {/* Info del Cliente */}
                        <div className="bg-slate-50 p-4 rounded-lg border flex justify-between items-center">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase">Cliente</p>
                                <p className="font-bold text-slate-800">{selectedClient?.fullname}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-500 uppercase">Deuda Actual</p>
                                <p className="font-mono font-bold text-red-600">
                                    {formatCurrency(Number(selectedClient?.creditProfile?.currentDebt || 0))}
                                </p>
                            </div>
                        </div>

                        {/* Input de Monto */}
                        <div className="space-y-2">
                            <Label htmlFor="amount" className="text-sm font-bold">Monto a Abonar (Bs)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">Bs.</span>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="pl-10 text-lg font-bold h-12"
                                    autoFocus
                                />
                            </div>
                            
                            {/* Cálculo previo visual */}
                            {paymentAmount && Number(paymentAmount) > 0 && (
                                <div className="text-xs text-center p-2 bg-emerald-50 text-emerald-700 rounded border border-emerald-100 mt-2">
                                    Nuevo Saldo Estimado: <strong>{formatCurrency(Math.max(0, Number(selectedClient?.creditProfile?.currentDebt || 0) - Number(paymentAmount)))}</strong>
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>Cancelar</Button>
                        <Button 
                            onClick={processPayment} 
                            disabled={isProcessing || !paymentAmount || Number(paymentAmount) <= 0}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            {isProcessing ? (
                                <><Loader2 className="animate-spin h-4 w-4 mr-2" /> Procesando...</>
                            ) : (
                                <><CheckCircle className="mr-2 h-4 w-4" /> Confirmar Pago</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}