import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { errorResponse } from "@/lib/utils";
import type { Unidad, UnidadForm } from "@/types";

// GET /api/unidades
export async function GET() {
  try {
    const unidades = await query<Unidad[]>(
      "SELECT * FROM unidades ORDER BY nombre_unidad ASC"
    );
    return Response.json({ data: unidades });
  } catch (e) {
    console.error(e);
    return errorResponse("Error al obtener las unidades", 500);
  }
}

// POST /api/unidades
export async function POST(req: NextRequest) {
  try {
    const body: UnidadForm = await req.json();

    if (!body.nombre_unidad?.trim()) {
      return errorResponse("El nombre de la unidad es obligatorio");
    }

    const result = await query<{ insertId: number }>(
      "INSERT INTO unidades (nombre_unidad, activo) VALUES (?, ?)",
      [body.nombre_unidad.trim(), body.activo ?? true]
    );

    return Response.json(
      { message: "Unidad creada", data: { id_unidad: result.insertId } },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return errorResponse("Error al crear la unidad", 500);
  }
}
