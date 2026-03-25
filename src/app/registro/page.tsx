"use client";

import { useEffect, useState, useCallback } from "react";
import { Save, BookOpen } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button }           from "@/components/ui/Button";
import { Select }           from "@/components/ui/Select";
import { Badge }            from "@/components/ui/Badge";
import { useToast }         from "@/components/ui/Toast";
import { nombreTrimestre }  from "@/lib/utils";
import type {
  Unidad, Trimestre, UnidadMiembro, RegistroActividad, NivelEstudio,
} from "@/types";

type CellKey = `${number}-${number}`;

interface CellData {
  estudio_les:           NivelEstudio;
  asistencia_gp:         boolean;
  estudios_biblicos_dados: number;
}

const SABADOS = Array.from({ length: 13 }, (_, i) => i + 1);

const ESTUDIO_OPTS: { value: NivelEstudio; label: string; color: string }[] = [
  { value: "PP", label: "PP",  color: "bg-green-100 text-green-700" },
  { value: "P",  label: "P",   color: "bg-yellow-100 text-yellow-700" },
  { value: "N",  label: "N",   color: "bg-red-100 text-red-600" },
];

export default function RegistroPage() {
  const { toast } = useToast();

  const [unidades, setUnidades]     = useState<Unidad[]>([]);
  const [trimestres, setTrimestres] = useState<Trimestre[]>([]);
  const [miembros, setMiembros]     = useState<UnidadMiembro[]>([]);
  const [registros, setRegistros]   = useState<RegistroActividad[]>([]);

  const [idUnidad,    setIdUnidad]    = useState("");
  const [idTrimestre, setIdTrimestre] = useState("");
  const [anio,        setAnio]        = useState(String(new Date().getFullYear()));

  const [cells,   setCells]   = useState<Record<CellKey, CellData>>({});
  const [saving,  setSaving]  = useState<CellKey | null>(null);
  const [loading, setLoading] = useState(false);

  // Cargar catálogos al montar
  useEffect(() => {
    Promise.all([
      fetch("/api/unidades").then((r) => r.json()),
      fetch("/api/trimestres").then((r) => r.json()),
    ]).then(([u, t]) => {
      setUnidades(u.data ?? []);
      setTrimestres(t.data ?? []);
    });
  }, []);

  // Cargar miembros cuando cambia unidad o año
  useEffect(() => {
    if (!idUnidad) return;
    fetch(`/api/asignaciones?unidad=${idUnidad}&anio=${anio}`)
      .then((r) => r.json())
      .then((json) => setMiembros(json.data ?? []));
  }, [idUnidad, anio]);

  // Cargar registros cuando cambia trimestre
  const loadRegistros = useCallback(async () => {
    if (!idTrimestre) return;
    setLoading(true);
    const res  = await fetch(`/api/registro?trimestre=${idTrimestre}`);
    const json = await res.json();
    const rows: RegistroActividad[] = json.data ?? [];

    // Construir mapa de celdas
    const map: Record<CellKey, CellData> = {};
    rows.forEach((r) => {
      const key: CellKey = `${r.id_miembro}-${r.numero_sabado}`;
      map[key] = {
        estudio_les:             r.estudio_les,
        asistencia_gp:           Boolean(r.asistencia_gp),
        estudios_biblicos_dados: r.estudios_biblicos_dados,
      };
    });
    setRegistros(rows);
    setCells(map);
    setLoading(false);
  }, [idTrimestre]);

  useEffect(() => { loadRegistros(); }, [loadRegistros]);

  const getCell = (idMiembro: number, sabado: number): CellData =>
    cells[`${idMiembro}-${sabado}`] ?? {
      estudio_les: "N",
      asistencia_gp: false,
      estudios_biblicos_dados: 0,
    };

  const patchCell = (idMiembro: number, sabado: number, patch: Partial<CellData>) => {
    const key: CellKey = `${idMiembro}-${sabado}`;
    setCells((prev) => ({
      ...prev,
      [key]: { ...getCell(idMiembro, sabado), ...patch },
    }));
  };

  const saveCell = async (idMiembro: number, sabado: number) => {
    if (!idTrimestre) return;
    const key: CellKey = `${idMiembro}-${sabado}`;
    setSaving(key);
    const cell = getCell(idMiembro, sabado);
    await fetch("/api/registro", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_miembro:              idMiembro,
        id_trimestre:            Number(idTrimestre),
        numero_sabado:           sabado,
        estudio_les:             cell.estudio_les,
        asistencia_gp:           cell.asistencia_gp,
        estudios_biblicos_dados: cell.estudios_biblicos_dados,
      }),
    });
    setSaving(null);
    toast("Guardado");
  };

  const unidadOpts  = unidades.map((u) => ({ value: u.id_unidad, label: u.nombre_unidad }));
  const triOpts     = trimestres.map((t) => ({
    value: t.id_trimestre,
    label: `${nombreTrimestre(t.numero_trimestre)} ${t.anio}`,
  }));
  const anioOpts    = [2024, 2025, 2026, 2027].map((a) => ({ value: a, label: String(a) }));

  const listo = idUnidad && idTrimestre && miembros.length > 0;

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card>
        <CardHeader title="Registro sabático" description="Actividad semanal por miembro" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select label="Unidad"     options={unidadOpts}  value={idUnidad}    onChange={(e) => setIdUnidad(e.target.value)}    placeholder="Seleccione..." />
          <Select label="Año"        options={anioOpts}    value={anio}         onChange={(e) => setAnio(e.target.value)} />
          <Select label="Trimestre"  options={triOpts}     value={idTrimestre}  onChange={(e) => setIdTrimestre(e.target.value)} placeholder="Seleccione..." />
        </div>
      </Card>

      {/* Grilla */}
      {listo && (
        <Card padding={false}>
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <BookOpen size={16} className="text-primary-600" />
            <span className="font-semibold text-gray-900 text-sm">
              Cuadro de actividades — {miembros.length} miembro(s)
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent mr-2" />
              Cargando registros...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-left font-semibold text-gray-500 w-40 sticky left-0 bg-gray-50">
                      Miembro
                    </th>
                    <th className="px-2 py-3 text-center font-semibold text-gray-500 w-20">
                      Rol
                    </th>
                    {SABADOS.map((s) => (
                      <th key={s} className="px-2 py-3 text-center font-semibold text-gray-500 min-w-[88px]">
                        Sáb {s}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {miembros.map((m) => (
                    <tr key={m.id_asignacion} className="hover:bg-gray-50/60">
                      {/* Nombre */}
                      <td className="px-4 py-2 font-medium text-gray-800 sticky left-0 bg-white whitespace-nowrap">
                        {m.nombre} {m.apellido}
                      </td>
                      {/* Rol */}
                      <td className="px-2 py-2 text-center">
                        <Badge variant={m.rol === "Maestro" ? "blue" : m.rol === "Maestro Asociado" ? "purple" : "gray"}>
                          {m.rol === "Maestro" ? "Maestro" : m.rol === "Maestro Asociado" ? "M.Asoc." : "Alumno"}
                        </Badge>
                      </td>
                      {/* Celdas por sábado */}
                      {SABADOS.map((s) => {
                        const cell = getCell(m.id_miembro!, s);
                        const key: CellKey = `${m.id_miembro}-${s}`;
                        return (
                          <td key={s} className="px-1 py-1.5 align-top">
                            <div className="flex flex-col gap-1 items-center">
                              {/* Nivel de estudio */}
                              <div className="flex gap-0.5">
                                {ESTUDIO_OPTS.map((opt) => (
                                  <button
                                    key={opt.value}
                                    onClick={() => patchCell(m.id_miembro!, s, { estudio_les: opt.value })}
                                    className={`w-6 h-6 rounded text-xs font-bold transition-all ${
                                      cell.estudio_les === opt.value
                                        ? opt.color + " ring-1 ring-current"
                                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                              {/* Asistencia GP */}
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={cell.asistencia_gp}
                                  onChange={(e) => patchCell(m.id_miembro!, s, { asistencia_gp: e.target.checked })}
                                  className="h-3 w-3 rounded border-gray-300 text-primary-600"
                                />
                                <span className="text-gray-400 text-[10px]">GP</span>
                              </label>
                              {/* Estudios bíblicos */}
                              <input
                                type="number"
                                min={0}
                                value={cell.estudios_biblicos_dados}
                                onChange={(e) => patchCell(m.id_miembro!, s, { estudios_biblicos_dados: Number(e.target.value) })}
                                className="w-10 text-center text-xs border border-gray-200 rounded px-1 py-0.5 focus:outline-none focus:border-primary-400"
                                placeholder="EB"
                              />
                              {/* Guardar */}
                              <button
                                onClick={() => saveCell(m.id_miembro!, s)}
                                disabled={saving === key}
                                className="text-[10px] text-primary-600 hover:text-primary-800 disabled:opacity-50 flex items-center gap-0.5"
                              >
                                {saving === key ? (
                                  <span className="h-2 w-2 rounded-full border border-primary-600 border-t-transparent animate-spin" />
                                ) : (
                                  <Save size={10} />
                                )}
                                Guardar
                              </button>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Leyenda */}
          <div className="px-4 py-3 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-500">
            <span><span className="font-bold text-green-600">PP</span> = Profundo (toda la lección)</span>
            <span><span className="font-bold text-yellow-600">P</span>  = Parcial</span>
            <span><span className="font-bold text-red-500">N</span>   = No estudió</span>
            <span><span className="font-bold text-gray-700">GP</span> = Asistió al grupo pequeño</span>
            <span><span className="font-bold text-gray-700">EB</span> = Estudios bíblicos dados</span>
          </div>
        </Card>
      )}

      {!listo && (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <BookOpen size={40} className="mb-3 text-gray-300" />
            <p className="text-sm font-medium">Selecciona una unidad y un trimestre para comenzar</p>
          </div>
        </Card>
      )}
    </div>
  );
}
