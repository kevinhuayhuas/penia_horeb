import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { errorResponse } from "@/lib/utils";
import type { Unidad, UnidadForm } from "@/types";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/unidades/:id
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const rows = await query<Unidad[]>(
      "SELECT * FROM unidades WHERE id_unidad = ?",
      [id]
    );
    if (!rows.length) return errorResponse("Unidad no encontrada", 404);
    return Response.json({ data: rows[0] });
  } catch (e) {
    console.error(e);
    return errorResponse("Error al obtener la unidad", 500);
  }
}

// PUT /api/unidades/:id
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const body: Partial<UnidadForm> = await req.json();

    if (!body.nombre_unidad?.trim()) {
      return errorResponse("El nombre de la unidad es obligatorio");
    }

    await query(
      "UPDATE unidades SET nombre_unidad = ?, activo = ? WHERE id_unidad = ?",
      [body.nombre_unidad.trim(), body.activo ?? true, id]
    );

    return Response.json({ message: "Unidad actualizada" });
  } catch (e) {
    console.error(e);
    return errorResponse("Error al actualizar la unidad", 500);
  }
}

// DELETE /api/unidades/:id
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    await query("DELETE FROM unidades WHERE id_unidad = ?", [id]);
    return Response.json({ message: "Unidad eliminada" });
  } catch (e) {
    console.error(e);
    return errorResponse("Error al eliminar la unidad", 500);
  }
}
