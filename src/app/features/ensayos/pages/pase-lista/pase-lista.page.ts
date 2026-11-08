import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { Ensayo, Costalero, Asistencia, EstadoAsistencia } from '../../../../core/models';

interface CostaleroConAsistencia extends Costalero {
  estado: EstadoAsistencia;
  notas: string;
}

@Component({
  selector: 'app-pase-lista',
  standalone: true,
  imports: [CommonModule, RouterModule, IonicModule],
  templateUrl: './pase-lista.page.html',
  styleUrls: ['./pase-lista.page.scss'],
})
export class PaseListaPage implements OnInit {
  ensayo?: Ensayo;
  costaleros: CostaleroConAsistencia[] = [];

  constructor(private route: ActivatedRoute, private mock: MockDataService) {}

  ngOnInit() {
    const ensayoId = this.route.snapshot.paramMap.get('id') || 'e1';
    this.ensayo = this.mock.ensayos.find(e => e.id === ensayoId);

    if (this.ensayo) {
      const asistencias = this.mock.getAsistenciasByEnsayo(ensayoId);
      const costaleros = this.mock.getCostalerosByPaso(this.ensayo.paso_id);

      this.costaleros = costaleros.map(c => {
        const asistencia = asistencias.find(a => a.costalero_id === c.id);
        return {
          ...c,
          estado: asistencia?.estado || 'ausente',
          notas: asistencia?.notas || '',
        };
      });
    }
  }

  toggleEstado(costalero: CostaleroConAsistencia) {
    const orden: EstadoAsistencia[] = ['presente', 'ausente', 'justificada'];
    const idx = orden.indexOf(costalero.estado);
    costalero.estado = orden[(idx + 1) % orden.length];
  }

  setEstado(costalero: CostaleroConAsistencia, estado: EstadoAsistencia) {
    costalero.estado = estado;
  }

  getPresentes(): number { return this.costaleros.filter(c => c.estado === 'presente').length; }
  getAusentes(): number  { return this.costaleros.filter(c => c.estado === 'ausente').length; }
  getJustificadas(): number { return this.costaleros.filter(c => c.estado === 'justificada').length; }
}
