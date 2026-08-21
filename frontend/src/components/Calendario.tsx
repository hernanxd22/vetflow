import { useMemo, useState } from 'react'
import { BadgeEstado, BloqueEvento, LineaEvento } from './EventoCita'
import { ESTADOS_VISIBLES, estiloEstado, horaCorta, type CitaCalendario } from './citas'
import { ymdLocal as ymd } from '../shared'

// The clinic works 08:00–13:00 and 16:00–21:00, so the grid spans the whole
// working day and greys out the gap in between.
const HORA_INICIO = 8
const HORA_FIN = 21
const ALMUERZO_DESDE = 13
const ALMUERZO_HASTA = 16
const ALTO_HORA = 56
const DURACION_MIN = 60

const DIAS_CORTOS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
  'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

type Modo = 'mes' | 'semana' | 'dia'

function lunesDe(d: Date): Date {
  const n = new Date(d)
  const dia = n.getDay()
  n.setDate(n.getDate() + (dia === 0 ? -6 : 1 - dia))
  n.setHours(0, 0, 0, 0)
  return n
}

function sumarDias(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function minutosDe(hora: string | null): number | null {
  if (!hora) return null
  const [h, m] = hora.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return h * 60 + m
}

export type Props = {
  citas: CitaCalendario[]
  loading: boolean
  titulo: string
  subtitulo: string
  /** Main line of each event — differs per role. */
  tituloEvento: (c: CitaCalendario) => string
  /** Optional second line of each event. */
  subtituloEvento?: (c: CitaCalendario) => string | undefined
  /** Shown inside the detail card when the cita has a mascota. */
  onVerHistorial?: (c: CitaCalendario) => void
}

export default function Calendario({
  citas, loading, titulo, subtitulo, tituloEvento, subtituloEvento, onVerHistorial,
}: Props) {
  const [modo, setModo] = useState<Modo>('semana')
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d })
  const [seleccionada, setSeleccionada] = useState<CitaCalendario | null>(null)

  const hoyStr = ymd(new Date())

  // A cita with no fecha cannot be placed on a grid. It is counted and reported
  // rather than dropped, so the calendar never hides data it received.
  const sinFecha = useMemo(() => citas.filter(c => !c.fecha), [citas])

  const porDia = useMemo(() => {
    const mapa = new Map<string, CitaCalendario[]>()
    for (const c of citas) {
      if (!c.fecha) continue
      const clave = c.fecha.slice(0, 10)
      const lista = mapa.get(clave)
      if (lista) lista.push(c)
      else mapa.set(clave, [c])
    }
    for (const lista of mapa.values()) {
      lista.sort((a, b) => (minutosDe(a.hora) ?? 0) - (minutosDe(b.hora) ?? 0))
    }
    return mapa
  }, [citas])

  const diasVisibles = useMemo(() => {
    if (modo === 'dia') return [cursor]
    if (modo === 'semana') {
      const l = lunesDe(cursor)
      return Array.from({ length: 7 }, (_, i) => sumarDias(l, i))
    }
    // Month: full weeks covering the month, Monday-first.
    const primero = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
    const inicio = lunesDe(primero)
    const ultimo = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0)
    const total = Math.ceil((ultimo.getTime() - inicio.getTime()) / 86400000) + 1
    const semanas = Math.max(5, Math.ceil(total / 7))
    return Array.from({ length: semanas * 7 }, (_, i) => sumarDias(inicio, i))
  }, [modo, cursor])

  function mover(paso: number) {
    setCursor(c => {
      if (modo === 'dia') return sumarDias(c, paso)
      if (modo === 'semana') return sumarDias(c, paso * 7)
      return new Date(c.getFullYear(), c.getMonth() + paso, 1)
    })
  }

  function irHoy() {
    const d = new Date(); d.setHours(0, 0, 0, 0); setCursor(d)
  }

  const tituloPeriodo = useMemo(() => {
    if (modo === 'dia') {
      return `${cursor.getDate()} de ${MESES[cursor.getMonth()]} de ${cursor.getFullYear()}`
    }
    if (modo === 'semana') {
      const l = lunesDe(cursor)
      const d = sumarDias(l, 6)
      if (l.getMonth() === d.getMonth()) {
        return `${l.getDate()} – ${d.getDate()} de ${MESES[l.getMonth()]} de ${l.getFullYear()}`
      }
      return `${l.getDate()} ${MESES[l.getMonth()].slice(0, 3)} – ${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)} de ${d.getFullYear()}`
    }
    return `${MESES[cursor.getMonth()]} de ${cursor.getFullYear()}`
  }, [modo, cursor])

  const horas = Array.from({ length: HORA_FIN - HORA_INICIO }, (_, i) => HORA_INICIO + i)
  const altoGrilla = (HORA_FIN - HORA_INICIO) * ALTO_HORA

  // Red "now" indicator, only while the current time falls inside the grid.
  const ahora = new Date()
  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes()
  const dentroDeGrilla = minutosAhora >= HORA_INICIO * 60 && minutosAhora <= HORA_FIN * 60
  const topAhora = ((minutosAhora - HORA_INICIO * 60) / 60) * ALTO_HORA

  const botonNav: React.CSSProperties = {
    width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)',
    background: 'white', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', color: 'var(--text)',
  }

  return (
    <div style={{ padding: '40px 40px 48px' }}>
      {/* ── Barra superior ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{titulo}</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>{subtitulo}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={irHoy} style={{
            height: 36, padding: '0 16px', borderRadius: 8, border: '1px solid var(--border)',
            background: 'white', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.85rem', fontWeight: 500, color: 'var(--text)',
          }}>Hoy</button>

          <button onClick={() => mover(-1)} style={botonNav} aria-label="Período anterior">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button onClick={() => mover(1)} style={botonNav} aria-label="Período siguiente">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>

          <span style={{
            fontFamily: 'Syne, sans-serif', fontSize: '1.05rem', fontWeight: 700,
            color: 'var(--text)', minWidth: 210, textTransform: 'capitalize',
          }}>{tituloPeriodo}</span>

          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: 'white' }}>
            {(['dia', 'semana', 'mes'] as Modo[]).map(m => (
              <button key={m} onClick={() => setModo(m)} style={{
                height: 36, padding: '0 16px', border: 'none', cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem',
                fontWeight: modo === m ? 600 : 400,
                background: modo === m ? 'var(--teal-light)' : 'white',
                color: modo === m ? 'var(--teal-dark)' : 'var(--muted)',
                textTransform: 'capitalize',
              }}>{m === 'dia' ? 'Día' : m}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Referencia de estados ── */}
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', margin: '18px 0 16px' }}>
        {ESTADOS_VISIBLES.map(e => {
          const s = estiloEstado(e)
          return (
            <span key={e} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.78rem', color: 'var(--muted)' }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: s.fondo, border: `2px solid ${s.borde}` }} />
              {s.etiqueta}
            </span>
          )
        })}
        {sinFecha.length > 0 && (
          <span style={{ fontSize: '0.78rem', color: '#a35a00', fontWeight: 500 }}>
            ⚠ {sinFecha.length} cita{sinFecha.length > 1 ? 's' : ''} sin fecha asignada (no se puede ubicar en la grilla)
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: 80 }}>
          {[0, 0.2, 0.4].map((d, i) => (
            <span key={i} style={{ width: 8, height: 8, background: 'var(--teal)', borderRadius: '50%', display: 'inline-block', animation: `dot 1.2s ease-in-out ${d}s infinite` }} />
          ))}
        </div>
      ) : modo === 'mes' ? (
        /* ══════════ VISTA MES ══════════ */
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0,1fr))', borderBottom: '1px solid var(--border)' }}>
            {DIAS_CORTOS.map(d => (
              <div key={d} style={{ padding: '10px 8px', textAlign: 'center', fontSize: '0.68rem', fontWeight: 600, letterSpacing: 1.2, color: 'var(--muted)' }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0,1fr))' }}>
            {diasVisibles.map((d, i) => {
              const clave = ymd(d)
              const delMes = d.getMonth() === cursor.getMonth()
              const esHoy = clave === hoyStr
              const finDeSemana = d.getDay() === 0 || d.getDay() === 6
              const delDia = porDia.get(clave) ?? []
              return (
                <div key={i} style={{
                  minHeight: 108, borderRight: (i + 1) % 7 ? '1px solid var(--border)' : 'none',
                  borderBottom: '1px solid var(--border)', padding: 6,
                  background: !delMes ? '#fafbfb' : finDeSemana ? 'rgba(0,0,0,0.015)' : 'white',
                  opacity: delMes ? 1 : 0.55,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
                    <span style={{
                      width: 24, height: 24, borderRadius: '50%', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.78rem', fontWeight: esHoy ? 700 : 500,
                      background: esHoy ? 'var(--teal)' : 'transparent',
                      color: esHoy ? 'white' : 'var(--text)',
                    }}>{d.getDate()}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {delDia.slice(0, 3).map(c => (
                      <LineaEvento key={c.id} cita={c} titulo={tituloEvento(c)} onClick={() => setSeleccionada(c)} />
                    ))}
                    {delDia.length > 3 && (
                      <span
                        onClick={() => { setCursor(d); setModo('dia') }}
                        style={{ fontSize: '0.68rem', color: 'var(--teal-mid)', fontWeight: 600, cursor: 'pointer', paddingLeft: 4 }}
                      >+{delDia.length - 3} más</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* ══════════ VISTA SEMANA / DÍA ══════════ */
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          {/* Encabezado de días */}
          <div style={{
            display: 'grid', gridTemplateColumns: `64px repeat(${diasVisibles.length}, minmax(0,1fr))`,
            borderBottom: '1px solid var(--border)', background: 'white',
            position: 'sticky', top: 0, zIndex: 3,
          }}>
            <div />
            {diasVisibles.map((d, i) => {
              const esHoy = ymd(d) === hoyStr
              const finDeSemana = d.getDay() === 0 || d.getDay() === 6
              return (
                <div key={i} style={{
                  padding: '10px 6px 12px', textAlign: 'center',
                  borderLeft: '1px solid var(--border)',
                  background: finDeSemana ? 'rgba(0,0,0,0.015)' : 'white',
                }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: 1.4, color: esHoy ? 'var(--teal)' : 'var(--muted)' }}>
                    {DIAS_CORTOS[(d.getDay() + 6) % 7]}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
                    <span style={{
                      width: 30, height: 30, borderRadius: '50%', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Syne, sans-serif', fontSize: '1rem', fontWeight: 700,
                      background: esHoy ? 'var(--teal)' : 'transparent',
                      color: esHoy ? 'white' : 'var(--text)',
                    }}>{d.getDate()}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Grilla horaria */}
          <div style={{ maxHeight: 'calc(100vh - 330px)', overflowY: 'auto' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: `64px repeat(${diasVisibles.length}, minmax(0,1fr))`,
              position: 'relative',
            }}>
              {/* Columna de horas */}
              <div style={{ position: 'relative', height: altoGrilla }}>
                {horas.map((h, i) => (
                  <span key={h} style={{
                    position: 'absolute', top: i * ALTO_HORA - 7, right: 10,
                    fontSize: '0.7rem', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums',
                  }}>{String(h).padStart(2, '0')}:00</span>
                ))}
                <span style={{ position: 'absolute', top: altoGrilla - 7, right: 10, fontSize: '0.7rem', color: 'var(--muted)' }}>
                  {HORA_FIN}:00
                </span>
              </div>

              {/* Columnas de días */}
              {diasVisibles.map((d, di) => {
                const clave = ymd(d)
                const esHoy = clave === hoyStr
                const finDeSemana = d.getDay() === 0 || d.getDay() === 6
                const delDia = porDia.get(clave) ?? []

                // All slots are one hour on the hour, so events collide only when
                // they share a start time. Splitting the column by that group is
                // enough and keeps the layout predictable.
                const grupos = new Map<string, CitaCalendario[]>()
                for (const c of delDia) {
                  const k = c.hora ?? 'sin-hora'
                  const g = grupos.get(k)
                  if (g) g.push(c); else grupos.set(k, [c])
                }

                return (
                  <div key={di} style={{
                    position: 'relative', height: altoGrilla,
                    borderLeft: '1px solid var(--border)',
                    background: finDeSemana ? 'rgba(0,0,0,0.015)' : 'transparent',
                    backgroundImage: `repeating-linear-gradient(to bottom, var(--cal-grid) 0 1px, transparent 1px ${ALTO_HORA}px)`,
                  }}>
                    {/* Franja fuera de horario de atención */}
                    <div style={{
                      position: 'absolute', left: 0, right: 0,
                      top: (ALMUERZO_DESDE - HORA_INICIO) * ALTO_HORA,
                      height: (ALMUERZO_HASTA - ALMUERZO_DESDE) * ALTO_HORA,
                      background: 'var(--cal-offhours)', pointerEvents: 'none',
                    }} />

                    {/* Línea de "ahora" */}
                    {esHoy && dentroDeGrilla && (
                      <div style={{ position: 'absolute', left: 0, right: 0, top: topAhora, zIndex: 2, pointerEvents: 'none' }}>
                        <div style={{ height: 2, background: 'var(--cal-now)' }} />
                        <div style={{
                          position: 'absolute', left: -5, top: -4, width: 10, height: 10,
                          borderRadius: '50%', background: 'var(--cal-now)',
                        }} />
                      </div>
                    )}

                    {/* Eventos */}
                    {[...grupos.values()].map(grupo =>
                      grupo.map((c, gi) => {
                        const min = minutosDe(c.hora)
                        if (min === null) return null
                        const top = ((min - HORA_INICIO * 60) / 60) * ALTO_HORA
                        if (top < 0 || top >= altoGrilla) return null
                        const ancho = 100 / grupo.length
                        return (
                          <div key={c.id} style={{
                            position: 'absolute', zIndex: 1,
                            top: top + 1, height: (DURACION_MIN / 60) * ALTO_HORA - 3,
                            left: `calc(${gi * ancho}% + 3px)`,
                            width: `calc(${ancho}% - 6px)`,
                          }}>
                            <BloqueEvento
                              cita={c}
                              titulo={tituloEvento(c)}
                              subtitulo={subtituloEvento?.(c)}
                              onClick={() => setSeleccionada(c)}
                            />
                          </div>
                        )
                      })
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Tarjeta de detalle ── */}
      {seleccionada && (
        <div
          onClick={() => setSeleccionada(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(13,61,79,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1200, padding: 24,
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{
            background: 'white', borderRadius: 18, padding: 28, width: 'min(420px, 100%)',
            boxShadow: '0 24px 70px rgba(0,0,0,0.22)', position: 'relative',
          }}>
            <button onClick={() => setSeleccionada(null)} style={{
              position: 'absolute', top: 14, right: 14, width: 30, height: 30,
              border: 'none', background: 'none', cursor: 'pointer',
              color: 'var(--muted)', fontSize: 18,
            }}>✕</button>

            <div style={{ marginBottom: 16 }}><BadgeEstado estado={seleccionada.estado} /></div>

            <h4 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: 18 }}>
              🐾 {seleccionada.mascota_nombre || 'Sin mascota'}
            </h4>

            <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 16px', fontSize: '0.88rem' }}>
              <dt style={{ color: 'var(--muted)' }}>Fecha</dt>
              <dd style={{ color: 'var(--text)', fontWeight: 500 }}>
                {seleccionada.fecha
                  ? new Date(seleccionada.fecha.slice(0, 10) + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
                  : 'Sin asignar'}
              </dd>

              <dt style={{ color: 'var(--muted)' }}>Hora</dt>
              <dd style={{ color: 'var(--text)', fontWeight: 500 }}>{horaCorta(seleccionada.hora)}</dd>

              {seleccionada.cliente_nombre && (<>
                <dt style={{ color: 'var(--muted)' }}>Dueño</dt>
                <dd style={{ color: 'var(--text)', fontWeight: 500 }}>{seleccionada.cliente_nombre}</dd>
              </>)}

              {seleccionada.veterinario_nombre && (<>
                <dt style={{ color: 'var(--muted)' }}>Veterinario</dt>
                <dd style={{ color: 'var(--text)', fontWeight: 500 }}>{seleccionada.veterinario_nombre}</dd>
              </>)}
            </dl>

            {onVerHistorial && seleccionada.mascota_id != null && (
              <button
                onClick={() => { const c = seleccionada; setSeleccionada(null); onVerHistorial(c) }}
                style={{
                  marginTop: 22, width: '100%', height: 42, borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, var(--teal), var(--teal-mid))',
                  color: 'white', fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem',
                  fontWeight: 500, cursor: 'pointer',
                }}
              >Ver historial médico</button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
