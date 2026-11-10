import { Component, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { RelevosService, ResumenAsistencia, MIN_RELEVOS, MAX_RELEVOS } from '../../../../core/services/relevos.service';
import { Costalero, AsignacionRelevo, Paso, Relevo, Trabajadera } from '../../../../core/models';
import { SelectorCostaleroComponent } from '../selector-costalero/selector-costalero.component';

interface PuestoTablero {
  columna: number;
  costalero?: Costalero;
  asignacion?: AsignacionRelevo;
  deOtra: boolean;          // va en una trabajadera que no es la suya
  numeroOrigen?: number;    // nº de su trabajadera de verdad
}

interface FilaTablero {
  trabajadera: Trabajadera;
  puestos: PuestoTablero[];
}

interface TarjetaTablero {
  relevo: Relevo;
  nombre: string;
  calleInicio: string;
  calleFin: string;
  ocupados: number;
  vacios: number;
  tieneAnterior: boolean;
  filas: FilaTablero[];
}

/**
 * Pestaña "Relevos (nuevo)": todos los relevos del paso a la vez, cada uno con su cuadrícula completa
 * y con las acciones (sugerir, copiar el anterior, vaciar, calles) como iconos en la propia tarjeta.
 * Así no hay que entrar y salir de cada relevo ni recordar quién estaba en el anterior.
 */
@Component({
  selector: 'app-tablero-relevos',
  standalone: true,
  imports: [FormsModule, IonicModule, SelectorCostaleroComponent],
  templateUrl: './tablero-relevos.component.html',
  styleUrls: ['./tablero-relevos.component.scss'],
})
export class TableroRelevosComponent implements OnInit {
  private mock = inject(MockDataService);
  private relevosService = inject(RelevosService);

  @Input({ required: true }) pasoId!: string;
  @Input() color = 'var(--mc-accent)';

  readonly min = MIN_RELEVOS;
  readonly max = MAX_RELEVOS;

  paso?: Paso;
  tarjetas: TarjetaTablero[] = [];
  totalPuestos = 0;
  hayAsistencias = false;
  private asistencias = new Map<string, ResumenAsistencia>();

  /** 'cuadricula': tarjetas una debajo de otra (varias por fila si caben); 'fila': una fila que se desliza hacia los lados */
  vista: 'cuadricula' | 'fila' = 'cuadricula';

  /** Número de relevos que se está eligiendo (al crear o al cambiar) */
  numero = 5;
  cambiandoNumero = false;

  /** Mensaje tras sugerir: se muestra en la tarjeta que lo ha generado (o arriba si es para todos) */
  mensaje: { relevoId: string | null; texto: string } | null = null;

  /** Acción que sobrescribiría lo ya colocado y espera confirmación */
  confirmar: { relevoId: string; tipo: 'copiar' | 'vaciar' } | null = null;

  /** Relevo cuyas calles se están editando */
  editandoCalles: string | null = null;
  calleInicio = '';
  calleFin = '';

  /** Puesto abierto en la ventana de selección */
  seleccion: { relevoId: string; trabajaderaId: string; columna: number } | null = null;

  ngOnInit() {
    this.cargar();
  }

  /** Reconstruye todas las tarjetas a partir de los datos */
  cargar() {
    this.paso = this.mock.getPaso(this.pasoId);
    if (!this.paso) return;

    const trabajaderas = this.mock.getTrabajaderasByPaso(this.pasoId);
    const costaleros = this.mock.getCostalerosByPaso(this.pasoId);
    const capacidad = this.paso.capacidad_trabajadera;

    this.asistencias = new Map();
    for (const c of costaleros) {
      const resumen = this.relevosService.resumenAsistencia(this.pasoId, c.id);
      if (resumen) this.asistencias.set(c.id, resumen);
    }
    this.hayAsistencias = this.asistencias.size > 0;

    this.totalPuestos = this.relevosService.totalPuestos(this.pasoId);

    this.tarjetas = this.relevosService.getRelevos(this.pasoId).map(relevo => {
      const filas: FilaTablero[] = trabajaderas.map(t => ({
        trabajadera: t,
        puestos: Array.from({ length: capacidad }, (_, columna) => {
          const asignacion = this.relevosService.getAsignacion(relevo.id, t.id, columna);
          const costalero = asignacion ? costaleros.find(c => c.id === asignacion.costalero_id) : undefined;
          const origen = costalero ? trabajaderas.find(x => x.id === costalero.trabajadera_id) : undefined;
          return {
            columna,
            asignacion: costalero ? asignacion : undefined,
            costalero,
            deOtra: !!costalero && costalero.trabajadera_id !== t.id,
            numeroOrigen: origen?.numero,
          };
        }),
      }));
      const ocupados = this.relevosService.contarOcupados(relevo.id);
      return {
        relevo,
        nombre: this.relevosService.nombre(relevo),
        calleInicio: relevo.calle_inicio ?? '',
        calleFin: relevo.calle_fin ?? '',
        ocupados,
        vacios: this.totalPuestos - ocupados,
        tieneAnterior: !!this.relevosService.getAnterior(relevo),
        filas,
      };
    });
  }

  get hayPuestosVacios(): boolean {
    return this.tarjetas.some(t => t.vacios > 0);
  }

  // ---- Número de relevos ----

  cambiar(delta: number) {
    this.numero = Math.max(this.min, Math.min(this.max, this.numero + delta));
  }

  /** Al escribir el número a mano se acepta tal cual; se ajusta a los límites al salir del campo */
  escribir(valor: number | string | null) {
    const n = Math.round(Number(valor));
    if (Number.isFinite(n)) this.numero = n;
  }

  ajustar() {
    this.numero = Math.max(this.min, Math.min(this.max, this.numero || this.min));
  }

  crear() {
    this.ajustar();
    this.relevosService.configurar(this.pasoId, this.numero);
    this.mensaje = null;
    this.cargar();
  }

  empezarACambiar() {
    this.numero = this.tarjetas.length;
    this.cambiandoNumero = true;
    this.mensaje = null;
  }

  cancelarCambio() {
    this.cambiandoNumero = false;
  }

  get relevosQueSeQuitan(): number {
    return Math.max(0, this.tarjetas.length - this.numero);
  }

  get relevosQueSeAnaden(): number {
    return Math.max(0, this.numero - this.tarjetas.length);
  }

  /** Puestos ya colocados que se perderían con el número elegido */
  get puestosQueSePierden(): number {
    return this.relevosService.puestosQueSePierden(this.pasoId, this.numero);
  }

  aplicarCambio() {
    this.ajustar();
    this.relevosService.configurar(this.pasoId, this.numero);
    this.cambiandoNumero = false;
    this.cargar();
  }

  // ---- Acciones por relevo ----

  sugerirTodos() {
    const res = this.relevosService.sugerirTodos(this.pasoId);
    this.mensaje = { relevoId: null, texto: this.relevosService.describirSugerencia(res) };
    this.confirmar = null;
    this.cargar();
  }

  sugerirUno(t: TarjetaTablero) {
    const res = this.relevosService.sugerir(t.relevo.id);
    this.mensaje = { relevoId: t.relevo.id, texto: this.relevosService.describirSugerencia(res) };
    this.confirmar = null;
    this.cargar();
  }

  pedirAccion(t: TarjetaTablero, tipo: 'copiar' | 'vaciar') {
    // Si no hay nada colocado no hay nada que perder: se hace directamente
    if (t.ocupados === 0) { this.ejecutar(t.relevo.id, tipo); return; }
    this.confirmar = { relevoId: t.relevo.id, tipo };
  }

  confirmarAccion() {
    if (this.confirmar) this.ejecutar(this.confirmar.relevoId, this.confirmar.tipo);
  }

  cancelarAccion() {
    this.confirmar = null;
  }

  private ejecutar(relevoId: string, tipo: 'copiar' | 'vaciar') {
    const relevo = this.relevosService.getRelevo(relevoId);
    if (!relevo) return;
    if (tipo === 'copiar') {
      const anterior = this.relevosService.getAnterior(relevo);
      if (anterior) {
        this.relevosService.copiarDe(relevoId, anterior.id);
        this.mensaje = { relevoId, texto: `Copiado desde «${this.relevosService.nombre(anterior)}». Cambia lo que necesites.` };
      }
    } else {
      this.relevosService.vaciar(relevoId);
      this.mensaje = null;
    }
    this.confirmar = null;
    this.cargar();
  }

  // ---- Calles ----

  alternarCalles(t: TarjetaTablero) {
    if (this.editandoCalles === t.relevo.id) { this.guardarCalles(); return; }
    this.editandoCalles = t.relevo.id;
    this.calleInicio = t.calleInicio;
    this.calleFin = t.calleFin;
  }

  guardarCalles() {
    if (!this.editandoCalles) return;
    this.relevosService.actualizarCalles(this.editandoCalles, this.calleInicio, this.calleFin);
    this.editandoCalles = null;
    this.cargar();
  }

  // ---- Puestos ----

  abrirPuesto(t: TarjetaTablero, fila: FilaTablero, puesto: PuestoTablero) {
    this.seleccion = { relevoId: t.relevo.id, trabajaderaId: fila.trabajadera.id, columna: puesto.columna };
  }

  cerrarSeleccion() {
    this.seleccion = null;
  }

  primerApellido(c: Costalero): string {
    return c.apellidos.split(' ')[0];
  }

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

  /** Texto emergente de un puesto */
  tituloPuesto(p: PuestoTablero): string {
    if (!p.costalero) return 'Puesto vacío';
    const base = `${p.costalero.nombre} ${p.costalero.apellidos}`;
    const origen = p.deOtra ? ` · es de la T${p.numeroOrigen}` : '';
    const asistencia = this.asistenciaTitulo(p.costalero);
    const nota = p.asignacion?.nota ? ` · ${p.asignacion.nota}` : '';
    return base + origen + (asistencia ? ` · ${asistencia}` : '') + nota;
  }
}
