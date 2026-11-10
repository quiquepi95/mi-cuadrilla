import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.micuadrilla.app',
  appName: 'Mi Cuadrilla',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a2e',
      showSpinner: false,
    },
    // La app tiene fondo oscuro: iconos claros en la barra de estado y en la de gestos
    SystemBars: {
      style: 'DARK',
    },
  },
};

export default config;
