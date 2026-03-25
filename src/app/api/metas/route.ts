import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { errorResponse } from "@/lib/utils";
import type { MetaMisionera, MetaForm } from "@/types";

// GET /api/metas?unidad=id&trimestre=id&sabado=n
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idUnidad    = searchParams.get("unidad");
    const idTrimestre = searchParams.get("trimestre");
    const sabado      = searchParams.get("sabado");

    const conditions: string[] = [];
    const params: unknown[]    = [];

    if (idUnidad)    { conditions.push("mm.id_unidad = ?");     params.push(idUnidad); }
    if (idTrimestre) { conditions.push("mm.id_trimestre = ?");  params.push(idTrimestre); }
    if (sabado)      { conditions.push("mm.numero_sabado = ?"); params.push(sabado); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const metas = await query<MetaMisionera[]>(
      `SELECT mm.*, u.nombre_unidad
       FROM metas_misioneras mm
       JOIN unidades u ON mm.id_unidad = u.id_unidad
       ${where}
       ORDER BY mm.numero_sabado ASC`,
      params
    );

    return Response.json({ data: metas });
  } catch (e) {
    console.error(e);
    return errorResponse("Error al obtener las metas", 500);
  }
}

// POST /api/metas — upsert por (unidad, trimestre, sabado)
export async function POST(req: NextRequest) {
  try {
    const body: MetaForm = await req.json();

    if (!body.id_unidad || !body.id_trimestre || !body.numero_sabado) {
      return errorResponse("Unidad, trimestre y sábado son obligatorios");
    }

    const existing = await query<MetaMisionera[]>(
      `SELECT id_meta FROM metas_misioneras
       WHERE id_unidad = ? AND id_trimestre = ? AND numero_sabado = ?`,
      [body.id_unidad, body.id_trimestre, body.numero_sabado]
    );

    if (existing.length) {
      await query(
        `UPDATE metas_misioneras
         SET miembros_presentes = ?, estudio_siete_dias = ?,
             asistencia_gp_total = ?, estudiantes_biblia_total = ?, bautismos = ?
         WHERE id_meta = ?`,
        [
          body.miembros_presentes       ?? 0,
          body.estudio_siete_dias       ?? 0,
          body.asistencia_gp_total      ?? 0,
          body.estudiantes_biblia_total ?? 0,
          body.bautismos                ?? 0,
          existing[0].id_meta,
        ]
      );
      return Response.json({ message: "Meta actualizada" });
    }

    const result = await query<{ insertId: number }>(
      `INSERT INTO metas_misioneras
         (id_unidad, id_trimestre, numero_sabado, miembros_presentes,
          estudio_siete_dias, asistencia_gp_total, estudiantes_biblia_total, bautismos)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.id_unidad,
        body.id_trimestre,
        body.numero_sabado,
        body.miembros_presentes       ?? 0,
        body.estudio_siete_dias       ?? 0,
        body.asistencia_gp_total      ?? 0,
        body.estudiantes_biblia_total ?? 0,
        body.bautismos                ?? 0,
      ]
    );

    return Response.json(
      { message: "Meta creada", data: { id_meta: result.insertId } },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return errorResponse("Error al guardar la meta", 500);
  }
}
