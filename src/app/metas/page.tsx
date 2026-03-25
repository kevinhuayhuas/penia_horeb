"use client";

import { useEffect, useState, useCallback } from "react";
import { Save, Target } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Select }           from "@/components/ui/Select";
import { useToast }         from "@/components/ui/Toast";
import { nombreTrimestre }  from "@/lib/utils";
import type { Unidad, Trimestre, MetaMisionera, MetaForm } from "@/types";

const SABADOS = Array.from({ length: 13 }, (_, i) => i + 1);

type MetasMap = Record<number, Partial<MetaMisionera>>;

export default function MetasPage() {
  const { toast } = useToast();

  const [unidades, setUnidades]     = useState<Unidad[]>([]);
  const [trimestres, setTrimestres] = useState<Trimestre[]>([]);
  const [idUnidad,    setIdUnidad]    = useState("");
  const [idTrimestre, setIdTrimestre] = useState("");
  const [metas, setMetas]     = useState<MetasMap>({});
  const [saving, setSaving]   = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/unidades").then((r) => r.json()),
      fetch("/api/trimestres").then((r) => r.json()),
    ]).then(([u, t]) => {
      setUnidades(u.data ?? []);
      setTrimestres(t.data ?? []);
    });
  }, []);

  const loadMetas = useCallback(async () => {
    if (!idUnidad || !idTrimestre) return;
    setLoading(true);
    const res  = await fetch(`/api/metas?unidad=${idUnidad}&trimestre=${idTrimestre}`);
    const json = await res.json();
    const map: MetasMap = {};
    (json.data as MetaMisionera[]).forEach((m) => { map[m.numero_sabado] = m; });
    setMetas(map);
    setLoading(false);
  }, [idUnidad, idTrimestre]);

  useEffect(() => { loadMetas(); }, [loadMetas]);

  const getMeta = (sabado: number): Partial<MetaMisionera> =>
    metas[sabado] ?? {
      miembros_presentes: 0, estudio_siete_dias: 0,
      asistencia_gp_total: 0, estudiantes_biblia_total: 0, bautismos: 0,
    };

  const patchMeta = (sabado: number, field: string, value: number) => {
    setMetas((prev) => ({
      ...prev,
      [sabado]: { ...getMeta(sabado), [field]: value },
    }));
  };

  const saveMeta = async (sabado: number) => {
    if (!idUnidad || !idTrimestre) return;
    setSaving(sabado);
    const meta = getMeta(sabado);
    const body: MetaForm = {
      id_unidad:               Number(idUnidad),
      id_trimestre:            Number(idTrimestre),
      numero_sabado:           sabado,
      miembros_presentes:       meta.miembros_presentes       ?? 0,
      estudio_siete_dias:       meta.estudio_siete_dias       ?? 0,
      asistencia_gp_total:      meta.asistencia_gp_total      ?? 0,
      estudiantes_biblia_total: meta.estudiantes_biblia_total ?? 0,
      bautismos:                meta.bautismos                ?? 0,
    };
    const res  = await fetch("/api/metas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    setSaving(null);
    if (!res.ok) { toast(json.error ?? "Error", "error"); return; }
    toast(`Sábado ${sabado} guardado`);
    loadMetas();
  };

  const unidadOpts  = unidades.map((u) => ({ value: u.id_unidad, label: u.nombre_unidad }));
  const triOpts     = trimestres.map((t) => ({
    value: t.id_trimestre,
    label: `${nombreTrimestre(t.numero_trimestre)} ${t.anio}`,
  }));

  const listo = idUnidad && idTrimestre;

  const FIELDS: { key: keyof MetaMisionera; label: string }[] = [
    { key: "miembros_presentes",       label: "Presentes"  },
    { key: "estudio_siete_dias",       label: "Est. 7 días" },
    { key: "asistencia_gp_total",      label: "Asist. GP"  },
    { key: "estudiantes_biblia_total", label: "Est. Biblia" },
    { key: "bautismos",                label: "Bautismos"  },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Metas Misioneras" description="Seguimiento semanal de objetivos por unidad" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Unidad"    options={unidadOpts} value={idUnidad}    onChange={(e) => setIdUnidad(e.target.value)}    placeholder="Seleccione..." />
          <Select label="Trimestre" options={triOpts}    value={idTrimestre} onChange={(e) => setIdTrimestre(e.target.value)} placeholder="Seleccione..." />
        </div>
      </Card>

      {listo && (
        <Card padding={false}>
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <Target size={16} className="text-accent-500" />
            <span className="font-semibold text-gray-900 text-sm">Cuadro de metas</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent mr-2" />
              Cargando...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-left font-semibold text-gray-500 w-28 sticky left-0 bg-gray-50">
                      Sábado
                    </th>
                    {FIELDS.map((f) => (
                      <th key={f.key} className="px-3 py-3 text-center font-semibold text-gray-500 min-w-[100px]">
                        {f.label}
                      </th>
                    ))}
                    <th className="px-3 py-3 w-20" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {SABADOS.map((s) => {
                    const meta = getMeta(s);
                    return (
                      <tr key={s} className="hover:bg-gray-50/60">
                        <td className="px-4 py-2 font-medium text-gray-700 sticky left-0 bg-white">
                          Sábado {s}
                        </td>
                        {FIELDS.map((f) => (
                          <td key={f.key} className="px-3 py-1.5 text-center">
                            <input
                              type="number"
                              min={0}
                              value={(meta[f.key] as number) ?? 0}
                              onChange={(e) => patchMeta(s, f.key, Number(e.target.value))}
                              className="w-20 text-center text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/20"
                            />
                          </td>
                        ))}
                        <td className="px-3 py-1.5 text-center">
                          <button
                            onClick={() => saveMeta(s)}
                            disabled={saving === s}
                            className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800 disabled:opacity-50 font-medium"
                          >
                            {saving === s ? (
                              <span className="h-3 w-3 rounded-full border border-primary-600 border-t-transparent animate-spin" />
                            ) : (
                              <Save size={12} />
                            )}
                            Guardar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {!listo && (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Target size={40} className="mb-3 text-gray-300" />
            <p className="text-sm font-medium">Selecciona una unidad y un trimestre</p>
          </div>
        </Card>
      )}
    </div>
  );
}
