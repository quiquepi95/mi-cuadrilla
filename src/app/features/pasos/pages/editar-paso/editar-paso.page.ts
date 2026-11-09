import { Component, OnInit, inject } from '@angular/core';

import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { COLORES_PRESET } from '../../../../core/constants/colores';
import { Paso } from '../../../../core/models';

/**
 * Borrador de una trabajadera mientras se edita.
 * Nada se aplica a los datos reales hasta pulsar "Guardar cambios".
 * El id es la identidad de la trabajadera (sus costaleros y su diferencia de altura van ligados al id);
 * el número que se muestra es solo su POSICIÓN en la lista.
 */
interface TrabajaderaDraft {
  id: string;
  nuevo: boolean;
  diferencia: number | null;  // diferencia de altura en cm respecto a la de referencia
  costaleros: number;         // todos los registros asignados (activos y de baja)
  activos: number;
}

interface Movimiento { desde: string; hasta: string; }

@Component({
  selector: 'app-editar-paso',
  standalone: true,
  imports: [RouterModule, IonicModule, FormsModule],
  templateUrl: './editar-paso.page.html',
  styleUrls: ['./editar-paso.page.scss'],
})
export class EditarPasoPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private mock = inject(MockDataService);


  paso?: Paso;

  // ---- Datos del paso ----
  nombre         = '';
  hermandad      = '';
  fechaProcesion = '';
  capacidad: number | null = null;
  color          = '#c9a84c';
  colorPersonalizado = false;
  coloresPreset  = COLORES_PRESET;

  // ---- Trabajaderas (borrador) ----
  draft: TrabajaderaDraft[] = [];
  private removidas: string[] = [];          // ids de trabajaderas existentes que se van a eliminar
  private movimientos: Movimiento[] = [];    // costaleros que cambian de trabajadera, en orden

  // ---- Quitar trabajadera con costaleros ----
  pendienteQuitar?: TrabajaderaDraft;
  destinoId = '';

  submitted = false;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.paso = this.mock.getPaso(id);
    if (!this.paso) return;

    this.nombre         = this.paso.nombre;
    this.hermandad      = this.paso.descripcion ?? '';
    this.fechaProcesion = this.paso.fecha_procesion ?? '';
    this.capacidad      = this.paso.capacidad_trabajadera;
    this.color          = this.paso.color ?? '#c9a84c';
    this.colorPersonalizado = !this.coloresPreset.some(c => c.hex === this.color);

    this.draft = this.mock.getTrabajaderasByPaso(id).map(t => {
      const registros = this.mock.costaleros.filter(c => c.trabajadera_id === t.id);
      return {
        id: t.id,
        nuevo: false,
        diferencia: t.diferencia_altura_cm,
        costaleros: registros.length,
        activos: registros.filter(c => c.activo).length,
      };
    });
  }

  // ---- Color ----
  seleccionarColor(hex: string) { this.color = hex; this.colorPersonalizado = false; }
  activarColorPersonalizado()   { this.colorPersonalizado = true; }

  get nombreInvalido(): boolean { return this.submitted && !this.nombre.trim(); }

  // ---- Posición / orden ----
  posicion(item: TrabajaderaDraft): number { return this.draft.indexOf(item) + 1; }

  subir(i: number) {
    if (i <= 0) return;
    [this.draft[i - 1], this.draft[i]] = [this.draft[i], this.draft[i - 1]];
  }

  bajar(i: number) {
    if (i >= this.draft.length - 1) return;
    [this.draft[i + 1], this.draft[i]] = [this.draft[i], this.draft[i + 1]];
  }

  // ---- Nº de trabajaderas ----
  sumar() {
    if (this.draft.length >= 20) return;
    this.pendienteQuitar = undefined;
    this.draft.push({
      id: `t-${this.paso!.id}-${Date.now()}-${this.draft.length}`,
      nuevo: true,
      diferencia: 0,
      costaleros: 0,
      activos: 0,
    });
  }

  /** Quita la ÚLTIMA trabajadera de la lista (para quitar otra, primero se baja con las flechas) */
  restar() {
    if (this.draft.length <= 1) return;
    const ultima = this.draft[this.draft.length - 1];

    if (ultima.costaleros === 0) {
      this.quitarDelBorrador(ultima);
      return;
    }

    // Tiene costaleros: preguntar a qué trabajadera se mueven
    this.pendienteQuitar = ultima;
    this.destinoId = this.draft[this.draft.length - 2].id;
  }

  get destinos(): TrabajaderaDraft[] {
    return this.draft.filter(t => t !== this.pendienteQuitar);
  }

  descripcionCostaleros(item: TrabajaderaDraft): string {
    const bajas = item.costaleros - item.activos;
    const base  = `${item.activos} costalero${item.activos !== 1 ? 's' : ''}`;
    return bajas > 0 ? `${base} y ${bajas} de baja` : base;
  }

  confirmarQuitar() {
    const pend = this.pendienteQuitar;
    const destino = this.draft.find(t => t.id === this.destinoId);
    if (!pend || !destino) return;

    destino.costaleros += pend.costaleros;
    destino.activos    += pend.activos;
    this.movimientos.push({ desde: pend.id, hasta: destino.id });

    this.quitarDelBorrador(pend);
    this.pendienteQuitar = undefined;
  }

  cancelarQuitar() { this.pendienteQuitar = undefined; }

  private quitarDelBorrador(item: TrabajaderaDraft) {
    this.draft = this.draft.filter(t => t !== item);
    if (!item.nuevo) this.removidas.push(item.id);
  }

  // ---- Guardar ----
  guardar() {
    this.submitted = true;
    if (!this.nombre.trim() || !this.paso) return;

    const ahora = new Date().toISOString();

    // 1. Datos del paso
    this.paso.nombre                = this.nombre.trim();
    this.paso.descripcion           = this.hermandad.trim() || undefined;
    this.paso.fecha_procesion       = this.fechaProcesion || undefined;
    this.paso.capacidad_trabajadera = this.capacidad ?? 0;
    this.paso.color                 = this.color;
    this.paso.num_trabajaderas      = this.draft.length;
    this.paso.updated_at            = ahora;

    // 2. Crear las trabajaderas nuevas (antes de mover costaleros, por si alguno se mueve a una nueva)
    this.draft.forEach((item, i) => {
      if (item.nuevo) {
        this.mock.trabajaderas.push({
          id: item.id,
          paso_id: this.paso!.id,
          numero: i + 1,
          diferencia_altura_cm: item.diferencia ?? 0,
          created_at: ahora,
          updated_at: ahora,
        });
      }
    });

    // 3. Mover costaleros de las trabajaderas que se quitan (en el orden en que se decidió)
    for (const m of this.movimientos) {
      this.mock.costaleros
        .filter(c => c.trabajadera_id === m.desde)
        .forEach(c => { c.trabajadera_id = m.hasta; c.updated_at = ahora; });
    }

    // 4. Eliminar las trabajaderas quitadas
    this.mock.trabajaderas = this.mock.trabajaderas.filter(t => !this.removidas.includes(t.id));

    // 5. Posición y diferencia de altura de las que se mantienen
    this.draft.forEach((item, i) => {
      if (item.nuevo) return;
      const t = this.mock.trabajaderas.find(x => x.id === item.id);
      if (t) {
        t.numero = i + 1;
        t.diferencia_altura_cm = item.diferencia ?? 0;
        t.updated_at = ahora;
      }
    });

    this.router.navigate(['/pasos', this.paso.id]);
  }
}
