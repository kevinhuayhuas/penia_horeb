import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";
import { errorResponse } from "@/lib/utils";
import type { Usuario } from "@/types";

// POST /api/auth/login
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email?.trim() || !password?.trim()) {
      return errorResponse("Email y contraseña son obligatorios");
    }

    // Buscar usuario activo por email
    const rows = await query<(Usuario & { password_hash: string })[]>(
      "SELECT * FROM usuarios WHERE email = ? AND activo = 1",
      [email.trim().toLowerCase()]
    );

    if (!rows.length) {
      return errorResponse("Credenciales incorrectas", 401);
    }

    const usuario = rows[0];
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValida) {
      return errorResponse("Credenciales incorrectas", 401);
    }

    // Guardar sesión cifrada en cookie
    const session = await getSession();
    session.id_usuario = usuario.id_usuario;
    session.nombre     = usuario.nombre;
    session.email      = usuario.email;
    session.rol        = usuario.rol;
    session.isLoggedIn = true;
    await session.save();

    return Response.json({
      message: "Sesión iniciada",
      data: {
        id_usuario: usuario.id_usuario,
        nombre:     usuario.nombre,
        email:      usuario.email,
        rol:        usuario.rol,
      },
    });
  } catch (e) {
    console.error(e);
    return errorResponse("Error al iniciar sesión", 500);
  }
}
