/**
 * Valida la ruta "origen" que viaja en la URL (?origen=/ensayos) para poder volver a donde se vino.
 * Solo se aceptan rutas internas de la app; cualquier otra cosa se descarta (devuelve '').
 */
export function origenInterno(valor: string | null): string {
  const v = valor ?? '';
  return v.startsWith('/') && !v.startsWith('//') ? v : '';
}
