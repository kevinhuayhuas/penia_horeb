"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button }           from "@/components/ui/Button";
import { Table }            from "@/components/ui/Table";
import { Modal }            from "@/components/ui/Modal";
import { Select }           from "@/components/ui/Select";
import { Input }            from "@/components/ui/Input";
import { ConfirmDialog }    from "@/components/ui/ConfirmDialog";
import { Badge }            from "@/components/ui/Badge";
import { useToast }         from "@/components/ui/Toast";
import { nombreTrimestre }  from "@/lib/utils";
import type { Trimestre, TrimestreForm } from "@/types";

const TRIMESTRE_OPTIONS = [
  { value: 1, label: "1° Trimestre (Enero – Marzo)" },
  { value: 2, label: "2° Trimestre (Abril – Junio)" },
  { value: 3, label: "3° Trimestre (Julio – Septiembre)" },
  { value: 4, label: "4° Trimestre (Octubre – Diciembre)" },
];

const badgeVariants: Record<number, "blue" | "green" | "yellow" | "purple"> = {
  1: "blue", 2: "green", 3: "yellow", 4: "purple",
};

export default function TrimestresPage() {
  const { toast } = useToast();
  const [trimestres, setTrimestres]   = useState<Trimestre[]>([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const [modalOpen, setModalOpen]     = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Trimestre | null>(null);
  const [form, setForm] = useState<TrimestreForm>({
    numero_trimestre: 1,
    anio: new Date().getFullYear(),
  });

  const fetchTrimestres = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/trimestres");
    const json = await res.json();
    setTrimestres(json.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchTrimestres(); }, [fetchTrimestres]);

  const handleSave = async () => {
    setSaving(true);
    const res  = await fetch("/api/trimestres", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) { toast(json.error ?? "Error al crear el trimestre", "error"); return; }
    toast("Trimestre creado");
    setModalOpen(false);
    fetchTrimestres();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res  = await fetch(`/api/trimestres/${deleteTarget.id_trimestre}`, { method: "DELETE" });
    const json = await res.json();
    setDeleting(false);
    if (!res.ok) { toast(json.error ?? "Error", "error"); return; }
    toast("Trimestre eliminado");
    setConfirmOpen(false);
    fetchTrimestres();
  };

  const columns = [
    { key: "id_trimestre", header: "ID", className: "w-16" },
    {
      key: "numero_trimestre",
      header: "Trimestre",
      render: (t: Trimestre) => (
        <Badge variant={badgeVariants[t.numero_trimestre]}>
          {nombreTrimestre(t.numero_trimestre)}
        </Badge>
      ),
    },
    { key: "anio", header: "Año" },
    {
      key: "sabados",
      header: "Sábados",
      render: () => <span className="text-gray-500 text-xs">13 sábados</span>,
    },
    {
      key: "acciones",
      header: "",
      className: "w-16",
      render: (t: Trimestre) => (
        <button
          onClick={() => { setDeleteTarget(t); setConfirmOpen(true); }}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={15} />
        </button>
      ),
    },
  ];

  return (
    <div className="max-w-2xl space-y-4">
      <Card>
        <CardHeader
          title="Trimestres"
          description="Periodos de estudio bíblico (13 sábados cada uno)"
          action={
            <Button onClick={() => setModalOpen(true)} size="sm">
              <Plus size={15} /> Nuevo trimestre
            </Button>
          }
        />
        <Table<Trimestre>
          columns={columns}
          data={trimestres}
          keyField="id_trimestre"
          loading={loading}
          emptyMessage="No hay trimestres registrados"
        />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nuevo trimestre"
        size="sm"
      >
        <div className="space-y-4">
          <Select
            label="Trimestre"
            required
            options={TRIMESTRE_OPTIONS}
            value={form.numero_trimestre}
            onChange={(e) => setForm({ ...form, numero_trimestre: Number(e.target.value) as 1|2|3|4 })}
          />
          <Input
            label="Año"
            type="number"
            required
            min={2020}
            max={2099}
            value={form.anio}
            onChange={(e) => setForm({ ...form, anio: Number(e.target.value) })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>Crear trimestre</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        message={`¿Eliminar el ${nombreTrimestre(deleteTarget?.numero_trimestre ?? 1)} ${deleteTarget?.anio}? Se eliminarán todos sus registros.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        loading={deleting}
      />
    </div>
  );
}
