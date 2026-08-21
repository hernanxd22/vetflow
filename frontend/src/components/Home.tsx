import { useMemo } from 'react'
import { estiloEstado, horaCorta, type CitaCalendario } from './citas'
import { HORARIOS, emojis, fechaLarga, hhmmLocal, ymdLocal, type View } from '../shared'

type MascotaMin = { id: number; nombre: string; especie: string }

export type Props = {
  rol: string
  nombre: string
  citas: CitaCalendario[]
  mascotas: MascotaMin[]
  cantidadVeterinarios: number
  loading: boolean
  onIr: (v: View) => void
}

const tarjeta: React.CSSProperties = {
  background: 'white', border: '1px solid var(--border)', borderRadius: 20,
}

const rotulo: React.CSSProperties = {
  fontSize: '0.72rem', fontWeight: 700, letterSpacing: 3,
  textTransform: 'uppercase', color: 'var(--teal)', marginBottom: 16,
}

function hhmm(h: number) {
  return `${String(h).padStart(2, '0')}:00`
}

function Metrica({ valor, etiqueta, icono, gradiente, onClick }: {
  valor: string | number
  etiqueta: string
  icono: string
  gradiente: string
  onClick?: () => void
}) {
  return (
    <div onClick={onClick} style={{
      ...tarjeta, padding: '26px 24px', display: 'flex', alignItems: 'center',
      gap: 18, cursor: onClick ? 'pointer' : 'default',
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 15, background: gradiente,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, fontSize: 24,
      }}>{icono}</div>
      <div>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.9rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{valor}</div>
        <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 5 }}>{etiqueta}</div>
      </div>
    </div>
  )
}

function Vacio({ icono, titulo, texto, accion }: {
  icono: string; titulo: string; texto: string
  accion?: { label: string; onClick: () => void }
}) {
  return (
    <div style={{ ...tarjeta, padding: '48px 28px', textAlign: 'center' }}>
      <div style={{ fontSize: 44, marginBottom: 14, opacity: 0.55 }}>{icono}</div>
      <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{titulo}</div>
      <p style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.65, maxWidth: 380, margin: '0 auto' }}>{texto}</p>
      {accion && (
        <button onClick={accion.onClick} style={{
          marginTop: 20, height: 42, padding: '0 24px', borderRadius: 100, border: 'none',
          background: 'linear-gradient(135deg, var(--teal), var(--teal-mid))', color: 'white',
          fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer',
        }}>{accion.label}</button>
      )}
    </div>
  )
}

// A dashboard answers "what do I have to do next", so today's list is rendered
// inline instead of sending the user to the calendar to look it up.
function AgendaDelDia({ citas, mostrarDueno, onVerCalendario }: {
  citas: CitaCalendario[]
  mostrarDueno: boolean
  onVerCalendario: () => void
}) {
  return (
    <div style={{ ...tarjeta, overflow: 'hidden' }}>
      {citas.map((c, i) => {
        const e = estiloEstado(c.estado)
        return (
          <div key={c.id} style={{
            display: 'flex', alignItems: 'center', gap: 18, padding: '16px 24px',
            borderTop: i ? '1px solid var(--border)' : 'none',
            opacity: e.tachado ? 0.6 : 1,
          }}>
            <div style={{
              width: 62, flexShrink: 0, fontFamily: 'Syne, sans-serif',
              fontSize: '1.05rem', fontWeight: 700, color: e.texto,
            }}>{horaCorta(c.hora)}</div>
            <div style={{ width: 4, alignSelf: 'stretch', borderRadius: 4, background: e.borde, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '0.93rem', fontWeight: 500, color: 'var(--text)',
                textDecoration: e.tachado ? 'line-through' : 'none',
              }}>🐾 {c.mascota_nombre || 'Sin mascota'}</div>
              {mostrarDueno && c.cliente_nombre && (
                <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 2 }}>{c.cliente_nombre}</div>
              )}
            </div>
            <span style={{
              background: e.fondo, color: e.texto, border: `1px solid ${e.borde}`,
              fontSize: '0.7rem', fontWeight: 600, padding: '3px 12px', borderRadius: 100, flexShrink: 0,
            }}>{e.etiqueta}</span>
          </div>
        )
      })}
      <button onClick={onVerCalendario} style={{
        width: '100%', padding: '14px', border: 'none', borderTop: '1px solid var(--border)',
        background: 'var(--cream)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
        fontSize: '0.85rem', fontWeight: 500, color: 'var(--teal-dark)',
      }}>Ver calendario completo →</button>
    </div>
  )
}

export default function Home({
  rol, nombre, citas, mascotas, cantidadVeterinarios, loading, onIr,
}: Props) {
  const esCliente = rol === 'cliente'
  const esAdmin = rol === 'admin'
  const hoy = ymdLocal(new Date())
  const ahora = hhmmLocal(new Date())

  // Everything below derives from the three lists already loaded for the other
  // views, so the dashboard costs no extra endpoint.
  const { proximo, proximos, deHoy, estaSemana } = useMemo(() => {
    const conFecha = citas.filter(c => c.fecha)
    const futuras = conFecha
      .filter(c => c.estado === 'confirmado')
      .filter(c => {
        const f = c.fecha!.slice(0, 10)
        if (f !== hoy) return f > hoy
        return horaCorta(c.hora) >= ahora
      })
      .sort((a, b) =>
        (a.fecha!.slice(0, 10) + horaCorta(a.hora))
          .localeCompare(b.fecha!.slice(0, 10) + horaCorta(b.hora)))

    const inicio = new Date()
    inicio.setDate(inicio.getDate() - inicio.getDay() + (inicio.getDay() === 0 ? -6 : 1))
    const fin = new Date(inicio)
    fin.setDate(inicio.getDate() + 6)
    const desde = ymdLocal(inicio)
    const hasta = ymdLocal(fin)

    return {
      proximo: futuras[0] ?? null,
      proximos: futuras.length,
      deHoy: conFecha
        .filter(c => c.fecha!.slice(0, 10) === hoy)
        .sort((a, b) => horaCorta(a.hora).localeCompare(horaCorta(b.hora))),
      estaSemana: conFecha.filter(c => {
        const f = c.fecha!.slice(0, 10)
        return f >= desde && f <= hasta && c.estado === 'confirmado'
      }).length,
    }
  }, [citas, hoy, ahora])

  const saludo = nombre.split(' ')[0] || 'usuario'
  const fechaDeHoy = new Date().toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

      {/* ── Franja de bienvenida ── */}
      <section style={{
        background: 'linear-gradient(135deg, var(--navy) 0%, #1a6b5a 55%, var(--teal) 100%)',
        padding: '38px 40px 42px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 15% 85%, rgba(27,191,160,0.25) 0%, transparent 55%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 40, animation: 'float 3s ease-in-out infinite' }}>🐾</span>
          <div style={{ flex: 1, minWidth: 220 }}>
            <h1 style={{
              fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.6rem,3.2vw,2.2rem)',
              fontWeight: 800, color: 'white', letterSpacing: -1, lineHeight: 1.1,
            }}>Hola, {saludo}</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.92rem', marginTop: 6, textTransform: 'capitalize' }}>
              {fechaDeHoy}
            </p>
          </div>
          {esCliente && (
            <button onClick={() => onIr('chat')} style={{
              display: 'inline-flex', alignItems: 'center', gap: 9, background: 'white',
              color: 'var(--navy)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.92rem',
              fontWeight: 500, padding: '13px 26px', borderRadius: 100, border: 'none',
              cursor: 'pointer', boxShadow: '0 8px 26px rgba(0,0,0,0.2)',
            }}>💬 Agendar un turno</button>
          )}
        </div>
      </section>

      <div style={{ padding: '36px 40px 8px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: 60 }}>
            {[0, 0.2, 0.4].map((d, i) => (
              <span key={i} style={{ width: 8, height: 8, background: 'var(--teal)', borderRadius: '50%', display: 'inline-block', animation: `dot 1.2s ease-in-out ${d}s infinite` }} />
            ))}
          </div>
        ) : esCliente ? (
          <>
            {/* ── Próximo turno ── */}
            <div style={rotulo}>Tu próximo turno</div>
            {proximo ? (
              <div style={{
                ...tarjeta, padding: '30px 32px', display: 'flex', alignItems: 'center',
                gap: 26, flexWrap: 'wrap',
                borderLeft: '5px solid var(--teal)',
              }}>
                <div style={{ minWidth: 92 }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '2.4rem', fontWeight: 800, color: 'var(--teal)', lineHeight: 1 }}>
                    {horaCorta(proximo.hora)}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 6, textTransform: 'capitalize' }}>
                    {fechaLarga(proximo.fecha!)}
                  </div>
                </div>
                <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--border)' }} />
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>
                    🐾 {proximo.mascota_nombre || 'Sin mascota'}
                  </div>
                  {proximo.veterinario_nombre && (
                    <div style={{ fontSize: '0.88rem', color: 'var(--muted)', marginTop: 5 }}>
                      con {proximo.veterinario_nombre}
                    </div>
                  )}
                </div>
                <button onClick={() => onIr('citas')} style={{
                  height: 42, padding: '0 22px', borderRadius: 100,
                  border: '1px solid var(--border)', background: 'var(--cream)',
                  cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.88rem', fontWeight: 500, color: 'var(--teal-dark)',
                }}>Ver en el calendario</button>
              </div>
            ) : (
              <Vacio
                icono="📅"
                titulo="No tenés turnos próximos"
                texto="Pedile al asistente que te agende uno. Escribile «quiero agendar un turno» y te guía paso a paso."
                accion={{ label: '💬 Agendar por chat', onClick: () => onIr('chat') }}
              />
            )}

            {/* ── Métricas ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginTop: 30 }}>
              <Metrica valor={mascotas.length} etiqueta={mascotas.length === 1 ? 'Mascota registrada' : 'Mascotas registradas'}
                icono="🐶" gradiente="linear-gradient(135deg, var(--teal), var(--teal-mid))" onClick={() => onIr('mascotas')} />
              <Metrica valor={proximos} etiqueta={proximos === 1 ? 'Turno próximo' : 'Turnos próximos'}
                icono="📅" gradiente="linear-gradient(135deg, #7C4DFF, #536DFE)" onClick={() => onIr('citas')} />
              <Metrica valor={citas.length} etiqueta="Turnos en tu historial"
                icono="📋" gradiente="linear-gradient(135deg, #FFD54F, #FFB300)" onClick={() => onIr('citas')} />
            </div>

            {/* ── Mascotas ── */}
            {mascotas.length > 0 && (
              <div style={{ marginTop: 42 }}>
                <div style={rotulo}>Tus mascotas</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14 }}>
                  {mascotas.slice(0, 4).map(m => (
                    <div key={m.id} onClick={() => onIr('mascotas')} style={{
                      ...tarjeta, padding: '20px 22px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 14,
                    }}>
                      <span style={{ fontSize: 30 }}>{emojis[m.especie] || '🐾'}</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.98rem', fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.nombre}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--muted)', textTransform: 'capitalize' }}>{m.especie}</div>
                      </div>
                    </div>
                  ))}
                  {mascotas.length > 4 && (
                    <div onClick={() => onIr('mascotas')} style={{
                      ...tarjeta, padding: '20px 22px', cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', color: 'var(--teal-mid)',
                      fontWeight: 500, fontSize: '0.88rem', background: 'var(--teal-light)',
                    }}>+{mascotas.length - 4} más</div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* ── Métricas de personal ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <Metrica valor={deHoy.length} etiqueta={deHoy.length === 1 ? 'Turno hoy' : 'Turnos hoy'}
                icono="📅" gradiente="linear-gradient(135deg, var(--teal), var(--teal-mid))" onClick={() => onIr(esAdmin ? 'admin' : 'citas')} />
              <Metrica valor={estaSemana} etiqueta="Confirmados esta semana"
                icono="🗓️" gradiente="linear-gradient(135deg, #7C4DFF, #536DFE)" onClick={() => onIr(esAdmin ? 'admin' : 'citas')} />
              <Metrica valor={mascotas.length} etiqueta="Mascotas registradas"
                icono="🐶" gradiente="linear-gradient(135deg, #FFD54F, #FFB300)" onClick={() => onIr('mascotas')} />
              {esAdmin && (
                <Metrica valor={cantidadVeterinarios} etiqueta="Veterinarios"
                  icono="👨‍⚕️" gradiente="linear-gradient(135deg, #26C6DA, #00ACC1)" onClick={() => onIr('veterinarios')} />
              )}
            </div>

            {/* ── Agenda de hoy ── */}
            <div style={{ marginTop: 42 }}>
              <div style={rotulo}>
                {esAdmin ? 'Turnos de hoy · toda la clínica' : 'Tu agenda de hoy'}
              </div>
              {deHoy.length > 0 ? (
                <AgendaDelDia citas={deHoy} mostrarDueno onVerCalendario={() => onIr(esAdmin ? 'admin' : 'citas')} />
              ) : (
                <Vacio
                  icono="☕"
                  titulo="No hay turnos para hoy"
                  texto={esAdmin
                    ? 'Ningún cliente tiene turnos agendados para la fecha de hoy.'
                    : 'No tenés turnos asignados para hoy. Revisá el calendario para ver los próximos.'}
                  accion={{ label: 'Ver calendario', onClick: () => onIr(esAdmin ? 'admin' : 'citas') }}
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Horarios de atención ── */}
      <section style={{ padding: '42px 40px 56px' }}>
        <div style={rotulo}>Horarios de atención</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
          <div style={{ ...tarjeta, padding: '26px 24px', display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ width: 52, height: 52, borderRadius: 15, background: 'linear-gradient(135deg, #FFD54F, #FFB300)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 24 }}>☀️</div>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Mañana</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                Lunes a Viernes<br />{hhmm(HORARIOS.mananaDesde)} – {hhmm(HORARIOS.mananaHasta)}
              </div>
            </div>
          </div>
          <div style={{ ...tarjeta, padding: '26px 24px', display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ width: 52, height: 52, borderRadius: 15, background: 'linear-gradient(135deg, #7C4DFF, #536DFE)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 24 }}>🌙</div>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Tarde</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                Lunes a Viernes<br />{hhmm(HORARIOS.tardeDesde)} – {hhmm(HORARIOS.tardeHasta)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ background: 'var(--navy)', padding: '22px 40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginTop: 'auto' }}>
        © 2026 VetFlow — Sistema de turnos veterinarios
      </footer>
    </div>
  )
}
