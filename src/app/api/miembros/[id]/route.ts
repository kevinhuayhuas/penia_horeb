import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { errorResponse } from "@/lib/utils";
import type { Miembro, MiembroForm } from "@/types";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/miembros/:id
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const rows = await query<Miembro[]>(
      "SELECT * FROM miembros WHERE id_miembro = ?",
      [id]
    );
    if (!rows.length) return errorResponse("Miembro no encontrado", 404);
    return Response.json({ data: rows[0] });
  } catch (e) {
    console.error(e);
    return errorResponse("Error al obtener el miembro", 500);
  }
}

// PUT /api/miembros/:id
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const body: Partial<MiembroForm> = await req.json();

    if (!body.nombre?.trim() || !body.apellido?.trim()) {
      return errorResponse("Nombre y apellido son obligatorios");
    }

    await query(
      `UPDATE miembros
       SET dni = ?, nombre = ?, apellido = ?, telefono = ?,
           email = ?, direccion = ?, fecha_cumpleanos = ?
       WHERE id_miembro = ?`,
      [
        body.dni              ?? null,
        body.nombre.trim(),
        body.apellido.trim(),
        body.telefono         ?? null,
        body.email            ?? null,
        body.direccion        ?? null,
        body.fecha_cumpleanos ?? null,
        id,
      ]
    );

    return Response.json({ message: "Miembro actualizado" });
  } catch (e) {
    console.error(e);
    return errorResponse("Error al actualizar el miembro", 500);
  }
}

// DELETE /api/miembros/:id
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    await query("DELETE FROM miembros WHERE id_miembro = ?", [id]);
    return Response.json({ message: "Miembro eliminado" });
  } catch (e) {
    console.error(e);
    return errorResponse("Error al eliminar el miembro", 500);
  }
}
