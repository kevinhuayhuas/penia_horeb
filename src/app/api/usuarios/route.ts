import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";
import { errorResponse } from "@/lib/utils";
import type { Usuario, UsuarioForm } from "@/types";

// GET /api/usuarios  — solo Admin
export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || session.rol !== "Admin") {
      return errorResponse("Acceso denegado", 403);
    }

    const usuarios = await query<Usuario[]>(
      "SELECT id_usuario, nombre, email, rol, activo, fecha_registro FROM usuarios ORDER BY nombre ASC"
    );
    return Response.json({ data: usuarios });
  } catch (e) {
    console.error(e);
    return errorResponse("Error al obtener usuarios", 500);
  }
}

// POST /api/usuarios  — solo Admin
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || session.rol !== "Admin") {
      return errorResponse("Acceso denegado", 403);
    }

    const body: UsuarioForm = await req.json();

    if (!body.nombre?.trim() || !body.email?.trim() || !body.password?.trim()) {
      return errorResponse("Nombre, email y contraseña son obligatorios");
    }

    const hash = await bcrypt.hash(body.password, 10);

    const result = await query<{ insertId: number }>(
      "INSERT INTO usuarios (nombre, email, password_hash, rol, activo) VALUES (?, ?, ?, ?, ?)",
      [
        body.nombre.trim(),
        body.email.trim().toLowerCase(),
        hash,
        body.rol ?? "Maestro",
        body.activo ?? true,
      ]
    );

    return Response.json(
      { message: "Usuario creado", data: { id_usuario: result.insertId } },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return errorResponse("Error al crear el usuario (email puede estar duplicado)", 500);
  }
}
