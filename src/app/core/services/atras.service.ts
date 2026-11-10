import { Injectable } from '@angular/core';

/**
 * Gestiona el botón "atrás" del móvil para las ventanas emergentes.
 *
 * Cada ventana (asistente de duplicados, selector de costalero...) se registra al abrirse con
 * `registrar()` y se da de baja al cerrarse. Al pulsar atrás, primero se cierra la última ventana
 * abierta; solo si no hay ninguna se vuelve a la pantalla anterior.
 */
@Injectable({ providedIn: 'root' })
export class AtrasService {
  private pila: (() => void)[] = [];

  /** Registra una ventana abierta. Devuelve la función para darla de baja. */
  registrar(cerrar: () => void): () => void {
    this.pila.push(cerrar);
    return () => {
      this.pila = this.pila.filter(f => f !== cerrar);
    };
  }

  /** Cierra la última ventana abierta. Devuelve true si había alguna. */
  cerrarUltima(): boolean {
    const cerrar = this.pila[this.pila.length - 1];
    if (!cerrar) return false;
    cerrar(); // la propia ventana se da de baja al cerrarse
    return true;
  }
}
