import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';

/**
 * Botón "volver" que se queda fijo arriba mientras se hace scroll.
 * Va como primer hijo del `.page-container` de la pantalla (es "sticky" dentro de la zona con scroll).
 * Ya lo usan el detalle del paso, editar costalero y el pase de lista; falta ponerlo en el resto
 * de pantallas que todavía tienen su enlace "volver" normal (ver tarea en CONTEXT.md).
 */
@Component({
  selector: 'app-volver-fijo',
  standalone: true,
  imports: [RouterModule, IonicModule],
  template: `
    <a class="volver" [routerLink]="ruta" [queryParams]="queryParams">
      <ion-icon name="arrow-back-outline"></ion-icon>
      <span>{{ texto }}</span>
    </a>
  `,
  styles: [`
    :host {
      display: block;
      position: sticky;
      top: 0;
      z-index: 30;
      margin-bottom: 10px;
      background: var(--mc-bg);
      box-shadow: 0 6px 6px -6px rgba(0, 0, 0, 0.45);
    }
    /* En el móvil la zona con scroll empieza justo debajo de la barra superior del menú (ver MainLayout),
       así que top: 0 ya la deja debajo de ella */
    .volver {
      display: inline-flex; align-items: center; gap: 6px;
      min-height: 34px; padding: 0 4px;
      color: var(--mc-text); font-size: 0.85rem; font-weight: 600; text-decoration: none;
      ion-icon { font-size: 1.15rem; color: var(--mc-accent); flex-shrink: 0; }
      span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 70vw; }
      &:hover { color: var(--mc-accent); }
    }
  `],
})
export class VolverFijoComponent {
  /** Destino: una ruta ('/pasos') o una lista (['/pasos', id]) */
  @Input({ required: true }) ruta!: string | unknown[];
  @Input() queryParams: Record<string, string> | null = null;
  @Input() texto = 'Volver';
}
