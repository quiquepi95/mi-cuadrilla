import { Component, OnInit, inject } from '@angular/core';

import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { Paso } from '../../../../core/models';

@Component({
  selector: 'app-lista-pasos',
  standalone: true,
  imports: [RouterModule, IonicModule],
  templateUrl: './lista-pasos.page.html',
  styleUrls: ['./lista-pasos.page.scss'],
})
export class ListaPasosPage implements OnInit {
  private mock = inject(MockDataService);

  pasos: Paso[] = [];

  ngOnInit() {
    this.pasos = this.mock.getPasos();
  }

  getInitials(nombre: string): string {
    return nombre.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  getTotalCostaleros(pasoId: string): number {
    return this.mock.getCostalerosByPaso(pasoId).length;
  }

  getTotalEnsayos(pasoId: string): number {
    return this.mock.getEnsayosByPaso(pasoId).length;
  }

  getTotalCostalerosGlobal(): number {
    // Personas únicas (por persona_id) en todos los pasos
    const ids = new Set(this.mock.costaleros.map(c => c.persona_id));
    return ids.size;
  }

  getTotalEnsayosGlobal(): number {
    return this.mock.ensayos.length;
  }
}
