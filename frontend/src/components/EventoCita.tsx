import { estiloEstado, horaCorta, type CitaCalendario } from './citas'

// One block inside the week/day time grid.
export function BloqueEvento({
  cita, titulo, subtitulo, onClick,
}: {
  cita: CitaCalendario
  titulo: string
  subtitulo?: string
  onClick?: () => void
}) {
  const e = estiloEstado(cita.estado)
  return (
    <div
      onClick={onClick}
      title={`${horaCorta(cita.hora)} · ${titulo}${subtitulo ? ` · ${subtitulo}` : ''} · ${e.etiqueta}`}
      style={{
        height: '100%', overflow: 'hidden', cursor: onClick ? 'pointer' : 'default',
        background: e.fondo, borderLeft: `3px solid ${e.borde}`, borderRadius: 6,
        padding: '4px 6px', color: e.texto,
        textDecoration: e.tachado ? 'line-through' : 'none',
        opacity: e.tachado ? 0.75 : 1,
        display: 'flex', flexDirection: 'column', gap: 1,
      }}
    >
      <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: 0.2 }}>
        {horaCorta(cita.hora)}
      </span>
      <span style={{ fontSize: '0.74rem', fontWeight: 500, lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {titulo}
      </span>
      {subtitulo && (
        <span style={{ fontSize: '0.68rem', opacity: 0.85, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {subtitulo}
        </span>
      )}
    </div>
  )
}

// Compact one-line entry used inside a month cell.
export function LineaEvento({
  cita, titulo, onClick,
}: {
  cita: CitaCalendario
  titulo: string
  onClick?: () => void
}) {
  const e = estiloEstado(cita.estado)
  return (
    <div
      onClick={onClick}
      title={`${horaCorta(cita.hora)} · ${titulo} · ${e.etiqueta}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 5, padding: '2px 4px',
        borderRadius: 4, cursor: onClick ? 'pointer' : 'default',
        color: e.texto, textDecoration: e.tachado ? 'line-through' : 'none',
        opacity: e.tachado ? 0.75 : 1, fontSize: '0.7rem',
        overflow: 'hidden', whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: e.punto, flexShrink: 0 }} />
      <span style={{ fontWeight: 700, flexShrink: 0 }}>{horaCorta(cita.hora)}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{titulo}</span>
    </div>
  )
}

export function BadgeEstado({ estado }: { estado: string }) {
  const e = estiloEstado(estado)
  return (
    <span style={{
      background: e.fondo, color: e.texto, border: `1px solid ${e.borde}`,
      fontSize: '0.7rem', fontWeight: 600, padding: '3px 10px',
      borderRadius: 100, display: 'inline-block',
    }}>
      {e.etiqueta}
    </span>
  )
}
