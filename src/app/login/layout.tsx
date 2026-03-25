import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar sesión — Peña Horeb",
};

// El login tiene su propio layout sin sidebar ni header
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
