import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { FormsModule } from '@angular/forms';
import { PersonasService, Persona } from '../../../../core/services/personas.service';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { Costalero, Paso } from '../../../../core/models';

interface PersonaConPasos extends Persona {
  pasos: { paso: Paso; costalero: Costalero }[];
  activo: boolean;
}

@Component({
  selector: 'app-lista-costaleros',
  standalone: true,
  imports: [CommonModule, RouterModule, IonicModule, FormsModule],
  templateUrl: './lista-costaleros.page.html',
  styleUrls: ['./lista-costaleros.page.scss'],
})
export class ListaCostalerosPage implements OnInit {
  personas: PersonaConPasos[] = [];
  duplicados: Persona[][] = [];
  filtro = '';
  mostrarSoloDuplicados = false;

  constructor(
    private personasService: PersonasService,
    private mock: MockDataService,
  ) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.personas = this.personasService.personas.map(p => {
      const pasos = this.mock.getPasosByPersona(p.id);
      const activo = pasos.some(r => r.costalero.activo);
      return { ...p, pasos, activo };
    }).sort((a, b) => a.apellidos.localeCompare(b.apellidos, 'es'));

    this.duplicados = this.personasService.getDuplicados();
  }

  get personasFiltradas(): PersonaConPasos[] {
    let lista = this.personas;

    if (this.mostrarSoloDuplicados) {
      const idsDuplicados = new Set(this.duplicados.flat().map(p => p.id));
      lista = lista.filter(p => idsDuplicados.has(p.id));
    }

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
}
