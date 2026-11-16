/**
 * Valida la ruta "origen" que viaja en la URL (?origen=/ensayos) para poder volver a donde se vino.
 * Solo se aceptan rutas internas de la app; cualquier otra cosa se descarta (devuelve '').
 */
export function origenInterno(valor: string | null): string {
  const v = valor ?? '';
  return v.startsWith('/') && !v.startsWith('//') ? v : '';
}

/**
 * Pantalla "padre" de una ruta: a dónde lleva el botón atrás del móvil (el mismo destino que la flecha
 * "volver" de cada pantalla). Devuelve null en "Mis Pasos", la pantalla principal, donde atrás pregunta
 * si se quiere salir de la app.
 *
 *   /costaleros/:id/editar     -> el origen (p. ej. el listado /costaleros)
 *   /costaleros                -> /pasos
 *   /pasos/:id/editar          -> /pasos/:id
 *   /pasos/:id                 -> /pasos
 *   ensayos de un paso         -> el origen, o la pestaña Ensayos de ese paso
 *   /ensayos/:id/lista         -> el origen, o la pestaña Ensayos de su paso
 *   /ensayos                   -> /pasos
 *
 * `pasoDeEnsayo` busca el paso al que pertenece un ensayo (para el pase de lista sin origen).
 */
export function rutaPadre(url: string, pasoDeEnsayo: (ensayoId: string) => string | undefined): string | null {
  const [ruta, consulta = ''] = url.split('#')[0].split('?');
  const origen = origenInterno(new URLSearchParams(consulta).get('origen'));
  const t = ruta.split('/').filter(Boolean);

  if (t.length === 0 || (t[0] === 'pasos' && t.length === 1)) return null;

  if (t[0] === 'pasos') {
    if (t[1] === 'nuevo' || t.length === 2) return '/pasos';
    if (t[2] === 'editar') return `/pasos/${t[1]}`;
    if (t[2] === 'ensayos') return origen || `/pasos/${t[1]}?tab=ensayos`;
    if (t[2] === 'costaleros') return `/pasos/${t[1]}`;
    return `/pasos/${t[1]}`;
  }

  if (t[0] === 'ensayos' && t[2] === 'lista') {
    if (origen) return origen;
    const pasoId = pasoDeEnsayo(t[1]);
    return pasoId ? `/pasos/${pasoId}?tab=ensayos` : '/ensayos';
  }

  if (t[0] === 'costaleros' && t[2] === 'editar') return origen || '/costaleros';

  return '/pasos';
}