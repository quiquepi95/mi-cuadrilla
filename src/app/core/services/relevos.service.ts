import { Injectable, inject } from '@angular/core';
import { MockDataService } from './mock-data.service';
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

  /**
   * Cuadrícula de un relevo para dibujar la miniatura: filas = trabajaderas, columnas = puestos.
   * Cada casilla lleva las iniciales del costalero colocado ('' si el puesto está vacío).
   */
  getCeldas(relevoId: string): string[][] {
    const relevo = this.getRelevo(relevoId);
    const paso = relevo ? this.mock.getPaso(relevo.paso_id) : undefined;
    if (!relevo || !paso) return [];
    const activos = new Map(this.mock.getCostalerosByPaso(relevo.paso_id).map(c => [c.id, c]));
    return this.mock.getTrabajaderasByPaso(relevo.paso_id).map(t => {
      const fila: string[] = [];
      for (let col = 0; col < paso.capacidad_trabajadera; col++) {
        const a = this.getAsignacion(relevoId, t.id, col);
        const costalero = a ? activos.get(a.costalero_id) : undefined;
        fila.push(costalero ? this.iniciales(costalero) : '');
      }
      return fila;
    });
  }

  /** Primera letra del nombre y del primer apellido, en mayúsculas */
  iniciales(c: Costalero): string {
    return `${c.nombre[0] ?? ''}${c.apellidos.trim()[0] ?? ''}`.toUpperCase();
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
  // SUGERENCIA DE RELEVO
  // ----------------------------------------------------------

  /**
   * Rellena los puestos VACÍOS de un relevo (lo que el capataz ya haya colocado no se toca).
   *
   * Para cada trabajadera elige entre sus propios costaleros activos que aún no estén en este relevo.
   * Prioridad, de mayor a menor:
   *   1. SALIDA / ENTRADA: quien no hace la Salida tiene que hacer la Entrada (y al revés).
   *      Se aplica cuando el otro extremo ya tiene gente colocada.
   *   2. TRABAJADERA DOBLADA (tiene al menos el doble de costaleros que puestos): el relevo es un
   *      cambio completo, así que entran antes los que NO estuvieron en el relevo anterior.
   *   3. Los que menos relevos llevan debajo del paso (para que todos rueden).
   *   4. Los que NO estuvieron en el relevo anterior (descansan los que acaban de salir).
   *   5. Los que mejor asistencia tienen a los ensayos (presente = 1, justificada = 0,5, ausente = 0).
   *   6. Los que menos pasos sacan en total: se da descanso a quien saca más pasos, porque puede
   *      venir más cansado de otros días.
   *   7. Al azar, para no favorecer siempre a los mismos (el resultado puede cambiar al repetir la sugerencia).
   * Nunca coloca a nadie en una trabajadera que no sea la suya: si faltan costaleros,
   * el puesto se queda vacío y se avisa.
   *
   * POSICIÓN: cada costalero vuelve al puesto (columna) que ya ocupó en otros relevos de esa trabajadera,
   * el más cercano en el tiempo, para que mantenga su posición durante toda la procesión.
   * Si ese puesto no está libre, ocupa uno de los que queden.
   */
  sugerir(relevoId: string): ResultadoSugerencia {
    const relevo = this.getRelevo(relevoId);
    const paso = relevo ? this.mock.getPaso(relevo.paso_id) : undefined;
    if (!relevo || !paso) return { colocados: 0, sinCubrir: 0, sinDescanso: [] };

    const costaleros = this.mock.getCostalerosByPaso(paso.id);
    const trabajaderas = this.mock.getTrabajaderasByPaso(paso.id);
    const relevosDelPaso = this.getRelevos(paso.id);

    // Carga: en cuántos OTROS relevos está ya cada costalero
    const carga = new Map<string, number>();
    for (const otro of relevosDelPaso.filter(r => r.id !== relevo.id)) {
      for (const a of this.getAsignaciones(otro.id)) {
        carga.set(a.costalero_id, (carga.get(a.costalero_id) ?? 0) + 1);
      }
    }

    // Quién estuvo en el relevo anterior
    const anterior = this.getAnterior(relevo);
    const estuvoAntes = new Set(anterior ? this.getAsignaciones(anterior.id).map(a => a.costalero_id) : []);

    // Condición Salida / Entrada: quien no está en el otro extremo está obligado a estar en este
    const esSalida = relevo.orden === 1;
    const esEntrada = relevo.orden === relevosDelPaso.length;
    const otroExtremo = esSalida ? relevosDelPaso[relevosDelPaso.length - 1] : esEntrada ? relevosDelPaso[0] : undefined;
    const enOtroExtremo = new Set(otroExtremo ? this.getAsignaciones(otroExtremo.id).map(a => a.costalero_id) : []);
    const hayCondicionExtremos = enOtroExtremo.size > 0;
    const obligado = (c: Costalero) => hayCondicionExtremos && !enOtroExtremo.has(c.id);

    // Asistencia a ensayos ya celebrados y no cancelados
    const ensayosPasados = this.ensayosPasadosIds(paso.id);
    const asistencia = (c: Costalero) => this.tasaAsistencia(c.id, ensayosPasados);

    // Puesto habitual: dónde ha ido ya cada costalero en OTROS relevos de este paso.
    // Sirve para que cada uno mantenga su posición durante toda la procesión.
    const historial = new Map<string, { distancia: number; orden: number; trabajaderaId: string; columna: number }[]>();
    for (const otro of relevosDelPaso.filter(r => r.id !== relevo.id)) {
      for (const a of this.getAsignaciones(otro.id)) {
        const lista = historial.get(a.costalero_id) ?? [];
        lista.push({ distancia: Math.abs(otro.orden - relevo.orden), orden: otro.orden, trabajaderaId: a.trabajadera_id, columna: a.columna });
        historial.set(a.costalero_id, lista);
      }
    }
    // De los relevos en esta misma trabajadera, el más cercano en el tiempo
    const puestoHabitual = (c: Costalero, trabajaderaId: string): number | undefined =>
      (historial.get(c.id) ?? [])
        .filter(h => h.trabajaderaId === trabajaderaId)
        .sort((a, b) => a.distancia - b.distancia || a.orden - b.orden)[0]?.columna;

    // Cuántos pasos saca cada persona (en todos los pasos en los que está activa)
    const pasosPorPersona = new Map<string, number>();
    for (const c of this.mock.costaleros) {
      if (c.activo) pasosPorPersona.set(c.persona_id, (pasosPorPersona.get(c.persona_id) ?? 0) + 1);
    }
    const pasosQueSaca = (c: Costalero) => pasosPorPersona.get(c.persona_id) ?? 1;

    // Desempate final al azar (un número por costalero, fijo durante esta sugerencia)
    const azar = new Map(costaleros.map(c => [c.id, Math.random()]));

    const enRelevo = new Set(this.getAsignaciones(relevo.id).map(a => a.costalero_id));
    let colocados = 0;
    let sinCubrir = 0;
    const sinDescanso: number[] = [];

    for (const t of trabajaderas) {
      const huecos: number[] = [];
      for (let col = 0; col < paso.capacidad_trabajadera; col++) {
        if (!this.getAsignacion(relevo.id, t.id, col)) huecos.push(col);
      }
      if (huecos.length === 0) continue;

      const deLaTrabajadera = costaleros.filter(c => c.trabajadera_id === t.id);
      const doblada = this.estaDoblada(deLaTrabajadera.length, paso.capacidad_trabajadera);

      const candidatos = deLaTrabajadera
        .filter(c => !enRelevo.has(c.id))
        .sort((a, b) =>
          Number(obligado(b)) - Number(obligado(a)) ||
          (doblada ? Number(estuvoAntes.has(a.id)) - Number(estuvoAntes.has(b.id)) : 0) ||
          (carga.get(a.id) ?? 0) - (carga.get(b.id) ?? 0) ||
          Number(estuvoAntes.has(a.id)) - Number(estuvoAntes.has(b.id)) ||
          asistencia(b) - asistencia(a) ||
          pasosQueSaca(a) - pasosQueSaca(b) ||
          (azar.get(a.id) ?? 0) - (azar.get(b.id) ?? 0)
        );

      // Los que entran son los primeros del orden de prioridad, uno por hueco
      const elegidos = candidatos.slice(0, huecos.length);
      sinCubrir += huecos.length - elegidos.length;

      // Cada uno vuelve a su puesto habitual si está libre
      const libres = new Set(huecos);
      const sinPuesto: Costalero[] = [];
      for (const c of elegidos) {
        const habitual = puestoHabitual(c, t.id);
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

      for (const c of elegidos) enRelevo.add(c.id);
      colocados += elegidos.length;
      const colocadosAqui = elegidos.length;

      // Si hay tantos costaleros como puestos (o menos), repiten en todos los relevos
      if (colocadosAqui > 0 && deLaTrabajadera.length <= paso.capacidad_trabajadera) {
        sinDescanso.push(t.numero);
      }
    }

    return { colocados, sinCubrir, sinDescanso };
  }

  /** Una trabajadera va "doblada" cuando tiene al menos el doble de costaleros activos que puestos */
  estaDoblada(costalerosActivos: number, puestos: number): boolean {
    return puestos > 0 && costalerosActivos >= 2 * puestos;
  }

  /** Sugiere, en orden, todos los relevos del paso que tengan puestos vacíos */
  sugerirTodos(pasoId: string): ResultadoSugerencia {
    const total: ResultadoSugerencia = { colocados: 0, sinCubrir: 0, sinDescanso: [] };
    // Lo que ya había colocado antes (por el capataz) no se toca
    const idsPrevios = new Set(this.asignaciones.map(a => a.id));
    for (const r of this.getRelevos(pasoId)) {
      const res = this.sugerir(r.id);
      total.colocados += res.colocados;
      total.sinCubrir += res.sinCubrir;
      for (const n of res.sinDescanso) {
        if (!total.sinDescanso.includes(n)) total.sinDescanso.push(n);
      }
    }
    total.sinDescanso.sort((a, b) => a - b);
    this.estabilizarPuestos(pasoId, idsPrevios);
    return total;
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

  /** Texto para enseñar al capataz tras una sugerencia (solo menciona lo que hay que avisar) */
  describirSugerencia(res: ResultadoSugerencia): string {
    if (res.colocados === 0 && res.sinCubrir === 0) return 'No había puestos vacíos que rellenar.';

    let texto = `Sugerencia lista: ${res.colocados} puesto${res.colocados !== 1 ? 's' : ''} rellenado${res.colocados !== 1 ? 's' : ''}.`;
    if (res.sinCubrir > 0) {
      texto += ` ${res.sinCubrir} se han quedado vacíos porque no hay más costaleros en su trabajadera.`;
    }
    if (res.sinDescanso.length > 0) {
      const lista = res.sinDescanso.length === 1
        ? String(res.sinDescanso[0])
        : `${res.sinDescanso.slice(0, -1).join(', ')} y ${res.sinDescanso[res.sinDescanso.length - 1]}`;
      texto += res.sinDescanso.length === 1
        ? ` La trabajadera ${lista} tiene tantos costaleros como puestos (o menos): son los mismos en todos los relevos y no hay a quién dar descanso.`
        : ` Las trabajaderas ${lista} tienen tantos costaleros como puestos (o menos): son los mismos en todos los relevos y no hay a quién dar descanso.`;
    }
    return texto;
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
   * Solo cuentan los ensayos en los que está marcado (los "sin marcar" no cuentan como nada).
   * Devuelve null si no hay ningún dato.
   */
  resumenAsistencia(pasoId: string, costaleroId: string): ResumenAsistencia | null {
    const ensayos = this.ensayosPasadosIds(pasoId);
    const marcas = this.mock.asistencias.filter(a => a.costalero_id === costaleroId && ensayos.has(a.ensayo_id));
    if (marcas.length === 0) return null;
    return {
      presentes: marcas.filter(a => a.estado === 'presente').length,
      justificadas: marcas.filter(a => a.estado === 'justificada').length,
      ausentes: marcas.filter(a => a.estado === 'ausente').length,
      marcados: marcas.length,
    };
  }

  private tasaAsistencia(costaleroId: string, ensayosIds: Set<string>): number {
    const marcas = this.mock.asistencias.filter(a => a.costalero_id === costaleroId && ensayosIds.has(a.ensayo_id));
    if (marcas.length === 0) return 0.5; // sin datos: neutral
    const suma = marcas.reduce((s, a) => s + (a.estado === 'presente' ? 1 : a.estado === 'justificada' ? 0.5 : 0), 0);
    return suma / marcas.length;
  }
}
