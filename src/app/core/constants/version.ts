import { version } from '../../../../package.json';

/**
 * Versión de la app. Sale de `package.json` (única fuente de verdad):
 * al terminar cada sesión se sube ahí y se anota en CHANGELOG.md.
 */
export const APP_VERSION: string = version;
