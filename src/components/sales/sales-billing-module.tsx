"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingCart,
  Search,
  Trash2,
  Loader2,
  RefreshCw,
  Plus,
  Save,
  Eye,
  Printer,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Wallet
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// --- INTERFACES ---
interface Product { id: number; nombre_producto: string; marca: string; categoria: string; stock_actual: number; precio_venta: number; sku?: string; }
interface PaymentMethod { id: number; name: string; isActive?: boolean; }
interface ClientCreditProfile { creditLimit: string; currentDebt: string; isActive: boolean; }
interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  rif?: string;
  creditProfile?: ClientCreditProfile; // Agregado para ver la deuda
}
interface SaleItem { product_id: number; product_name: string; quantity: number; unit_price: number; total: number; }
interface SaleHistory { id: number; total: number; createdAt: string; client?: { name: string; rif?: string; phone?: string; address?: string }; user?: { email: string }; paymentMethod?: { name: string }; items?: any[]; saleDetails?: any[]; }

// --- COMPONENTE DE FACTURA ---
interface InvoiceProps { sale: SaleHistory | any; clientName: string; formatCurrency: (amount: number, currency: string) => string; }

const InvoiceComponent: React.FC<InvoiceProps> = ({ sale, clientName, formatCurrency }) => {
  const productsList = sale.items || sale.saleDetails || [];

  return (
    <div id="invoice-print-area" className="p-8 bg-white text-black text-sm border border-gray-200 shadow-sm rounded-lg">
      <div className="flex justify-between items-start border-b border-gray-800 pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold font-geist tracking-tight uppercase">Tu Empresa C.A.</h1>
          <p className="text-gray-500 mt-1">RIF: J-12345678-0</p>
          <p className="text-gray-500">Dirección Fiscal de la Tienda</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-400 uppercase tracking-widest">Factura</div>
          <div className="text-3xl font-mono font-bold text-red-600">#{String(sale.id).padStart(6, '0')}</div>
          <p className="text-gray-600 mt-1 font-medium">{new Date(sale.createdAt || Date.now()).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mb-8 bg-gray-50 p-4 rounded-md border border-gray-100">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Cliente</p>
            <p className="text-lg font-bold text-gray-800">{clientName}</p>
            <p className="text-gray-600">{sale.client?.address || "Dirección no registrada"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Detalles</p>
            <p className="font-mono text-gray-700"><span className="font-bold">RIF:</span> {sale.client?.rif || "V-00000000"}</p>
            <p className="text-gray-600"><span className="font-bold">Tel:</span> {sale.client?.phone || "N/A"}</p>
          </div>
        </div>
      </div>

      <table className="w-full mb-8">
        <thead>
          <tr className="border-b-2 border-gray-800">
            <th className="text-left py-2 font-bold uppercase text-xs text-gray-600">Descripción</th>
            <th className="text-right py-2 font-bold uppercase text-xs text-gray-600">Precio</th>
            <th className="text-right py-2 font-bold uppercase text-xs text-gray-600">Cant.</th>
            <th className="text-right py-2 font-bold uppercase text-xs text-gray-600">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {productsList.map((item: any, index: number) => {
            const pName = item.product_name || item.product?.nombre_producto || item.product?.name || "Producto";
            const pPrice = Number(item.unit_price || item.priceAtSale || item.price || 0);
            const pQty = Number(item.quantity);
            const pTotal = pPrice * pQty;
            return (
              <tr key={index}>
                <td className="py-3 font-medium text-gray-700">{pName}</td>
                <td className="text-right py-3 font-mono text-gray-600">{formatCurrency(pPrice, "VES")}</td>
                <td className="text-right py-3 font-mono text-gray-600">{pQty}</td>
                <td className="text-right py-3 font-mono font-bold text-gray-800">{formatCurrency(pTotal, "VES")}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex justify-end border-t border-gray-800 pt-4">
        <div className="w-1/2 md:w-1/3 space-y-2">
          <div className="flex justify-between items-center pt-2">
            <span className="text-xl font-bold uppercase">Total:</span>
            <span className="text-2xl font-bold font-mono bg-gray-100 px-2 py-1 rounded">{formatCurrency(Number(sale.total), "VES")}</span>
          </div>
          <div className="text-right mt-2">
            <span className="text-xs font-bold text-gray-400 uppercase mr-2">Método de Pago:</span>
            <Badge variant="outline" className="text-xs font-mono">{sale.paymentMethod?.name || "N/A"}</Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function SalesBillingModule() {
  const { data: session, status } = useSession();

  // Estados de Datos
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [salesHistory, setSalesHistory] = useState<SaleHistory[]>([]);

  // Estados UI
  const [activeTab, setActiveTab] = useState("new-sale");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Carrito
  const [selectedProducts, setSelectedProducts] = useState<SaleItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>("");

  // Modales y Feedback
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [viewSaleModalOpen, setViewSaleModalOpen] = useState(false);

  // --- NUEVO MODAL DE ABONO ---
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [clientToPay, setClientToPay] = useState<Client | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  const [selectedSaleDetail, setSelectedSaleDetail] = useState<SaleHistory | null>(null);
  const [feedback, setFeedback] = useState<{ open: boolean; type: 'success' | 'error'; title: string; message: string; action?: () => void }>({
    open: false, type: 'success', title: '', message: ''
  });

  // Formulario Nuevo Cliente
  const [newClientData, setNewClientData] = useState({ fullname: "", taxId: "", email: "", phone: "", address: "" });

  const currentRate = 36.5;

  const showMessage = (type: 'success' | 'error', title: string, message: string, action?: () => void) => {
    setFeedback({ open: true, type, title, message, action });
  };

  // --- CARGA DE DATOS ---
  const fetchAllData = useCallback(async () => {
    if (status !== "authenticated" || !session?.user?.accessToken) return;
    setLoading(true);
    try {
      const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${session.user.accessToken}` };

      const [resProducts, resMethods, resClients, resHistory] = await Promise.all([
        fetch(`${API_URL}/products`, { headers }),
        fetch(`${API_URL}/sales/paymentMethod`, { headers }),
        fetch(`${API_URL}/clients`, { headers }),
        fetch(`${API_URL}/sales`, { headers })
      ]);

      if (resProducts.ok) {
        const data = await resProducts.json();
        const list = Array.isArray(data) ? data : (data.data || []);
        setProducts(list.map((p: any) => ({
          id: p.id,
          nombre_producto: p.nombre_producto || p.name,
          marca: p.marca || p.brand || "Genérico",
          categoria: typeof p.category === 'object' ? p.category?.name : "General",
          stock_actual: Number(p.stock_actual ?? p.stock ?? 0),
          precio_venta: Number(p.precio_venta ?? p.price ?? 0),
          sku: p.sku || `PROD-${p.id}`
        })));
      }

      if (resMethods.ok) {
        const data = await resMethods.json();
        const list = Array.isArray(data) ? data : (data.data || []);
        setPaymentMethods(list);
      }

      if (resClients.ok) {
        const data = await resClients.json();
        const list = Array.isArray(data) ? data : (data.data || []);
        setClients(list.map((c: any) => ({
          id: c.id,
          name: c.fullname || c.name || "Sin Nombre",
          email: c.email || "", phone: c.phone || "", address: c.address || "", rif: c.taxId || c.rif || "",
          creditProfile: c.creditProfile
        })));
      }

      if (resHistory.ok) {
        const data = await resHistory.json();
        const list = Array.isArray(data) ? data : (data.data || []);
        list.sort((a: any, b: any) => b.id - a.id);
        setSalesHistory(list.map((s: any) => ({
          ...s,
          client: s.client ? { ...s.client, name: s.client.fullname || s.client.name } : undefined
        })));
      }
    } catch (error) { console.error("Error cargando datos:", error); } finally { setLoading(false); }
  }, [session, status]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  // --- FUNCIONES ---
  const formatCurrency = useCallback((amount: number, currency: string = "VES") => {
    return `Bs. ${amount.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, []);

  const calculateTotals = useMemo(() => {
    return { totalVES: selectedProducts.reduce((sum, item) => sum + item.total, 0) };
  }, [selectedProducts]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter(p => p.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, searchTerm]);

  const addProductToSale = (product: Product) => {
    const existing = selectedProducts.find(i => i.product_id === product.id);
    if (existing && existing.quantity >= product.stock_actual) {
      return showMessage('error', 'Stock Insuficiente', 'No puedes agregar más unidades de las disponibles.');
    }
    setSelectedProducts(prev => {
      if (existing) return prev.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unit_price } : i);
      return [...prev, { product_id: product.id, product_name: product.nombre_producto, quantity: 1, unit_price: product.precio_venta, total: product.precio_venta }];
    });
  };

  const updateItemQuantity = (id: number, qty: number) => {
    const prod = products.find(p => p.id === id);
    if (!prod) return;
    if (qty <= 0) return setSelectedProducts(prev => prev.filter(i => i.product_id !== id));
    if (qty > prod.stock_actual) {
      return showMessage('error', 'Stock Insuficiente', `Solo hay ${prod.stock_actual} unidades disponibles.`);
    }
    setSelectedProducts(prev => prev.map(i => i.product_id === id ? { ...i, quantity: qty, total: qty * i.unit_price } : i));
  };

  const removeItemFromSale = (productId: number) => {
    setSelectedProducts(prev => prev.filter(i => i.product_id !== productId));
  };

  // --- PROCESAR VENTA ---
  const processSale = async () => {
    if (!selectedClient) return showMessage('error', 'Falta Cliente', 'Por favor seleccione un cliente.');
    if (!selectedPaymentMethodId) return showMessage('error', 'Falta Pago', 'Por favor seleccione un método de pago.');
    if (selectedProducts.length === 0) return showMessage('error', 'Carrito Vacío', 'Agregue productos antes de procesar.');

    setLoading(true);
    try {
      const payload = {
        clientId: selectedClient.id,
        paymentMethodId: Number(selectedPaymentMethodId),
        currencyId: 1,
        items: selectedProducts.map(i => ({ productId: i.product_id, quantity: i.quantity }))
      };

      const res = await fetch(`${API_URL}/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.user?.accessToken}` },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al procesar venta");
      }

      await fetchAllData();

      setSelectedProducts([]);
      setSelectedClient(null);
      setSelectedPaymentMethodId("");
      setSearchTerm("");

      showMessage('success', '¡Venta Exitosa!', 'La transacción se ha registrado correctamente.', () => {
        setActiveTab("sales-history");
      });

    } catch (e: any) {
      showMessage('error', 'Error al Procesar', e.message || 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  // --- PROCESAR ABONO ---
  const handleOpenPaymentDialog = (client: Client) => {
    setClientToPay(client);
    setPaymentAmount("");
    setIsPaymentDialogOpen(true);
    // No cerramos el dialogo de clientes todavía para que sea fluido
  };

  const handleProcessPayment = async () => {
    if (!clientToPay || !paymentAmount) return;
    const amount = parseFloat(paymentAmount);

    if (isNaN(amount) || amount <= 0) {
      return showMessage('error', 'Monto Inválido', 'El monto debe ser mayor a 0');
    }

    setLoading(true);
    try {
      // Endpoint PATCH definido en tu ClientsController
      const res = await fetch(`${API_URL}/clients/${clientToPay.id}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.user?.accessToken}` },
        body: JSON.stringify({ abono: amount })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al procesar el abono");
      }

      await fetchAllData(); // Recargar datos para ver deuda actualizada
      setIsPaymentDialogOpen(false);
      setIsClientDialogOpen(false); // Cerramos también el selector de clientes
      showMessage('success', 'Abono Exitoso', `Se abonaron ${formatCurrency(amount)} a la cuenta de ${clientToPay.name}`);

    } catch (e: any) {
      showMessage('error', 'Error en Abono', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async () => {
    if (!newClientData.fullname || !newClientData.taxId) return showMessage('error', 'Datos Faltantes', 'Nombre y RIF son obligatorios.');
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/clients`, {
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.user?.accessToken}` },
        body: JSON.stringify({ ...newClientData, creditLimit: 0 })
      });
      if (!res.ok) throw new Error((await res.json()).message);
      const data = await res.json();
      const newClient = data.data || data;
      await fetchAllData();
      setSelectedClient({ id: newClient.id, name: newClient.fullname, rif: newClient.taxId, email: newClient.email, phone: newClient.phone, address: newClient.address });
      setIsNewClientDialogOpen(false); setNewClientData({ fullname: "", taxId: "", email: "", phone: "", address: "" });
      showMessage('success', 'Cliente Registrado', 'El cliente ha sido creado y seleccionado.');
    } catch (e: any) { showMessage('error', 'Error', e.message); } finally { setLoading(false); }
  };

  const handleViewSale = async (saleId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/sales/${saleId}`, { headers: { "Authorization": `Bearer ${session?.user?.accessToken}` } });
      if (res.ok) {
        const responseData = await res.json();
        const saleData = responseData.data || responseData;
        if (saleData.client) {
          saleData.client.name = saleData.client.fullname || saleData.client.name;
          saleData.client.rif = saleData.client.taxId || saleData.client.rif;
        }
        setSelectedSaleDetail(saleData);
        setViewSaleModalOpen(true);
      }
    } catch (e) { console.error(e); showMessage('error', 'Error', 'No se pudo cargar el detalle.'); }
    finally { setLoading(false); }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("invoice-print-area");
    if (printContent) {
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    } else { window.print(); }
  };

  if (status === "loading") return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <style dangerouslySetInnerHTML={{ __html: `@media print { body * { visibility: hidden; } #invoice-print-area, #invoice-print-area * { visibility: visible; } #invoice-print-area { position: absolute; left: 0; top: 0; width: 100%; border: none; box-shadow: none; } .no-print { display: none; } }` }} />

      {/* MODAL FEEDBACK */}
      <Dialog open={feedback.open} onOpenChange={(open) => { if (!open) { setFeedback({ ...feedback, open: false }); if (feedback.action && feedback.type === 'success') feedback.action(); } }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader className="flex flex-col items-center justify-center text-center pb-2">
            {feedback.type === 'success' ? <CheckCircle className="h-16 w-16 text-green-500 mb-4" /> : <AlertCircle className="h-16 w-16 text-red-500 mb-4" />}
            <DialogTitle className={`text-xl ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{feedback.title}</DialogTitle>
            <DialogDescription className="text-center pt-2 font-medium text-gray-600">{feedback.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button onClick={() => { setFeedback({ ...feedback, open: false }); if (feedback.action && feedback.type === 'success') feedback.action(); }} className={feedback.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}>Aceptar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL DE ABONO */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-green-600" />
              Abonar a Deuda
            </DialogTitle>
            <DialogDescription>
              Cliente: <strong>{clientToPay?.name}</strong>
              <br />
              Deuda Actual: <span className="text-red-600 font-bold">{formatCurrency(Number(clientToPay?.creditProfile?.currentDebt || 0), "VES")}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="amount">Monto a Abonar (Bs)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="mt-2 text-lg font-bold"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleProcessPayment} disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
              Procesar Abono
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL VISOR FACTURA */}
      <Dialog open={viewSaleModalOpen} onOpenChange={setViewSaleModalOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b"><DialogTitle>Detalle de Venta #{selectedSaleDetail?.id}</DialogTitle><DialogDescription>Recibo digital</DialogDescription></DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 bg-gray-100 flex justify-center">
            {selectedSaleDetail && <div className="w-full max-w-2xl bg-white shadow-lg"><InvoiceComponent sale={selectedSaleDetail} clientName={selectedSaleDetail.client?.name || "Cliente"} formatCurrency={formatCurrency} /></div>}
          </div>
          <DialogFooter className="px-6 py-4 border-t bg-white sm:justify-between"><Button variant="outline" onClick={() => setViewSaleModalOpen(false)}>Cerrar</Button><Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Imprimir</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight font-geist">Punto de Venta</h2>
        <Button variant="outline" size="sm" onClick={fetchAllData} disabled={loading}><RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Actualizar Datos</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new-sale">Nueva Venta</TabsTrigger>
          <TabsTrigger value="sales-history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="new-sale" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle>Catálogo</CardTitle>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="Buscar producto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {filteredProducts.map((p) => (
                      <Card key={p.id} className={`cursor-pointer hover:border-primary transition-all ${p.stock_actual === 0 ? 'opacity-60 grayscale' : ''}`} onClick={() => p.stock_actual > 0 && addProductToSale(p)}>
                        <CardContent className="p-3 text-center">
                          <div className="font-semibold text-sm truncate" title={p.nombre_producto}>{p.nombre_producto}</div>
                          <div className="text-xs text-gray-500 mb-2">{p.categoria}</div>
                          <div className="font-bold text-lg text-primary">{formatCurrency(p.precio_venta, "VES")}</div>
                          <Badge variant={p.stock_actual > 0 ? "outline" : "destructive"} className="mt-1 text-xs">Stock: {p.stock_actual}</Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col gap-6">
              <Card className="flex-1 flex flex-col">
                <CardHeader><CardTitle>Carrito de Venta</CardTitle></CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="mb-4 space-y-2">
                    <Label>Cliente</Label>
                    <div className="flex gap-2">
                      <Input value={selectedClient?.name || ""} placeholder="Seleccione un cliente" readOnly className="font-medium" />

                      {/* DIALOG DE SELECCIÓN Y ABONO DE CLIENTES */}
                      <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
                        <DialogTrigger asChild><Button size="icon" variant="outline" title="Buscar Cliente"><Search className="h-4 w-4" /></Button></DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader><DialogTitle>Seleccionar Cliente</DialogTitle><DialogDescription>Busque un cliente para venta o abono</DialogDescription></DialogHeader>
                          <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {clients.map(c => (
                              <div key={c.id} className="p-3 border rounded hover:bg-gray-50 flex justify-between items-center group">
                                <div onClick={() => { setSelectedClient(c); setIsClientDialogOpen(false); }} className="cursor-pointer flex-1">
                                  <div className="font-bold">{c.name}</div>
                                  <div className="text-xs text-gray-500">{c.rif}</div>
                                </div>

                                <div className="flex items-center gap-4">
                                  {/* MOSTRAR DEUDA SI TIENE */}
                                  {c.creditProfile && Number(c.creditProfile.currentDebt) > 0 && (
                                    <div className="text-right">
                                      <div className="text-xs text-gray-500">Deuda:</div>
                                      <div className="text-sm font-bold text-red-600">{formatCurrency(Number(c.creditProfile.currentDebt), "VES")}</div>
                                    </div>
                                  )}

                                  <Button size="sm" variant="outline" onClick={() => { setSelectedClient(c); setIsClientDialogOpen(false); }}>
                                    Seleccionar
                                  </Button>

                                  {/* BOTÓN DE ABONAR (SOLO SI TIENE DEUDA) */}
                                  {c.creditProfile && Number(c.creditProfile.currentDebt) > 0 && (
                                    <Button
                                      size="sm"
                                      className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
                                      onClick={() => handleOpenPaymentDialog(c)}
                                    >
                                      <Wallet className="h-4 w-4 mr-1" /> Abonar
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
                        <DialogTrigger asChild><Button size="icon" className="bg-green-600 hover:bg-green-700 text-white" title="Crear Nuevo"><Plus className="h-4 w-4" /></Button></DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Nuevo Cliente</DialogTitle><DialogDescription>Llene los datos</DialogDescription></DialogHeader>
                          <div className="space-y-4 py-2">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2"><Label>Nombre *</Label><Input value={newClientData.fullname} onChange={(e) => setNewClientData({ ...newClientData, fullname: e.target.value })} /></div>
                              <div className="space-y-2"><Label>RIF/CI *</Label><Input value={newClientData.taxId} onChange={(e) => setNewClientData({ ...newClientData, taxId: e.target.value })} /></div>
                            </div>
                            <div className="space-y-2"><Label>Email</Label><Input value={newClientData.email} onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })} /></div>
                            <div className="space-y-2"><Label>Teléfono</Label><Input value={newClientData.phone} onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })} /></div>
                            <div className="space-y-2"><Label>Dirección</Label><Textarea value={newClientData.address} onChange={(e) => setNewClientData({ ...newClientData, address: e.target.value })} /></div>
                          </div>
                          <DialogFooter><Button onClick={handleCreateClient} disabled={loading} className="w-full">{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Guardar</Button></DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 min-h-[150px] mb-4 border rounded p-2">
                    {selectedProducts.map(item => (
                      <div key={item.product_id} className="flex justify-between items-center bg-gray-50 p-2 rounded text-sm">
                        <div className="flex-1"><div className="font-medium truncate max-w-[120px]">{item.product_name}</div><div className="text-xs text-gray-500">{formatCurrency(item.unit_price, "VES")} c/u</div></div>
                        <div className="flex items-center gap-2"><Input type="number" className="w-12 h-8 px-1 text-center" value={item.quantity} onChange={(e) => updateItemQuantity(item.product_id, parseInt(e.target.value))} /><Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => removeItemFromSale(item.product_id)}><Trash2 className="h-4 w-4" /></Button></div>
                      </div>
                    ))}
                  </div>

                  <div className="mb-4 space-y-2">
                    <Label>Método de Pago</Label>
                    <Select value={selectedPaymentMethodId} onValueChange={setSelectedPaymentMethodId}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        {paymentMethods.length === 0 ? (
                          <SelectItem value="0" disabled>Cargando métodos...</SelectItem>
                        ) : (
                          paymentMethods.map(pm => (<SelectItem key={pm.id} value={pm.id.toString()}>{pm.name}</SelectItem>))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-lg font-bold"><span>Total:</span><span>{formatCurrency(calculateTotals.totalVES, "VES")}</span></div>
                    <p className="text-xs text-right text-gray-500">Ref USD: {formatCurrency(calculateTotals.totalVES / currentRate, "USD")}</p>
                  </div>

                  <Button className="w-full mt-4" size="lg" onClick={processSale} disabled={loading}><ShoppingCart className="mr-2 h-5 w-5" /> Procesar Venta</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sales-history">
          <Card>
            <CardHeader><CardTitle>Historial de Transacciones</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Fecha</TableHead><TableHead>Cliente</TableHead><TableHead>Método</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-right">Ver</TableHead></TableRow></TableHeader>
                <TableBody>
                  {salesHistory.map(sale => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-mono">{sale.id}</TableCell>
                      <TableCell>{new Date(sale.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{sale.client?.name || "N/A"}</TableCell>
                      <TableCell><Badge variant="secondary">{sale.paymentMethod?.name || "N/A"}</Badge></TableCell>
                      <TableCell className="text-right font-bold font-mono">{formatCurrency(Number(sale.total))}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewSale(sale.id)}>
                          <Eye className="h-4 w-4 text-blue-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}