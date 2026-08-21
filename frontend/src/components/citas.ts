// Shared shape for every calendar. The API returns nullable fecha/hora because
// a cita row is written incrementally by the workflow, so the calendar has to
// cope with an incomplete row instead of assuming it away.
export type CitaCalendario = {
  id: number
  fecha: string | null
  hora: string | null
  estado: string
  mascota_id?: number | null
  mascota_nombre?: string | null
  cliente_nombre?: string
  veterinario_nombre?: string | null
}

export type EstiloEstado = {
  fondo: string
  borde: string
  texto: string
  punto: string
  tachado: boolean
  etiqueta: string
}

const ESTILOS: Record<string, EstiloEstado> = {
  confirmado: {
    fondo: 'rgba(15,157,126,0.14)', borde: '#0f9d7e', texto: '#0b5f4d',
    punto: '#0f9d7e', tachado: false, etiqueta: 'Confirmada',
  },
  completado: {
    fondo: 'rgba(96,125,139,0.14)', borde: '#607d8b', texto: '#37474f',
    punto: '#607d8b', tachado: false, etiqueta: 'Completada',
  },
  cancelado: {
    fondo: 'rgba(120,144,156,0.10)', borde: '#b0bec5', texto: '#78909c',
    punto: '#b0bec5', tachado: true, etiqueta: 'Cancelada',
  },
}

const POR_DEFECTO: EstiloEstado = {
  fondo: 'rgba(255,143,0,0.12)', borde: '#ff8f00', texto: '#a35a00',
  punto: '#ff8f00', tachado: false, etiqueta: 'Pendiente',
}

/** Estados the API is allowed to return, in the order shown to the user. */
export const ESTADOS_VISIBLES = ['confirmado', 'cancelado', 'completado'] as const

export function estiloEstado(estado: string): EstiloEstado {
  return ESTILOS[estado] ?? POR_DEFECTO
}

export function horaCorta(hora: string | null): string {
  return hora ? hora.slice(0, 5) : '--:--'
}
