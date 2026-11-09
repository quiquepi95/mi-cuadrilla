import { Injectable, inject } from '@angular/core';
import { Paso, Trabajadera, Costalero, Ensayo, Asistencia } from '../models';
import { PersonasService } from './personas.service';
import { hoyLocal } from '../utils/fechas';
import {
  PID_ANTONIO, PID_MANUEL, PID_FRANCISCO, PID_JOSE, PID_ENRIQUE,
  PID_CARLOS, PID_MIGUEL, PID_LUIS, PID_GONZALO2,
  PID_RAFAEL, PID_DAVID, PID_JAVIER,
  PID_PABLO, PID_SERGIO, PID_JORGE,
  PID_ALBERTO, PID_RAMON, PID_TOMAS,
  PID_ANDRES, PID_VICTOR,
  PID_FERNANDO, PID_IVAN, PID_OSCAR, PID_FELIX,
  PID_PEDRO, PID_RUBEN, PID_MARIO,
  PID_HECTOR, PID_DANIEL, PID_ALEJANDRO,
  PID_NACHO, PID_GERMAN,
  PID_MARCOS, PID_RAUL, PID_EMILIO,
  PID_IGNACIO, PID_GONZALO,
} from './personas.service';

// ============================================================
// Datos de prueba EXTRA para probar la pantalla "Ensayos":
// ensayos pasados (con y sin lista), uno cancelado y uno de HOY.
// Se quitarán al conectar Supabase.
// ============================================================
const ENSAYOS_PRUEBA_EXTRA: Ensayo[] = [
  { id: 'e12', paso_id: '1', fecha: '2026-10-15', descripcion: 'Ensayo de costal',       lugar: 'Nave de la hermandad', created_at: '', updated_at: '' },
  { id: 'e13', paso_id: '1', fecha: '2026-11-02', descripcion: 'Ensayo de trabajaderas', lugar: 'Nave de la hermandad', created_at: '', updated_at: '' },
  { id: 'e14', paso_id: '2', fecha: '2026-10-28', descripcion: 'Ensayo de igualá',       lugar: 'Casa de hermandad',    cancelado: true, motivo_cancelacion: 'Lluvia', created_at: '', updated_at: '' },
  { id: 'e15', paso_id: '3', fecha: '2026-11-05', descripcion: 'Ensayo de presentación', lugar: 'Basílica del Gran Poder', created_at: '', updated_at: '' },
  { id: 'e16', paso_id: '2', fecha: hoyLocal(),   descripcion: 'Ensayo de hoy',          lugar: 'Casa de hermandad',    created_at: '', updated_at: '' },
];

const ASISTENCIAS_PRUEBA_EXTRA: Asistencia[] = [
  // e12 (Cristo, pasado): lista COMPLETA (los 13 costaleros activos marcados)
  { id: 'x5',  ensayo_id: 'e12', costalero_id: 'c3',  estado: 'presente',    notas: '',        created_at: '' },
  { id: 'x6',  ensayo_id: 'e12', costalero_id: 'c4',  estado: 'presente',    notas: '',        created_at: '' },
  { id: 'x7',  ensayo_id: 'e12', costalero_id: 'c6',  estado: 'presente',    notas: '',        created_at: '' },
  { id: 'x8',  ensayo_id: 'e12', costalero_id: 'c7',  estado: 'ausente',     notas: 'Trabajo', created_at: '' },
  { id: 'x9',  ensayo_id: 'e12', costalero_id: 'c9',  estado: 'presente',    notas: '',        created_at: '' },
  { id: 'x10', ensayo_id: 'e12', costalero_id: 'c10', estado: 'presente',    notas: '',        created_at: '' },
  { id: 'x11', ensayo_id: 'e12', costalero_id: 'c11', estado: 'presente',    notas: '',        created_at: '' },
  { id: 'x12', ensayo_id: 'e12', costalero_id: 'c12', estado: 'presente',    notas: '',        created_at: '' },
  { id: 'x13', ensayo_id: 'e12', costalero_id: 'c13', estado: 'presente',    notas: '',        created_at: '' },
  { id: 'x1', ensayo_id: 'e12', costalero_id: 'c1', estado: 'presente',    notas: '',      created_at: '' },
  { id: 'x2', ensayo_id: 'e12', costalero_id: 'c2', estado: 'presente',    notas: '',      created_at: '' },
  { id: 'x3', ensayo_id: 'e12', costalero_id: 'c5', estado: 'justificada', notas: 'Viaje', created_at: '' },
  { id: 'x4', ensayo_id: 'e12', costalero_id: 'c8', estado: 'ausente',     notas: '',      created_at: '' },
  // e15 (Gran Poder, pasado): lista a medias
  { id: 'y1', ensayo_id: 'e15', costalero_id: 'p-c1', estado: 'presente',  notas: '',      created_at: '' },
  { id: 'y2', ensayo_id: 'e15', costalero_id: 'p-c2', estado: 'ausente',   notas: '',      created_at: '' },
  // e13 (Cristo, pasado) y e14 (cancelado): sin lista a propósito
];

@Injectable({ providedIn: 'root' })
export class MockDataService {

  private personas = inject(PersonasService);

  pasos: Paso[] = [
    { id: '1', nombre: 'Cristo de la Buena Muerte',           descripcion: 'Paso de misterio. Hermandad de los Estudiantes.', imagen_url: '', owner_id: 'user-1', num_trabajaderas: 4, capacidad_trabajadera: 8, color: '#c9a84c', created_at: '2026-01-01', updated_at: '2026-01-01' },
    { id: '2', nombre: 'Virgen de la Esperanza',              descripcion: 'Paso de palio. La Macarena.',                     imagen_url: '', owner_id: 'user-1', num_trabajaderas: 3, capacidad_trabajadera: 6, color: '#7b3f9e', created_at: '2026-01-01', updated_at: '2026-01-01' },
    { id: '3', nombre: 'Nuestro Padre Jesús del Gran Poder',  descripcion: 'Paso de misterio. El Gran Poder.',                imagen_url: '', owner_id: 'user-1', num_trabajaderas: 5, capacidad_trabajadera: 9, color: '#8b0000', created_at: '2026-01-01', updated_at: '2026-01-01' },
  ];

  trabajaderas: Trabajadera[] = [
    // Cristo (paso 1)
    { id: 't1',  paso_id: '1', numero: 1, diferencia_altura_cm: 0, created_at: '', updated_at: '' },
    { id: 't2',  paso_id: '1', numero: 2, diferencia_altura_cm: 2, created_at: '', updated_at: '' },
    { id: 't3',  paso_id: '1', numero: 3, diferencia_altura_cm: 5, created_at: '', updated_at: '' },
    { id: 't4',  paso_id: '1', numero: 4, diferencia_altura_cm: 3, created_at: '', updated_at: '' },
    // Esperanza (paso 2)
    { id: 'te1', paso_id: '2', numero: 1, diferencia_altura_cm: 0, created_at: '', updated_at: '' },
    { id: 'te2', paso_id: '2', numero: 2, diferencia_altura_cm: 3, created_at: '', updated_at: '' },
    { id: 'te3', paso_id: '2', numero: 3, diferencia_altura_cm: 6, created_at: '', updated_at: '' },
    // Gran Poder (paso 3)
    { id: 'tp1', paso_id: '3', numero: 1, diferencia_altura_cm: 0, created_at: '', updated_at: '' },
    { id: 'tp2', paso_id: '3', numero: 2, diferencia_altura_cm: 1, created_at: '', updated_at: '' },
    { id: 'tp3', paso_id: '3', numero: 3, diferencia_altura_cm: 4, created_at: '', updated_at: '' },
    { id: 'tp4', paso_id: '3', numero: 4, diferencia_altura_cm: 4, created_at: '', updated_at: '' },
    { id: 'tp5', paso_id: '3', numero: 5, diferencia_altura_cm: 7, created_at: '', updated_at: '' },
  ];

  costaleros: Costalero[] = [
    // ── CRISTO (paso 1) ─────────────────────────────────────
    { id: 'c1',  persona_id: PID_ANTONIO,   paso_id: '1', trabajadera_id: 't1', nombre: 'Antonio',   apellidos: 'García Pérez',     telefono: '600111222', calzo_cm: 0,   es_aspirante: false, activo: true,  posicion: 1, notas: '', created_at: '', updated_at: '' },
    { id: 'c2',  persona_id: PID_MANUEL,    paso_id: '1', trabajadera_id: 't1', nombre: 'Manuel',    apellidos: 'López Ruiz',       telefono: '600222333', calzo_cm: 0.5, es_aspirante: false, activo: true,  posicion: 2, notas: '', created_at: '', updated_at: '' },
    { id: 'c3',  persona_id: PID_FRANCISCO, paso_id: '1', trabajadera_id: 't1', nombre: 'Francisco', apellidos: 'Martín Gómez',     telefono: '600333444', calzo_cm: 1,   es_aspirante: true,  activo: true,  posicion: 3, notas: '', created_at: '', updated_at: '' },
    { id: 'c4',  persona_id: PID_JOSE,      paso_id: '1', trabajadera_id: 't1', nombre: 'José',      apellidos: 'Fernández Torres', telefono: '600444555', calzo_cm: 1.5, es_aspirante: false, activo: true,  posicion: 4, notas: '', created_at: '', updated_at: '' },
    { id: 'c4b', persona_id: PID_ENRIQUE,   paso_id: '1', trabajadera_id: 't1', nombre: 'Enrique',   apellidos: 'Castro Rueda',     telefono: '600444666', calzo_cm: 2,   es_aspirante: true,  activo: false, posicion: 5, notas: 'Aspirante descartado', created_at: '', updated_at: '' },
    { id: 'c5',  persona_id: PID_CARLOS,    paso_id: '1', trabajadera_id: 't2', nombre: 'Carlos',    apellidos: 'Sánchez Vega',     telefono: '600555666', calzo_cm: 0,   es_aspirante: false, activo: true,  posicion: 1, notas: '', created_at: '', updated_at: '' },
    { id: 'c6',  persona_id: PID_MIGUEL,    paso_id: '1', trabajadera_id: 't2', nombre: 'Miguel',    apellidos: 'Jiménez Castro',   telefono: '600666777', calzo_cm: 1,   es_aspirante: false, activo: true,  posicion: 2, notas: '', created_at: '', updated_at: '' },
    { id: 'c7',  persona_id: PID_LUIS,      paso_id: '1', trabajadera_id: 't2', nombre: 'Luis',      apellidos: 'Navarro Gil',      telefono: '600700800', calzo_cm: 1.5, es_aspirante: true,  activo: true,  posicion: 3, notas: '', created_at: '', updated_at: '' },
    { id: 'c7b', persona_id: PID_GONZALO2,  paso_id: '1', trabajadera_id: 't2', nombre: 'Gonzalo',   apellidos: 'Aguilar Reina',    telefono: '600700900', calzo_cm: 2,   es_aspirante: true,  activo: false, posicion: 4, notas: 'Baja por lesión', created_at: '', updated_at: '' },
    { id: 'c8',  persona_id: PID_RAFAEL,    paso_id: '1', trabajadera_id: 't3', nombre: 'Rafael',    apellidos: 'Moreno Díaz',      telefono: '600777888', calzo_cm: 0,   es_aspirante: false, activo: true,  posicion: 1, notas: '', created_at: '', updated_at: '' },
    { id: 'c9',  persona_id: PID_DAVID,     paso_id: '1', trabajadera_id: 't3', nombre: 'David',     apellidos: 'Romero Blanco',    telefono: '600888999', calzo_cm: 0.5, es_aspirante: false, activo: true,  posicion: 2, notas: '', created_at: '', updated_at: '' },
    { id: 'c10', persona_id: PID_JAVIER,    paso_id: '1', trabajadera_id: 't3', nombre: 'Javier',    apellidos: 'Castro Reina',     telefono: '600900100', calzo_cm: 2,   es_aspirante: true,  activo: true,  posicion: 3, notas: '', created_at: '', updated_at: '' },
    { id: 'c11', persona_id: PID_PABLO,     paso_id: '1', trabajadera_id: 't4', nombre: 'Pablo',     apellidos: 'Alonso Reyes',     telefono: '600999000', calzo_cm: 0,   es_aspirante: false, activo: true,  posicion: 1, notas: '', created_at: '', updated_at: '' },
    { id: 'c12', persona_id: PID_SERGIO,    paso_id: '1', trabajadera_id: 't4', nombre: 'Sergio',    apellidos: 'Vargas Molina',    telefono: '601000111', calzo_cm: 1,   es_aspirante: false, activo: true,  posicion: 2, notas: '', created_at: '', updated_at: '' },
    { id: 'c13', persona_id: PID_JORGE,     paso_id: '1', trabajadera_id: 't4', nombre: 'Jorge',     apellidos: 'Delgado Fuentes',  telefono: '601100222', calzo_cm: 1.5, es_aspirante: false, activo: true,  posicion: 3, notas: '', created_at: '', updated_at: '' },

    // ── ESPERANZA (paso 2) ───────────────────────────────────
    { id: 'e-c1',  persona_id: PID_MANUEL,   paso_id: '2', trabajadera_id: 'te1', nombre: 'Manuel',   apellidos: 'López Ruiz',     telefono: '600222333', calzo_cm: 0,   es_aspirante: false, activo: true,  posicion: 1, notas: '', created_at: '', updated_at: '' },
    { id: 'e-c2',  persona_id: PID_ALBERTO,  paso_id: '2', trabajadera_id: 'te1', nombre: 'Alberto',  apellidos: 'Reyes Castillo', telefono: '601200333', calzo_cm: 0.5, es_aspirante: false, activo: true,  posicion: 2, notas: '', created_at: '', updated_at: '' },
    { id: 'e-c3',  persona_id: PID_RAMON,    paso_id: '2', trabajadera_id: 'te1', nombre: 'Ramón',    apellidos: 'Herrera Ponce',  telefono: '601300444', calzo_cm: 1.5, es_aspirante: true,  activo: true,  posicion: 3, notas: '', created_at: '', updated_at: '' },
    { id: 'e-c3b', persona_id: PID_TOMAS,    paso_id: '2', trabajadera_id: 'te1', nombre: 'Tomás',    apellidos: 'Iglesias Mora',  telefono: '601400555', calzo_cm: 2,   es_aspirante: true,  activo: false, posicion: 4, notas: 'Aspirante descartado', created_at: '', updated_at: '' },
    { id: 'e-c4',  persona_id: PID_CARLOS,   paso_id: '2', trabajadera_id: 'te2', nombre: 'Carlos',   apellidos: 'Sánchez Vega',   telefono: '600555666', calzo_cm: 0,   es_aspirante: false, activo: true,  posicion: 1, notas: '', created_at: '', updated_at: '' },
    { id: 'e-c5',  persona_id: PID_ANDRES,   paso_id: '2', trabajadera_id: 'te2', nombre: 'Andrés',   apellidos: 'Medina Ríos',    telefono: '601500666', calzo_cm: 1,   es_aspirante: false, activo: true,  posicion: 2, notas: '', created_at: '', updated_at: '' },
    { id: 'e-c6',  persona_id: PID_VICTOR,   paso_id: '2', trabajadera_id: 'te2', nombre: 'Víctor',   apellidos: 'Ortega Sola',    telefono: '601600777', calzo_cm: 1.5, es_aspirante: true,  activo: true,  posicion: 3, notas: '', created_at: '', updated_at: '' },
    { id: 'e-c7',  persona_id: PID_FERNANDO, paso_id: '2', trabajadera_id: 'te3', nombre: 'Fernando', apellidos: 'Blanco Correa',  telefono: '601700888', calzo_cm: 0,   es_aspirante: false, activo: true,  posicion: 1, notas: '', created_at: '', updated_at: '' },
    { id: 'e-c8',  persona_id: PID_IVAN,     paso_id: '2', trabajadera_id: 'te3', nombre: 'Iván',     apellidos: 'Torres Mena',    telefono: '601800999', calzo_cm: 1,   es_aspirante: false, activo: true,  posicion: 2, notas: '', created_at: '', updated_at: '' },
    { id: 'e-c9',  persona_id: PID_OSCAR,    paso_id: '2', trabajadera_id: 'te3', nombre: 'Óscar',    apellidos: 'Ramos Durán',    telefono: '601900000', calzo_cm: 2,   es_aspirante: true,  activo: true,  posicion: 3, notas: '', created_at: '', updated_at: '' },
    { id: 'e-c9b', persona_id: PID_FELIX,    paso_id: '2', trabajadera_id: 'te3', nombre: 'Félix',    apellidos: 'Cano Prieto',    telefono: '601900111', calzo_cm: 2.5, es_aspirante: true,  activo: false, posicion: 4, notas: 'Baja voluntaria', created_at: '', updated_at: '' },

    // ── GRAN PODER (paso 3) ──────────────────────────────────
    { id: 'p-c1',  persona_id: PID_ANTONIO,   paso_id: '3', trabajadera_id: 'tp1', nombre: 'Antonio',   apellidos: 'García Pérez',   telefono: '600111222', calzo_cm: 0,   es_aspirante: false, activo: true,  posicion: 1, notas: '', created_at: '', updated_at: '' },
    { id: 'p-c2',  persona_id: PID_PEDRO,     paso_id: '3', trabajadera_id: 'tp1', nombre: 'Pedro',     apellidos: 'Vega Campos',    telefono: '602000111', calzo_cm: 0.5, es_aspirante: false, activo: true,  posicion: 2, notas: '', created_at: '', updated_at: '' },
    { id: 'p-c3',  persona_id: PID_RUBEN,     paso_id: '3', trabajadera_id: 'tp1', nombre: 'Rubén',     apellidos: 'Santana Plata',  telefono: '602100222', calzo_cm: 1,   es_aspirante: true,  activo: true,  posicion: 3, notas: '', created_at: '', updated_at: '' },
    { id: 'p-c3b', persona_id: PID_MARIO,     paso_id: '3', trabajadera_id: 'tp1', nombre: 'Mario',     apellidos: 'Cano Espejo',    telefono: '602200333', calzo_cm: 1.5, es_aspirante: true,  activo: false, posicion: 4, notas: 'Aspirante descartado', created_at: '', updated_at: '' },
    { id: 'p-c4',  persona_id: PID_HECTOR,    paso_id: '3', trabajadera_id: 'tp2', nombre: 'Héctor',    apellidos: 'Luna Parejo',    telefono: '602300444', calzo_cm: 0,   es_aspirante: false, activo: true,  posicion: 1, notas: '', created_at: '', updated_at: '' },
    { id: 'p-c5',  persona_id: PID_DANIEL,    paso_id: '3', trabajadera_id: 'tp2', nombre: 'Daniel',    apellidos: 'Perea Montoya',  telefono: '602400555', calzo_cm: 1,   es_aspirante: false, activo: true,  posicion: 2, notas: '', created_at: '', updated_at: '' },
    { id: 'p-c6',  persona_id: PID_ALEJANDRO, paso_id: '3', trabajadera_id: 'tp2', nombre: 'Alejandro', apellidos: 'Serrano Baena',  telefono: '602500666', calzo_cm: 1.5, es_aspirante: true,  activo: true,  posicion: 3, notas: '', created_at: '', updated_at: '' },
    { id: 'p-c7',  persona_id: PID_RAFAEL,    paso_id: '3', trabajadera_id: 'tp3', nombre: 'Rafael',    apellidos: 'Moreno Díaz',    telefono: '600777888', calzo_cm: 0,   es_aspirante: false, activo: true,  posicion: 1, notas: '', created_at: '', updated_at: '' },
    { id: 'p-c8',  persona_id: PID_NACHO,     paso_id: '3', trabajadera_id: 'tp3', nombre: 'Nacho',     apellidos: 'Bermúdez Leiva', telefono: '602600777', calzo_cm: 1,   es_aspirante: false, activo: true,  posicion: 2, notas: '', created_at: '', updated_at: '' },
    { id: 'p-c9',  persona_id: PID_GERMAN,    paso_id: '3', trabajadera_id: 'tp3', nombre: 'Germán',    apellidos: 'Flores Toro',    telefono: '602700888', calzo_cm: 2,   es_aspirante: true,  activo: true,  posicion: 3, notas: '', created_at: '', updated_at: '' },
    { id: 'p-c10', persona_id: PID_MARCOS,    paso_id: '3', trabajadera_id: 'tp4', nombre: 'Marcos',    apellidos: 'Gil Aguilar',    telefono: '602800999', calzo_cm: 0,   es_aspirante: false, activo: true,  posicion: 1, notas: '', created_at: '', updated_at: '' },
    { id: 'p-c11', persona_id: PID_RAUL,      paso_id: '3', trabajadera_id: 'tp4', nombre: 'Raúl',      apellidos: 'Prieto Nieto',   telefono: '602900000', calzo_cm: 0.5, es_aspirante: false, activo: true,  posicion: 2, notas: '', created_at: '', updated_at: '' },
    { id: 'p-c12', persona_id: PID_EMILIO,    paso_id: '3', trabajadera_id: 'tp4', nombre: 'Emilio',    apellidos: 'Peña Zapata',    telefono: '603000111', calzo_cm: 1.5, es_aspirante: true,  activo: true,  posicion: 3, notas: '', created_at: '', updated_at: '' },
    { id: 'p-c13', persona_id: PID_PABLO,     paso_id: '3', trabajadera_id: 'tp5', nombre: 'Pablo',     apellidos: 'Alonso Reyes',   telefono: '600999000', calzo_cm: 0,   es_aspirante: false, activo: true,  posicion: 1, notas: '', created_at: '', updated_at: '' },
    { id: 'p-c14', persona_id: PID_IGNACIO,   paso_id: '3', trabajadera_id: 'tp5', nombre: 'Ignacio',   apellidos: 'Soto Aranda',    telefono: '603100222', calzo_cm: 1,   es_aspirante: false, activo: true,  posicion: 2, notas: '', created_at: '', updated_at: '' },
    { id: 'p-c15', persona_id: PID_GONZALO,   paso_id: '3', trabajadera_id: 'tp5', nombre: 'Gonzalo',   apellidos: 'Vidal Carmona',  telefono: '603200333', calzo_cm: 2,   es_aspirante: true,  activo: true,  posicion: 3, notas: '', created_at: '', updated_at: '' },
  ];

  ensayos: Ensayo[] = [
    ...ENSAYOS_PRUEBA_EXTRA,
    { id: 'e1',  paso_id: '1', fecha: '2027-02-10', descripcion: 'Primer ensayo de levantá',  lugar: 'Nave de la hermandad',    created_at: '', updated_at: '' },
    { id: 'e2',  paso_id: '1', fecha: '2027-02-17', descripcion: 'Ensayo de chicotá larga',   lugar: 'Nave de la hermandad',    created_at: '', updated_at: '' },
    { id: 'e3',  paso_id: '1', fecha: '2027-02-24', descripcion: 'Ensayo general',             lugar: 'Calle Feria',             created_at: '', updated_at: '' },
    { id: 'e4',  paso_id: '1', fecha: '2027-03-03', descripcion: 'Ensayo con marchas',         lugar: 'Nave de la hermandad',    created_at: '', updated_at: '' },
    { id: 'e5',  paso_id: '2', fecha: '2027-02-08', descripcion: 'Primer ensayo',              lugar: 'Casa de hermandad',       created_at: '', updated_at: '' },
    { id: 'e6',  paso_id: '2', fecha: '2027-02-15', descripcion: 'Ensayo de igualá',           lugar: 'Casa de hermandad',       created_at: '', updated_at: '' },
    { id: 'e7',  paso_id: '2', fecha: '2027-02-22', descripcion: 'Ensayo en calle',            lugar: 'Calle San Luis',          created_at: '', updated_at: '' },
    { id: 'e8',  paso_id: '3', fecha: '2027-02-06', descripcion: 'Ensayo de presentación',    lugar: 'Basílica del Gran Poder', created_at: '', updated_at: '' },
    { id: 'e9',  paso_id: '3', fecha: '2027-02-13', descripcion: 'Ensayo de trabajaderas',    lugar: 'Basílica del Gran Poder', created_at: '', updated_at: '' },
    { id: 'e10', paso_id: '3', fecha: '2027-02-20', descripcion: 'Ensayo general nocturno',   lugar: 'Calle Amor de Dios',      created_at: '', updated_at: '' },
    { id: 'e11', paso_id: '3', fecha: '2027-02-27', descripcion: 'Ensayo final antes de SS',  lugar: 'Basílica del Gran Poder', created_at: '', updated_at: '' },
  ];

  asistencias: Asistencia[] = [
    ...ASISTENCIAS_PRUEBA_EXTRA,
    { id: 'a1',  ensayo_id: 'e1', costalero_id: 'c1',  estado: 'presente',    notas: '',        created_at: '' },
    { id: 'a2',  ensayo_id: 'e1', costalero_id: 'c2',  estado: 'presente',    notas: '',        created_at: '' },
    { id: 'a3',  ensayo_id: 'e1', costalero_id: 'c3',  estado: 'ausente',     notas: 'Trabajo', created_at: '' },
    { id: 'a4',  ensayo_id: 'e1', costalero_id: 'c4',  estado: 'presente',    notas: '',        created_at: '' },
    { id: 'a5',  ensayo_id: 'e1', costalero_id: 'c5',  estado: 'justificada', notas: 'Viaje',   created_at: '' },
    { id: 'a6',  ensayo_id: 'e1', costalero_id: 'c6',  estado: 'presente',    notas: '',        created_at: '' },
    { id: 'a7',  ensayo_id: 'e1', costalero_id: 'c7',  estado: 'presente',    notas: '',        created_at: '' },
    { id: 'a8',  ensayo_id: 'e1', costalero_id: 'c8',  estado: 'presente',    notas: '',        created_at: '' },
    { id: 'a9',  ensayo_id: 'e1', costalero_id: 'c9',  estado: 'ausente',     notas: '',        created_at: '' },
    { id: 'a10', ensayo_id: 'e1', costalero_id: 'c10', estado: 'presente',    notas: '',        created_at: '' },
    { id: 'a11', ensayo_id: 'e1', costalero_id: 'c11', estado: 'presente',    notas: '',        created_at: '' },
    { id: 'a12', ensayo_id: 'e1', costalero_id: 'c12', estado: 'presente',    notas: '',        created_at: '' },
    { id: 'a13', ensayo_id: 'e1', costalero_id: 'c13', estado: 'justificada', notas: 'Médico',  created_at: '' },
    { id: 'b1',  ensayo_id: 'e5', costalero_id: 'e-c1', estado: 'presente',    notas: '',        created_at: '' },
    { id: 'b2',  ensayo_id: 'e5', costalero_id: 'e-c2', estado: 'presente',    notas: '',        created_at: '' },
    { id: 'b3',  ensayo_id: 'e5', costalero_id: 'e-c3', estado: 'ausente',     notas: 'Lesión',  created_at: '' },
    { id: 'b4',  ensayo_id: 'e5', costalero_id: 'e-c4', estado: 'presente',    notas: '',        created_at: '' },
    { id: 'b5',  ensayo_id: 'e5', costalero_id: 'e-c5', estado: 'justificada', notas: 'Trabajo', created_at: '' },
    { id: 'b6',  ensayo_id: 'e5', costalero_id: 'e-c6', estado: 'presente',    notas: '',        created_at: '' },
    { id: 'b7',  ensayo_id: 'e5', costalero_id: 'e-c7', estado: 'presente',    notas: '',        created_at: '' },
    { id: 'b8',  ensayo_id: 'e5', costalero_id: 'e-c8', estado: 'ausente',     notas: '',        created_at: '' },
    { id: 'b9',  ensayo_id: 'e5', costalero_id: 'e-c9', estado: 'presente',    notas: '',        created_at: '' },
    { id: 'd1',  ensayo_id: 'e8', costalero_id: 'p-c1',  estado: 'presente',    notas: '',        created_at: '' },
    { id: 'd2',  ensayo_id: 'e8', costalero_id: 'p-c2',  estado: 'presente',    notas: '',        created_at: '' },
    { id: 'd3',  ensayo_id: 'e8', costalero_id: 'p-c3',  estado: 'justificada', notas: 'Viaje',   created_at: '' },
    { id: 'd4',  ensayo_id: 'e8', costalero_id: 'p-c4',  estado: 'ausente',     notas: '',        created_at: '' },
    { id: 'd5',  ensayo_id: 'e8', costalero_id: 'p-c5',  estado: 'presente',    notas: '',        created_at: '' },
    { id: 'd6',  ensayo_id: 'e8', costalero_id: 'p-c6',  estado: 'presente',    notas: '',        created_at: '' },
    { id: 'd7',  ensayo_id: 'e8', costalero_id: 'p-c7',  estado: 'presente',    notas: '',        created_at: '' },
    { id: 'd8',  ensayo_id: 'e8', costalero_id: 'p-c8',  estado: 'ausente',     notas: 'Trabajo', created_at: '' },
    { id: 'd9',  ensayo_id: 'e8', costalero_id: 'p-c9',  estado: 'presente',    notas: '',        created_at: '' },
    { id: 'd10', ensayo_id: 'e8', costalero_id: 'p-c10', estado: 'presente',    notas: '',        created_at: '' },
    { id: 'd11', ensayo_id: 'e8', costalero_id: 'p-c11', estado: 'justificada', notas: 'Médico',  created_at: '' },
    { id: 'd12', ensayo_id: 'e8', costalero_id: 'p-c12', estado: 'presente',    notas: '',        created_at: '' },
    { id: 'd13', ensayo_id: 'e8', costalero_id: 'p-c13', estado: 'presente',    notas: '',        created_at: '' },
    { id: 'd14', ensayo_id: 'e8', costalero_id: 'p-c14', estado: 'ausente',     notas: '',        created_at: '' },
    { id: 'd15', ensayo_id: 'e8', costalero_id: 'p-c15', estado: 'presente',    notas: '',        created_at: '' },
  ];

  // ----------------------------------------------------------
  // MÉTODOS
  // ----------------------------------------------------------

  getPasos(): Paso[] { return this.pasos; }

  getPaso(id: string): Paso | undefined { return this.pasos.find(p => p.id === id); }

  getTrabajaderasByPaso(pasoId: string): Trabajadera[] {
    return this.trabajaderas
      .filter(t => t.paso_id === pasoId)
      .sort((a, b) => a.numero - b.numero);
  }

  getCostalerosByPaso(pasoId: string, soloActivos = true): Costalero[] {
    return this.costaleros
      .filter(c => c.paso_id === pasoId && (!soloActivos || c.activo))
      .map(c => this.conDatosDePersona(c))
      .sort((a, b) => a.calzo_cm !== b.calzo_cm ? a.calzo_cm - b.calzo_cm : a.apellidos.localeCompare(b.apellidos, 'es'));
  }

  getCostalerosByTrabadadera(trabajaderaId: string, soloActivos = true): Costalero[] {
    return this.costaleros
      .filter(c => c.trabajadera_id === trabajaderaId && (!soloActivos || c.activo))
      .map(c => this.conDatosDePersona(c))
      .sort((a, b) => a.calzo_cm !== b.calzo_cm ? a.calzo_cm - b.calzo_cm : a.apellidos.localeCompare(b.apellidos, 'es'));
  }

  /** Registro real (editable) de un costalero en un paso. Úsalo para guardar cambios. */
  getRegistroCostalero(pasoId: string, costaleroId: string): Costalero | undefined {
    return this.costaleros.find(c => c.id === costaleroId && c.paso_id === pasoId);
  }

  /**
   * Devuelve una copia del costalero con nombre, apellidos y teléfono tomados de la PERSONA,
   * que es la fuente de verdad. Así, si se edita la persona en el listado global,
   * el cambio se ve en todos los pasos.
   */
  private conDatosDePersona(c: Costalero): Costalero {
    const p = this.personas.buscarPorId(c.persona_id);
    return p ? { ...c, nombre: p.nombre, apellidos: p.apellidos, telefono: p.telefono } : c;
  }

  /** Ensayos de un paso ordenados por fecha (los que no tienen fecha, al final) */
  getEnsayosByPaso(pasoId: string): Ensayo[] {
    return this.ensayos
      .filter(e => e.paso_id === pasoId)
      .sort((a, b) => {
        if (!a.fecha && !b.fecha) return 0;
        if (!a.fecha) return 1;
        if (!b.fecha) return -1;
        return a.fecha.localeCompare(b.fecha);
      });
  }

  getEnsayo(id: string): Ensayo | undefined {
    return this.ensayos.find(e => e.id === id);
  }

  /** Elimina un ensayo y toda la asistencia registrada en él */
  eliminarEnsayo(id: string) {
    this.ensayos = this.ensayos.filter(e => e.id !== id);
    this.asistencias = this.asistencias.filter(a => a.ensayo_id !== id);
  }

  /** Quita la asistencia de un costalero en un ensayo (vuelve a "sin marcar") */
  eliminarAsistencia(ensayoId: string, costaleroId: string) {
    this.asistencias = this.asistencias.filter(a => !(a.ensayo_id === ensayoId && a.costalero_id === costaleroId));
  }

  /** Crea o actualiza la asistencia de un costalero en un ensayo */
  guardarAsistencia(ensayoId: string, costaleroId: string, estado: Asistencia['estado'], notas: string) {
    const existente = this.asistencias.find(a => a.ensayo_id === ensayoId && a.costalero_id === costaleroId);
    if (existente) {
      existente.estado = estado;
      existente.notas = notas;
    } else {
      this.asistencias.push({
        id: `a-${ensayoId}-${costaleroId}`,
        ensayo_id: ensayoId,
        costalero_id: costaleroId,
        estado,
        notas,
        created_at: new Date().toISOString(),
      });
    }
  }

  getAsistenciasByEnsayo(ensayoId: string): Asistencia[] { return this.asistencias.filter(a => a.ensayo_id === ensayoId); }

  getPasosByPersona(personaId: string): { paso: Paso; costalero: Costalero }[] {
    return this.costaleros
      .filter(c => c.persona_id === personaId)
      .map(c => ({ costalero: c, paso: this.pasos.find(p => p.id === c.paso_id)! }))
      .filter(r => r.paso);
  }

  getResumenAsistencia(ensayoId: string) {
    const a = this.getAsistenciasByEnsayo(ensayoId);
    return { presentes: a.filter(x => x.estado === 'presente').length, ausentes: a.filter(x => x.estado === 'ausente').length, justificadas: a.filter(x => x.estado === 'justificada').length, total: a.length };
  }
}
