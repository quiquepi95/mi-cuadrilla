import { Component, Input, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { RelevosService, MIN_RELEVOS, MAX_RELEVOS } from '../../../../core/services/relevos.service';
import { RelevoMiniaturaComponent } from '../relevo-miniatura/relevo-miniatura.component';

interface TarjetaRelevo {
  id: string;
  nombre: string;
  calleInicio: string;
  calleFin: string;
  ocupados: number;
  celdas: string[][];
}

/** Pestaña "Relevos" del detalle de un paso: crea los relevos y los muestra como tarjetas */
@Component({
  selector: 'app-relevos-tab',
  standalone: true,
  imports: [RouterModule, FormsModule, IonicModule, RelevoMiniaturaComponent],
  templateUrl: './relevos-tab.component.html',
  styleUrls: ['./relevos-tab.component.scss'],
})
export class RelevosTabComponent implements OnInit {
  private relevosService = inject(RelevosService);

  @Input({ required: true }) pasoId!: string;
  @Input() color = 'var(--mc-accent)';

  readonly min = MIN_RELEVOS;
  readonly max = MAX_RELEVOS;

  tarjetas: TarjetaRelevo[] = [];
  totalPuestos = 0;

  /** Número de relevos que se está eligiendo (al crear o al cambiar) */
  numero = 5;
  cambiandoNumero = false;
  mensaje = '';

  ngOnInit() {
    this.cargar();
  }

  private cargar() {
    const relevos = this.relevosService.getRelevos(this.pasoId);
    this.totalPuestos = this.relevosService.totalPuestos(this.pasoId);
    this.tarjetas = relevos.map(r => ({
      id: r.id,
      nombre: this.relevosService.nombre(r),
      calleInicio: r.calle_inicio ?? '',
      calleFin: r.calle_fin ?? '',
      ocupados: this.relevosService.contarOcupados(r.id),
      celdas: this.relevosService.getCeldas(r.id),
    }));
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
    this.mensaje = '';
    this.cargar();
  }

  empezarACambiar() {
    this.numero = this.tarjetas.length;
    this.cambiandoNumero = true;
    this.mensaje = '';
  }

  cancelarCambio() {
    this.cambiandoNumero = false;
  }

  /** Cuántos relevos se quitarían con el número elegido */
  get relevosQueSeQuitan(): number {
    return Math.max(0, this.tarjetas.length - this.numero);
  }

  /** Cuántos relevos se añadirían con el número elegido */
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

  // ---- Sugerencia ----

  get hayPuestosVacios(): boolean {
    return this.tarjetas.some(t => t.ocupados < this.totalPuestos);
  }

  sugerirTodos() {
    const res = this.relevosService.sugerirTodos(this.pasoId);
    this.mensaje = this.relevosService.describirSugerencia(res);
    this.cargar();
  }
}
