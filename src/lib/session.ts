import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type RolUsuario = "Admin" | "Maestro";

// 1. Definimos la estructura de los datos de sesión
export interface SessionData {
  id_usuario: number;
  nombre: string;
  email: string;
  rol: RolUsuario;
  isLoggedIn: boolean;
}

// 2. Usamos 'SessionOptions' en lugar de 'IronSessionOptions'
const SESSION_OPTIONS: SessionOptions = {
  password: process.env.SESSION_SECRET || "escuela-sabatica-secret-key-must-be-32chars-min",
  cookieName: "es_session",
  cookieOptions: {
    // En producción debe ser true, pero asegúrate de tener HTTPS
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 horas
  },
};

// 3. Función para obtener la sesión
export async function getSession() {
  const cookieStore = await cookies();
  // En la v8+, getIronSession ya infiere los tipos correctamente
  return await getIronSession<SessionData>(cookieStore, SESSION_OPTIONS);
}
