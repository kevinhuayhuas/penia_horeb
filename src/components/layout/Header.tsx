"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState }    from "react";
import { Calendar, LogOut, User, ShieldCheck, Menu } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { SessionData } from "@/lib/session";

const titles: Record<string, { title: string; subtitle: string }> = {
  "/":          { title: "Dashboard",        subtitle: "Resumen general del sistema" },
  "/unidades":  { title: "Unidades",         subtitle: "Gestión de grupos de estudio" },
  "/miembros":  { title: "Miembros",         subtitle: "Registro de feligresía" },
  "/trimestres":{ title: "Trimestres",       subtitle: "Periodos de estudio" },
  "/registro":  { title: "Registro Sabático",subtitle: "Actividad semanal por miembro" },
  "/metas":     { title: "Metas Misioneras", subtitle: "Seguimiento de objetivos" },
  "/reportes":  { title: "Reportes",         subtitle: "Estadísticas de fidelidad" },
  "/usuarios":  { title: "Usuarios",         subtitle: "Gestión de cuentas del sistema" },
};

type UserInfo = Pick<SessionData, "nombre" | "email" | "rol">;

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const segment  = "/" + (pathname.split("/")[1] ?? "");
  const info     = titles[segment] ?? { title: "Sistema", subtitle: "Escuela Sabática" };

  const [user,       setUser]       = useState<UserInfo | null>(null);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Carga el usuario autenticado
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((json) => json && setUser(json.data));
  }, [pathname]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-white border-b border-gray-100 shrink-0">
      <div className="flex items-center gap-3">
        {/* Hamburger en móvil */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
        {/* Título de página */}
        <div>
          <h1 className="text-base md:text-lg font-semibold text-gray-900 leading-tight">
            {info.title}
          </h1>
          <p className="text-xs text-gray-500 hidden sm:block">{info.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Fecha */}
        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
          <Calendar size={15} className="text-gray-400" />
          <span>{formatDate(new Date())}</span>
        </div>

        {/* Menú de usuario */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-xl px-3 py-1.5 hover:bg-gray-100 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-xs">
                {user.nombre.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-gray-900 leading-tight">
                  {user.nombre}
                </p>
                <p className="text-xs text-gray-500 leading-tight flex items-center gap-1">
                  {user.rol === "Admin"
                    ? <><ShieldCheck size={10} className="text-primary-600" /> Admin</>
                    : <><User size={10} /> Maestro</>
                  }
                </p>
              </div>
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <>
                {/* Cierra al hacer clic fuera */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-20 w-52 rounded-xl bg-white border border-gray-100 shadow-lg py-1 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user.nombre}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {loggingOut ? (
                      <span className="h-4 w-4 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
                    ) : (
                      <LogOut size={15} />
                    )}
                    Cerrar sesión
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
