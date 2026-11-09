import { Component, OnInit, inject } from '@angular/core';

import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { PersonasService, Persona } from '../../../../core/services/personas.service';
import { Costalero, Paso, Trabajadera } from '../../../../core/models';

/**
 * Pantalla de un costalero DENTRO de un paso.
 * - Datos del paso (editables): trabajadera, calzo, aspirante, baja, notas.
 * - Datos personales (solo lectura): se editan desde el listado global de costaleros.
 */
@Component({
  selector: 'app-detalle-costalero',
  standalone: true,
  imports: [RouterModule, IonicModule, FormsModule],
  templateUrl: './detalle-costalero.page.html',
  styleUrls: ['./detalle-costalero.page.scss'],
})
export class DetalleCostaleroPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private mock = inject(MockDataService);
  private personas = inject(PersonasService);


  paso?: Paso;
  trabajaderas: Trabajadera[] = [];
  registro?: Costalero;      // registro real en este paso (es el que se modifica al guardar)
  persona?: Persona;         // datos personales (solo lectura aquí)
  otrosPasos: Paso[] = [];   // otros pasos donde esta persona está activa

  // Campos editables (copia hasta pulsar guardar)
  trabajaderaId = '';
  calzo_cm: number | null = null;
  es_aspirante = false;
  dadoDeBaja   = false;
  notas        = '';

  submitted = false;
  urlActual = '';

  ngOnInit() {
    const pasoId = this.route.snapshot.paramMap.get('pasoId') || '';
    const id     = this.route.snapshot.paramMap.get('id') || '';
    this.urlActual = this.router.url.split('?')[0];

    this.paso         = this.mock.getPaso(pasoId);
    this.trabajaderas = this.mock.getTrabajaderasByPaso(pasoId);
    this.registro     = this.mock.getRegistroCostalero(pasoId, id);

    if (!this.registro) return;

    this.persona = this.personas.buscarPorId(this.registro.persona_id);

    this.trabajaderaId = this.registro.trabajadera_id;
    this.calzo_cm      = this.registro.calzo_cm;
    this.es_aspirante  = this.registro.es_aspirante;
    this.dadoDeBaja    = !this.registro.activo;
    this.notas         = this.registro.notas ?? '';

    this.otrosPasos = this.mock
      .getPasosByPersona(this.registro.persona_id)
      .filter(r => r.costalero.activo && r.paso.id !== pasoId)
      .map(r => r.paso);
  }

  get trabajaderaInvalida(): boolean { return this.submitted && !this.trabajaderaId; }

  /**
   * Al quitar la baja, el motivo deja de tener sentido y se borra.
   * Si el costalero ya estaba de baja y se vuelve a marcar antes de guardar, se recupera el motivo original.
   */
  onBajaChange(valor: boolean) {
    this.dadoDeBaja = valor;
    if (!this.registro || this.registro.activo) return; // solo aplica si estaba de baja al abrir

    if (!valor) {
      this.notas = '';
    } else if (!this.notas.trim()) {
      this.notas = this.registro.notas ?? '';
    }
  }

  get nombreCompleto(): string {
    return this.persona ? `${this.persona.nombre} ${this.persona.apellidos}` : '';
  }

  guardar() {
    this.submitted = true;
    if (!this.registro || !this.trabajaderaId) return;

    this.registro.trabajadera_id = this.trabajaderaId;
    this.registro.calzo_cm       = this.calzo_cm ?? 0;
    this.registro.es_aspirante   = this.es_aspirante;
    this.registro.activo         = !this.dadoDeBaja;
    this.registro.notas          = this.notas.trim();
    this.registro.updated_at     = new Date().toISOString();

    this.router.navigate(['/pasos', this.paso!.id]);
  }
}
