import type { Metadata } from "next";
import "./globals.css";
import { AppShell }      from "@/components/layout/AppShell";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title:       "Peña Horeb — Escuela Sabática",
  description: "Sistema de registro del avance de estudios bíblicos por grupos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <ToastProvider>
          <AppShell>
            {children}
          </AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}
