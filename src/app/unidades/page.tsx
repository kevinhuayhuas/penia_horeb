"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { Card, CardHeader }  from "@/components/ui/Card";
import { Button }            from "@/components/ui/Button";
import { Table }             from "@/components/ui/Table";
import { Modal }             from "@/components/ui/Modal";
import { Input }             from "@/components/ui/Input";
import { ConfirmDialog }     from "@/components/ui/ConfirmDialog";
import { Badge }             from "@/components/ui/Badge";
import { useToast }          from "@/components/ui/Toast";
import type { Unidad, UnidadForm } from "@/types";

const EMPTY_FORM: UnidadForm = { nombre_unidad: "", activo: true };

export default function UnidadesPage() {
  const { toast } = useToast();
  const [unidades, setUnidades]       = useState<Unidad[]>([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const [modalOpen, setModalOpen]     = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editTarget, setEditTarget]   = useState<Unidad | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Unidad | null>(null);
  const [form, setForm]               = useState<UnidadForm>(EMPTY_FORM);
  const [error, setError]             = useState("");

  const fetchUnidades = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/unidades");
    const json = await res.json();
    setUnidades(json.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUnidades(); }, [fetchUnidades]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (u: Unidad) => {
    setEditTarget(u);
    setForm({ nombre_unidad: u.nombre_unidad, activo: u.activo });
    setError("");
    setModalOpen(true);
  };

  const openDelete = (u: Unidad) => {
    setDeleteTarget(u);
    setConfirmOpen(true);
  };

  const handleSave = async () => {
    if (!form.nombre_unidad.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    setSaving(true);
    const url    = editTarget ? `/api/unidades/${editTarget.id_unidad}` : "/api/unidades";
    const method = editTarget ? "PUT" : "POST";
    const res    = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) {
      toast(json.error ?? "Error al guardar", "error");
      return;
    }
    toast(editTarget ? "Unidad actualizada" : "Unidad creada");
    setModalOpen(false);
    fetchUnidades();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res  = await fetch(`/api/unidades/${deleteTarget.id_unidad}`, { method: "DELETE" });
    const json = await res.json();
    setDeleting(false);
    if (!res.ok) { toast(json.error ?? "Error al eliminar", "error"); return; }
    toast("Unidad eliminada");
    setConfirmOpen(false);
    fetchUnidades();
  };

  const columns = [
    { key: "id_unidad", header: "ID", className: "w-16" },
    {
      key: "nombre_unidad",
      header: "Nombre",
      render: (u: Unidad) => (
        <Link
          href={`/unidades/${u.id_unidad}`}
          className="font-medium text-primary-600 hover:text-primary-800 hover:underline"
        >
          {u.nombre_unidad}
        </Link>
      ),
    },
    {
      key: "activo",
      header: "Estado",
      render: (u: Unidad) => (
        <Badge variant={u.activo ? "green" : "gray"}>
          {u.activo ? "Activa" : "Inactiva"}
        </Badge>
      ),
    },
    {
      key: "acciones",
      header: "Acciones",
      className: "w-40",
      render: (u: Unidad) => (
        <div className="flex items-center gap-1">
          {/* Botón principal: Ver miembros */}
          <Link
            href={`/unidades/${u.id_unidad}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors"
          >
            <Users size={13} /> Miembros
          </Link>
          <button
            onClick={() => openEdit(u)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => openDelete(u)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-3xl space-y-4">
      <Card>
        <CardHeader
          title="Unidades de estudio"
          description="Grupos bíblicos con sus maestros y alumnos"
          action={
            <Button onClick={openCreate} size="sm">
              <Plus size={15} /> Nueva unidad
            </Button>
          }
        />

        <Table<Unidad>
          columns={columns}
          data={unidades}
          keyField="id_unidad"
          loading={loading}
          emptyMessage="No hay unidades registradas"
        />
      </Card>

      {/* Modal crear/editar */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? "Editar unidad" : "Nueva unidad"}
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Nombre de la unidad"
            required
            value={form.nombre_unidad}
            error={error}
            onChange={(e) => { setForm({ ...form, nombre_unidad: e.target.value }); setError(""); }}
            placeholder="Ej: Unidad Misael"
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="activo"
              checked={form.activo}
              onChange={(e) => setForm({ ...form, activo: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="activo" className="text-sm text-gray-700">
              Unidad activa
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {editTarget ? "Guardar cambios" : "Crear unidad"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmar eliminación */}
      <ConfirmDialog
        open={confirmOpen}
        message={`¿Eliminar la unidad "${deleteTarget?.nombre_unidad}"? Esta acción también eliminará sus asignaciones.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        loading={deleting}
      />
    </div>
  );
}
