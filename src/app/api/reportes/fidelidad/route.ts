import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { errorResponse } from "@/lib/utils";
import type { ReporteFidelidad } from "@/types";

// GET /api/reportes/fidelidad?unidad=id&trimestre=id
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idUnidad    = searchParams.get("unidad");
    const idTrimestre = searchParams.get("trimestre");

    if (!idUnidad || !idTrimestre) {
      return errorResponse("Los parámetros unidad y trimestre son obligatorios");
    }

    const reporte = await query<ReporteFidelidad[]>(
      `SELECT
         m.nombre,
         m.apellido,
         COUNT(CASE WHEN r.estudio_les = 'PP' THEN 1 END)  AS total_fidelidad_completa,
         COUNT(CASE WHEN r.asistencia_gp = 1 THEN 1 END)   AS total_asistencia_gp,
         COALESCE(SUM(r.estudios_biblicos_dados), 0)        AS total_estudios_dados
       FROM miembros m
       JOIN unidades_miembros um ON m.id_miembro = um.id_miembro
       LEFT JOIN registro_actividad r
         ON m.id_miembro = r.id_miembro AND r.id_trimestre = ?
       WHERE um.id_unidad = ?
       GROUP BY m.id_miembro, m.nombre, m.apellido
       ORDER BY total_fidelidad_completa DESC, m.apellido ASC`,
      [idTrimestre, idUnidad]
    );

    return Response.json({ data: reporte });
  } catch (e) {
    console.error(e);
    return errorResponse("Error al generar el reporte", 500);
  }
}
