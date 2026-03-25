import { getSession } from "@/lib/session";

// POST /api/auth/logout
export async function POST() {
  try {
    const session = await getSession();
    session.destroy();
    return Response.json({ message: "Sesión cerrada" });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Error al cerrar sesión" }, { status: 500 });
  }
}
