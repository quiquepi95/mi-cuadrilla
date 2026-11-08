import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { PersonasService, Persona } from '../../../../core/services/personas.service';
import { Trabajadera, Paso } from '../../../../core/models';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

export type AlertaDuplicado = 'telefono_existe' | 'nombre_similar' | null;

@Component({
  selector: 'app-nuevo-costalero',
  standalone: true,
  imports: [CommonModule, RouterModule, IonicModule, FormsModule],
  templateUrl: './nuevo-costalero.page.html',
  styleUrls: ['./nuevo-costalero.page.scss'],
})
export class NuevoCostaleroPage implements OnInit, OnDestroy {

  paso?: Paso;
  trabajaderas: Trabajadera[] = [];

  // ---- Campos del formulario ----
  nombre        = '';
  apellidos     = '';
  telefono      = '';
  alias         = '';
  trabajaderaId = '';
  calzo_cm: number | null = null;
  es_aspirante  = false;

  // ---- Autocompletar ----
  sugerencias: Persona[] = [];
  mostrarSugerencias    = false;
  personaSeleccionada?: Persona;   // persona vinculada por autocompletar

  // ---- Alertas de duplicado ----
  alertaDuplicado: AlertaDuplicado = null;
  personaDuplicada?: Persona;

  // ---- Estado ----
  submitted  = false;
  guardando  = false;

  private busqueda$ = new Subject<string>();
  private destroy$  = new Subject<void>();

  constructor(
    private route:    ActivatedRoute,
    private router:   Router,
    private mock:     MockDataService,
    private personas: PersonasService,
  ) {}

  ngOnInit() {
    const pasoId = this.route.snapshot.paramMap.get('pasoId') || '';
    this.paso        = this.mock.getPaso(pasoId);
    this.trabajaderas = this.mock.getTrabajaderasByPaso(pasoId);

    // Autocompletar con debounce
    this.busqueda$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(texto => {
      this.sugerencias       = this.personas.buscar(texto);
      this.mostrarSugerencias = this.sugerencias.length > 0;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ---- Autocompletar ----
  onNombreInput() {
    this.personaSeleccionada = undefined;
    this.alertaDuplicado     = null;
    const texto = `${this.nombre} ${this.apellidos}`.trim();
    this.busqueda$.next(texto);
  }

  onApellidosInput() {
    this.onNombreInput();
  }

  seleccionarSugerencia(p: Persona) {
    this.nombre              = p.nombre;
    this.apellidos           = p.apellidos;
    this.telefono            = p.telefono;
    this.alias               = p.alias ?? '';
    this.personaSeleccionada = p;
    this.sugerencias         = [];
    this.mostrarSugerencias  = false;
    this.alertaDuplicado     = null;
  }

  cerrarSugerencias() {
    // pequeño delay para que el click en sugerencia se procese antes
    setTimeout(() => { this.mostrarSugerencias = false; }, 150);
  }

  // ---- Validación de duplicado al salir del campo teléfono ----
  onTelefonoBlur() {
    if (!this.telefono || this.personaSeleccionada) return;

    const existente = this.personas.buscarPorTelefono(this.telefono);
    if (existente) {
      // Teléfono exacto ya existe en otra persona
      const mismoNombre =
        existente.nombre.toLowerCase()    === this.nombre.toLowerCase() &&
        existente.apellidos.toLowerCase() === this.apellidos.toLowerCase();

      if (mismoNombre) {
        // Es la misma persona — vinculamos automáticamente sin aviso
        this.personaSeleccionada = existente;
        this.alertaDuplicado     = null;
      } else {
        // Teléfono de otra persona distinta
        this.alertaDuplicado  = 'telefono_existe';
        this.personaDuplicada = existente;
      }
    } else {
      // Teléfono nuevo — comprobar si el nombre es similar a alguien existente
      const similares = this.personas.buscar(`${this.nombre} ${this.apellidos}`);
      if (similares.length > 0) {
        this.alertaDuplicado  = 'nombre_similar';
        this.personaDuplicada = similares[0];
      } else {
        this.alertaDuplicado = null;
      }
    }
  }

  // ---- Usar persona existente (desde alerta duplicado) ----
  usarPersonaExistente() {
    if (this.personaDuplicada) {
      this.seleccionarSugerencia(this.personaDuplicada);
    }
  }

  // ---- Ignorar alerta y crear persona nueva ----
  ignorarAlerta() {
    this.alertaDuplicado  = null;
    this.personaDuplicada = undefined;
  }

  // ---- Getters de validación ----
  get nombreInvalido():      boolean { return this.submitted && !this.nombre.trim(); }
  get apellidosInvalido():   boolean { return this.submitted && !this.apellidos.trim(); }
  get trabajaderaInvalida(): boolean { return this.submitted && !this.trabajaderaId; }

  getNombreTrabadadera(id: string): string {
    const t = this.trabajaderas.find(t => t.id === id);
    return t ? `Trabajadera ${t.numero}` : '';
  }

  // ---- Guardar ----
  guardar() {
    this.submitted = true;
    if (!this.nombre.trim() || !this.apellidos.trim() || !this.trabajaderaId) return;
    this.guardando = true;

    // Resolver persona_id
    let personaId: string;
    if (this.personaSeleccionada) {
      personaId = this.personaSeleccionada.id;
    } else {
      // Crear persona nueva
      const nueva = this.personas.crearPersona({
        nombre:    this.nombre.trim(),
        apellidos: this.apellidos.trim(),
        telefono:  this.telefono.trim(),
        alias:     this.alias.trim() || undefined,
      });
      personaId = nueva.id;
    }

    const nuevoId = `c-${Date.now()}`;
    this.mock.costaleros.push({
      id:             nuevoId,
      persona_id:     personaId,
      paso_id:        this.paso!.id,
      trabajadera_id: this.trabajaderaId,
      nombre:         this.nombre.trim(),
      apellidos:      this.apellidos.trim(),
      telefono:       this.telefono.trim(),
      calzo_cm:       this.calzo_cm ?? 0,
      es_aspirante:   this.es_aspirante,
      activo:         true,
      notas:          '',
      created_at:     new Date().toISOString(),
      updated_at:     new Date().toISOString(),
    });

    this.router.navigate(['/pasos', this.paso!.id]);
  }
}
