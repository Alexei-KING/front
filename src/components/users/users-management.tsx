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
    HelpCircle,
    Pencil // <--- Importamos el ícono de editar
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function UsersManagement() {
    const { data: session } = useSession();

    // --- ESTADOS ---
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Estado para saber si estamos editando (null = creando, número = ID del usuario a editar)
    const [editingId, setEditingId] = useState<number | null>(null);

    // Estado para modales de feedback
    const [statusModal, setStatusModal] = useState({
        open: false,
        title: "",
        message: "",
        type: "success" as "success" | "error" | "confirm",
        onConfirm: () => { }
    });

    // Formulario
    const [formData, setFormData] = useState({
        cedula: "",
        name: "",
        lastname: "",
        email: "",
        phone: "",
        password: "",
        role: 4
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
            setUsers(Array.isArray(result.data) ? result.data : []);
        } catch (error) {
            console.error("Error cargando usuarios:", error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [session]);

    // --- ABRIR MODAL PARA CREAR ---
    const openCreateModal = () => {
        setEditingId(null); // Modo crear
        setFormData({ cedula: "", name: "", lastname: "", email: "", phone: "", password: "", role: 4 });
        setIsModalOpen(true);
    };

    // --- ABRIR MODAL PARA EDITAR ---
    const openEditModal = (user: any) => {
        setEditingId(user.id); // Modo editar
        setFormData({
            cedula: user.cedula,
            name: user.name,
            lastname: user.lastname,
            email: user.email,
            phone: user.phone || "",
            password: "", // Contraseña vacía por defecto al editar (para no sobrescribirla si no se cambia)
            role: user.role?.id || 4 // Extraemos el ID del rol que viene del backend
        });
        setIsModalOpen(true);
    };

    // --- GUARDAR (CREAR O EDITAR) ---
    const handleSave = async () => {
        // Validación básica
        if (!formData.cedula || !formData.email || !formData.name) {
            setStatusModal({
                open: true,
                title: "Datos Incompletos",
                message: "Nombre, Cédula y Correo son obligatorios.",
                type: "error",
                onConfirm: () => { }
            });
            return;
        }

        // Si estamos creando, la contraseña es obligatoria
        if (!editingId && !formData.password) {
            setStatusModal({
                open: true,
                title: "Contraseña Requerida",
                message: "Debes asignar una contraseña al nuevo usuario.",
                type: "error",
                onConfirm: () => { }
            });
            return;
        }

        try {
            // Definimos URL y Método según si editamos o creamos
            const url = editingId ? `${API_URL}/users/${editingId}` : `${API_URL}/users`;
            const method = editingId ? "PATCH" : "POST";

            // Preparamos los datos
            const payload = { ...formData };

            // Si estamos editando y la contraseña está vacía, la quitamos del payload para no borrarla en BD
            if (editingId && !payload.password) {
                delete (payload as any).password;
            }

            const res = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.user?.accessToken}`
                },
                body: JSON.stringify(payload)
            });

            const responseData = await res.json();

            if (res.ok) {
                setStatusModal({
                    open: true,
                    title: editingId ? "Usuario Actualizado" : "Usuario Registrado",
                    message: editingId
                        ? `Los datos de ${formData.name} han sido actualizados.`
                        : `El usuario ${formData.name} ha sido creado.`,
                    type: "success",
                    onConfirm: () => { }
                });
                loadUsers();
                setIsModalOpen(false);
            } else {
                setStatusModal({
                    open: true,
                    title: "Error",
                    message: responseData.message || "Ocurrió un error al procesar la solicitud.",
                    type: "error",
                    onConfirm: () => { }
                });
            }
        } catch (error) {
            setStatusModal({
                open: true,
                title: "Error de Conexión",
                message: "No hay conexión con el servidor.",
                type: "error",
                onConfirm: () => { }
            });
        }
    };

    // --- ELIMINAR ---
    const confirmDelete = (id: number, name: string) => {
        setStatusModal({
            open: true,
            title: "¿Estás seguro?",
            message: `Vas a eliminar a ${name}. Si es el último administrador, el sistema no te dejará.`,
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

            const data = await res.json();

            if (res.ok) {
                setStatusModal({
                    open: true,
                    title: "Usuario Eliminado",
                    message: "El usuario ha sido desactivado.",
                    type: "success",
                    onConfirm: () => { }
                });
                loadUsers();
            } else {
                setStatusModal({
                    open: true,
                    title: "No se pudo eliminar",
                    message: data.message || "Error desconocido.",
                    type: "error",
                    onConfirm: () => { }
                });
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <div className="space-y-6 font-geist p-6">
            {/* ENCABEZADO */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-teal-900">Gestión de Usuarios</h2>
                    <p className="text-muted-foreground">Administración de personal.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" onClick={loadUsers} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 ${loading && 'animate-spin'}`} />
                    </Button>
                    <Button onClick={openCreateModal} className="bg-teal-700 hover:bg-teal-800 flex-1 sm:flex-none">
                        <UserPlus className="mr-2 h-4 w-4" /> Nuevo Usuario
                    </Button>
                </div>
            </div>

            {/* TABLA */}
            <Card className="shadow-sm border-teal-100">
                <CardContent className="pt-6 p-0 sm:p-6">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50">
                                <TableHead>Cédula</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead className="hidden sm:table-cell">Correo</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="animate-spin mx-auto text-teal-600 h-8 w-8" /></TableCell></TableRow>
                            ) : users.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No se encontraron usuarios.</TableCell></TableRow>
                            ) : users.map((u: any) => (
                                <TableRow key={u.id}>
                                    <TableCell className="font-mono text-xs font-medium">{u.cedula}</TableCell>
                                    <TableCell className="font-medium capitalize">{u.name} {u.lastname}</TableCell>
                                    <TableCell className="hidden sm:table-cell text-muted-foreground">{u.email}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-teal-50 border-teal-200 text-teal-700">
                                            <Shield className="mr-1 h-3 w-3" />
                                            {u.role?.name || "Sin Rol"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-1">
                                        {/* BOTÓN EDITAR */}
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="text-blue-600 hover:bg-blue-50"
                                            onClick={() => openEditModal(u)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        {/* BOTÓN ELIMINAR */}
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

            {/* MODAL FORMULARIO (CREAR / EDITAR) */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-teal-900">
                            {editingId ? "Editar Usuario" : "Nuevo Registro de Personal"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Cédula *</Label>
                            <Input
                                placeholder="Ej: 12345678"
                                value={formData.cedula}
                                onChange={e => setFormData({ ...formData, cedula: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Teléfono</Label>
                            <Input
                                placeholder="0412..."
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Nombre *</Label>
                            <Input
                                placeholder="Nombre"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Apellido</Label>
                            <Input
                                placeholder="Apellido"
                                value={formData.lastname}
                                onChange={e => setFormData({ ...formData, lastname: e.target.value })}
                            />
                        </div>
                        <div className="sm:col-span-2 space-y-2">
                            <Label>Correo Electrónico *</Label>
                            <Input
                                type="email"
                                placeholder="usuario@correo.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="sm:col-span-2 space-y-2">
                            <Label>
                                Contraseña {editingId && <span className="text-xs text-muted-foreground font-normal">(Dejar vacía para mantener la actual)</span>}
                                {!editingId && "*"}
                            </Label>
                            <Input
                                type="password"
                                placeholder={editingId ? "••••••••" : "Crear contraseña"}
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        <div className="sm:col-span-2 space-y-2">
                            <Label>Rol / Permisos *</Label>
                            <Select value={String(formData.role)} onValueChange={v => setFormData({ ...formData, role: Number(v) })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione un rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2">Administrador</SelectItem>
                                    <SelectItem value="3">Supervisor</SelectItem>
                                    <SelectItem value="4">Vendedor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button className="bg-teal-700 hover:bg-teal-800" onClick={handleSave}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            {editingId ? "Guardar Cambios" : "Guardar Usuario"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MODAL STATUS */}
            <Dialog open={statusModal.open} onOpenChange={(val) => setStatusModal({ ...statusModal, open: val })}>
                <DialogContent className="sm:max-w-[400px]">
                    <div className="flex flex-col items-center text-center py-6">
                        {statusModal.type === "success" && <CheckCircle2 className="h-16 w-16 text-green-500 mb-4 animate-in zoom-in" />}
                        {statusModal.type === "error" && <AlertCircle className="h-16 w-16 text-red-500 mb-4 animate-in zoom-in" />}
                        {statusModal.type === "confirm" && <HelpCircle className="h-16 w-16 text-orange-500 mb-4 animate-in zoom-in" />}

                        <DialogTitle className="text-xl mb-2 font-bold">{statusModal.title}</DialogTitle>
                        <p className="text-muted-foreground">{statusModal.message}</p>
                    </div>

                    <DialogFooter className="flex gap-2 sm:gap-0 w-full">
                        {statusModal.type === "confirm" ? (
                            <div className="flex gap-2 w-full">
                                <Button variant="outline" onClick={() => setStatusModal({ ...statusModal, open: false })} className="flex-1">Cancelar</Button>
                                <Button variant="destructive" onClick={() => { statusModal.onConfirm(); setStatusModal({ ...statusModal, open: false }); }} className="flex-1">Eliminar</Button>
                            </div>
                        ) : (
                            <Button className="w-full bg-slate-900" onClick={() => setStatusModal({ ...statusModal, open: false })}>Entendido</Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}