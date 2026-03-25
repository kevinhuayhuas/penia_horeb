import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { errorResponse } from "@/lib/utils";

interface Params {
  params: Promise<{ id: string }>;
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    await query(
      "DELETE FROM unidades_miembros WHERE id_asignacion = ?",
      [id]
    );
    return Response.json({ message: "Asignación eliminada" });
  } catch (e) {
    console.error(e);
    return errorResponse("Error al eliminar la asignación", 500);
  }
}
