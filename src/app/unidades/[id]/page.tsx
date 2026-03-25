"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Card, CardHeader }  from "@/components/ui/Card";
import { Button }            from "@/components/ui/Button";
import { Table }             from "@/components/ui/Table";
import { Modal }             from "@/components/ui/Modal";
import { Select }            from "@/components/ui/Select";
import { Badge }             from "@/components/ui/Badge";
import { ConfirmDialog }     from "@/components/ui/ConfirmDialog";
import { useToast }          from "@/components/ui/Toast";
import type { Unidad, UnidadMiembro, Miembro, AsignacionForm, RolMiembro } from "@/types";

const ROL_OPTS: { value: RolMiembro; label: string }[] = [
  { value: "Maestro",           label: "Maestro" },
  { value: "Maestro Asociado",  label: "Maestro Asociado" },
  { value: "Alumno",            label: "Alumno" },
];

const badgeMap: Record<RolMiembro, "blue" | "purple" | "gray"> = {
  "Maestro":          "blue",
  "Maestro Asociado": "purple",
  "Alumno":           "gray",
};

const anioOpts = [2024, 2025, 2026, 2027].map((a) => ({ value: a, label: String(a) }));

export default function UnidadDetallePage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();
  const { toast } = useToast();

  const [unidad, setUnidad]         = useState<Unidad | null>(null);
  const [asignaciones, setAsignaciones] = useState<UnidadMiembro[]>([]);
  const [miembros, setMiembros]     = useState<Miembro[]>([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [modalOpen, setModalOpen]   = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UnidadMiembro | null>(null);
  const [form, setForm] = useState<Omit<AsignacionForm, "id_unidad">>({
    id_miembro: 0,
    rol: "Alumno",
    anio: new Date().getFullYear(),
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [uRes, aRes, mRes] = await Promise.all([
      fetch(`/api/unidades/${id}`).then((r) => r.json()),
      fetch(`/api/asignaciones?unidad=${id}`).then((r) => r.json()),
      fetch("/api/miembros").then((r) => r.json()),
    ]);
    setUnidad(uRes.data ?? null);
    setAsignaciones(aRes.data ?? []);
    setMiembros(mRes.data ?? []);
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    if (!form.id_miembro) { toast("Selecciona un miembro", "error"); return; }
    setSaving(true);
    const body: AsignacionForm = { ...form, id_unidad: Number(id) };
    const res  = await fetch("/api/asignaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) { toast(json.error ?? "Error", "error"); return; }
    toast("Miembro asignado");
    setModalOpen(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res  = await fetch(`/api/asignaciones/${deleteTarget.id_asignacion}`, { method: "DELETE" });
    const json = await res.json();
    setDeleting(false);
    if (!res.ok) { toast(json.error ?? "Error", "error"); return; }
    toast("Asignación eliminada");
    setConfirmOpen(false);
    fetchData();
  };

  const miembroOpts = miembros.map((m) => ({
    value: m.id_miembro,
    label: `${m.nombre} ${m.apellido}`,
  }));

  const columns = [
    {
      key: "nombre",
      header: "Miembro",
      render: (a: UnidadMiembro) => `${a.nombre} ${a.apellido}`,
    },
    {
      key: "rol",
      header: "Rol",
      render: (a: UnidadMiembro) => (
        <Badge variant={badgeMap[a.rol]}>{a.rol}</Badge>
      ),
    },
    { key: "anio", header: "Año" },
    {
      key: "acciones",
      header: "",
      className: "w-16",
      render: (a: UnidadMiembro) => (
        <button
          onClick={() => { setDeleteTarget(a); setConfirmOpen(true); }}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={15} />
        </button>
      ),
    },
  ];

  return (
    <div className="max-w-2xl space-y-4">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft size={15} /> Volver
      </Button>

      <Card>
        <CardHeader
          title={unidad ? `Unidad: ${unidad.nombre_unidad}` : "Cargando..."}
          description="Miembros asignados a esta unidad"
          action={
            <Button onClick={() => setModalOpen(true)} size="sm">
              <Plus size={15} /> Asignar miembro
            </Button>
          }
        />
        <Table<UnidadMiembro>
          columns={columns}
          data={asignaciones}
          keyField="id_asignacion"
          loading={loading}
          emptyMessage="No hay miembros asignados"
        />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Asignar miembro"
        size="sm"
      >
        <div className="space-y-4">
          <Select
            label="Miembro"
            required
            options={miembroOpts}
            value={form.id_miembro || ""}
            onChange={(e) => setForm({ ...form, id_miembro: Number(e.target.value) })}
            placeholder="Seleccione..."
          />
          <Select
            label="Rol"
            required
            options={ROL_OPTS}
            value={form.rol}
            onChange={(e) => setForm({ ...form, rol: e.target.value as RolMiembro })}
          />
          <Select
            label="Año"
            required
            options={anioOpts}
            value={form.anio}
            onChange={(e) => setForm({ ...form, anio: Number(e.target.value) })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>Asignar</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        message={`¿Quitar a ${deleteTarget?.nombre} ${deleteTarget?.apellido} de esta unidad?`}
        confirmLabel="Quitar"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        loading={deleting}
      />
    </div>
  );
}
