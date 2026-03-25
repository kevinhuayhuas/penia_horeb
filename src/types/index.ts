// ============================================================
// Entidades de base de datos
// ============================================================

export type RolUsuario = "Admin" | "Maestro";

export interface Usuario {
  id_usuario:     number;
  nombre:         string;
  email:          string;
  rol:            RolUsuario;
  activo:         boolean;
  fecha_registro: string;
}

export interface UsuarioForm {
  nombre:   string;
  email:    string;
  password: string;
  rol:      RolUsuario;
  activo:   boolean;
}

export interface Unidad {
  id_unidad: number;
  nombre_unidad: string;
  activo: boolean;
}

export interface Miembro {
  id_miembro: number;
  dni: string | null;
  nombre: string;
  apellido: string;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  fecha_cumpleanos: string | null;
  fecha_registro: string;
}

export type RolMiembro = "Maestro" | "Maestro Asociado" | "Alumno";

export interface UnidadMiembro {
  id_asignacion: number;
  id_unidad: number;
  id_miembro: number;
  rol: RolMiembro;
  anio: number;
  // joins
  nombre?: string;
  apellido?: string;
  nombre_unidad?: string;
}

export interface Trimestre {
  id_trimestre: number;
  numero_trimestre: 1 | 2 | 3 | 4;
  anio: number;
}

export type NivelEstudio = "PP" | "P" | "N";

export interface RegistroActividad {
  id_registro: number;
  id_miembro: number;
  id_trimestre: number;
  numero_sabado: number;
  estudio_les: NivelEstudio;
  asistencia_gp: boolean;
  estudios_biblicos_dados: number;
  // joins
  nombre?: string;
  apellido?: string;
}

export interface MetaMisionera {
  id_meta: number;
  id_unidad: number;
  id_trimestre: number;
  numero_sabado: number;
  miembros_presentes: number;
  estudio_siete_dias: number;
  asistencia_gp_total: number;
  estudiantes_biblia_total: number;
  bautismos: number;
  // joins
  nombre_unidad?: string;
}

// ============================================================
// Tipos para API responses
// ============================================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// ============================================================
// Tipos para formularios
// ============================================================

export type UnidadForm = Omit<Unidad, "id_unidad">;
export type MiembroForm = Omit<Miembro, "id_miembro" | "fecha_registro">;
export type TrimestreForm = Omit<Trimestre, "id_trimestre">;

export interface RegistroForm {
  id_miembro: number;
  id_trimestre: number;
  numero_sabado: number;
  estudio_les: NivelEstudio;
  asistencia_gp: boolean;
  estudios_biblicos_dados: number;
}

export interface MetaForm {
  id_unidad: number;
  id_trimestre: number;
  numero_sabado: number;
  miembros_presentes: number;
  estudio_siete_dias: number;
  asistencia_gp_total: number;
  estudiantes_biblia_total: number;
  bautismos: number;
}

export interface AsignacionForm {
  id_unidad: number;
  id_miembro: number;
  rol: RolMiembro;
  anio: number;
}

// ============================================================
// Tipos para reporte de fidelidad
// ============================================================

export interface ReporteFidelidad {
  nombre: string;
  apellido: string;
  total_fidelidad_completa: number;
  total_asistencia_gp: number;
  total_estudios_dados: number;
}

// ============================================================
// Dashboard stats
// ============================================================

export interface DashboardStats {
  totalUnidades: number;
  totalMiembros: number;
  totalTrimestres: number;
  totalRegistros: number;
}
