import { Component, OnInit, inject } from '@angular/core';

import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { FormsModule } from '@angular/forms';
import { PersonasService, Persona } from '../../../../core/services/personas.service';

@Component({
  selector: 'app-editar-costalero',
  standalone: true,
  imports: [RouterModule, IonicModule, FormsModule],
  templateUrl: './editar-costalero.page.html',
  styleUrls: ['./editar-costalero.page.scss'],
})
export class EditarCostaleroPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private personas = inject(PersonasService);


  persona?: Persona;

  // Campos editables (copia para no mutar hasta guardar)
  nombre    = '';
  apellidos = '';
  telefono  = '';
  alias     = '';

  // Validación
  submitted          = false;
  telefonoConflicto?: Persona;  // otra persona con el mismo teléfono

  // Origen de la navegación para volver
  origen = '/costaleros';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.origen = this.route.snapshot.queryParamMap.get('origen') || '/costaleros';
    this.persona = this.personas.buscarPorId(id);

    if (this.persona) {
      this.nombre    = this.persona.nombre;
      this.apellidos = this.persona.apellidos;
      this.telefono  = this.persona.telefono;
      this.alias     = this.persona.alias ?? '';
    }
  }

  onTelefonoBlur() {
    if (!this.telefono || !this.persona) return;
    const tel = this.telefono.trim();
    if (tel === this.persona.telefono) {
      // Sin cambio, no hay conflicto
      this.telefonoConflicto = undefined;
      return;
    }
    const existente = this.personas.buscarPorTelefono(tel);
    this.telefonoConflicto = existente && existente.id !== this.persona.id ? existente : undefined;
  }

  get nombreInvalido():    boolean { return this.submitted && !this.nombre.trim(); }
  get apellidosInvalido(): boolean { return this.submitted && !this.apellidos.trim(); }
  get telefonoInvalido():  boolean { return !!this.telefonoConflicto; }

  guardar() {
    this.submitted = true;
    if (!this.nombre.trim() || !this.apellidos.trim() || this.telefonoConflicto) return;

    this.personas.actualizarPersona(this.persona!.id, {
      nombre:    this.nombre.trim(),
      apellidos: this.apellidos.trim(),
      telefono:  this.telefono.trim(),
      alias:     this.alias.trim() || undefined,
    });

    this.router.navigateByUrl(this.origen);
  }
}
