import { Component, NgZone, OnDestroy, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { App } from '@capacitor/app';
import { AtrasService } from './core/services/atras.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnDestroy {
  private router = inject(Router);
  private location = inject(Location);
  private zone = inject(NgZone);
  private atras = inject(AtrasService);

  private listenerAtras?: PluginListenerHandle;
  private quitarAtras?: () => void;

  /** Aviso "¿Salir de la aplicación?" */
  confirmandoSalida = false;

  constructor() {
    // Botón "atrás" del móvil (solo en la app nativa)
    if (Capacitor.isNativePlatform()) {
      App.addListener('backButton', ({ canGoBack }) => {
        this.zone.run(() => this.alPulsarAtras(canGoBack));
      }).then(handle => (this.listenerAtras = handle));
    }
  }

  ngOnDestroy() {
    this.listenerAtras?.remove();
    this.quitarAtras?.();
  }

  /**
   * 1. Si hay una ventana emergente abierta, se cierra.
   * 2. Si se puede volver a la pantalla anterior, se vuelve.
   * 3. Si no, y no se está en "Mis Pasos", se va a "Mis Pasos".
   * 4. Si ya se está en "Mis Pasos", se pregunta si se quiere salir de la app.
   */
  private alPulsarAtras(canGoBack: boolean) {
    if (this.atras.cerrarUltima()) return;

    if (canGoBack) {
      this.location.back();
      return;
    }

    const ruta = this.router.url.split('?')[0];
    if (ruta !== '/pasos') {
      this.router.navigateByUrl('/pasos');
      return;
    }

    this.preguntarSalida();
  }

  private preguntarSalida() {
    this.confirmandoSalida = true;
    // Con la alerta abierta, el botón atrás equivale a "Quedarme"
    this.quitarAtras?.();
    this.quitarAtras = this.atras.registrar(() => this.cancelarSalida());
  }

  cancelarSalida() {
    this.confirmandoSalida = false;
    this.quitarAtras?.();
    this.quitarAtras = undefined;
  }

  salir() {
    App.exitApp();
  }
}
