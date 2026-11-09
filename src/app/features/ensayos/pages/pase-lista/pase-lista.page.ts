import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { origenInterno } from '../../../../core/utils/navegacion';
import { Ensayo, Costalero, Trabajadera, EstadoAsistencia } from '../../../../core/models';

interface CostaleroConAsistencia extends Costalero {
  estado: EstadoAsistencia | null;   // null = todavía sin marcar
  notas: string;
}

@Component({
  selector: 'app-pase-lista',
  standalone: true,
  imports: [CommonModule, RouterModule, IonicModule, FormsModule],
  templateUrl: './pase-lista.page.html',
  styleUrls: ['./pase-lista.page.scss'],
})
export class PaseListaPage implements OnInit {
  private route = inject(ActivatedRoute);
  private mock = inject(MockDataService);

  ensayo?: Ensayo;
  costaleros: CostaleroConAsistencia[] = [];
  trabajaderas: Trabajadera[] = [];
  guardado = false;

  /** Página a la que volver (por ejemplo "/ensayos"). Vacío = pestaña Ensayos del paso */
  origen = '';

  ngOnInit() {
    this.origen = origenInterno(this.route.snapshot.queryParamMap.get('origen'));
    const ensayoId = this.route.snapshot.paramMap.get('id') || '';
    this.ensayo = this.mock.getEnsayo(ensayoId);

    if (this.ensayo) {
      const asistencias = this.mock.getAsistenciasByEnsayo(ensayoId);
      this.trabajaderas = this.mock.getTrabajaderasByPaso(this.ensayo.paso_id);
      const costaleros  = this.mock.getCostalerosByPaso(this.ensayo.paso_id);

      this.costaleros = costaleros.map(c => {
        const asistencia = asistencias.find(a => a.costalero_id === c.id);
        return {
          ...c,
          estado: asistencia?.estado ?? null,
          notas: asistencia?.notas || '',
        };
      });
    }
  }

  /** Número (posición) de la trabajadera de un costalero */
  numeroTrabajadera(c: Costalero): string {
    const t = this.trabajaderas.find(t => t.id === c.trabajadera_id);
    return t ? String(t.numero) : '?';
  }

  /** Marca el estado; si se pulsa el mismo botón otra vez, se desmarca */
  setEstado(costalero: CostaleroConAsistencia, estado: EstadoAsistencia) {
    costalero.estado = costalero.estado === estado ? null : estado;
    this.guardado = false;
  }

  /** Se muestra el campo de nota para ausentes y justificados */
  muestraNota(c: CostaleroConAsistencia): boolean {
    return c.estado === 'ausente' || c.estado === 'justificada';
  }

  placeholderNota(c: CostaleroConAsistencia): string {
    return c.estado === 'justificada'
      ? 'Justificación (ej: viaje, médico...)'
      : 'Motivo de la ausencia (opcional)';
  }

  guardar() {
    if (!this.ensayo) return;

    for (const c of this.costaleros) {
      if (c.estado === null) {
        // Sin marcar: no se guarda nada (y se borra lo que hubiera si se ha desmarcado)
        this.mock.eliminarAsistencia(this.ensayo.id, c.id);
      } else {
        // La nota solo tiene sentido si no está presente
        const nota = c.estado === 'presente' ? '' : c.notas.trim();
        this.mock.guardarAsistencia(this.ensayo.id, c.id, c.estado, nota);
      }
    }

    this.guardado = true;
    setTimeout(() => { this.guardado = false; }, 2500);
  }

  getPresentes(): number { return this.costaleros.filter(c => c.estado === 'presente').length; }
  getAusentes(): number  { return this.costaleros.filter(c => c.estado === 'ausente').length; }
  getJustificadas(): number { return this.costaleros.filter(c => c.estado === 'justificada').length; }
  getSinMarcar(): number { return this.costaleros.filter(c => c.estado === null).length; }
}
