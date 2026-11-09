/**
 * Fecha de hoy en formato ISO (YYYY-MM-DD) usando la hora LOCAL del dispositivo.
 * (toISOString() usa UTC y cerca de medianoche daría el día equivocado.)
 */
export function hoyLocal(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
