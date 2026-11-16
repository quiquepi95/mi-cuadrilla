import { Injectable, inject } from '@angular/core';
import { MockDataService } from './mock-data.service';
import { PersonasService } from './personas.service';
import { Relevo, AsignacionRelevo, Costalero } from '../models';
import { hoyLocal } from '../utils/fechas';
import { sembrarRelevosDePrueba } from './datos-prueba-relevos';

export const MIN_RELEVOS = 2;   // Salida y Entrada como mínimo
export const MAX_RELEVOS = 20;

export interface ResumenAsistencia {
  presentes: number;
  justificadas: number;
  ausentes: number;
  marcados: number;    // ensayos en los que está marcado (presente, justificada o ausente)
  total: number;       // ensayos ya celebrados del paso (todos deberían tener la misma cifra)
  sinMarcar: number;   // ensayos celebrados en los que aún no se ha indicado si asistió (total - marcados)
}

/** Marcas informativas de un costalero (puntos sutiles en las casillas de los relevos) */
export interface MarcasCostalero {
  otrosTuyos: number;    // otros pasos tuyos en los que está activo
  externos: number;      // pasos que saca fuera de tu cuadrilla (los apunta el capataz en su ficha)
  variosPasos: boolean;  // otrosTuyos + externos > 0
  aspirante: boolean;
  sinMarcar: number;     // ensayos celebrados en los que falta indicar si asistió
}

export interface ResultadoSugerencia {
  colocados: number;   // puestos que se han rellenado
  sinCubrir: number;   // puestos que se han quedado vacíos por falta de candidatos
  /** Nº de las trabajaderas que tienen tantos costaleros como puestos (o menos): no hay nadie a quien dar descanso */
  sinDescanso: number[];
}

/**
 * Relevos de un paso (datos de prueba en memoria; se sustituirá por Supabase).
 *
 * Un relevo es una cuadrícula: filas = trabajaderas, columnas = puestos de cada trabajadera.
 * Reglas:
 *  - Un costalero puede estar en varios relevos, pero nunca dos veces en el mismo.
 *  - El primer relevo se llama "Salida", el último "Entrada" y los de en medio "Relevo N".
 */
@Injectable({ providedIn: 'root' })
export class RelevosService {
  private mock = inject(MockDataService);
  private personas = inject(PersonasService);

  relevos: Relevo[] = [];
  asignaciones: AsignacionRelevo[] = [];
  private contador = 0;

  constructor() {
    // Datos de prueba (se quitarán al conectar Supabase)
    sembrarRelevosDePrueba(this, this.mock);
  }

  private nuevoId(prefijo: string): string {
    return `${prefijo}-${++this.contador}-${Date.now()}`;
  }

  // ----------------------------------------------------------
  // RELEVOS
  // ----------------------------------------------------------

  getRelevos(pasoId: string): Relevo[] {
    return this.relevos
      .filter(r => r.paso_id === pasoId)
      .sort((a, b) => a.orden - b.orden);
  }

  getRelevo(id: string): Relevo | undefined {
    return this.relevos.find(r => r.id === id);
  }

  /** "Salida", "Relevo 1", "Relevo 2"... "Entrada" */
  nombre(r: Relevo): string {
    const total = this.relevos.filter(x => x.paso_id === r.paso_id).length;
    if (r.orden === 1) return 'Salida';
    if (r.orden === total) return 'Entrada';
    return `Relevo ${r.orden - 1}`;
  }

  /** Relevo anterior al dado (undefined si es la Salida) */
  getAnterior(r: Relevo): Relevo | undefined {
    return this.getRelevos(r.paso_id).find(x => x.orden === r.orden - 1);
  }

  /** Cuántos puestos con costalero se perderían si se reduce a `n` relevos */
  puestosQueSePierden(pasoId: string, n: number): number {
    n = Math.max(MIN_RELEVOS, Math.min(MAX_RELEVOS, Math.round(n) || MIN_RELEVOS));
    const lista = this.getRelevos(pasoId);
    const aQuitar = this.cualesQuitar(lista, n);
    return this.asignaciones.filter(a => aQuitar.some(r => r.id === a.relevo_id)).length;
  }

  /** Deja el paso con exactamente `n` relevos. La Salida y la Entrada se conservan. */
  configurar(pasoId: string, n: number) {
    n = Math.max(MIN_RELEVOS, Math.min(MAX_RELEVOS, Math.round(n) || MIN_RELEVOS));
    const ahora = new Date().toISOString();
    let lista = this.getRelevos(pasoId);

    if (lista.length === 0) {
      for (let i = 1; i <= n; i++) {
        this.relevos.push({ id: this.nuevoId('rel'), paso_id: pasoId, orden: i, created_at: ahora, updated_at: ahora });
      }
      return;
    }

    // Añadir: se insertan justo antes de la Entrada, que sigue siendo la última
    while (lista.length < n) {
      const entrada = lista[lista.length - 1];
      const ordenNuevo = entrada.orden;
      entrada.orden++;
      this.relevos.push({ id: this.nuevoId('rel'), paso_id: pasoId, orden: ordenNuevo, created_at: ahora, updated_at: ahora });
      lista = this.getRelevos(pasoId);
    }

    // Quitar: se eliminan los de en medio más cercanos a la Entrada
    const aQuitar = this.cualesQuitar(lista, n);
    if (aQuitar.length > 0) {
      const ids = new Set(aQuitar.map(r => r.id));
      this.relevos = this.relevos.filter(r => !ids.has(r.id));
      this.asignaciones = this.asignaciones.filter(a => !ids.has(a.relevo_id));
      this.getRelevos(pasoId).forEach((r, i) => (r.orden = i + 1));
    }
  }

  private cualesQuitar(lista: Relevo[], n: number): Relevo[] {
    const sobran = lista.length - n;
    if (sobran <= 0) return [];
    // Los de en medio (ni Salida ni Entrada), empezando por el más cercano a la Entrada
    const medios = lista.slice(1, lista.length - 1).reverse();
    return medios.slice(0, sobran);
  }

  actualizarCalles(relevoId: string, calleInicio: string, calleFin: string) {
    const r = this.getRelevo(relevoId);
    if (!r) return;
    r.calle_inicio = calleInicio.trim();
    r.calle_fin = calleFin.trim();
    r.updated_at = new Date().toISOString();
  }

  /** Guarda la lista de marchas de un relevo (en orden). Se ignoran las vacías. */
  actualizarMarchas(relevoId: string, marchas: string[]) {
    const r = this.getRelevo(relevoId);
    if (!r) return;
    r.marchas = marchas.map(m => m.trim()).filter(m => m.length > 0);
    r.updated_at = new Date().toISOString();
  }

  // ----------------------------------------------------------
  // PUESTOS
  // ----------------------------------------------------------

  getAsignaciones(relevoId: string): AsignacionRelevo[] {
    return this.asignaciones.filter(a => a.relevo_id === relevoId);
  }

  getAsignacion(relevoId: string, trabajaderaId: string, columna: number): AsignacionRelevo | undefined {
    return this.asignaciones.find(a =>
      a.relevo_id === relevoId && a.trabajadera_id === trabajaderaId && a.columna === columna);
  }

  getAsignacionDeCostalero(relevoId: string, costaleroId: string): AsignacionRelevo | undefined {
    return this.asignaciones.find(a => a.relevo_id === relevoId && a.costalero_id === costaleroId);
  }

  /**
   * Puestos ocupados de un relevo. Solo cuentan los que siguen existiendo hoy
   * (trabajadera y puesto dentro de la cuadrícula, costalero activo).
   */
  contarOcupados(relevoId: string): number {
    const relevo = this.getRelevo(relevoId);
    if (!relevo) return 0;
    const paso = this.mock.getPaso(relevo.paso_id);
    if (!paso) return 0;
    const trabajaderas = new Set(this.mock.getTrabajaderasByPaso(relevo.paso_id).map(t => t.id));
    const activos = new Set(this.mock.getCostalerosByPaso(relevo.paso_id).map(c => c.id));
    return this.getAsignaciones(relevoId).filter(a =>
      trabajaderas.has(a.trabajadera_id) && a.columna < paso.capacidad_trabajadera && activos.has(a.costalero_id)
    ).length;
  }

  actualizarNota(relevoId: string, trabajaderaId: string, columna: number, nota: string) {
    const a = this.getAsignacion(relevoId, trabajaderaId, columna);
    if (a) a.nota = nota.trim();
  }

  totalPuestos(pasoId: string): number {
    const paso = this.mock.getPaso(pasoId);
    if (!paso) return 0;
    return this.mock.getTrabajaderasByPaso(pasoId).length * paso.capacidad_trabajadera;
  }

  /**
   * Pone a un costalero en un puesto (sustituye al que hubiera).
   * Devuelve false si ese costalero ya está en OTRO puesto del mismo relevo
   * (en ese caso hay que usar `intercambiar`).
   */
  asignar(relevoId: string, trabajaderaId: string, columna: number, costaleroId: string, nota = ''): boolean {
    const previa = this.getAsignacionDeCostalero(relevoId, costaleroId);
    if (previa && !(previa.trabajadera_id === trabajaderaId && previa.columna === columna)) return false;

    this.quitar(relevoId, trabajaderaId, columna);
    this.asignaciones.push({
      id: this.nuevoId('asg'),
      relevo_id: relevoId,
      trabajadera_id: trabajaderaId,
      columna,
      costalero_id: costaleroId,
      nota: nota.trim(),
    });
    return true;
  }

  /**
   * Lleva a un costalero que YA está en este relevo a otro puesto.
   * Si el puesto destino está ocupado, el otro costalero se va al puesto que deja libre.
   */
  intercambiar(relevoId: string, trabajaderaId: string, columna: number, costaleroId: string, nota = '') {
    const origen = this.getAsignacionDeCostalero(relevoId, costaleroId);
    if (!origen) {
      this.asignar(relevoId, trabajaderaId, columna, costaleroId, nota);
      return;
    }
    if (origen.trabajadera_id === trabajaderaId && origen.columna === columna) return;

    const destino = this.getAsignacion(relevoId, trabajaderaId, columna);
    const origenT = origen.trabajadera_id;
    const origenC = origen.columna;
    if (destino) {
      destino.trabajadera_id = origenT;
      destino.columna = origenC;
      destino.nota = '';
    }
    origen.trabajadera_id = trabajaderaId;
    origen.columna = columna;
    origen.nota = nota.trim();
  }

  quitar(relevoId: string, trabajaderaId: string, columna: number) {
    this.asignaciones = this.asignaciones.filter(a =>
      !(a.relevo_id === relevoId && a.trabajadera_id === trabajaderaId && a.columna === columna));
  }

  vaciar(relevoId: string) {
    this.asignaciones = this.asignaciones.filter(a => a.relevo_id !== relevoId);
  }

  /** Sustituye el contenido de un relevo por una copia de otro */
  copiarDe(relevoId: string, origenId: string) {
    this.vaciar(relevoId);
    for (const a of this.getAsignaciones(origenId)) {
      this.asignaciones.push({ ...a, id: this.nuevoId('asg'), relevo_id: relevoId });
    }
  }

  // ----------------------------------------------------------
  // SUGERENCIA DE RELEVOS
  // ----------------------------------------------------------

  /**
   * Rellena los puestos VACÍOS de un relevo (lo que el capataz ya haya colocado no se toca).
   * Nunca coloca a nadie en una trabajadera que no sea la suya: si faltan costaleros,
   * el puesto se queda vacío y se avisa. Las reglas están explicadas en `planificar`.
   */
  sugerir(relevoId: string): ResultadoSugerencia {
    const relevo = this.getRelevo(relevoId);
    if (!relevo) return { colocados: 0, sinCubrir: 0, sinDescanso: [] };
    return this.rellenar(relevo.paso_id, relevo.id);
  }

  /** Sugiere, de una vez, todos los relevos del paso que tengan puestos vacíos */
  sugerirTodos(pasoId: string): ResultadoSugerencia {
    // Lo que ya había colocado antes (por el capataz) no se toca
    const idsPrevios = new Set(this.asignaciones.map(a => a.id));
    const total = this.rellenar(pasoId);
    total.sinDescanso.sort((a, b) => a - b);
    this.estabilizarPuestos(pasoId, idsPrevios);
    return total;
  }

  /**
   * Marcas informativas de un costalero (puntos sutiles en las casillas):
   *  - varios pasos: está activo en otro paso tuyo o saca pasos fuera de tu cuadrilla
   *  - aspirante
   */
  marcas(c: Costalero): MarcasCostalero {
    const otrosTuyos = this.mock.costaleros.filter(x => x.persona_id === c.persona_id && x.id !== c.id && x.activo).length;
    const externos = this.personas.buscarPorId(c.persona_id)?.pasos_externos ?? 0;
    return { otrosTuyos, externos, variosPasos: otrosTuyos + externos > 0, aspirante: c.es_aspirante, sinMarcar: this.resumenAsistencia(c.paso_id, c.id)?.sinMarcar ?? 0 };
  }

  /** Texto para el aviso emergente ('' si no tiene ninguna marca) */
  describirMarcas(c: Costalero): string {
    const m = this.marcas(c);
    const partes: string[] = [];
    if (m.otrosTuyos > 0) partes.push('también está en ' + (m.otrosTuyos === 1 ? 'otro paso tuyo' : `${m.otrosTuyos} pasos más tuyos`));
    if (m.externos > 0) partes.push(`saca ${m.externos} paso${m.externos !== 1 ? 's' : ''} fuera de tu cuadrilla`);
    if (m.aspirante) partes.push('aspirante');
    if (m.sinMarcar > 0) partes.push(`falta marcar la asistencia a ${m.sinMarcar} ensayo${m.sinMarcar !== 1 ? 's' : ''}`);
    return partes.join(', ');
  }

  /** Pasos que saca una persona en total: los suyos activos (en tus pasos) más los que saca fuera de tu cuadrilla */
  private pasosQueSaca(c: Costalero): number {
    const propios = this.mock.costaleros.filter(x => x.persona_id === c.persona_id && x.activo).length;
    return Math.max(1, propios) + (this.personas.buscarPorId(c.persona_id)?.pasos_externos ?? 0);
  }

  /** Planifica cada trabajadera y coloca el plan en los relevos pedidos (todos si no se indica ninguno) */
  private rellenar(pasoId: string, soloRelevoId?: string): ResultadoSugerencia {
    const resultado: ResultadoSugerencia = { colocados: 0, sinCubrir: 0, sinDescanso: [] };
    const paso = this.mock.getPaso(pasoId);
    if (!paso) return resultado;

    const costaleros = this.mock.getCostalerosByPaso(paso.id);
    const trabajaderas = this.mock.getTrabajaderasByPaso(paso.id);
    const relevos = this.getRelevos(paso.id);
    const ensayos = this.ensayosPasadosIds(paso.id);

    // 1) Plan de cada trabajadera (quién va en cada relevo)
    const planes = new Map<string, Map<string, string[]>>();
    for (const t of trabajaderas) {
      const propios = costaleros.filter(c => c.trabajadera_id === t.id);
      planes.set(t.id, this.planificar(paso.capacidad_trabajadera, t.id, propios, relevos, ensayos));
    }

    // 2) Colocar el plan en los relevos pedidos, de la Salida a la Entrada
    for (const relevo of relevos) {
      if (soloRelevoId && relevo.id !== soloRelevoId) continue;
      const anterior = this.getAnterior(relevo);

      for (const t of trabajaderas) {
        const huecos: number[] = [];
        for (let col = 0; col < paso.capacidad_trabajadera; col++) {
          if (!this.getAsignacion(relevo.id, t.id, col)) huecos.push(col);
        }
        if (huecos.length === 0) continue;

        const propios = costaleros.filter(c => c.trabajadera_id === t.id);
        const ids = planes.get(t.id)?.get(relevo.id) ?? [];
        const elegidos = ids
          .map(id => propios.find(c => c.id === id))
          .filter((c): c is Costalero => !!c && !this.getAsignacionDeCostalero(relevo.id, c.id))
          .slice(0, huecos.length);
        resultado.sinCubrir += huecos.length - elegidos.length;

        // Cada uno vuelve a su puesto habitual si está libre
        const libres = new Set(huecos);
        const sinPuesto: Costalero[] = [];
        for (const c of elegidos) {
          const habitual = this.puestoHabitual(relevo, c, t.id, relevos);
          if (habitual !== undefined && libres.has(habitual)) {
            libres.delete(habitual);
            this.asignar(relevo.id, t.id, habitual, c.id);
          } else {
            sinPuesto.push(c);
          }
        }

        // Los demás ocupan los huecos que sobran; primero los de quienes se van en este relevo
        // (el que entra releva al que sale en el mismo puesto)
        const seleccion = new Set(elegidos.map(c => c.id));
        const seVa = (col: number) => {
          const previo = anterior ? this.getAsignacion(anterior.id, t.id, col)?.costalero_id : undefined;
          return previo !== undefined && !seleccion.has(previo);
        };
        const restantes = [...libres].sort((a, b) => Number(seVa(b)) - Number(seVa(a)) || a - b);
        for (const c of sinPuesto) {
          this.asignar(relevo.id, t.id, restantes.shift()!, c.id);
        }

        resultado.colocados += elegidos.length;

        // Si hay tantos costaleros como puestos (o menos), repiten en todos los relevos
        if (elegidos.length > 0 && propios.length <= paso.capacidad_trabajadera && !resultado.sinDescanso.includes(t.numero)) {
          resultado.sinDescanso.push(t.numero);
        }
      }
    }
    return resultado;
  }

  /** Columna que ya ocupó el costalero en esa trabajadera en el relevo más cercano en el tiempo */
  private puestoHabitual(relevo: Relevo, c: Costalero, trabajaderaId: string, relevos: Relevo[]): number | undefined {
    let mejor: { distancia: number; orden: number; columna: number } | undefined;
    for (const otro of relevos) {
      if (otro.id === relevo.id) continue;
      const a = this.getAsignacionDeCostalero(otro.id, c.id);
      if (!a || a.trabajadera_id !== trabajaderaId) continue;
      const candidato = { distancia: Math.abs(otro.orden - relevo.orden), orden: otro.orden, columna: a.columna };
      if (!mejor || candidato.distancia < mejor.distancia || (candidato.distancia === mejor.distancia && candidato.orden < mejor.orden)) {
        mejor = candidato;
      }
    }
    return mejor?.columna;
  }

  /**
   * Plan de una trabajadera: qué costaleros propios van en los puestos vacíos de cada relevo.
   *
   * Se miran TODOS los relevos a la vez (no uno detrás de otro) y se busca el reparto de menor "coste":
   *   1. CUPO DE RELEVOS: cada uno hace n o n+1 relevos. Los relevos de más van a quien mejor
   *      asistencia tiene (presente 1, ausencia justificada 0,5, sin justificar 0); si hay empate,
   *      a quien más descansado pueda venir (menos pasos saca en total, contando los de fuera de tu cuadrilla).
   *      Solo en casos excepcionales (asistencia muy distinta: media diferencia o más) la diferencia llega a 2.
   *   2. DESCANSO: se evita que alguien haga 3 relevos seguidos, y en menor medida 2 seguidos.
   *   3. SALIDA / ENTRADA: quien no hace la Salida hace la Entrada (y al revés).
   *   4. La Entrada y, en menor medida, la Salida van a quienes mejor asistencia tienen.
   * Lo que el capataz ya haya colocado se respeta. Al azar entre repartos igual de buenos,
   * así que el resultado puede cambiar al repetir la sugerencia.
   * Devuelve, para cada relevo (id), los ids de costaleros a colocar en los puestos vacíos.
   */
  private planificar(puestos: number, trabajaderaId: string, cands: Costalero[], relevos: Relevo[], ensayos: Set<string>): Map<string, string[]> {
    const plan = new Map<string, string[]>();
    const n = relevos.length;
    const N = cands.length;
    if (N === 0 || n === 0) return plan;

    // Lo ya colocado: fijo[i][k] = el costalero k ya está en el relevo i (en cualquier fila)
    const indice = new Map(cands.map((c, k) => [c.id, k]));
    const fijo: boolean[][] = relevos.map(() => Array<boolean>(N).fill(false));
    const porColocar: number[] = [];   // puestos vacíos que se pueden rellenar en cada relevo
    relevos.forEach((r, i) => {
      const asignaciones = this.getAsignaciones(r.id);
      const enFila = asignaciones.filter(a => a.columna < puestos && a.trabajadera_id === trabajaderaId).length;
      for (const a of asignaciones) {
        const k = indice.get(a.costalero_id);
        if (k !== undefined) fijo[i][k] = true;
      }
      const disponibles = fijo[i].filter(x => !x).length;
      porColocar.push(Math.min(Math.max(0, puestos - enFila), disponibles));
    });
    const relevosAPlanificar = porColocar.map((x, i) => (x > 0 ? i : -1)).filter(i => i >= 0);
    if (relevosAPlanificar.length === 0) return plan;

    const merito = cands.map(c => this.meritoAsistencia(c.id, ensayos));
    const carga = cands.map(c => this.pasosQueSaca(c));
    const azar = cands.map(() => Math.random());

    // ---- Cupo de relevos de cada uno ----
    const total = Math.min(n * puestos, n * N);
    const base = Math.floor(total / N);
    const extra = total - base * N;
    const orden = cands.map((_, k) => k).sort((a, b) =>
      merito[b].valor - merito[a].valor || carga[a] - carga[b] || azar[a] - azar[b]);
    const cupo = Array<number>(N).fill(base);
    orden.slice(0, extra).forEach(k => cupo[k]++);

    // Excepción: si alguien tiene mucha peor asistencia que otro (media diferencia o más, con al menos
    // 3 ensayos marcados cada uno), hace un relevo menos y se lo queda quien mejor asistencia tiene.
    // La diferencia entre el que más y el que menos relevos hace nunca pasa de 2.
    for (let lo = N - 1; lo >= 1; lo--) {
      const peor = orden[lo];
      if (merito[peor].marcas < 3 || cupo[peor] <= 1) continue;
      for (let hi = 0; hi < lo; hi++) {
        const mejor = orden[hi];
        if (merito[mejor].valor - merito[peor].valor < 0.5) break;
        if (merito[mejor].marcas < 3 || cupo[mejor] >= n) continue;
        cupo[mejor]++; cupo[peor]--;
        if (Math.max(...cupo) - Math.min(...cupo) <= 2) break;
        cupo[mejor]--; cupo[peor]++;   // se pasaría de 2 de diferencia: se deshace
      }
    }

    // ---- Coste de un reparto (menor = mejor). Se calcula por persona, así que un intercambio solo afecta a dos ----
    const costePersona = (en: boolean[][], k: number): number => {
      let suma = 0;
      let hechos = 0;
      for (let i = 0; i < n; i++) {
        if (!en[i][k]) continue;
        hechos++;
        if (i + 1 < n && en[i + 1][k]) {
          suma += 15;                                   // dos seguidos
          if (i + 2 < n && en[i + 2][k]) suma += 300;   // tres seguidos
        }
      }
      suma += Math.abs(hechos - cupo[k]) * 1000;
      if (hechos > 0 && !en[0][k] && !en[n - 1][k]) suma += 120;   // ni Salida ni Entrada
      if (en[0][k]) suma += (1 - merito[k].valor) * 40;            // la Salida, mejor a quien asiste
      if (en[n - 1][k]) suma += (1 - merito[k].valor) * 80;        // la Entrada, todavía más
      return suma;
    };

    // ---- Búsqueda: reparto inicial al azar y mejoras por intercambios ----
    // Dos tipos de intercambio: cambiar quién ocupa un puesto de un relevo, o cruzar a dos personas
    // entre dos relevos (este último no cambia cuántos relevos hace cada uno).
    const todos = cands.map((_, k) => k);
    const vueltas = Math.min(30000, 2000 + 60 * N * n);
    let mejorCoste = Infinity;
    let mejorReparto: boolean[][] = fijo;
    for (let intento = 0; intento < 4; intento++) {
      const en = fijo.map(f => [...f]);
      const hechos = Array<number>(N).fill(0);
      for (let i = 0; i < n; i++) for (let k = 0; k < N; k++) if (en[i][k]) hechos[k]++;

      for (const i of relevosAPlanificar) {
        const libres = todos.filter(k => !en[i][k])
          .sort((a, b) => (cupo[b] - hechos[b]) - (cupo[a] - hechos[a]) || Math.random() - 0.5);
        for (const k of libres.slice(0, porColocar[i])) { en[i][k] = true; hechos[k]++; }
      }

      let actual = todos.reduce((s, k) => s + costePersona(en, k), 0);
      for (let v = 0; v < vueltas; v++) {
        const i = relevosAPlanificar[Math.floor(Math.random() * relevosAPlanificar.length)];
        const dentro = todos.filter(k => en[i][k] && !fijo[i][k]);
        if (dentro.length === 0) continue;
        const a = dentro[Math.floor(Math.random() * dentro.length)];

        if (Math.random() < 0.5) {
          // Cruce: a pasa de i a j y b pasa de j a i
          const j = relevosAPlanificar[Math.floor(Math.random() * relevosAPlanificar.length)];
          if (j === i) continue;
          const deJ = todos.filter(k => en[j][k] && !fijo[j][k] && !en[i][k]);
          if (deJ.length === 0 || en[j][a]) continue;
          const b = deJ[Math.floor(Math.random() * deJ.length)];
          const antes = costePersona(en, a) + costePersona(en, b);
          en[i][a] = false; en[j][a] = true; en[j][b] = false; en[i][b] = true;
          const despues = costePersona(en, a) + costePersona(en, b);
          if (despues <= antes) actual += despues - antes;
          else { en[i][a] = true; en[j][a] = false; en[j][b] = true; en[i][b] = false; }
        } else {
          // Sustitución: a sale de i y entra b
          const fuera = todos.filter(k => !en[i][k]);
          if (fuera.length === 0) continue;
          const b = fuera[Math.floor(Math.random() * fuera.length)];
          const antes = costePersona(en, a) + costePersona(en, b);
          en[i][a] = false; en[i][b] = true;
          const despues = costePersona(en, a) + costePersona(en, b);
          if (despues <= antes) actual += despues - antes;
          else { en[i][a] = true; en[i][b] = false; }
        }
      }

      if (actual < mejorCoste) { mejorCoste = actual; mejorReparto = en.map(f => [...f]); }
    }

    for (const i of relevosAPlanificar) {
      plan.set(relevos[i].id, cands.filter((_, k) => mejorReparto[i][k] && !fijo[i][k]).map(c => c.id));
    }
    return plan;
  }

  /**
   * Mérito de asistencia para repartir relevos: presente = 1, ausencia justificada = 0,5, ausente sin justificar = 0.
   * Sin ningún ensayo marcado vale 0,5 (neutro). `marcas` = ensayos en los que está marcado.
   */
  private meritoAsistencia(costaleroId: string, ensayosIds: Set<string>): { valor: number; marcas: number } {
    const marcas = this.mock.asistencias.filter(a => a.costalero_id === costaleroId && ensayosIds.has(a.ensayo_id));
    if (marcas.length === 0) return { valor: 0.5, marcas: 0 };
    const suma = marcas.reduce((s, a) => s + (a.estado === 'presente' ? 1 : a.estado === 'justificada' ? 0.5 : 0), 0);
    return { valor: suma / marcas.length, marcas: marcas.length };
  }
  /**
   * Cuando se sugieren todos los relevos a la vez, recoloca a los costaleros dentro de cada trabajadera
   * para que el MAYOR NÚMERO POSIBLE vaya en el mismo puesto en todos los relevos en los que sale.
   *
   * A veces no pueden ser todos: por ejemplo, con 4 costaleros para 3 puestos que rotan de uno en uno,
   * todos coinciden con todos en algún relevo y hacen falta 4 puestos fijos. En ese caso los que no pueden
   * quedarse fijos son los menos posibles y ocupan el hueco del que sale en cada relevo.
   *
   * Si el capataz ya había colocado a alguien en esa trabajadera, no se toca nada en ella.
   */
  private estabilizarPuestos(pasoId: string, idsPrevios: Set<string>) {
    const paso = this.mock.getPaso(pasoId);
    if (!paso) return;
    const puestos = paso.capacidad_trabajadera;
    const idsRelevos = new Set(this.getRelevos(pasoId).map(r => r.id));

    for (const t of this.mock.getTrabajaderasByPaso(pasoId)) {
      const asign = this.asignaciones.filter(a => a.trabajadera_id === t.id && idsRelevos.has(a.relevo_id));
      if (asign.length === 0 || asign.some(a => idsPrevios.has(a.id))) continue;

      // En qué relevos sale cada persona y en qué puesto estaba la primera vez
      const relevosDe = new Map<string, Set<string>>();
      const puestoActual = new Map<string, number>();
      for (const a of asign) {
        if (!relevosDe.has(a.costalero_id)) { relevosDe.set(a.costalero_id, new Set()); puestoActual.set(a.costalero_id, a.columna); }
        relevosDe.get(a.costalero_id)!.add(a.relevo_id);
      }

      // Primero los que salen más veces (los más difíciles de colocar)
      const personas = [...relevosDe.keys()].sort((a, b) => relevosDe.get(b)!.size - relevosDe.get(a)!.size);
      const coinciden = (p: string, q: string) => [...relevosDe.get(p)!].some(r => relevosDe.get(q)!.has(r));

      // Búsqueda del mayor conjunto de personas con puesto fijo (sin que dos coincidan en el mismo puesto)
      let mejor = new Map<string, number>();
      const actual = new Map<string, number>();
      let nodos = 0;
      const buscar = (i: number) => {
        if (++nodos > 200000) return;                                   // límite por si hay demasiadas combinaciones
        if (actual.size + (personas.length - i) <= mejor.size) return;  // aunque se fijaran todas las que quedan, no mejora
        if (i === personas.length) { mejor = new Map(actual); return; }
        const p = personas[i];
        // Se prueba primero el puesto que ya tenía, para cambiar lo mínimo
        const orden = [puestoActual.get(p)!, ...Array.from({ length: puestos }, (_, c) => c)]
          .filter((c, idx, arr) => c < puestos && arr.indexOf(c) === idx);
        for (const col of orden) {
          if ([...actual].every(([q, colQ]) => colQ !== col || !coinciden(p, q))) {
            actual.set(p, col);
            buscar(i + 1);
            actual.delete(p);
            if (mejor.size === personas.length) return;                 // ya están todos fijos
          }
        }
        buscar(i + 1);                                                  // esta persona no se queda fija
      };
      buscar(0);

      // Los fijos van siempre a su puesto; el resto ocupa los huecos que quedan en cada relevo
      for (const idRelevo of idsRelevos) {
        const delRelevo = asign.filter(a => a.relevo_id === idRelevo);
        const ocupados = new Set<number>();
        for (const a of delRelevo) {
          const fijo = mejor.get(a.costalero_id);
          if (fijo !== undefined) { a.columna = fijo; ocupados.add(fijo); }
        }
        const libres = Array.from({ length: puestos }, (_, c) => c).filter(c => !ocupados.has(c));
        for (const a of delRelevo) {
          if (mejor.has(a.costalero_id)) continue;
          const preferido = puestoActual.get(a.costalero_id)!;
          const idx = libres.includes(preferido) ? libres.indexOf(preferido) : 0;
          a.columna = libres.splice(idx, 1)[0];
        }
      }
    }
  }

  /** Texto de aviso tras una sugerencia. Solo dice lo que hay que avisar; si todo fue bien devuelve '' */
  describirSugerencia(res: ResultadoSugerencia): string {
    const avisos: string[] = [];
    if (res.sinCubrir > 0) {
      avisos.push(`${res.sinCubrir} puesto${res.sinCubrir !== 1 ? 's se han quedado vacíos' : ' se ha quedado vacío'} porque no hay más costaleros en su trabajadera.`);
    }
    if (res.sinDescanso.length > 0) {
      const lista = res.sinDescanso.length === 1
        ? String(res.sinDescanso[0])
        : `${res.sinDescanso.slice(0, -1).join(', ')} y ${res.sinDescanso[res.sinDescanso.length - 1]}`;
      avisos.push(res.sinDescanso.length === 1
        ? `La trabajadera ${lista} tiene tantos costaleros como puestos (o menos): son los mismos en todos los relevos y no hay a quién dar descanso.`
        : `Las trabajaderas ${lista} tienen tantos costaleros como puestos (o menos): son los mismos en todos los relevos y no hay a quién dar descanso.`);
    }
    return avisos.join(' ');
  }

  /** Ensayos del paso ya celebrados (fecha hasta hoy) y no cancelados */
  private ensayosPasadosIds(pasoId: string): Set<string> {
    const hoy = hoyLocal();
    return new Set(
      this.mock.getEnsayosByPaso(pasoId)
        .filter(e => !e.cancelado && !!e.fecha && e.fecha <= hoy)
        .map(e => e.id)
    );
  }

  /**
   * Asistencia de un costalero a los ensayos ya celebrados de su paso.
   * `total` es el nº de ensayos celebrados (el mismo para todos); `marcados`, aquellos en los que
   * ya se ha indicado algo; `sinMarcar`, los que faltan por indicar. Los "sin marcar" no cuentan como nada
   * para repartir relevos, pero se avisa de ellos.
   * Devuelve null si el paso aún no ha celebrado ningún ensayo.
   */
  resumenAsistencia(pasoId: string, costaleroId: string): ResumenAsistencia | null {
    const ensayos = this.ensayosPasadosIds(pasoId);
    if (ensayos.size === 0) return null;
    const marcas = this.mock.asistencias.filter(a => a.costalero_id === costaleroId && ensayos.has(a.ensayo_id));
    return {
      presentes: marcas.filter(a => a.estado === 'presente').length,
      justificadas: marcas.filter(a => a.estado === 'justificada').length,
      ausentes: marcas.filter(a => a.estado === 'ausente').length,
      marcados: marcas.length,
      total: ensayos.size,
      sinMarcar: Math.max(0, ensayos.size - marcas.length),
    };
  }
}
