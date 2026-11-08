import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { Paso, Trabajadera, Costalero, Ensayo } from '../../../../core/models';

@Component({
  selector: 'app-detalle-paso',
  standalone: true,
  imports: [CommonModule, RouterModule, IonicModule],
  templateUrl: './detalle-paso.page.html',
  styleUrls: ['./detalle-paso.page.scss'],
})
export class DetallePasoPage implements OnInit {
  paso?: Paso;
  trabajaderas: Trabajadera[] = [];
  costaleros: Costalero[] = [];       // solo activos, ordenados
  ensayos: Ensayo[] = [];
  activeTab: 'trabajaderas' | 'ensayos' | 'auxiliares' = 'trabajaderas';

  // Set de persona_id que aparecen en más de un paso
  private personasEnVariosPasos = new Set<string>();

  constructor(private route: ActivatedRoute, private mock: MockDataService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') || '1';
    this.paso        = this.mock.getPaso(id);
    this.trabajaderas = this.mock.getTrabajaderasByPaso(id);
    this.costaleros  = this.mock.getCostalerosByPaso(id, true);
    this.ensayos     = this.mock.getEnsayosByPaso(id);

    // Personas que aparecen en más de un paso (para badge "Varios pasos")
    const conteo = new Map<string, number>();
    for (const c of this.mock.costaleros) {
      conteo.set(c.persona_id, (conteo.get(c.persona_id) ?? 0) + 1);
    }
    this.personasEnVariosPasos = new Set(
      [...conteo.entries()].filter(([, n]) => n > 1).map(([pid]) => pid)
    );
  }

  estaEnVariosPasos(c: Costalero): boolean {
    return this.personasEnVariosPasos.has(c.persona_id);
  }

  /** Costaleros ACTIVOS de una trabajadera, ya ordenados por calzo+apellido */
  getCostalerosDeTrabadera(tId: string): Costalero[] {
    return this.costaleros.filter(c => c.trabajadera_id === tId);
  }

  getTotalCostalerosActivos(): number {
    return this.costaleros.length;
  }

  getProximoEnsayo(): Ensayo | undefined {
    const hoy = new Date().toISOString().split('T')[0];
    return this.ensayos.find(e => e.fecha >= hoy);
  }

  formatCalzo(calzo: number): string {
    return calzo === 0 ? 'Referencia' : `+${calzo} cm`;
  }
}
