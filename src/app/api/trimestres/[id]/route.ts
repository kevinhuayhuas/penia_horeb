import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { errorResponse } from "@/lib/utils";
import type { Trimestre } from "@/types";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const rows = await query<Trimestre[]>(
      "SELECT * FROM trimestres WHERE id_trimestre = ?",
      [id]
    );
    if (!rows.length) return errorResponse("Trimestre no encontrado", 404);
    return Response.json({ data: rows[0] });
  } catch (e) {
    console.error(e);
    return errorResponse("Error al obtener el trimestre", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    await query("DELETE FROM trimestres WHERE id_trimestre = ?", [id]);
    return Response.json({ message: "Trimestre eliminado" });
  } catch (e) {
    console.error(e);
    return errorResponse("Error al eliminar el trimestre", 500);
  }
}
