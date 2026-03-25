import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { errorResponse } from "@/lib/utils";
import type { Miembro, MiembroForm } from "@/types";

// GET /api/miembros  — admite ?unidad=id para filtrar por unidad
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idUnidad = searchParams.get("unidad");

    let sql: string;
    let params: unknown[];

    if (idUnidad) {
      sql = `
        SELECT m.*, um.rol, um.anio, um.id_unidad
        FROM miembros m
        JOIN unidades_miembros um ON m.id_miembro = um.id_miembro
        WHERE um.id_unidad = ?
        ORDER BY m.apellido, m.nombre
      `;
      params = [idUnidad];
    } else {
      sql = "SELECT * FROM miembros ORDER BY apellido, nombre";
      params = [];
    }

    const miembros = await query<Miembro[]>(sql, params);
    return Response.json({ data: miembros });
  } catch (e) {
    console.error(e);
    return errorResponse("Error al obtener los miembros", 500);
  }
}

// POST /api/miembros
export async function POST(req: NextRequest) {
  try {
    const body: MiembroForm = await req.json();

    if (!body.nombre?.trim() || !body.apellido?.trim()) {
      return errorResponse("Nombre y apellido son obligatorios");
    }

    const result = await query<{ insertId: number }>(
      `INSERT INTO miembros
         (dni, nombre, apellido, telefono, email, direccion, fecha_cumpleanos)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        body.dni     ?? null,
        body.nombre.trim(),
        body.apellido.trim(),
        body.telefono       ?? null,
        body.email          ?? null,
        body.direccion      ?? null,
        body.fecha_cumpleanos ?? null,
      ]
    );

    return Response.json(
      { message: "Miembro creado", data: { id_miembro: result.insertId } },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return errorResponse("Error al crear el miembro", 500);
  }
}
