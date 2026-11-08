import { Injectable, signal } from '@angular/core';

export type ThemeId = 'clasico';

export interface Theme {
  id: ThemeId;
  nombre: string;
  descripcion: string;
}

export const THEMES: Theme[] = [
  { id: 'clasico', nombre: 'Cofrade Clásico', descripcion: 'Fondo oscuro · Dorado · Solemne' },
];

@Injectable({ providedIn: 'root' })
export class ThemeService {
  currentTheme = signal<ThemeId>('clasico');

  setTheme(id: ThemeId) {
    document.body.classList.remove('theme-clasico');
    document.body.classList.add(`theme-${id}`);
    this.currentTheme.set(id);
  }

  init() {
    this.setTheme(this.currentTheme());
  }
}
