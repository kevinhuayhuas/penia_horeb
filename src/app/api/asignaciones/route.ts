import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { errorResponse } from "@/lib/utils";
import type { UnidadMiembro, AsignacionForm } from "@/types";

// GET /api/asignaciones?unidad=id&anio=yyyy
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idUnidad = searchParams.get("unidad");
    const anio     = searchParams.get("anio");

    const conditions: string[] = [];
    const params: unknown[]    = [];

    if (idUnidad) { conditions.push("um.id_unidad = ?"); params.push(idUnidad); }
    if (anio)     { conditions.push("um.anio = ?");      params.push(anio); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const asignaciones = await query<UnidadMiembro[]>(
      `SELECT um.*, m.nombre, m.apellido, u.nombre_unidad
       FROM unidades_miembros um
       JOIN miembros m ON um.id_miembro = m.id_miembro
       JOIN unidades u ON um.id_unidad  = u.id_unidad
       ${where}
       ORDER BY um.rol ASC, m.apellido ASC`,
      params
    );

    return Response.json({ data: asignaciones });
  } catch (e) {
    console.error(e);
    return errorResponse("Error al obtener las asignaciones", 500);
  }
}

// POST /api/asignaciones
export async function POST(req: NextRequest) {
  try {
    const body: AsignacionForm = await req.json();

    if (!body.id_unidad || !body.id_miembro || !body.rol || !body.anio) {
      return errorResponse("Todos los campos son obligatorios");
    }

    const result = await query<{ insertId: number }>(
      "INSERT INTO unidades_miembros (id_unidad, id_miembro, rol, anio) VALUES (?, ?, ?, ?)",
      [body.id_unidad, body.id_miembro, body.rol, body.anio]
    );

    return Response.json(
      { message: "Asignación creada", data: { id_asignacion: result.insertId } },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return errorResponse("Error al crear la asignación", 500);
  }
}
