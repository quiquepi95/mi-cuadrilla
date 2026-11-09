import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { hoyLocal } from '../../../../core/utils/fechas';
import { Ensayo, Paso } from '../../../../core/models';

type Temporalidad = 'futuros' | 'pasados' | 'todos';

interface EnsayoFila {
  ensayo: Ensayo;
  paso: Paso;
  esHoy: boolean;
  esPasado: boolean;
  /**
   * Estado de la lista de un ensayo PASADO y no cancelado:
   * 'ninguna' (nadie marcado), 'incompleta' (faltan costaleros activos por marcar) o 'completa'.
   * En los futuros y cancelados es 'completa' porque no hay nada pendiente.
   */
  lista: 'completa' | 'incompleta' | 'ninguna';
  /** Pasado, no cancelado y con la lista sin terminar (ninguna o incompleta) */
  pendienteLista: boolean;
}

/**
 * Pantalla "Ensayos": todos los ensayos de todos los pasos.
 * Por defecto muestra los futuros (hoy incluido). Filtros: futuros/pasados/todos, paso y rango de fechas.
 */
@Component({
  selector: 'app-lista-ensayos',
  standalone: true,
  imports: [DatePipe, RouterModule, IonicModule, FormsModule],
  templateUrl: './lista-ensayos.page.html',
  styleUrls: ['./lista-ensayos.page.scss'],
})
export class ListaEnsayosPage {
  private mock   = inject(MockDataService);
  private router = inject(Router);

  readonly opciones: { id: Temporalidad; label: string }[] = [
    { id: 'futuros', label: 'Futuros' },
    { id: 'pasados', label: 'Pasados' },
    { id: 'todos',   label: 'Todos' },
  ];

  // ---- Filtros ----
  temporalidad: Temporalidad = 'futuros';
  pasoFiltroId = '';       // '' = todos los pasos
  desde = '';
  hasta = '';
  soloSinLista = false;

  // ---- Nuevo ensayo (elegir paso) ----
  eligiendoPaso = false;
  pasoNuevoId = '';

  private readonly hoy = hoyLocal();

  get pasos(): Paso[] { return this.mock.getPasos(); }

  /** Todos los ensayos con la información que necesita la lista */
  private get filas(): EnsayoFila[] {
    return this.mock.ensayos
      .map(e => {
        const paso = this.mock.getPaso(e.paso_id);
        if (!paso) return null;
        const esPasado = !!e.fecha && e.fecha < this.hoy;
        const lista = this.estadoLista(e, esPasado);
        return {
          ensayo: e,
          paso,
          esHoy: e.fecha === this.hoy,
          esPasado,
          lista,
          pendienteLista: lista !== 'completa',
        } as EnsayoFila;
      })
      .filter((f): f is EnsayoFila => f !== null);
  }

  /** Cuántos costaleros ACTIVOS del paso tienen marcada su asistencia en el ensayo */
  private estadoLista(e: Ensayo, esPasado: boolean): 'completa' | 'incompleta' | 'ninguna' {
    if (!esPasado || e.cancelado) return 'completa';

    const activos = this.mock.getCostalerosByPaso(e.paso_id);
    if (activos.length === 0) return 'completa'; // nadie a quien pasar lista

    const asistencias = this.mock.getAsistenciasByEnsayo(e.id);
    const marcados = activos.filter(c => asistencias.some(a => a.costalero_id === c.id)).length;

    if (marcados === 0) return 'ninguna';
    return marcados === activos.length ? 'completa' : 'incompleta';
  }

  /** Nº de ensayos pasados con la lista pendiente (ninguna o incompleta), en TODOS los pasos y sin filtros */
  get totalPendientes(): number { return this.filas.filter(f => f.pendienteLista).length; }

  get filasFiltradas(): EnsayoFila[] {
    let filas = this.filas;

    if (this.temporalidad === 'futuros') filas = filas.filter(f => !!f.ensayo.fecha && !f.esPasado);
    if (this.temporalidad === 'pasados') filas = filas.filter(f => f.esPasado);

    if (this.pasoFiltroId) filas = filas.filter(f => f.paso.id === this.pasoFiltroId);
    if (this.desde)        filas = filas.filter(f => !!f.ensayo.fecha && f.ensayo.fecha >= this.desde);
    if (this.hasta)        filas = filas.filter(f => !!f.ensayo.fecha && f.ensayo.fecha <= this.hasta);
    if (this.soloSinLista) filas = filas.filter(f => f.pendienteLista);

    // Futuros y Todos: del más cercano al más lejano. Pasados: del más reciente al más antiguo.
    const sentido = this.temporalidad === 'pasados' ? -1 : 1;
    return [...filas].sort((a, b) => {
      const fa = a.ensayo.fecha, fb = b.ensayo.fecha;
      if (!fa && !fb) return 0;
      if (!fa) return 1;          // sin fecha siempre al final
      if (!fb) return -1;
      return fa.localeCompare(fb) * sentido;
    });
  }

  get hayFiltros(): boolean {
    return this.temporalidad !== 'futuros' || !!this.pasoFiltroId || !!this.desde || !!this.hasta || this.soloSinLista;
  }

  limpiarFiltros() {
    this.temporalidad = 'futuros';
    this.pasoFiltroId = '';
    this.desde = '';
    this.hasta = '';
    this.soloSinLista = false;
  }

  /** El aviso "sin pasar lista" actúa como atajo: enseña solo esos ensayos pasados */
  alternarSinLista() {
    this.soloSinLista = !this.soloSinLista;
    if (this.soloSinLista) this.temporalidad = 'pasados';
  }

  // ---- Nuevo ensayo ----
  abrirNuevo() {
    const pasos = this.pasos;
    if (pasos.length === 0) return;
    if (pasos.length === 1) { this.irANuevo(pasos[0].id); return; }

    this.pasoNuevoId = this.pasoFiltroId || pasos[0].id;
    this.eligiendoPaso = !this.eligiendoPaso;
  }

  continuarNuevo() {
    if (this.pasoNuevoId) this.irANuevo(this.pasoNuevoId);
  }

  private irANuevo(pasoId: string) {
    this.router.navigate(['/pasos', pasoId, 'ensayos', 'nuevo'], { queryParams: { origen: '/ensayos' } });
  }
}
