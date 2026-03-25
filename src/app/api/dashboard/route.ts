import { query } from "@/lib/db";
import { errorResponse } from "@/lib/utils";
import type { DashboardStats } from "@/types";

// GET /api/dashboard
export async function GET() {
  try {
    const [[totalUnidades], [totalMiembros], [totalTrimestres], [totalRegistros]] =
      await Promise.all([
        query<{ total: number }[]>("SELECT COUNT(*) AS total FROM unidades WHERE activo = 1"),
        query<{ total: number }[]>("SELECT COUNT(*) AS total FROM miembros"),
        query<{ total: number }[]>("SELECT COUNT(*) AS total FROM trimestres"),
        query<{ total: number }[]>("SELECT COUNT(*) AS total FROM registro_actividad"),
      ]);

    const stats: DashboardStats = {
      totalUnidades:  totalUnidades.total,
      totalMiembros:  totalMiembros.total,
      totalTrimestres: totalTrimestres.total,
      totalRegistros: totalRegistros.total,
    };

    return Response.json({ data: stats });
  } catch (e) {
    console.error(e);
    return errorResponse("Error al obtener estadísticas", 500);
  }
}
