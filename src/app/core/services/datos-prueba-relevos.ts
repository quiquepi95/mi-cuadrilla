import type { Persona } from './personas.service';
import type { Costalero, Ensayo, Asistencia } from '../models';
import type { RelevosService } from './relevos.service';
import type { MockDataService } from './mock-data.service';

// ============================================================
// Datos de prueba para la pestaña "Relevos". Se quitarán al conectar Supabase.
//
//  - Cristo (1):      sin relevos a propósito.
//  - Esperanza (2):   20 relevos, todos vacíos.
//  - Gran Poder (3):  20 relevos. Salida, Relevo 1 y Entrada con gente; el resto vacíos.
//                     Trabajaderas 1-5 con 8 costaleros para 6 puestos (rotan); los costaleros
//                     de las trabajaderas 6 y 7 se quedan fuera de todos los relevos.
//  - Paso 4 (4x3):    18 costaleros (12 puestos + 6 que quedan fuera en la Salida). 4 relevos.
//  - Paso 5 (4x3):    24 costaleros = dos cuadrillas completas. 4 relevos: A, B, A, B.
// ============================================================

// Los nombres se combinan de forma que todas las personas generadas son distintas
// (así no aparecen como "posibles duplicados" en el listado de costaleros).
const NOMBRES = [
  'Adrián', 'Álvaro', 'Aitor', 'Bruno', 'César', 'Diego', 'Eduardo', 'Gabriel', 'Hugo', 'Jesús',
  'Lucas', 'Marcelo', 'Nicolás', 'Ricardo', 'Salvador', 'Teodoro', 'Ulises', 'Vicente', 'Yago', 'Zacarías',
];
const APELLIDOS_1 = [
  'Acosta', 'Barrios', 'Cabrera', 'Duarte', 'Escudero', 'Fajardo', 'Galán', 'Heredia', 'Infante', 'Jurado',
  'Lara', 'Maldonado', 'Naranjo', 'Olmo', 'Paredes', 'Quintero', 'Rivas', 'Salcedo', 'Tapia', 'Ulloa',
  'Valdés', 'Yáñez', 'Zamora',
];
const APELLIDOS_2 = [
  'Aranda', 'Bravo', 'Cortés', 'Domínguez', 'Expósito', 'Figueroa', 'Guerrero', 'Hidalgo', 'Ibáñez', 'Jaén', 'León', 'Montero',
];

interface Grupo {
  pasoId: string;
  trabajaderaId: string;
  cantidad: number;
  posicionInicial: number;
}

const GRUPOS: Grupo[] = [
  // Gran Poder: 5 más en las trabajaderas 1-5 (llegan a 8 para 6 puestos, así hay quien descansa)
  // y 4 en las nuevas trabajaderas 6 y 7 (esas se quedan fuera de los relevos de prueba)
  { pasoId: '3', trabajaderaId: 'tp1', cantidad: 5, posicionInicial: 4 },
  { pasoId: '3', trabajaderaId: 'tp2', cantidad: 5, posicionInicial: 4 },
  { pasoId: '3', trabajaderaId: 'tp3', cantidad: 5, posicionInicial: 4 },
  { pasoId: '3', trabajaderaId: 'tp4', cantidad: 5, posicionInicial: 4 },
  { pasoId: '3', trabajaderaId: 'tp5', cantidad: 5, posicionInicial: 4 },
  { pasoId: '3', trabajaderaId: 'tp6', cantidad: 4, posicionInicial: 1 },
  { pasoId: '3', trabajaderaId: 'tp7', cantidad: 4, posicionInicial: 1 },
  // Paso 4 (4x3): 5 + 5 + 4 + 4 = 18
  { pasoId: '4', trabajaderaId: 'tq1', cantidad: 5, posicionInicial: 1 },
  { pasoId: '4', trabajaderaId: 'tq2', cantidad: 5, posicionInicial: 1 },
  { pasoId: '4', trabajaderaId: 'tq3', cantidad: 4, posicionInicial: 1 },
  { pasoId: '4', trabajaderaId: 'tq4', cantidad: 4, posicionInicial: 1 },
  // Paso 5 (4x3): 6 por trabajadera = 24 (trabajaderas dobladas)
  { pasoId: '5', trabajaderaId: 'tc1', cantidad: 6, posicionInicial: 1 },
  { pasoId: '5', trabajaderaId: 'tc2', cantidad: 6, posicionInicial: 1 },
  { pasoId: '5', trabajaderaId: 'tc3', cantidad: 6, posicionInicial: 1 },
  { pasoId: '5', trabajaderaId: 'tc4', cantidad: 6, posicionInicial: 1 },
];

export const PERSONAS_PRUEBA_RELEVOS: Persona[] = [];
export const COSTALEROS_PRUEBA_RELEVOS: Costalero[] = [];

let n = 0;
for (const g of GRUPOS) {
  for (let j = 0; j < g.cantidad; j++) {
    n++;
    const personaId = `a1b2c3d4-0002-0000-0000-${String(n).padStart(12, '0')}`;
    const nombre = NOMBRES[(n - 1) % NOMBRES.length];
    const apellidos = `${APELLIDOS_1[(n - 1) % APELLIDOS_1.length]} ${APELLIDOS_2[((n - 1) * 5 + 2) % APELLIDOS_2.length]}`;
    const telefono = `7${String(10000000 + n * 37).padStart(8, '0')}`;

    PERSONAS_PRUEBA_RELEVOS.push({ id: personaId, nombre, apellidos, telefono });
    COSTALEROS_PRUEBA_RELEVOS.push({
      id: `r-${n}`,
      persona_id: personaId,
      paso_id: g.pasoId,
      trabajadera_id: g.trabajaderaId,
      nombre,
      apellidos,
      telefono,
      calzo_cm: (j % 5) * 0.5,
      es_aspirante: false,
      activo: true,
      posicion: g.posicionInicial + j,
      notas: '',
      created_at: '',
      updated_at: '',
    });
  }
}

// ------------------------------------------------------------
// Ensayos pasados con lista de asistencia para TODOS los pasos, para probar la pantalla de Ensayos,
// el pase de lista y cómo la asistencia influye en los relevos.
// Las fechas son relativas a hoy (siempre pasadas). Unas listas están al 100 % y otras a medias.
// El paso 1 ya tiene la suya (e12, completa) y una pasada sin lista (e13) en ENSAYOS_PRUEBA_EXTRA.
// ------------------------------------------------------------
function fechaRelativa(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function ensayoPasado(id: string, pasoId: string, dias: number, descripcion: string, lugar: string): Ensayo {
  return { id, paso_id: pasoId, fecha: fechaRelativa(dias), descripcion, lugar, created_at: '', updated_at: '' };
}

interface ListaPrueba {
  ensayo: Ensayo;
  proporcion: number;   // 1 = lista completa; 0,6 = solo se ha marcado a ~6 de cada 10 costaleros
  indice: number;       // varía el reparto de presentes / ausentes / justificadas entre ensayos
}

const LISTAS_PRUEBA: ListaPrueba[] = [
  // Esperanza (paso 2): una completa y otra a medias
  { ensayo: ensayoPasado('e-p2a', '2', -28, 'Ensayo de costal',  'Casa de hermandad'), proporcion: 1,   indice: 0 },
  { ensayo: ensayoPasado('e-p2b', '2', -14, 'Ensayo en calle',   'Calle San Luis'),    proporcion: 0.6, indice: 1 },
  // Gran Poder (paso 3): una completa y otra a medias (además de e15, que ya está a medias)
  { ensayo: ensayoPasado('e-p3a', '3', -35, 'Ensayo de presentación', 'Basílica del Gran Poder'), proporcion: 1,   indice: 0 },
  { ensayo: ensayoPasado('e-p3b', '3', -10, 'Ensayo de trabajaderas', 'Basílica del Gran Poder'), proporcion: 0.7, indice: 1 },
  // Cristo del Perdón (paso 4): tres completas
  { ensayo: ensayoPasado('e-r1', '4', -21, 'Ensayo de igualá',       'Nave de la hermandad'), proporcion: 1, indice: 0 },
  { ensayo: ensayoPasado('e-r2', '4', -14, 'Ensayo de trabajaderas', 'Nave de la hermandad'), proporcion: 1, indice: 1 },
  { ensayo: ensayoPasado('e-r3', '4', -7,  'Ensayo general',         'Calle Feria'),          proporcion: 1, indice: 2 },
  // Virgen de la Alegría (paso 5): una completa y otra a medias
  { ensayo: ensayoPasado('e-p5a', '5', -21, 'Ensayo de igualá', 'Casa de hermandad'), proporcion: 1,   indice: 0 },
  { ensayo: ensayoPasado('e-p5b', '5', -7,  'Ensayo general',   'Calle Amor de Dios'), proporcion: 0.5, indice: 1 },
];

export const ENSAYOS_PRUEBA_RELEVOS: Ensayo[] = LISTAS_PRUEBA.map(l => l.ensayo);

/**
 * Crea la asistencia de las listas de prueba para los costaleros ACTIVOS de cada paso.
 * Reparto fijo y variado: la mayoría asiste, con algunas ausencias y justificaciones.
 */
export function generarAsistenciasPrueba(costaleros: Costalero[]): Asistencia[] {
  const resultado: Asistencia[] = [];
  for (const lista of LISTAS_PRUEBA) {
    const activos = costaleros.filter(c => c.paso_id === lista.ensayo.paso_id && c.activo);
    activos.forEach((c, k) => {
      // En una lista a medias solo se marca a una parte de los costaleros (repartida, no los primeros)
      if (lista.proporcion < 1 && (k * 7 + lista.indice * 3) % 10 >= lista.proporcion * 10) return;
      const patron = (k * 3 + lista.indice * 2) % 7;
      const estado: Asistencia['estado'] = patron === 0 ? 'ausente' : patron === 1 ? 'justificada' : 'presente';
      resultado.push({
        id: `a-${lista.ensayo.id}-${c.id}`,
        ensayo_id: lista.ensayo.id,
        costalero_id: c.id,
        estado,
        notas: '',
        created_at: '',
      });
    });
  }
  return resultado;
}

/** Crea los relevos de prueba. Se llama una sola vez al arrancar el servicio de relevos. */
export function sembrarRelevosDePrueba(relevos: RelevosService, mock: MockDataService) {
  // Cristo (1): sin relevos, a propósito.

  // Esperanza (2): 20 relevos, ningún costalero colocado
  relevos.configurar('2', 20);

  // Gran Poder (3): 20 relevos; solo Salida, Relevo 1 y Entrada tienen gente.
  // Las trabajaderas 6 y 7 se vacían a mano para que sus costaleros queden fuera de todos los relevos.
  relevos.configurar('3', 20);
  const lista = relevos.getRelevos('3');
  const conGente = [lista[0], lista[1], lista[lista.length - 1]];
  const paso3 = mock.getPaso('3');
  const filasFuera = mock.getTrabajaderasByPaso('3').filter(t => t.numero >= 6);
  for (const r of conGente) {
    relevos.sugerir(r.id);
    for (const t of filasFuera) {
      for (let col = 0; col < (paso3?.capacidad_trabajadera ?? 0); col++) {
        relevos.quitar(r.id, t.id, col);
      }
    }
  }

  // Pasos 4 y 5 (4x3): 4 relevos completos rellenados con la sugerencia
  for (const pasoId of ['4', '5']) {
    relevos.configurar(pasoId, 4);
    relevos.sugerirTodos(pasoId);
  }
}
