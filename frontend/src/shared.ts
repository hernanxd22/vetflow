export type View =
  | 'home' | 'registrar' | 'mascotas' | 'chat'
  | 'citas' | 'admin' | 'historial' | 'veterinarios'

export const emojis: Record<string, string> = {
  perro: '🐶', gato: '🐱', conejo: '🐰',
  pajaro: '🐦', hamster: '🐹', otro: '🐾',
}

// Clinic opening hours. These mirror the slots the n8n workflow actually
// offers (MANANA = [8..12], TARDE = [16..20]), so the interface cannot promise
// a window the assistant will never hand out.
export const HORARIOS = {
  mananaDesde: 8, mananaHasta: 13,
  tardeDesde: 16, tardeHasta: 21,
}

// Local calendar date as YYYY-MM-DD. toISOString() reports UTC, so in Argentina
// (UTC-3) anything after 21:00 is already reported as the next day and every
// date comparison built on it shifts by one.
export function ymdLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function hhmmLocal(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function fechaLarga(iso: string): string {
  return new Date(iso.slice(0, 10) + 'T00:00:00')
    .toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
}
