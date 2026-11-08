// ============================================================
// MODELOS DE DOMINIO - Mi Cuadrilla
// ============================================================

// ---- USUARIO / PERFIL ----
export interface UserProfile {
  id: string;               // UUID de Supabase Auth
  email: string;
  display_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// ---- PASO (Proyecto principal) ----
export interface Paso {
  id: string;
  nombre: string;           // Ej: "Cristo de la Buena Muerte"
  descripcion?: string;
  imagen_url?: string;
  owner_id: string;         // UUID del capataz propietario
  num_trabajaderas: number; // Número total de trabajaderas
  capacidad_trabajadera: number; // Costaleros que caben en cada trabajadera (igual en todas)
  color?: string;           // Color del paso elegido por el capataz (hex)
  created_at: string;
  updated_at: string;
}

// ---- MIEMBRO DEL PASO (capataz owner + auxiliares) ----
export type RolPaso = 'owner' | 'auxiliar';

export interface PasoMiembro {
  id: string;
  paso_id: string;
  user_id: string;
  rol: RolPaso;
  created_at: string;
  // Relaciones
  user?: UserProfile;
}

// ---- TRABAJADERA ----
export interface Trabajadera {
  id: string;
  paso_id: string;
  numero: number;              // Orden: 1, 2, 3...
  diferencia_altura_cm: number;// 0 para la de referencia (la más alta). Valor introducido manualmente tras la igualá.
  created_at: string;
  updated_at: string;
  // Relaciones
  costaleros?: Costalero[];
}

// ---- COSTALERO ----
export interface Costalero {
  id: string;
  persona_id: string;       // ID de la persona real (puede repetirse en varios pasos en trabajaderas distintas)
  paso_id: string;
  trabajadera_id: string;
  nombre: string;
  apellidos: string;
  telefono?: string;
  calzo_cm: number;         // Decimal permitido (ej: 0.5, 1.5). 0 = el más alto de la trabajadera (referencia)
  es_aspirante: boolean;
  activo: boolean;          // false = dado de baja o aspirante descartado. No cuenta en listados activos pero permanece en histórico
  posicion?: number;        // Posición dentro de la trabajadera (para mapa visual futuro)
  notas?: string;
  created_at: string;
  updated_at: string;
  // Relaciones
  trabajadera?: Trabajadera;
}

// ---- ENSAYO ----
export interface Ensayo {
  id: string;
  paso_id: string;
  fecha: string;            // ISO date string
  descripcion?: string;
  lugar?: string;
  created_at: string;
  updated_at: string;
  // Relaciones
  asistencias?: Asistencia[];
}

// ---- ASISTENCIA ----
export type EstadoAsistencia = 'presente' | 'ausente' | 'justificada';

export interface Asistencia {
  id: string;
  ensayo_id: string;
  costalero_id: string;
  estado: EstadoAsistencia;
  notas?: string;
  created_at: string;
  // Relaciones
  costalero?: Costalero;
}

// ---- DTOs para formularios ----
export type CreatePasoDto = Omit<Paso, 'id' | 'owner_id' | 'created_at' | 'updated_at'>;
export type UpdatePasoDto = Partial<CreatePasoDto>;

export type CreateCostaleroDto = Omit<Costalero, 'id' | 'created_at' | 'updated_at' | 'trabajadera'>;
export type UpdateCostaleroDto = Partial<CreateCostaleroDto>;

export type CreateEnsayoDto = Omit<Ensayo, 'id' | 'created_at' | 'updated_at' | 'asistencias'>;
export type UpdateEnsayoDto = Partial<CreateEnsayoDto>;

export type CreateTrabajaderaDto = Omit<Trabajadera, 'id' | 'created_at' | 'updated_at' | 'costaleros'>;
export type UpdateTrabajaderaDto = Partial<CreateTrabajaderaDto>;
