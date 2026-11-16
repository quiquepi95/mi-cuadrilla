import { Component, Input, OnChanges, inject } from '@angular/core';
import { Costalero } from '../../../../core/models';
import { RelevosService, MarcasCostalero } from '../../../../core/services/relevos.service';

/**
 * Puntos muy discretos junto al nombre de un costalero:
 *  - punto lleno: saca más pasos (en otro paso tuyo o fuera de tu cuadrilla)
 *  - anillo vacío: aspirante
 * La posición la decide quien lo usa (con una clase en el propio elemento).
 */
@Component({
  selector: 'app-marcas-costalero',
  standalone: true,
  template: `
    @if (marcas.sinMarcar > 0) { <span class="aviso" aria-hidden="true">!</span> }
    @if (marcas.variosPasos) { <span class="punto varios" aria-hidden="true"></span> }
    @if (marcas.aspirante) { <span class="punto aspirante" aria-hidden="true"></span> }
  `,
  styles: [`
    :host { display: inline-flex; align-items: center; gap: 3px; pointer-events: none; }
    :host:empty { display: none; }
    .punto { width: 5px; height: 5px; border-radius: 50%; box-sizing: border-box; flex-shrink: 0; opacity: 0.75; }
    .varios { background: var(--mc-accent); }
    .aspirante { border: 1px solid var(--mc-text-muted); }
    .aviso { font-size: 0.62rem; font-weight: 800; line-height: 1; color: var(--mc-warning); }
  `],
})
export class MarcasCostaleroComponent implements OnChanges {
  private relevos = inject(RelevosService);

  @Input({ required: true }) costalero!: Costalero;

  marcas: MarcasCostalero = { otrosTuyos: 0, externos: 0, variosPasos: false, aspirante: false, sinMarcar: 0 };

  ngOnChanges() {
    this.marcas = this.relevos.marcas(this.costalero);
  }
}

/**
 * Línea de leyenda bajo las cuadrículas. Solo explica lo que se ve en pantalla:
 * el "2/3" de asistencia y los puntos que haya.
 */
@Component({
  selector: 'app-leyenda-relevos',
  standalone: true,
  template: `
    @if (hayAsistencias || hayVarios || hayAspirantes || haySinMarcar) {
      <p class="leyenda">
        @if (hayAsistencias) { <span>Número pequeño: asistencia a ensayos (asistidos / ensayos celebrados).</span> }
        @if (haySinMarcar) { <span><i class="aviso">!</i> Falta indicar si asistió a algún ensayo.</span> }
        @if (hayVarios) { <span><i class="punto varios"></i> Saca más pasos (otro paso tuyo o fuera de tu cuadrilla).</span> }
        @if (hayAspirantes) { <span><i class="punto aspirante"></i> Aspirante.</span> }
      </p>
    }
  `,
  styles: [`
    .leyenda { margin: 0 0 12px; font-size: 0.72rem; color: var(--mc-text-muted); display: flex; flex-direction: column; align-items: flex-start; gap: 3px; }
    .punto { display: inline-block; width: 6px; height: 6px; border-radius: 50%; box-sizing: border-box; margin-right: 4px; vertical-align: middle; }
    .varios { background: var(--mc-accent); }
    .aspirante { border: 1px solid var(--mc-text-muted); }
    .aviso { display: inline-block; width: 6px; margin-right: 4px; text-align: center; font-style: normal; font-weight: 800; color: var(--mc-warning); }
  `],
})
export class LeyendaRelevosComponent implements OnChanges {
  private relevos = inject(RelevosService);

  /** Costaleros del paso (se mira cuáles tienen marcas) */
  @Input({ required: true }) costaleros: Costalero[] = [];
  @Input() hayAsistencias = false;

  hayVarios = false;
  hayAspirantes = false;
  haySinMarcar = false;

  ngOnChanges() {
    const marcas = this.costaleros.map(c => this.relevos.marcas(c));
    this.hayVarios = marcas.some(m => m.variosPasos);
    this.hayAspirantes = marcas.some(m => m.aspirante);
    this.haySinMarcar = marcas.some(m => m.sinMarcar > 0);
  }
}
