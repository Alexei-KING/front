"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    UserPlus,
    Shield,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Loader2,
    RefreshCw,
    HelpCircle
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function UsersManagement() {
    const { data: session } = useSession();

    // Estados principales
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Estado para la modal de aviso (Success/Error)
    const [statusModal, setStatusModal] = useState({
        open: false,
        title: "",
        message: "",
        type: "success" as "success" | "error" | "confirm",
        onConfirm: () => { }
    });

    // Estado para nuevo usuario (Ajustado a IDs: 2, 3, 4)
    const [newUser, setNewUser] = useState({
        cedula: "",
        name: "",
        lastname: "",
        email: "",
        phone: "",
        password: "",
        role: 4 // Por defecto VENDEDOR (ID 4)
    });

    // --- CARGAR USUARIOS ---
    const loadUsers = async () => {
        if (!session?.user?.accessToken) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/users`, {
                headers: {
                    Authorization: `Bearer ${session.user.accessToken}`,
                    "Content-Type": "application/json"
                }
            });
            const result = await res.json();
            setUsers(result.data || []);
        } catch (error) {
            console.error("Error cargando usuarios:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [session]);

    // --- ACCIÓN: GUARDAR ---
    const handleSave = async () => {
        try {
            const res = await fetch(`${API_URL}/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.user?.accessToken}`
                },
                body: JSON.stringify(newUser)
            });

            const responseData = await res.json();

            if (res.ok) {
                setStatusModal({
                    open: true,
                    title: "¡Usuario Registrado!",
                    message: `El usuario ${newUser.name} ha sido agregado con éxito.`,
                    type: "success",
                    onConfirm: () => { }
                });
                loadUsers();
                setIsModalOpen(false);
                setNewUser({ cedula: "", name: "", lastname: "", email: "", phone: "", password: "", role: 4 });
            } else {
                setStatusModal({
                    open: true,
                    title: "Error al registrar",
                    message: responseData.message || "Verifica los datos.",
                    type: "error",
                    onConfirm: () => { }
                });
            }
        } catch (error) {
            setStatusModal({
                open: true,
                title: "Error de Conexión",
                message: "No se pudo conectar con el servidor.",
                type: "error",
                onConfirm: () => { }
            });
        }
    };

    // --- ACCIÓN: ELIMINAR (CON CONFIRMACIÓN PERSONALIZADA) ---
    const confirmDelete = (id: number, name: string) => {
        setStatusModal({
            open: true,
            title: "¿Estás seguro?",
            message: `Vas a eliminar a ${name}. Esta acción desactivará al usuario del sistema.`,
            type: "confirm",
            onConfirm: () => executeDelete(id)
        });
    };

    const executeDelete = async (id: number) => {
        try {
            const res = await fetch(`${API_URL}/users/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
            });

            if (res.ok) {
                setStatusModal({
                    open: true,
                    title: "Eliminado",
                    message: "El usuario ha sido desactivado correctamente.",
                    type: "success",
                    onConfirm: () => { }
                });
                loadUsers();
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    };

    return (
        <div className="space-y-6 font-geist">
            {/* ENCABEZADO */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-teal-900">Gestión de Usuarios</h2>
                    <p className="text-muted-foreground">Control de acceso: Administradores, Supervisores y Vendedores.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={loadUsers} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 ${loading && 'animate-spin'}`} />
                    </Button>
                    <Button onClick={() => setIsModalOpen(true)} className="bg-teal-700 hover:bg-teal-800">
                        <UserPlus className="mr-2 h-4 w-4" /> Nuevo Usuario
                    </Button>
                </div>
            </div>

            {/* TABLA */}
            <Card className="shadow-sm border-teal-100">
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50">
                                <TableHead>Cédula</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Correo</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="animate-spin mx-auto text-teal-600" /></TableCell></TableRow>
                            ) : users.map((u: any) => (
                                <TableRow key={u.id}>
                                    <TableCell className="font-mono text-xs">{u.cedula}</TableCell>
                                    <TableCell className="font-medium">{u.name} {u.lastname}</TableCell>
                                    <TableCell>{u.email}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-teal-50 border-teal-200">
                                            <Shield className="mr-1 h-3 w-3 text-teal-600" />
                                            {u.role?.name || "Sin Rol"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="text-red-500 hover:bg-red-50"
                                            onClick={() => confirmDelete(u.id, u.name)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* MODAL: CREAR USUARIO */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader><DialogTitle>Nuevo Registro de Personal</DialogTitle></DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2"><Label>Cédula</Label><Input value={newUser.cedula} onChange={e => setNewUser({ ...newUser, cedula: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Teléfono</Label><Input value={newUser.phone} onChange={e => setNewUser({ ...newUser, phone: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Nombre</Label><Input value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Apellido</Label><Input value={newUser.lastname} onChange={e => setNewUser({ ...newUser, lastname: e.target.value })} /></div>
                        <div className="col-span-2 space-y-2"><Label>Correo</Label><Input type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} /></div>
                        <div className="col-span-2 space-y-2"><Label>Contraseña</Label><Input type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} /></div>
                        <div className="col-span-2 space-y-2">
                            <Label>Nivel de Acceso</Label>
                            <Select value={String(newUser.role)} onValueChange={v => setNewUser({ ...newUser, role: Number(v) })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2">Administrador</SelectItem>
                                    <SelectItem value="3">Supervisor</SelectItem>
                                    <SelectItem value="4">Vendedor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter><Button className="w-full bg-teal-700" onClick={handleSave}>Guardar Personal</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MODAL: STATUS / CONFIRMACIÓN */}
            <Dialog open={statusModal.open} onOpenChange={(val) => setStatusModal({ ...statusModal, open: val })}>
                <DialogContent className="sm:max-w-[400px]">
                    <div className="flex flex-col items-center text-center py-4">
                        {statusModal.type === "success" && <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />}
                        {statusModal.type === "error" && <AlertCircle className="h-16 w-16 text-red-500 mb-4" />}
                        {statusModal.type === "confirm" && <HelpCircle className="h-16 w-16 text-orange-500 mb-4" />}

                        <DialogTitle className="text-xl mb-2">{statusModal.title}</DialogTitle>
                        <p className="text-gray-500">{statusModal.message}</p>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        {statusModal.type === "confirm" ? (
                            <>
                                <Button variant="outline" onClick={() => setStatusModal({ ...statusModal, open: false })} className="flex-1">Cancelar</Button>
                                <Button variant="destructive" onClick={() => { statusModal.onConfirm(); setStatusModal({ ...statusModal, open: false }); }} className="flex-1">Eliminar</Button>
                            </>
                        ) : (
                            <Button className="w-full" onClick={() => setStatusModal({ ...statusModal, open: false })}>Entendido</Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}