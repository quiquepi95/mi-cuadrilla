import { ApplicationRef, Component, NgZone, OnDestroy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { App } from '@capacitor/app';
import { AtrasService } from './core/services/atras.service';
import { MockDataService } from './core/services/mock-data.service';
import { rutaPadre } from './core/utils/navegacion';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnDestroy {
  private router = inject(Router);
  private mock = inject(MockDataService);
  private zone = inject(NgZone);
  private atras = inject(AtrasService);
  private appRef = inject(ApplicationRef);

  private listenerAtras?: PluginListenerHandle;
  private quitarAtras?: () => void;

  /** Aviso "¿Salir de la aplicación?" */
  confirmandoSalida = signal(false);

  constructor() {
    // Botón "atrás" del móvil (solo en la app nativa)
    if (Capacitor.isNativePlatform()) {
      App.addListener('backButton', () => {
        this.zone.run(() => this.alPulsarAtras());
      }).then(handle => (this.listenerAtras = handle));
    }
  }

  ngOnDestroy() {
    this.listenerAtras?.remove();
    this.quitarAtras?.();
  }

  /**
   * 1. Si hay una ventana emergente abierta, se cierra.
   * 2. Si se está en "Mis Pasos" (la pantalla principal), se pregunta si se quiere salir de la app.
   * 3. En cualquier otra pantalla, se va a su pantalla "padre", la misma a la que lleva su flecha
   *    "volver" (ver `rutaPadre`): de editar un costalero al listado, del listado a Mis Pasos.
   *    No se usa el historial del móvil: guarda todas las pantallas visitadas y haría recorrerlas todas.
   */
  private alPulsarAtras() {
    if (this.atras.cerrarUltima()) {
      this.repintar();
      return;
    }

    const padre = rutaPadre(this.router.url, id => this.mock.getEnsayo(id)?.paso_id);
    if (padre === null) {
      this.preguntarSalida();
      return;
    }
    // Se sustituye la entrada del historial en vez de añadir otra, para que no crezca sin fin
    this.router.navigateByUrl(padre, { replaceUrl: true });
  }

  /**
   * La app no usa zone.js: lo que cambia desde el botón del móvil (fuera de un clic de la pantalla)
   * no se dibuja hasta el siguiente toque. Se fuerza el repintado.
   */
  private repintar() {
    this.appRef.tick();
  }

  private preguntarSalida() {
    this.confirmandoSalida.set(true);
    // Con la alerta abierta, el botón atrás equivale a "Quedarme"
    this.quitarAtras?.();
    this.quitarAtras = this.atras.registrar(() => this.cancelarSalida());
  }

  cancelarSalida() {
    this.confirmandoSalida.set(false);
    this.quitarAtras?.();
    this.quitarAtras = undefined;
  }

  salir() {
    App.exitApp();
  }
}
