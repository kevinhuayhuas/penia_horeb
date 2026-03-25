"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Users, BookOpen } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button }           from "@/components/ui/Button";
import { Select }           from "@/components/ui/Select";
import { Badge }            from "@/components/ui/Badge";
import { useToast }         from "@/components/ui/Toast";
import { nombreTrimestre }  from "@/lib/utils";
import type { Unidad, Trimestre, ReporteFidelidad } from "@/types";

export default function ReportesPage() {
  const { toast } = useToast();

  const [unidades, setUnidades]     = useState<Unidad[]>([]);
  const [trimestres, setTrimestres] = useState<Trimestre[]>([]);
  const [idUnidad,    setIdUnidad]    = useState("");
  const [idTrimestre, setIdTrimestre] = useState("");
  const [reporte, setReporte]         = useState<ReporteFidelidad[] | null>(null);
  const [loading, setLoading]         = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/unidades").then((r) => r.json()),
      fetch("/api/trimestres").then((r) => r.json()),
    ]).then(([u, t]) => {
      setUnidades(u.data ?? []);
      setTrimestres(t.data ?? []);
    });
  }, []);

  const generarReporte = async () => {
    if (!idUnidad || !idTrimestre) {
      toast("Selecciona unidad y trimestre", "error");
      return;
    }
    setLoading(true);
    const res  = await fetch(`/api/reportes/fidelidad?unidad=${idUnidad}&trimestre=${idTrimestre}`);
    const json = await res.json();
    setLoading(false);
    if (!res.ok) { toast(json.error ?? "Error", "error"); return; }
    setReporte(json.data ?? []);
  };

  const unidadOpts = unidades.map((u) => ({ value: u.id_unidad, label: u.nombre_unidad }));
  const triOpts    = trimestres.map((t) => ({
    value: t.id_trimestre,
    label: `${nombreTrimestre(t.numero_trimestre)} ${t.anio}`,
  }));

  const triLabel = () => {
    const t = trimestres.find((t) => String(t.id_trimestre) === idTrimestre);
    return t ? `${nombreTrimestre(t.numero_trimestre)} ${t.anio}` : "";
  };
  const uLabel = () => unidades.find((u) => String(u.id_unidad) === idUnidad)?.nombre_unidad ?? "";

  // Totales — Number() garantiza que MySQL2 no devuelva strings en SUM/COUNT
  const totalFidelidad  = reporte?.reduce((s, r) => s + Number(r.total_fidelidad_completa), 0) ?? 0;
  const totalGP         = reporte?.reduce((s, r) => s + Number(r.total_asistencia_gp), 0) ?? 0;
  const totalEB         = reporte?.reduce((s, r) => s + Number(r.total_estudios_dados), 0) ?? 0;

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Filtros */}
      <Card>
        <CardHeader title="Reporte de Fidelidad" description="Análisis por unidad y trimestre" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <Select label="Unidad"    options={unidadOpts} value={idUnidad}    onChange={(e) => setIdUnidad(e.target.value)}    placeholder="Seleccione..." />
          <Select label="Trimestre" options={triOpts}    value={idTrimestre} onChange={(e) => setIdTrimestre(e.target.value)} placeholder="Seleccione..." />
          <Button onClick={generarReporte} loading={loading}>
            <BarChart3 size={15} />
            Generar reporte
          </Button>
        </div>
      </Card>

      {reporte && (
        <>
          {/* Totales */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Est. completo (PP)", value: totalFidelidad, icon: BookOpen,   color: "text-green-600 bg-green-50" },
              { label: "Asist. grupo peq.",  value: totalGP,        icon: Users,      color: "text-blue-600 bg-blue-50" },
              { label: "Estudios bíblicos",  value: totalEB,        icon: TrendingUp, color: "text-purple-600 bg-purple-50" },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label} className="flex items-center gap-4">
                <div className={`rounded-xl p-3 ${color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Tabla */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Detalle por miembro
                </h3>
                <p className="text-xs text-gray-500">
                  {uLabel()} · {triLabel()}
                </p>
              </div>
              <Badge variant="blue">{reporte.length} miembros</Badge>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Miembro
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Sáb. PP (fidelidad)
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Asist. Grupo Peq.
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Est. Bíblicos
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Fidelidad
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reporte.map((r, idx) => {
                    const pct = Math.round((Number(r.total_fidelidad_completa) / 13) * 100);
                    return (
                      <tr key={idx} className="hover:bg-gray-50/60">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {r.nombre} {r.apellido}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-bold text-green-700">{Number(r.total_fidelidad_completa)}</span>
                          <span className="text-gray-400">/13</span>
                        </td>
                        <td className="px-4 py-3 text-center text-blue-700 font-medium">
                          {Number(r.total_asistencia_gp)}
                        </td>
                        <td className="px-4 py-3 text-center text-purple-700 font-medium">
                          {Number(r.total_estudios_dados)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center gap-2 justify-center">
                            <div className="w-24 h-2 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  pct >= 80 ? "bg-green-500" :
                                  pct >= 50 ? "bg-yellow-500" : "bg-red-400"
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-600 w-8">
                              {pct}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {!reporte && (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <BarChart3 size={40} className="mb-3 text-gray-300" />
            <p className="text-sm font-medium">
              Selecciona los filtros y presiona "Generar reporte"
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
