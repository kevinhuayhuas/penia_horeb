import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { errorResponse } from "@/lib/utils";
import type { Trimestre, TrimestreForm } from "@/types";

// GET /api/trimestres
export async function GET() {
  try {
    const trimestres = await query<Trimestre[]>(
      "SELECT * FROM trimestres ORDER BY anio DESC, numero_trimestre ASC"
    );
    return Response.json({ data: trimestres });
  } catch (e) {
    console.error(e);
    return errorResponse("Error al obtener los trimestres", 500);
  }
}

// POST /api/trimestres
export async function POST(req: NextRequest) {
  try {
    const body: TrimestreForm = await req.json();

    if (!body.numero_trimestre || !body.anio) {
      return errorResponse("Número de trimestre y año son obligatorios");
    }

    if (body.numero_trimestre < 1 || body.numero_trimestre > 4) {
      return errorResponse("El número de trimestre debe estar entre 1 y 4");
    }

    const result = await query<{ insertId: number }>(
      "INSERT INTO trimestres (numero_trimestre, anio) VALUES (?, ?)",
      [body.numero_trimestre, body.anio]
    );

    return Response.json(
      { message: "Trimestre creado", data: { id_trimestre: result.insertId } },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return errorResponse("Error al crear el trimestre (puede que ya exista)", 500);
  }
}
