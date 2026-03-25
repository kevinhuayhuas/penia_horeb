import { getIronSession, IronSession, IronSessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type RolUsuario = "Admin" | "Maestro";

// Datos que se guardan cifrados en la cookie
export interface SessionData {
  id_usuario:  number;
  nombre:      string;
  email:       string;
  rol:         RolUsuario;
  isLoggedIn:  boolean;
}

const SESSION_OPTIONS: IronSessionOptions = {
  password: process.env.SESSION_SECRET ?? "escuela-sabatica-secret-key-must-be-32chars-min",
  cookieName: "es_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 horas
  },
};

// Obtiene la sesión desde el contexto de Server Component / Route Handler
export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, SESSION_OPTIONS);
}
