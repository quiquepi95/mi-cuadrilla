import { Component, Input } from '@angular/core';

/**
 * Miniatura de la parihuela vista desde arriba: una fila por trabajadera y una casilla por puesto.
 * Los puestos ocupados se pintan con el color del paso y muestran las iniciales del costalero.
 */
@Component({
  selector: 'app-relevo-miniatura',
  standalone: true,
  template: `
    <div class="mini" [style.--cols]="celdas[0]?.length || 1" aria-hidden="true">
      @for (fila of celdas; track $index) {
        @for (iniciales of fila; track $index) {
          <span
            class="celda"
            [class.llena]="!!iniciales"
            [style.background]="iniciales ? color : null"
            [style.color]="iniciales ? colorTexto : null"
            >{{ iniciales }}</span>
        }
      }
    </div>
  `,
  styles: [`
    .mini {
      display: grid;
      grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
      gap: 3px;
    }
    .celda {
      height: 20px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 3px;
      background: transparent;
      border: 1px solid var(--mc-border);
      font-size: 0.6rem; font-weight: 700; letter-spacing: 0.02em;
      overflow: hidden; white-space: nowrap;
    }
    .celda.llena { border-color: transparent; }
  `],
})
export class RelevoMiniaturaComponent {
  /** filas = trabajaderas, columnas = puestos. Cada casilla lleva las iniciales del costalero ('' = vacío) */
  @Input() celdas: string[][] = [];
  @Input() color = 'var(--mc-accent)';

  /** Texto oscuro o claro según lo claro que sea el color del paso (si es un color hexadecimal) */
  get colorTexto(): string {
    const m = /^#([0-9a-f]{6})$/i.exec(this.color.trim());
    if (!m) return 'var(--mc-bg)';
    const n = parseInt(m[1], 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const luminosidad = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminosidad > 0.6 ? '#1a1a2e' : '#ffffff';
  }
}
