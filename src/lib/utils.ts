import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina clases de Tailwind sin conflictos */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatea fecha a cadena legible en español */
export function formatDate(date: string | Date | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("es-PE", {
    day:   "2-digit",
    month: "long",
    year:  "numeric",
  });
}

/** Devuelve el nombre del trimestre */
export function nombreTrimestre(numero: number): string {
  const nombres = ["Primer", "Segundo", "Tercer", "Cuarto"];
  return `${nombres[numero - 1] ?? "?"} Trimestre`;
}

/** Devuelve etiqueta legible para nivel de estudio */
export function labelEstudio(valor: "PP" | "P" | "N"): string {
  const mapa: Record<string, string> = {
    PP: "Profundo (PP)",
    P:  "Parcial (P)",
    N:  "No estudió",
  };
  return mapa[valor] ?? valor;
}

/** Construye respuesta de error estándar */
export function errorResponse(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
