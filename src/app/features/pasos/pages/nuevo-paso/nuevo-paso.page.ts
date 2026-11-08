import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../../../core/services/mock-data.service';

// Colores predefinidos para elegir el color del paso
const COLORES_PRESET = [
  { hex: '#c9a84c', label: 'Dorado' },
  { hex: '#8b0000', label: 'Burdeos' },
  { hex: '#7b3f9e', label: 'Morado' },
  { hex: '#1a6b3a', label: 'Verde' },
  { hex: '#1a4a8b', label: 'Azul' },
  { hex: '#b5651d', label: 'Marrón' },
  { hex: '#c0392b', label: 'Rojo' },
  { hex: '#2c3e50', label: 'Azul oscuro' },
];

interface EnsayoForm {
  descripcion: string;
  fecha: string;
  lugar: string;
}

@Component({
  selector: 'app-nuevo-paso',
  standalone: true,
  imports: [CommonModule, RouterModule, IonicModule, FormsModule],
  templateUrl: './nuevo-paso.page.html',
  styleUrls: ['./nuevo-paso.page.scss'],
})
export class NuevoPasoPage {

  // ---- Paso actual del wizard ----
  step: 1 | 2 = 1;

  // ---- Formulario paso 1: datos del paso ----
  nombre            = '';
  hermandad         = '';
  numTrabajaderas: number | null = null;
  capacidadTrabadadera: number | null = null;
  color             = '#c9a84c';
  fechaProcesion    = '';

  coloresPreset     = COLORES_PRESET;
  colorPersonalizado = false;

  // ---- Formulario paso 2: ensayos ----
  ensayos: EnsayoForm[] = [];

  // ---- Estado ----
  submitted = false;

  constructor(private mock: MockDataService, private router: Router) {}

  // ---- Paso 1 ----
  get nombreInvalido(): boolean {
    return this.submitted && !this.nombre.trim();
  }

  seleccionarColor(hex: string) {
    this.color = hex;
    this.colorPersonalizado = false;
  }

  activarColorPersonalizado() {
    this.colorPersonalizado = true;
  }

  continuar() {
    this.submitted = true;
    if (!this.nombre.trim()) return;
    this.submitted = false;
    this.step = 2;
  }

  // ---- Paso 2: ensayos ----
  agregarEnsayo() {
    const num = this.ensayos.length + 1;
    this.ensayos.push({ descripcion: `Ensayo ${num}`, fecha: '', lugar: '' });
  }

  eliminarEnsayo(index: number) {
    this.ensayos.splice(index, 1);
    // Re-numerar los que tengan descripción por defecto
    this.ensayos.forEach((e, i) => {
      if (/^Ensayo \d+$/.test(e.descripcion)) {
        e.descripcion = `Ensayo ${i + 1}`;
      }
    });
  }

  // ---- Guardar ----
  guardar() {
    const nuevoId = String(this.mock.pasos.length + 1 + Date.now()).slice(-6);

    // Añadir paso al mock
    this.mock.pasos.push({
      id: nuevoId,
      nombre: this.nombre.trim(),
      descripcion: this.hermandad.trim() || undefined,
      imagen_url: '',
      owner_id: 'user-1',
      num_trabajaderas: this.numTrabajaderas ?? 0,
      capacidad_trabajadera: this.capacidadTrabadadera ?? 0,
      color: this.color,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Añadir trabajaderas vacías
    if (this.numTrabajaderas) {
      for (let i = 1; i <= this.numTrabajaderas; i++) {
        this.mock.trabajaderas.push({
          id: `t-${nuevoId}-${i}`,
          paso_id: nuevoId,
          numero: i,
          diferencia_altura_cm: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }

    // Añadir ensayos
    this.ensayos.forEach((e, i) => {
      this.mock.ensayos.push({
        id: `e-${nuevoId}-${i}`,
        paso_id: nuevoId,
        fecha: e.fecha || '',
        descripcion: e.descripcion,
        lugar: e.lugar || undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    });

    this.router.navigate(['/pasos', nuevoId]);
  }

  saltarEnsayos() {
    this.guardar();
  }

  volver() {
    this.step = 1;
  }
}
