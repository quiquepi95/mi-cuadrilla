import { Component, OnInit, OnDestroy, inject } from '@angular/core';

import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { FormsModule } from '@angular/forms';
import { PersonasService, Persona } from '../../../../core/services/personas.service';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { AtrasService } from '../../../../core/services/atras.service';
import { Costalero, Paso } from '../../../../core/models';

interface PersonaConPasos extends Persona {
  pasos: { paso: Paso; costalero: Costalero }[];
}

@Component({
  selector: 'app-lista-costaleros',
  standalone: true,
  imports: [RouterModule, IonicModule, FormsModule],
  templateUrl: './lista-costaleros.page.html',
  styleUrls: ['./lista-costaleros.page.scss'],
})
export class ListaCostalerosPage implements OnInit, OnDestroy {
  private personasService = inject(PersonasService);
  private mock = inject(MockDataService);
  private atras = inject(AtrasService);

  personas: PersonaConPasos[] = [];
  duplicados: Persona[][] = [];
  filtro = '';

  // ---- Asistente de duplicados ----
  revisando = false;
  paso: 'misma' | 'correcta' = 'misma';
  mensaje = '';
  private quitarAtras?: () => void;

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.personas = this.personasService.personas.map(p => {
      // Solo cuentan los pasos en los que la persona está ACTIVA
      const pasos = this.mock.getPasosByPersona(p.id).filter(r => r.costalero.activo);
      return { ...p, pasos };
    }).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

    this.duplicados = this.personasService.getDuplicados();
  }

  get personasFiltradas(): PersonaConPasos[] {
    let lista = this.personas;

    if (this.filtro.trim().length >= 2) {
      const q = this.filtro.trim().toLowerCase();
      lista = lista.filter(p =>
        `${p.nombre} ${p.apellidos}`.toLowerCase().includes(q) ||
        p.telefono.includes(q) ||
        (p.alias?.toLowerCase().includes(q) ?? false)
      );
    }

    return lista;
  }

  esDuplicado(personaId: string): boolean {
    return this.duplicados.some(g => g.some(p => p.id === personaId));
  }

  getPasosTexto(p: PersonaConPasos): string {
    return p.pasos.map(r => r.paso.nombre).join(', ') || 'Sin pasos asignados';
  }

  // ---- Asistente de duplicados ----

  /** Grupo que se está revisando ahora (con sus pasos) */
  get grupoActual(): PersonaConPasos[] {
    const grupo = this.duplicados[0] ?? [];
    return grupo
      .map(d => this.personas.find(p => p.id === d.id))
      .filter((p): p is PersonaConPasos => !!p);
  }

  abrirRevision() {
    this.mensaje = '';
    this.paso = 'misma';
    this.revisando = true;
    // El botón atrás del móvil cierra el asistente
    this.quitarAtras?.();
    this.quitarAtras = this.atras.registrar(() => this.cerrarRevision());
  }

  cerrarRevision() {
    this.revisando = false;
    this.quitarAtras?.();
    this.quitarAtras = undefined;
  }

  ngOnDestroy() {
    this.quitarAtras?.();
  }

  /** "No, son personas distintas": se deja de avisar de este grupo */
  noSonLaMisma() {
    this.personasService.descartarDuplicado(this.duplicados[0]);
    this.siguiente();
  }

  /** "Este es el correcto": el resto de fichas del grupo se juntan en esta */
  elegirCorrecta(correcta: PersonaConPasos) {
    const sobrantes = this.grupoActual.filter(p => p.id !== correcta.id);
    for (const s of sobrantes) {
      this.mock.fusionarPersonas(correcta.id, s.id);
    }
    this.mensaje = `Listo: ${correcta.nombre} ${correcta.apellidos} ahora es una sola ficha.`;
    this.siguiente();
  }

  private siguiente() {
    this.cargar();
    this.paso = 'misma';
    if (this.duplicados.length === 0) this.cerrarRevision();
  }
}
