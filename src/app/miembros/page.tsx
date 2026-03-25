"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardHeader }  from "@/components/ui/Card";
import { Button }            from "@/components/ui/Button";
import { Table }             from "@/components/ui/Table";
import { Modal }             from "@/components/ui/Modal";
import { Input }             from "@/components/ui/Input";
import { ConfirmDialog }     from "@/components/ui/ConfirmDialog";
import { useToast }          from "@/components/ui/Toast";
import { formatDate }        from "@/lib/utils";
import type { Miembro, MiembroForm } from "@/types";

const EMPTY: MiembroForm = {
  dni: "", nombre: "", apellido: "", telefono: "",
  email: "", direccion: "", fecha_cumpleanos: null,
};

export default function MiembrosPage() {
  const { toast } = useToast();
  const [miembros, setMiembros]         = useState<Miembro[]>([]);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [deleting, setDeleting]         = useState(false);
  const [modalOpen, setModalOpen]       = useState(false);
  const [confirmOpen, setConfirmOpen]   = useState(false);
  const [editTarget, setEditTarget]     = useState<Miembro | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Miembro | null>(null);
  const [form, setForm]                 = useState<MiembroForm>(EMPTY);

  const fetchMiembros = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/miembros");
    const json = await res.json();
    setMiembros(json.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchMiembros(); }, [fetchMiembros]);

  const patch = (field: keyof MiembroForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value || null }));

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY);
    setModalOpen(true);
  };

  const openEdit = (m: Miembro) => {
    setEditTarget(m);
    setForm({
      dni:              m.dni ?? "",
      nombre:           m.nombre,
      apellido:         m.apellido,
      telefono:         m.telefono ?? "",
      email:            m.email ?? "",
      direccion:        m.direccion ?? "",
      fecha_cumpleanos: m.fecha_cumpleanos,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.nombre?.trim() || !form.apellido?.trim()) {
      toast("Nombre y apellido son obligatorios", "error");
      return;
    }
    setSaving(true);
    const url    = editTarget ? `/api/miembros/${editTarget.id_miembro}` : "/api/miembros";
    const method = editTarget ? "PUT" : "POST";
    const res    = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) { toast(json.error ?? "Error al guardar", "error"); return; }
    toast(editTarget ? "Miembro actualizado" : "Miembro registrado");
    setModalOpen(false);
    fetchMiembros();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res  = await fetch(`/api/miembros/${deleteTarget.id_miembro}`, { method: "DELETE" });
    const json = await res.json();
    setDeleting(false);
    if (!res.ok) { toast(json.error ?? "Error al eliminar", "error"); return; }
    toast("Miembro eliminado");
    setConfirmOpen(false);
    fetchMiembros();
  };

  const columns = [
    { key: "nombre",   header: "Nombre",   render: (m: Miembro) => `${m.nombre} ${m.apellido}` },
    { key: "dni",      header: "DNI",      render: (m: Miembro) => m.dni ?? "—" },
    { key: "telefono", header: "Teléfono", render: (m: Miembro) => m.telefono ?? "—" },
    { key: "email",    header: "Email",    render: (m: Miembro) => m.email ?? "—" },
    {
      key: "fecha_cumpleanos",
      header: "Cumpleaños",
      render: (m: Miembro) => formatDate(m.fecha_cumpleanos),
    },
    {
      key: "acciones",
      header: "Acciones",
      className: "w-24",
      render: (m: Miembro) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
            <Pencil size={15} />
          </button>
          <button onClick={() => { setDeleteTarget(m); setConfirmOpen(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-5xl space-y-4">
      <Card>
        <CardHeader
          title="Miembros"
          description="Registro de toda la feligresía"
          action={
            <Button onClick={openCreate} size="sm">
              <Plus size={15} /> Nuevo miembro
            </Button>
          }
        />
        <Table<Miembro>
          columns={columns}
          data={miembros}
          keyField="id_miembro"
          loading={loading}
          emptyMessage="No hay miembros registrados"
        />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? "Editar miembro" : "Nuevo miembro"}
        size="lg"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Nombre"   required value={form.nombre   ?? ""} onChange={(e) => patch("nombre",   e.target.value)} />
          <Input label="Apellido" required value={form.apellido ?? ""} onChange={(e) => patch("apellido", e.target.value)} />
          <Input label="DNI"    value={form.dni       ?? ""} onChange={(e) => patch("dni",      e.target.value)} placeholder="Documento de identidad" />
          <Input label="Teléfono" value={form.telefono ?? ""} onChange={(e) => patch("telefono", e.target.value)} />
          <Input label="Email"  type="email" value={form.email ?? ""} onChange={(e) => patch("email", e.target.value)} />
          <Input label="Fecha de nacimiento" type="date" value={form.fecha_cumpleanos ?? ""} onChange={(e) => patch("fecha_cumpleanos", e.target.value)} />
          <div className="sm:col-span-2">
            <Input label="Dirección" value={form.direccion ?? ""} onChange={(e) => patch("direccion", e.target.value)} placeholder="Dirección completa" />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} loading={saving}>
            {editTarget ? "Guardar cambios" : "Registrar miembro"}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        message={`¿Eliminar a ${deleteTarget?.nombre} ${deleteTarget?.apellido}? Se eliminarán también sus registros.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        loading={deleting}
      />
    </div>
  );
}
