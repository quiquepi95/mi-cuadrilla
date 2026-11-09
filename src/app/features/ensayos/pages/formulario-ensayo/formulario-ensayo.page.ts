import { Component, OnInit, inject } from '@angular/core';

import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { origenInterno } from '../../../../core/utils/navegacion';
import { Ensayo, Paso } from '../../../../core/models';

/**
 * Formulario de ensayo: sirve para CREAR (/pasos/:pasoId/ensayos/nuevo)
 * y para EDITAR (/pasos/:pasoId/ensayos/:id/editar).
 */
@Component({
  selector: 'app-formulario-ensayo',
  standalone: true,
  imports: [RouterModule, IonicModule, FormsModule],
  templateUrl: './formulario-ensayo.page.html',
  styleUrls: ['./formulario-ensayo.page.scss'],
})
export class FormularioEnsayoPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private mock = inject(MockDataService);


  paso?: Paso;
  ensayo?: Ensayo;          // solo en modo edición
  modoEdicion = false;
  noEncontrado = false;

  descripcion = '';
  fecha       = '';
  lugar       = '';
  cancelado   = false;
  motivo      = '';

  confirmandoBorrado = false;
  submitted = false;

  /** Página a la que volver al terminar (por ejemplo "/ensayos"). Vacío = pestaña Ensayos del paso */
  origen = '';

  ngOnInit() {
    const pasoId = this.route.snapshot.paramMap.get('pasoId') || '';
    const id     = this.route.snapshot.paramMap.get('id');

    // Solo se aceptan rutas internas de la app
    this.origen = origenInterno(this.route.snapshot.queryParamMap.get('origen'));

    this.paso = this.mock.getPaso(pasoId);
    if (!this.paso) { this.noEncontrado = true; return; }

    if (id) {
      this.modoEdicion = true;
      this.ensayo = this.mock.getEnsayo(id);
      if (!this.ensayo || this.ensayo.paso_id !== pasoId) { this.noEncontrado = true; return; }

      this.descripcion = this.ensayo.descripcion ?? '';
      this.fecha       = this.ensayo.fecha ?? '';
      this.lugar       = this.ensayo.lugar ?? '';
      this.cancelado   = !!this.ensayo.cancelado;
      this.motivo      = this.ensayo.motivo_cancelacion ?? '';
    } else {
      // Nombre por defecto: Ensayo N+1 (se puede cambiar por Mudá, Retranqueo...)
      this.descripcion = `Ensayo ${this.mock.getEnsayosByPaso(pasoId).length + 1}`;
    }
  }

  get descripcionInvalida(): boolean { return this.submitted && !this.descripcion.trim(); }
  get fechaInvalida(): boolean       { return this.submitted && !this.fecha; }

  /** Al quitar la cancelación, el motivo deja de tener sentido y se borra */
  onCanceladoChange(valor: boolean) {
    this.cancelado = valor;
    if (!valor) this.motivo = '';
  }

  guardar() {
    this.submitted = true;
    if (!this.descripcion.trim() || !this.fecha || !this.paso) return;

    const ahora = new Date().toISOString();

    if (this.modoEdicion && this.ensayo) {
      this.ensayo.descripcion        = this.descripcion.trim();
      this.ensayo.fecha              = this.fecha;
      this.ensayo.lugar              = this.lugar.trim() || undefined;
      this.ensayo.cancelado          = this.cancelado;
      this.ensayo.motivo_cancelacion = this.cancelado ? (this.motivo.trim() || undefined) : undefined;
      this.ensayo.updated_at         = ahora;
    } else {
      this.mock.ensayos.push({
        id:          `e-${Date.now()}`,
        paso_id:     this.paso.id,
        fecha:       this.fecha,
        descripcion: this.descripcion.trim(),
        lugar:       this.lugar.trim() || undefined,
        created_at:  ahora,
        updated_at:  ahora,
      });
    }

    this.volver();
  }

  pedirBorrado()     { this.confirmandoBorrado = true; }
  cancelarBorrado()  { this.confirmandoBorrado = false; }

  confirmarBorrado() {
    if (!this.ensayo) return;
    this.mock.eliminarEnsayo(this.ensayo.id);
    this.volver();
  }

  private volver() {
    if (this.origen) {
      this.router.navigateByUrl(this.origen);
      return;
    }
    this.router.navigate(['/pasos', this.paso!.id], { queryParams: { tab: 'ensayos' } });
  }
}
