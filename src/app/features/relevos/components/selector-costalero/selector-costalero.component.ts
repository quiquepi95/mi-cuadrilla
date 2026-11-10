import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular/lazy';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { RelevosService, ResumenAsistencia } from '../../../../core/services/relevos.service';
import { AtrasService } from '../../../../core/services/atras.service';
import { Costalero, Paso, Relevo, Trabajadera, AsignacionRelevo } from '../../../../core/models';

interface Candidato {
  costalero: Costalero;
  numeroTrabajadera: number;
  propia: boolean;          // es de la trabajadera del puesto que se está rellenando
  esElActual: boolean;      // es quien está ahora en este puesto
}

/**
 * Ventana para elegir al costalero de UN puesto de un relevo: buscar, elegir (primero los de esa
 * trabajadera), dejar una nota si es de otra trabajadera, quitarlo o cambiar su nota.
 *
 * Quien ocupa ahora el puesto sale el primero de la lista, con el mismo tamaño y datos que los demás,
 * más suave y con una línea de color en el borde. Al tocarlo se edita su nota o se deja el puesto vacío.
 * Se cierra con el botón atrás del móvil.
 */
@Component({
  selector: 'app-selector-costalero',
  standalone: true,
  imports: [IonicModule, FormsModule],
  templateUrl: './selector-costalero.component.html',
  styleUrls: ['./selector-costalero.component.scss'],
})
export class SelectorCostaleroComponent implements OnInit, OnDestroy {
  private mock = inject(MockDataService);
  private relevosService = inject(RelevosService);
  private atras = inject(AtrasService);
  private quitarAtras?: () => void;

  @Input({ required: true }) relevoId!: string;
  @Input({ required: true }) trabajaderaId!: string;
  @Input({ required: true }) columna!: number;

  /** Se ha cambiado algo (colocar, quitar, nota): hay que refrescar lo que se ve detrás */
  @Output() cambio = new EventEmitter<void>();
  @Output() cerrar = new EventEmitter<void>();

  relevo?: Relevo;
  paso?: Paso;
  trabajadera?: Trabajadera;
  titulo = '';

  private trabajaderas: Trabajadera[] = [];
  private costaleros: Costalero[] = [];
  private asistencias = new Map<string, ResumenAsistencia>();

  actual?: Costalero;
  asignacionActual?: AsignacionRelevo;
  numeroOrigenActual?: number;

  busqueda = '';
  verOtras = false;

  /** Se está editando la nota del costalero actual / dejando el puesto vacío */
  editandoActual = false;
  notaActual = '';

  /** Costalero de otra trabajadera pendiente de colocar (se pide una nota opcional) */
  pendienteNota: Costalero | null = null;
  notaNueva = '';

  ngOnInit() {
    this.relevo = this.relevosService.getRelevo(this.relevoId);
    this.paso = this.relevo ? this.mock.getPaso(this.relevo.paso_id) : undefined;
    if (!this.relevo || !this.paso) { this.cerrar.emit(); return; }

    this.trabajaderas = this.mock.getTrabajaderasByPaso(this.paso.id);
    this.costaleros = this.mock.getCostalerosByPaso(this.paso.id);
    this.trabajadera = this.trabajaderas.find(t => t.id === this.trabajaderaId);

    for (const c of this.costaleros) {
      const resumen = this.relevosService.resumenAsistencia(this.paso.id, c.id);
      if (resumen) this.asistencias.set(c.id, resumen);
    }

    this.asignacionActual = this.relevosService.getAsignacion(this.relevoId, this.trabajaderaId, this.columna);
    this.actual = this.asignacionActual
      ? this.costaleros.find(c => c.id === this.asignacionActual!.costalero_id)
      : undefined;
    if (!this.actual) this.asignacionActual = undefined;
    this.notaActual = this.asignacionActual?.nota ?? '';
    this.numeroOrigenActual = this.actual
      ? this.trabajaderas.find(t => t.id === this.actual!.trabajadera_id)?.numero
      : undefined;

    this.titulo = `${this.relevosService.nombre(this.relevo)} · Trabajadera ${this.trabajadera?.numero ?? '?'} · puesto ${this.columna + 1}`;

    // El botón atrás del móvil cierra esta ventana
    this.quitarAtras = this.atras.registrar(() => this.cerrar.emit());
  }

  ngOnDestroy() {
    this.quitarAtras?.();
  }

  get esDeOtraTrabajadera(): boolean {
    return !!this.actual && this.actual.trabajadera_id !== this.trabajaderaId;
  }

  get buscando(): boolean {
    return this.busqueda.trim().length >= 2;
  }

  /**
   * Costaleros que se pueden poner en el puesto. Primero quien ya está ahí, después los de su
   * trabajadera y por último (si se piden o se busca) los de otras trabajaderas.
   */
  get candidatos(): Candidato[] {
    const q = this.busqueda.trim().toLowerCase();
    const coincide = (c: Costalero) => `${c.nombre} ${c.apellidos}`.toLowerCase().includes(q);

    return this.costaleros
      .filter(c => {
        if (this.buscando) return coincide(c);
        if (c.id === this.actual?.id) return true;       // el actual siempre se ve
        return c.trabajadera_id === this.trabajaderaId || this.verOtras;
      })
      .map(c => ({
        costalero: c,
        numeroTrabajadera: this.trabajaderas.find(t => t.id === c.trabajadera_id)?.numero ?? 0,
        propia: c.trabajadera_id === this.trabajaderaId,
        esElActual: c.id === this.actual?.id,
      }))
      .sort((a, b) =>
        Number(b.esElActual) - Number(a.esElActual) ||
        Number(b.propia) - Number(a.propia) ||
        a.numeroTrabajadera - b.numeroTrabajadera ||
        a.costalero.calzo_cm - b.costalero.calzo_cm ||
        a.costalero.apellidos.localeCompare(b.costalero.apellidos, 'es')
      );
  }

  elegir(c: Candidato) {
    if (c.esElActual) {
      // Tocar al que ya está: editar su nota o dejar el puesto vacío
      this.editandoActual = true;
      return;
    }
    if (!c.propia) {
      // Va en una trabajadera que no es la suya: se avisa y se puede dejar una nota
      this.pendienteNota = c.costalero;
      this.notaNueva = '';
      return;
    }
    this.colocar(c.costalero, '');
  }

  colocarConNota() {
    if (this.pendienteNota) this.colocar(this.pendienteNota, this.notaNueva);
  }

  volverALista() {
    this.pendienteNota = null;
    this.editandoActual = false;
  }

  private colocar(c: Costalero, nota: string) {
    if (this.relevosService.getAsignacionDeCostalero(this.relevoId, c.id)) {
      // Ya está en otro puesto de este relevo: se cambian de sitio
      this.relevosService.intercambiar(this.relevoId, this.trabajaderaId, this.columna, c.id, nota);
    } else {
      this.relevosService.asignar(this.relevoId, this.trabajaderaId, this.columna, c.id, nota);
    }
    this.cambio.emit();
    this.cerrar.emit();
  }

  quitarDelPuesto() {
    this.relevosService.quitar(this.relevoId, this.trabajaderaId, this.columna);
    this.cambio.emit();
    this.cerrar.emit();
  }

  guardarNotaActual() {
    this.relevosService.actualizarNota(this.relevoId, this.trabajaderaId, this.columna, this.notaActual);
    this.cambio.emit();
    this.cerrar.emit();
  }

  formatCalzo(calzo: number): string {
    return calzo === 0 ? '0 cm' : `+${calzo} cm`;
  }

  /** Texto corto de asistencia: ensayos a los que ha asistido / ensayos en los que está marcado ("7/9") */
  asistenciaTexto(c: Costalero): string {
    const r = this.asistencias.get(c.id);
    return r ? `${r.presentes}/${r.marcados}` : '';
  }

  asistenciaTitulo(c: Costalero): string {
    const r = this.asistencias.get(c.id);
    if (!r) return '';
    const extra = [
      r.justificadas > 0 ? `${r.justificadas} justificada${r.justificadas !== 1 ? 's' : ''}` : '',
      r.ausentes > 0 ? `${r.ausentes} ausencia${r.ausentes !== 1 ? 's' : ''}` : '',
    ].filter(Boolean).join(', ');
    return `Ha asistido a ${r.presentes} de ${r.marcados} ensayos${extra ? ' (' + extra + ')' : ''}`;
  }
}
