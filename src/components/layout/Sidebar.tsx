"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Users, BookOpen, Calendar,
  Target, BarChart3, BookMarked, ChevronRight,
  ShieldCheck, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RolUsuario } from "@/types";

interface NavItem {
  href:       string;
  label:      string;
  icon:       React.ElementType;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: "/",         label: "Dashboard",        icon: LayoutDashboard },
  { href: "/unidades", label: "Unidades",          icon: BookMarked },
  { href: "/miembros", label: "Miembros",          icon: Users },
  { href: "/trimestres",label: "Trimestres",       icon: Calendar },
  { href: "/registro", label: "Registro",          icon: BookOpen },
  { href: "/metas",    label: "Metas Misioneras",  icon: Target },
  { href: "/reportes", label: "Reportes",          icon: BarChart3 },
  { href: "/usuarios", label: "Usuarios",          icon: ShieldCheck, adminOnly: true },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [rol, setRol] = useState<RolUsuario | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((json) => json && setRol(json.data?.rol ?? null));
  }, []);

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || rol === "Admin"
  );

  return (
    <>
      {/* Backdrop móvil */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "flex flex-col w-64 shrink-0 bg-primary-950 min-h-screen",
        "fixed inset-y-0 left-0 z-30 transition-transform duration-300",
        "md:static md:inset-auto md:translate-x-0 md:z-auto",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-primary-800/50">
        <div className="w-9 h-9 rounded-xl bg-accent-500 flex items-center justify-center shadow-md">
          <BookOpen size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-white font-bold text-sm leading-tight">Peña Horeb</p>
          <p className="text-primary-400 text-xs">Escuela Sabática</p>
        </div>
        {/* Botón cerrar en móvil */}
        <button
          onClick={onClose}
          className="md:hidden p-1 rounded-lg text-primary-400 hover:text-white hover:bg-primary-800/60 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {visibleItems.map(({ href, label, icon: Icon, adminOnly }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm",
                "transition-all duration-150 group",
                isActive
                  ? "bg-primary-700 text-white font-medium shadow-sm"
                  : "text-primary-300 hover:bg-primary-800/60 hover:text-white"
              )}
            >
              <Icon
                size={18}
                className={cn(
                  "shrink-0 transition-colors",
                  isActive
                    ? "text-white"
                    : adminOnly
                      ? "text-accent-400 group-hover:text-white"
                      : "text-primary-400 group-hover:text-white"
                )}
              />
              <span className="flex-1">{label}</span>
              {adminOnly && !isActive && (
                <span className="text-[10px] bg-accent-500/20 text-accent-300 px-1.5 py-0.5 rounded-full font-medium">
                  Admin
                </span>
              )}
              {isActive && (
                <ChevronRight size={14} className="text-primary-300" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-primary-800/50">
        <p className="text-primary-500 text-xs text-center">
          Sistema v1.0 • 2026
        </p>
      </div>
    </aside>
    </>
  );
}
