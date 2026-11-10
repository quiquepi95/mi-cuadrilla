import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { RelevosService, ResumenAsistencia } from '../../../../core/services/relevos.service';
import { SelectorCostaleroComponent } from '../../components/selector-costalero/selector-costalero.component';
import { Paso, Relevo, Trabajadera, Costalero, AsignacionRelevo } from '../../../../core/models';

interface Puesto {
  columna: number;
  costalero?: Costalero;
  asignacion?: AsignacionRelevo;
  deOtra: boolean;          // va en una trabajadera que no es la suya
  numeroOrigen?: number;    // nº de su trabajadera de verdad
}

interface FilaTrabajadera {
  trabajadera: Trabajadera;
  puestos: Puesto[];
}

@Component({
  selector: 'app-editor-relevo',
  standalone: true,
  imports: [RouterModule, IonicModule, FormsModule, SelectorCostaleroComponent],
  templateUrl: './editor-relevo.page.html',
  styleUrls: ['./editor-relevo.page.scss'],
})
export class EditorRelevoPage implements OnInit {
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private mock = inject(MockDataService);
  private relevosService = inject(RelevosService);

  relevo?: Relevo;
  paso?: Paso;
  nombre = '';
  nombreAnterior = '';
  nombreSiguiente = '';
  anterior?: Relevo;
  siguiente?: Relevo;

  trabajaderas: Trabajadera[] = [];
  costaleros: Costalero[] = [];       // solo activos
  filas: FilaTrabajadera[] = [];
  ocupados = 0;
  total = 0;

  /** Asistencia a ensayos de cada costalero (solo los que tienen datos) */
  private asistencias = new Map<string, ResumenAsistencia>();
  hayAsistencias = false;

  calleInicio = '';
  calleFin = '';

  mensaje = '';
  accionPendiente: 'copiar' | 'vaciar' | null = null;

  /** Puesto abierto en la ventana de selección de costalero */
  seleccion: { trabajaderaId: string; columna: number } | null = null;

  ngOnInit() {
    // Se suscribe a la ruta para que los botones Anterior / Siguiente recarguen la pantalla
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.cargar(params.get('id') || '');
    });
  }

  private cargar(relevoId: string) {
    this.seleccion = null;
    this.mensaje = '';
    this.accionPendiente = null;

    this.relevo = this.relevosService.getRelevo(relevoId);
    if (!this.relevo) { this.paso = undefined; return; }

    this.paso = this.mock.getPaso(this.relevo.paso_id);
    this.nombre = this.relevosService.nombre(this.relevo);
    this.calleInicio = this.relevo.calle_inicio ?? '';
    this.calleFin = this.relevo.calle_fin ?? '';

    const lista = this.relevosService.getRelevos(this.relevo.paso_id);
    this.anterior = lista.find(r => r.orden === this.relevo!.orden - 1);
    this.siguiente = lista.find(r => r.orden === this.relevo!.orden + 1);
    this.nombreAnterior = this.anterior ? this.relevosService.nombre(this.anterior) : '';
    this.nombreSiguiente = this.siguiente ? this.relevosService.nombre(this.siguiente) : '';

    this.refrescar();
  }

  /** Reconstruye la cuadrícula a partir de los datos */
  refrescar() {
    if (!this.relevo || !this.paso) return;
    const relevoId = this.relevo.id;
    const capacidad = this.paso.capacidad_trabajadera;

    this.trabajaderas = this.mock.getTrabajaderasByPaso(this.paso.id);
    this.costaleros = this.mock.getCostalerosByPaso(this.paso.id);

    this.asistencias = new Map();
    for (const c of this.costaleros) {
      const resumen = this.relevosService.resumenAsistencia(this.paso.id, c.id);
      if (resumen) this.asistencias.set(c.id, resumen);
    }
    this.hayAsistencias = this.asistencias.size > 0;

    this.filas = this.trabajaderas.map(t => ({
      trabajadera: t,
      puestos: Array.from({ length: capacidad }, (_, columna) => {
        const asignacion = this.relevosService.getAsignacion(relevoId, t.id, columna);
        const costalero = asignacion ? this.costaleros.find(c => c.id === asignacion.costalero_id) : undefined;
        const origen = costalero ? this.trabajaderas.find(x => x.id === costalero.trabajadera_id) : undefined;
        return {
          columna,
          asignacion: costalero ? asignacion : undefined,
          costalero,
          deOtra: !!costalero && costalero.trabajadera_id !== t.id,
          numeroOrigen: origen?.numero,
        };
      }),
    }));

    this.ocupados = this.relevosService.contarOcupados(relevoId);
    this.total = this.relevosService.totalPuestos(this.paso.id);
  }

  get vacios(): number { return this.total - this.ocupados; }

  primerApellido(c: Costalero): string {
    return c.apellidos.split(' ')[0];
  }

  // ---- Calles ----

  guardarCalles() {
    if (!this.relevo) return;
    this.relevosService.actualizarCalles(this.relevo.id, this.calleInicio, this.calleFin);
  }

  // ---- Acciones del relevo ----

  sugerir() {
    if (!this.relevo) return;
    const res = this.relevosService.sugerir(this.relevo.id);
    this.mensaje = this.relevosService.describirSugerencia(res);
    this.accionPendiente = null;
    this.refrescar();
  }

  pedirAccion(accion: 'copiar' | 'vaciar') {
    // Si no hay nada colocado no hay nada que perder: se hace directamente
    if (this.ocupados === 0) { this.ejecutar(accion); return; }
    this.accionPendiente = accion;
  }

  confirmarAccion() {
    if (this.accionPendiente) this.ejecutar(this.accionPendiente);
  }

  cancelarAccion() {
    this.accionPendiente = null;
  }

  private ejecutar(accion: 'copiar' | 'vaciar') {
    if (!this.relevo) return;
    if (accion === 'copiar' && this.anterior) {
      this.relevosService.copiarDe(this.relevo.id, this.anterior.id);
      this.mensaje = `Copiado desde «${this.nombreAnterior}». Cambia lo que necesites.`;
    } else if (accion === 'vaciar') {
      this.relevosService.vaciar(this.relevo.id);
      this.mensaje = '';
    }
    this.accionPendiente = null;
    this.refrescar();
  }

  // ---- Selección de costalero (ventana compartida con la pestaña "Relevos (nuevo)") ----

  abrirPuesto(fila: FilaTrabajadera, puesto: Puesto) {
    this.seleccion = { trabajaderaId: fila.trabajadera.id, columna: puesto.columna };
  }

  cerrarSeleccion() {
    this.seleccion = null;
  }

  /** Texto corto de asistencia: ensayos a los que ha asistido / ensayos en los que está marcado ("7/9") */
  asistenciaTexto(c: Costalero): string {
    const r = this.asistencias.get(c.id);
    return r ? `${r.presentes}/${r.marcados}` : '';
  }

  /** Texto largo, para el aviso emergente */
  asistenciaTitulo(c: Costalero): string {
    const r = this.asistencias.get(c.id);
    if (!r) return '';
    const extra = [
      r.justificadas > 0 ? `${r.justificadas} justificada${r.justificadas !== 1 ? 's' : ''}` : '',
      r.ausentes > 0 ? `${r.ausentes} ausencia${r.ausentes !== 1 ? 's' : ''}` : '',
    ].filter(Boolean).join(', ');
    return `Ha asistido a ${r.presentes} de ${r.marcados} ensayos${extra ? ' (' + extra + ')' : ''}`;
  }

  /** Texto emergente de un puesto ocupado */
  tituloPuesto(p: Puesto): string {
    if (!p.costalero) return 'Puesto vacío';
    const base = `${p.costalero.nombre} ${p.costalero.apellidos}`;
    const origen = p.deOtra ? ` · es de la T${p.numeroOrigen}` : '';
    const asistencia = this.asistenciaTitulo(p.costalero);
    const nota = p.asignacion?.nota ? ` · ${p.asignacion.nota}` : '';
    return base + origen + (asistencia ? ` · ${asistencia}` : '') + nota;
  }
}
