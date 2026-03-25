import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { errorResponse } from "@/lib/utils";

interface Params {
  params: Promise<{ id: string }>;
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    await query("DELETE FROM registro_actividad WHERE id_registro = ?", [id]);
    return Response.json({ message: "Registro eliminado" });
  } catch (e) {
    console.error(e);
    return errorResponse("Error al eliminar el registro", 500);
  }
}
