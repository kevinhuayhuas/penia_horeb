"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, ShieldCheck, User } from "lucide-react";
import { Card, CardHeader }  from "@/components/ui/Card";
import { Button }            from "@/components/ui/Button";
import { Table }             from "@/components/ui/Table";
import { Modal }             from "@/components/ui/Modal";
import { Input }             from "@/components/ui/Input";
import { Select }            from "@/components/ui/Select";
import { Badge }             from "@/components/ui/Badge";
import { ConfirmDialog }     from "@/components/ui/ConfirmDialog";
import { useToast }          from "@/components/ui/Toast";
import { formatDate }        from "@/lib/utils";
import type { Usuario, UsuarioForm, RolUsuario } from "@/types";

const ROL_OPTS = [
  { value: "Admin",   label: "Administrador" },
  { value: "Maestro", label: "Maestro" },
];

const EMPTY: UsuarioForm = {
  nombre:   "",
  email:    "",
  password: "",
  rol:      "Maestro",
  activo:   true,
};

export default function UsuariosPage() {
  const { toast } = useToast();
  const [usuarios, setUsuarios]         = useState<Usuario[]>([]);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [deleting, setDeleting]         = useState(false);
  const [modalOpen, setModalOpen]       = useState(false);
  const [confirmOpen, setConfirmOpen]   = useState(false);
  const [editTarget, setEditTarget]     = useState<Usuario | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Usuario | null>(null);
  const [form, setForm]                 = useState<UsuarioForm>(EMPTY);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/usuarios");
    if (res.status === 403) {
      toast("Acceso denegado: solo administradores", "error");
      setLoading(false);
      return;
    }
    const json = await res.json();
    setUsuarios(json.data ?? []);
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchUsuarios(); }, [fetchUsuarios]);

  const patch = (field: keyof UsuarioForm, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY);
    setModalOpen(true);
  };

  const openEdit = (u: Usuario) => {
    setEditTarget(u);
    setForm({
      nombre:   u.nombre,
      email:    u.email,
      password: "",        // vacío: no se cambia si no se rellena
      rol:      u.rol,
      activo:   u.activo,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.nombre.trim() || !form.email.trim()) {
      toast("Nombre y email son obligatorios", "error");
      return;
    }
    if (!editTarget && !form.password.trim()) {
      toast("La contraseña es obligatoria para nuevos usuarios", "error");
      return;
    }
    setSaving(true);
    const url    = editTarget ? `/api/usuarios/${editTarget.id_usuario}` : "/api/usuarios";
    const method = editTarget ? "PUT" : "POST";
    const res    = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(form),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) { toast(json.error ?? "Error al guardar", "error"); return; }
    toast(editTarget ? "Usuario actualizado" : "Usuario creado");
    setModalOpen(false);
    fetchUsuarios();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res  = await fetch(`/api/usuarios/${deleteTarget.id_usuario}`, { method: "DELETE" });
    const json = await res.json();
    setDeleting(false);
    if (!res.ok) { toast(json.error ?? "Error", "error"); return; }
    toast("Usuario eliminado");
    setConfirmOpen(false);
    fetchUsuarios();
  };

  const columns = [
    {
      key: "nombre",
      header: "Usuario",
      render: (u: Usuario) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-xs">
            {u.nombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{u.nombre}</p>
            <p className="text-xs text-gray-500">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "rol",
      header: "Rol",
      render: (u: Usuario) => (
        <div className="flex items-center gap-1.5">
          {u.rol === "Admin"
            ? <ShieldCheck size={14} className="text-primary-600" />
            : <User size={14} className="text-gray-400" />
          }
          <Badge variant={u.rol === "Admin" ? "blue" : "gray"}>
            {u.rol === "Admin" ? "Administrador" : "Maestro"}
          </Badge>
        </div>
      ),
    },
    {
      key: "activo",
      header: "Estado",
      render: (u: Usuario) => (
        <Badge variant={u.activo ? "green" : "gray"}>
          {u.activo ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      key: "fecha_registro",
      header: "Registrado",
      render: (u: Usuario) => <span className="text-xs text-gray-500">{formatDate(u.fecha_registro)}</span>,
    },
    {
      key: "acciones",
      header: "",
      className: "w-20",
      render: (u: Usuario) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={() => { setDeleteTarget(u); setConfirmOpen(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-3xl space-y-4">
      <Card>
        <CardHeader
          title="Usuarios del sistema"
          description="Administra las cuentas y permisos de acceso"
          action={
            <Button onClick={openCreate} size="sm">
              <Plus size={15} /> Nuevo usuario
            </Button>
          }
        />
        <Table<Usuario>
          columns={columns}
          data={usuarios}
          keyField="id_usuario"
          loading={loading}
          emptyMessage="No hay usuarios registrados"
        />
      </Card>

      {/* Modal crear/editar */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? "Editar usuario" : "Nuevo usuario"}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Nombre completo"
            required
            value={form.nombre}
            onChange={(e) => patch("nombre", e.target.value)}
            placeholder="Ej: Juan Pérez"
          />
          <Input
            label="Correo electrónico"
            type="email"
            required
            value={form.email}
            onChange={(e) => patch("email", e.target.value)}
            placeholder="correo@ejemplo.com"
          />
          <Input
            label={editTarget ? "Nueva contraseña (dejar vacío para no cambiar)" : "Contraseña"}
            type="password"
            required={!editTarget}
            value={form.password}
            onChange={(e) => patch("password", e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />
          <Select
            label="Rol"
            required
            options={ROL_OPTS}
            value={form.rol}
            onChange={(e) => patch("rol", e.target.value as RolUsuario)}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="activo-user"
              checked={form.activo}
              onChange={(e) => patch("activo", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="activo-user" className="text-sm text-gray-700">
              Usuario activo
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>
              {editTarget ? "Guardar cambios" : "Crear usuario"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmar eliminación */}
      <ConfirmDialog
        open={confirmOpen}
        message={`¿Eliminar el usuario "${deleteTarget?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        loading={deleting}
      />
    </div>
  );
}
