import { getSession } from "@/lib/session";
import { errorResponse } from "@/lib/utils";

// GET /api/auth/me — devuelve el usuario de la sesión activa
export async function GET() {
  try {
    const session = await getSession();

    if (!session.isLoggedIn) {
      return errorResponse("No autenticado", 401);
    }

    return Response.json({
      data: {
        id_usuario: session.id_usuario,
        nombre:     session.nombre,
        email:      session.email,
        rol:        session.rol,
      },
    });
  } catch (e) {
    console.error(e);
    return errorResponse("Error al obtener sesión", 500);
  }
}
