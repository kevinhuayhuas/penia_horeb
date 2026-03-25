import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { errorResponse } from "@/lib/utils";
import type { RegistroActividad, RegistroForm } from "@/types";

// GET /api/registro?trimestre=id&miembro=id&sabado=n
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idTrimestre = searchParams.get("trimestre");
    const idMiembro   = searchParams.get("miembro");
    const sabado      = searchParams.get("sabado");

    const conditions: string[] = [];
    const params: unknown[]    = [];

    if (idTrimestre) { conditions.push("r.id_trimestre = ?");    params.push(idTrimestre); }
    if (idMiembro)   { conditions.push("r.id_miembro = ?");      params.push(idMiembro); }
    if (sabado)      { conditions.push("r.numero_sabado = ?");   params.push(sabado); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const registros = await query<RegistroActividad[]>(
      `SELECT r.*, m.nombre, m.apellido
       FROM registro_actividad r
       JOIN miembros m ON r.id_miembro = m.id_miembro
       ${where}
       ORDER BY r.numero_sabado ASC, m.apellido ASC`,
      params
    );

    return Response.json({ data: registros });
  } catch (e) {
    console.error(e);
    return errorResponse("Error al obtener los registros", 500);
  }
}

// POST /api/registro
export async function POST(req: NextRequest) {
  try {
    const body: RegistroForm = await req.json();

    if (!body.id_miembro || !body.id_trimestre || !body.numero_sabado) {
      return errorResponse("Miembro, trimestre y número de sábado son obligatorios");
    }

    // Upsert: si ya existe el registro lo actualiza
    const existing = await query<RegistroActividad[]>(
      `SELECT id_registro FROM registro_actividad
       WHERE id_miembro = ? AND id_trimestre = ? AND numero_sabado = ?`,
      [body.id_miembro, body.id_trimestre, body.numero_sabado]
    );

    if (existing.length) {
      await query(
        `UPDATE registro_actividad
         SET estudio_les = ?, asistencia_gp = ?, estudios_biblicos_dados = ?
         WHERE id_registro = ?`,
        [
          body.estudio_les ?? "N",
          body.asistencia_gp ? 1 : 0,
          body.estudios_biblicos_dados ?? 0,
          existing[0].id_registro,
        ]
      );
      return Response.json({ message: "Registro actualizado" });
    }

    const result = await query<{ insertId: number }>(
      `INSERT INTO registro_actividad
         (id_miembro, id_trimestre, numero_sabado, estudio_les, asistencia_gp, estudios_biblicos_dados)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        body.id_miembro,
        body.id_trimestre,
        body.numero_sabado,
        body.estudio_les ?? "N",
        body.asistencia_gp ? 1 : 0,
        body.estudios_biblicos_dados ?? 0,
      ]
    );

    return Response.json(
      { message: "Registro creado", data: { id_registro: result.insertId } },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return errorResponse("Error al guardar el registro", 500);
  }
}
