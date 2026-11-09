import { Injectable } from '@angular/core';

// ============================================================
// PERSONA — identidad real de un costalero
// Independiente de los pasos en los que participe
// ============================================================
export interface Persona {
  id: string;        // UUID inmutable, generado al crear por primera vez
  nombre: string;
  apellidos: string;
  telefono: string;  // Identificador humano principal
  alias?: string;    // Apodo opcional
}

// UUIDs fijos para el mock (simulan UUIDs reales)
// Personas que aparecen en varios pasos:
//   PID_ANTONIO → Cristo T1 + Gran Poder TP1
//   PID_MANUEL  → Cristo T1 + Esperanza TE1
//   PID_CARLOS  → Cristo T2 + Esperanza TE2
//   PID_RAFAEL  → Cristo T3 + Gran Poder TP3
//   PID_PABLO   → Cristo T4 + Gran Poder TP5
export const PID_ANTONIO   = 'a1b2c3d4-0001-0000-0000-000000000001';
export const PID_MANUEL    = 'a1b2c3d4-0001-0000-0000-000000000002';
export const PID_FRANCISCO = 'a1b2c3d4-0001-0000-0000-000000000003';
export const PID_JOSE      = 'a1b2c3d4-0001-0000-0000-000000000004';
export const PID_ENRIQUE   = 'a1b2c3d4-0001-0000-0000-000000000005';
export const PID_CARLOS    = 'a1b2c3d4-0001-0000-0000-000000000006';
export const PID_MIGUEL    = 'a1b2c3d4-0001-0000-0000-000000000007';
export const PID_LUIS      = 'a1b2c3d4-0001-0000-0000-000000000008';
export const PID_GONZALO2  = 'a1b2c3d4-0001-0000-0000-000000000009';
export const PID_RAFAEL    = 'a1b2c3d4-0001-0000-0000-000000000010';
export const PID_DAVID     = 'a1b2c3d4-0001-0000-0000-000000000011';
export const PID_JAVIER    = 'a1b2c3d4-0001-0000-0000-000000000012';
export const PID_PABLO     = 'a1b2c3d4-0001-0000-0000-000000000013';
export const PID_SERGIO    = 'a1b2c3d4-0001-0000-0000-000000000014';
export const PID_JORGE     = 'a1b2c3d4-0001-0000-0000-000000000015';
export const PID_ALBERTO   = 'a1b2c3d4-0001-0000-0000-000000000016';
export const PID_RAMON     = 'a1b2c3d4-0001-0000-0000-000000000017';
export const PID_TOMAS     = 'a1b2c3d4-0001-0000-0000-000000000018';
export const PID_ANDRES    = 'a1b2c3d4-0001-0000-0000-000000000019';
export const PID_VICTOR    = 'a1b2c3d4-0001-0000-0000-000000000020';
export const PID_FERNANDO  = 'a1b2c3d4-0001-0000-0000-000000000021';
export const PID_IVAN      = 'a1b2c3d4-0001-0000-0000-000000000022';
export const PID_OSCAR     = 'a1b2c3d4-0001-0000-0000-000000000023';
export const PID_FELIX     = 'a1b2c3d4-0001-0000-0000-000000000024';
export const PID_PEDRO     = 'a1b2c3d4-0001-0000-0000-000000000025';
export const PID_RUBEN     = 'a1b2c3d4-0001-0000-0000-000000000026';
export const PID_MARIO     = 'a1b2c3d4-0001-0000-0000-000000000027';
export const PID_HECTOR    = 'a1b2c3d4-0001-0000-0000-000000000028';
export const PID_DANIEL    = 'a1b2c3d4-0001-0000-0000-000000000029';
export const PID_ALEJANDRO = 'a1b2c3d4-0001-0000-0000-000000000030';
export const PID_NACHO     = 'a1b2c3d4-0001-0000-0000-000000000031';
export const PID_GERMAN    = 'a1b2c3d4-0001-0000-0000-000000000032';
export const PID_MARCOS    = 'a1b2c3d4-0001-0000-0000-000000000033';
export const PID_RAUL      = 'a1b2c3d4-0001-0000-0000-000000000034';
export const PID_EMILIO    = 'a1b2c3d4-0001-0000-0000-000000000035';
export const PID_IGNACIO   = 'a1b2c3d4-0001-0000-0000-000000000036';
export const PID_GONZALO   = 'a1b2c3d4-0001-0000-0000-000000000037';
export const PID_BERNARDO  = 'a1b2c3d4-0001-0000-0000-000000000038';
export const PID_ESTEBAN   = 'a1b2c3d4-0001-0000-0000-000000000039';

@Injectable({ providedIn: 'root' })
export class PersonasService {

  // Catálogo global de personas únicas
  personas: Persona[] = [
    { id: PID_ANTONIO,   nombre: 'Antonio',   apellidos: 'García Pérez',     telefono: '600111222' },
    { id: PID_MANUEL,    nombre: 'Manuel',     apellidos: 'López Ruiz',       telefono: '600222333' },
    { id: PID_FRANCISCO, nombre: 'Francisco',  apellidos: 'Martín Gómez',     telefono: '600333444' },
    { id: PID_JOSE,      nombre: 'José',       apellidos: 'Fernández Torres', telefono: '600444555' },
    { id: PID_ENRIQUE,   nombre: 'Enrique',    apellidos: 'Castro Rueda',     telefono: '600444666' },
    { id: PID_CARLOS,    nombre: 'Carlos',     apellidos: 'Sánchez Vega',     telefono: '600555666' },
    { id: PID_MIGUEL,    nombre: 'Miguel',     apellidos: 'Jiménez Castro',   telefono: '600666777' },
    { id: PID_LUIS,      nombre: 'Luis',       apellidos: 'Navarro Gil',      telefono: '600700800' },
    { id: PID_GONZALO2,  nombre: 'Gonzalo',    apellidos: 'Aguilar Reina',    telefono: '600700900' },
    { id: PID_RAFAEL,    nombre: 'Rafael',     apellidos: 'Moreno Díaz',      telefono: '600777888' },
    { id: PID_DAVID,     nombre: 'David',      apellidos: 'Romero Blanco',    telefono: '600888999' },
    { id: PID_JAVIER,    nombre: 'Javier',     apellidos: 'Castro Reina',     telefono: '600900100' },
    { id: PID_PABLO,     nombre: 'Pablo',      apellidos: 'Alonso Reyes',     telefono: '600999000' },
    { id: PID_SERGIO,    nombre: 'Sergio',     apellidos: 'Vargas Molina',    telefono: '601000111' },
    { id: PID_JORGE,     nombre: 'Jorge',      apellidos: 'Delgado Fuentes',  telefono: '601100222' },
    { id: PID_ALBERTO,   nombre: 'Alberto',    apellidos: 'Reyes Castillo',   telefono: '601200333' },
    { id: PID_RAMON,     nombre: 'Ramón',      apellidos: 'Herrera Ponce',    telefono: '601300444' },
    { id: PID_TOMAS,     nombre: 'Tomás',      apellidos: 'Iglesias Mora',    telefono: '601400555' },
    { id: PID_ANDRES,    nombre: 'Andrés',     apellidos: 'Medina Ríos',      telefono: '601500666' },
    { id: PID_VICTOR,    nombre: 'Víctor',     apellidos: 'Ortega Sola',      telefono: '601600777' },
    { id: PID_FERNANDO,  nombre: 'Fernando',   apellidos: 'Blanco Correa',    telefono: '601700888' },
    { id: PID_IVAN,      nombre: 'Iván',       apellidos: 'Torres Mena',      telefono: '601800999' },
    { id: PID_OSCAR,     nombre: 'Óscar',      apellidos: 'Ramos Durán',      telefono: '601900000' },
    { id: PID_FELIX,     nombre: 'Félix',      apellidos: 'Cano Prieto',      telefono: '601900111' },
    { id: PID_PEDRO,     nombre: 'Pedro',      apellidos: 'Vega Campos',      telefono: '602000111' },
    { id: PID_RUBEN,     nombre: 'Rubén',      apellidos: 'Santana Plata',    telefono: '602100222' },
    { id: PID_MARIO,     nombre: 'Mario',      apellidos: 'Cano Espejo',      telefono: '602200333' },
    { id: PID_HECTOR,    nombre: 'Héctor',     apellidos: 'Luna Parejo',      telefono: '602300444' },
    { id: PID_DANIEL,    nombre: 'Daniel',     apellidos: 'Perea Montoya',    telefono: '602400555' },
    { id: PID_ALEJANDRO, nombre: 'Alejandro',  apellidos: 'Serrano Baena',    telefono: '602500666' },
    { id: PID_NACHO,     nombre: 'Nacho',      apellidos: 'Bermúdez Leiva',   telefono: '602600777' },
    { id: PID_GERMAN,    nombre: 'Germán',     apellidos: 'Flores Toro',      telefono: '602700888' },
    { id: PID_MARCOS,    nombre: 'Marcos',     apellidos: 'Gil Aguilar',      telefono: '602800999' },
    { id: PID_RAUL,      nombre: 'Raúl',       apellidos: 'Prieto Nieto',     telefono: '602900000' },
    { id: PID_EMILIO,    nombre: 'Emilio',     apellidos: 'Peña Zapata',      telefono: '603000111' },
    { id: PID_IGNACIO,   nombre: 'Ignacio',    apellidos: 'Soto Aranda',      telefono: '603100222' },
    { id: PID_GONZALO,   nombre: 'Gonzalo',    apellidos: 'Vidal Carmona',    telefono: '603200333' },
    // Costaleros que no salen este año — en nómina sin paso asignado
    { id: PID_BERNARDO,  nombre: 'Bernardo',   apellidos: 'Ruiz Herrera',     telefono: '603300444', alias: 'el Gordo' },
    { id: PID_ESTEBAN,   nombre: 'Esteban',    apellidos: 'Campos Vázquez',   telefono: '603400555' },
  ];

  // ---- Generador de UUID v4 simple ----
  generarUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  // ---- Buscar por texto (nombre + apellidos) — para autocompletar ----
  buscar(texto: string): Persona[] {
    if (!texto || texto.trim().length < 2) return [];
    const q = texto.trim().toLowerCase();
    return this.personas.filter(p =>
      `${p.nombre} ${p.apellidos}`.toLowerCase().includes(q) ||
      p.apellidos.toLowerCase().includes(q) ||
      (p.alias?.toLowerCase().includes(q) ?? false)
    ).slice(0, 6); // máximo 6 sugerencias
  }

  // ---- Buscar por teléfono exacto ----
  buscarPorTelefono(telefono: string): Persona | undefined {
    const t = telefono.replace(/\s/g, '');
    return this.personas.find(p => p.telefono.replace(/\s/g, '') === t);
  }

  // ---- Buscar por UUID ----
  buscarPorId(id: string): Persona | undefined {
    return this.personas.find(p => p.id === id);
  }

  // ---- Detectar posibles duplicados ----
  // Mismo nombre+apellidos pero distinto teléfono → posible duplicado
  getDuplicados(): Persona[][] {
    const grupos: Map<string, Persona[]> = new Map();
    for (const p of this.personas) {
      const clave = `${p.nombre.toLowerCase().trim()} ${p.apellidos.toLowerCase().trim()}`;
      if (!grupos.has(clave)) grupos.set(clave, []);
      grupos.get(clave)!.push(p);
    }
    return [...grupos.values()].filter(g => g.length > 1);
  }

  // ---- Crear persona nueva ----
  crearPersona(datos: Omit<Persona, 'id'>): Persona {
    const nueva: Persona = { ...datos, id: this.generarUUID() };
    this.personas.push(nueva);
    return nueva;
  }

  // ---- Actualizar persona (se refleja en todos los pasos) ----
  actualizarPersona(id: string, datos: Partial<Omit<Persona, 'id'>>) {
    const idx = this.personas.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.personas[idx] = { ...this.personas[idx], ...datos };
    }
  }

  // ---- Fusionar duplicados ----
  fusionar(idMantener: string, idEliminar: string) {
    this.personas = this.personas.filter(p => p.id !== idEliminar);
    // Los costaleros que usaban idEliminar deben actualizar su persona_id externamente
    return idMantener;
  }
}
