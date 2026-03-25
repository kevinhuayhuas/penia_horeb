"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookMarked, Users, Calendar, BookOpen,
  Target, BarChart3, ArrowRight
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { DashboardStats } from "@/types";

interface StatCard {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  href: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((json) => setStats(json.data))
      .finally(() => setLoading(false));
  }, []);

  const cards: StatCard[] = [
    {
      label: "Unidades activas",
      value: stats?.totalUnidades ?? 0,
      icon:  BookMarked,
      color: "text-primary-600 bg-primary-50",
      href:  "/unidades",
    },
    {
      label: "Miembros registrados",
      value: stats?.totalMiembros ?? 0,
      icon:  Users,
      color: "text-green-600 bg-green-50",
      href:  "/miembros",
    },
    {
      label: "Trimestres",
      value: stats?.totalTrimestres ?? 0,
      icon:  Calendar,
      color: "text-amber-600 bg-amber-50",
      href:  "/trimestres",
    },
    {
      label: "Registros de actividad",
      value: stats?.totalRegistros ?? 0,
      icon:  BookOpen,
      color: "text-purple-600 bg-purple-50",
      href:  "/registro",
    },
  ];

  const quickLinks = [
    { href: "/registro",  label: "Registrar actividad semanal", icon: BookOpen,  desc: "Ingresa los sábados de cada miembro" },
    { href: "/metas",     label: "Actualizar metas misioneras",  icon: Target,    desc: "Registra los avances de la unidad" },
    { href: "/reportes",  label: "Ver reporte de fidelidad",     icon: BarChart3, desc: "Analiza el desempeño del trimestre" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Bienvenida */}
      <div className="rounded-2xl bg-gradient-to-r from-primary-700 to-primary-900 p-6 text-white">
        <h2 className="text-2xl font-bold mb-1">¡Bienvenido al Sistema!</h2>
        <p className="text-primary-200 text-sm">
          Gestiona el avance de los estudios bíblicos de los grupos de la Escuela Sabática.
        </p>
      </div>

      {/* Stats */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Resumen general
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(({ label, value, icon: Icon, color, href }) => (
            <Link key={href} href={href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {loading ? (
                        <span className="inline-block w-8 h-8 rounded bg-gray-100 animate-pulse" />
                      ) : (
                        value.toLocaleString()
                      )}
                    </p>
                  </div>
                  <div className={`rounded-xl p-2.5 ${color}`}>
                    <Icon size={20} />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Accesos rápidos */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Accesos rápidos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickLinks.map(({ href, label, icon: Icon, desc }) => (
            <Link key={href} href={href}>
              <Card className="hover:shadow-md hover:border-primary-200 transition-all cursor-pointer h-full">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl p-2.5 bg-primary-50 text-primary-600 shrink-0">
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                  <ArrowRight size={16} className="text-gray-400 shrink-0 mt-0.5" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
