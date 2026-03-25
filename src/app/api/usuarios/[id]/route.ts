import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";
import { errorResponse } from "@/lib/utils";

interface Params {
  params: Promise<{ id: string }>;
}

// PUT /api/usuarios/:id — Actualiza nombre, rol, activo y opcionalmente la contraseña
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const session = await getSession();
    if (!session.isLoggedIn || session.rol !== "Admin") {
      return errorResponse("Acceso denegado", 403);
    }

    const body = await req.json();

    if (!body.nombre?.trim() || !body.email?.trim()) {
      return errorResponse("Nombre y email son obligatorios");
    }

    if (body.password?.trim()) {
      // Actualiza también la contraseña
      const hash = await bcrypt.hash(body.password, 10);
      await query(
        "UPDATE usuarios SET nombre = ?, email = ?, rol = ?, activo = ?, password_hash = ? WHERE id_usuario = ?",
        [body.nombre.trim(), body.email.trim().toLowerCase(), body.rol, body.activo ?? true, hash, id]
      );
    } else {
      await query(
        "UPDATE usuarios SET nombre = ?, email = ?, rol = ?, activo = ? WHERE id_usuario = ?",
        [body.nombre.trim(), body.email.trim().toLowerCase(), body.rol, body.activo ?? true, id]
      );
    }

    return Response.json({ message: "Usuario actualizado" });
  } catch (e) {
    console.error(e);
    return errorResponse("Error al actualizar el usuario", 500);
  }
}

// DELETE /api/usuarios/:id — No puede eliminar su propio usuario
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const session = await getSession();
    if (!session.isLoggedIn || session.rol !== "Admin") {
      return errorResponse("Acceso denegado", 403);
    }

    if (session.id_usuario === Number(id)) {
      return errorResponse("No puedes eliminar tu propio usuario");
    }

    await query("DELETE FROM usuarios WHERE id_usuario = ?", [id]);
    return Response.json({ message: "Usuario eliminado" });
  } catch (e) {
    console.error(e);
    return errorResponse("Error al eliminar el usuario", 500);
  }
}
