import { Component, ElementRef, HostListener, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { hoyLocal } from '../../../../core/utils/fechas';
import { Paso, Trabajadera, Costalero, Ensayo } from '../../../../core/models';
import { RelevosTabComponent } from '../../../relevos/components/relevos-tab/relevos-tab.component';
import { TableroRelevosComponent } from '../../../relevos/components/tablero-relevos/tablero-relevos.component';

@Component({
  selector: 'app-detalle-paso',
  standalone: true,
  imports: [CommonModule, RouterModule, IonicModule, RelevosTabComponent, TableroRelevosComponent],
  templateUrl: './detalle-paso.page.html',
  styleUrls: ['./detalle-paso.page.scss'],
})
export class DetallePasoPage implements OnInit {
  private route = inject(ActivatedRoute);
  private mock = inject(MockDataService);

  paso?: Paso;
  trabajaderas: Trabajadera[] = [];
  costaleros: Costalero[] = [];       // solo activos, ordenados
  ensayos: Ensayo[] = [];
  tabsScrollIzq = false;
  tabsScrollDer = false;
  @ViewChild('tabsBar') tabsBar?: ElementRef<HTMLElement>;
  activeTab: 'trabajaderas' | 'ensayos' | 'relevos' | 'tablero' | 'auxiliares' = 'trabajaderas';

  // Set de persona_id que aparecen en más de un paso
  private personasEnVariosPasos = new Set<string>();

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') || '1';
    const tab = this.route.snapshot.queryParamMap.get('tab');
    if (tab === 'trabajaderas' || tab === 'ensayos' || tab === 'relevos' || tab === 'tablero' || tab === 'auxiliares') {
      this.activeTab = tab;
    }
    this.paso        = this.mock.getPaso(id);
    this.trabajaderas = this.mock.getTrabajaderasByPaso(id);
    this.costaleros  = this.mock.getCostalerosByPaso(id, false)
      // Activos primero; los inactivos van al final (el orden por calzo/apellido se mantiene)
      .sort((a, b) => Number(b.activo) - Number(a.activo));
    this.ensayos     = this.mock.getEnsayosByPaso(id);

    // Personas que están ACTIVAS en más de un paso (para badge "Varios pasos")
    const conteo = new Map<string, number>();
    for (const c of this.mock.costaleros.filter(x => x.activo)) {
      conteo.set(c.persona_id, (conteo.get(c.persona_id) ?? 0) + 1);
    }
    this.personasEnVariosPasos = new Set(
      [...conteo.entries()].filter(([, n]) => n > 1).map(([pid]) => pid)
    );

    // Si se abre directamente en una pestaña que queda fuera de la barra (móvil), se deja a la vista
    setTimeout(() => {
      document.querySelector('.tabs-bar .tab-btn.active')?.scrollIntoView({ block: 'nearest', inline: 'center' });
      this.actualizarFlechasTabs();
    });
  }

  /** Muestra las flechas solo si hay pestañas ocultas a ese lado */
  @HostListener('window:resize')
  actualizarFlechasTabs() {
    const barra = this.tabsBar?.nativeElement;
    if (!barra) return;
    this.tabsScrollIzq = barra.scrollLeft > 4;
    this.tabsScrollDer = barra.scrollLeft + barra.clientWidth < barra.scrollWidth - 4;
  }

  desplazarTabs(direccion: 1 | -1) {
    const barra = this.tabsBar?.nativeElement;
    barra?.scrollBy({ left: direccion * barra.clientWidth * 0.6, behavior: 'smooth' });
  }

  estaEnVariosPasos(c: Costalero): boolean {
    return c.activo && this.personasEnVariosPasos.has(c.persona_id);
  }

  /** Cambia de pestaña y, si la barra se desliza (móvil), deja la pestaña elegida a la vista */
  seleccionarTab(tab: 'trabajaderas' | 'ensayos' | 'relevos' | 'tablero' | 'auxiliares', evento?: Event) {
    this.activeTab = tab;
    const boton = evento?.currentTarget as HTMLElement | null;
    boton?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  /** Costaleros de una trabajadera (activos primero, luego inactivos) */
  getCostalerosDeTrabadera(tId: string): Costalero[] {
    return this.costaleros.filter(c => c.trabajadera_id === tId);
  }

  /** Nº de costaleros ACTIVOS de una trabajadera (los inactivos no cuentan) */
  contarActivos(tId: string): number {
    return this.costaleros.filter(c => c.trabajadera_id === tId && c.activo).length;
  }

  getTotalCostalerosActivos(): number {
    return this.costaleros.filter(c => c.activo).length;
  }

  /** Siguiente ensayo por fecha: hoy o posterior, con fecha puesta y no cancelado */
  getProximoEnsayo(): Ensayo | undefined {
    const hoy = hoyLocal(); // fecha LOCAL, no UTC

    return this.ensayos
      .filter(e => !e.cancelado && !!e.fecha && e.fecha >= hoy)
      .sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
  }

  formatCalzo(calzo: number): string {
    return calzo === 0 ? '0 cm' : `+${calzo} cm`;
  }
}
