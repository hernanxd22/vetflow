import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Register() {
  const [form, setForm] = useState({ nombre: '', apellido: '', dni: '', telefono: '', username: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.nombre.trim()) errs.nombre = 'Ingresá tu nombre'
    if (!form.apellido.trim()) errs.apellido = 'Ingresá tu apellido'
    if (!/^\d{7,10}$/.test(form.dni)) errs.dni = 'DNI inválido (7-10 dígitos)'
    if (!form.telefono.trim()) errs.telefono = 'Ingresá tu teléfono'
    if (form.username.trim().length < 3) errs.username = 'Mínimo 3 caracteres'
    if (form.password.length < 6) errs.password = 'Mínimo 6 caracteres'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setApiError('')
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch('https://proyec1-server.bxyea0.easypanel.host/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, nombre: form.nombre.trim(), apellido: form.apellido.trim(), dni: form.dni.trim(), telefono: form.telefono.trim(), username: form.username.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al registrarse')
      setSuccess(true)
    } catch (err: any) {
      setApiError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (field: string) => ({
    padding: '13px 16px', width: '100%',
    border: `1.5px solid ${errors[field] ? 'var(--error)' : 'rgba(15,157,126,0.2)'}`,
    borderRadius: 12, fontFamily: 'DM Sans, sans-serif', fontSize: '0.95rem',
    color: 'var(--text)', background: 'white', outline: 'none',
  } as React.CSSProperties)

  const fieldStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 7 }
  const labelStyle: React.CSSProperties = { fontSize: '0.83rem', fontWeight: 500, color: 'var(--text)' }
  const errStyle: React.CSSProperties = { fontSize: '0.78rem', color: 'var(--error)' }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', minHeight: '100vh' }}>

      {/* Panel izquierdo */}
      <div style={{
        background: 'linear-gradient(160deg, var(--navy) 0%, #1a6b5a 60%, var(--teal) 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '60px 40px', textAlign: 'center',
        position: 'sticky', top: 0, height: '100vh', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 80%, rgba(27,191,160,0.25) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(15,157,126,0.15) 0%, transparent 50%)', pointerEvents: 'none' }} />
        <span style={{ fontSize: 52, marginBottom: 20, display: 'block', animation: 'float 3s ease-in-out infinite', position: 'relative' }}>🐾</span>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '3.2rem', fontWeight: 800, color: 'white', letterSpacing: -2, lineHeight: 1, marginBottom: 16, position: 'relative' }}>VetFlow</div>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem', lineHeight: 1.75, fontWeight: 300, maxWidth: 280, position: 'relative' }}>
          El sistema moderno para gestionar los turnos de tus mascotas.
        </p>
        <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.12)', width: '100%', position: 'relative' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem', marginBottom: 12 }}>¿Ya tenés cuenta?</p>
          <Link to="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            color: 'white', fontSize: '0.9rem', fontWeight: 500,
            padding: '11px 24px', borderRadius: 100, textDecoration: 'none',
          }}>
            Iniciar sesión
          </Link>
        </div>
      </div>

      {/* Panel derecho */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 56px', overflowY: 'auto' }}>
        <div style={{ maxWidth: 480 }}>

          {success ? (
            <div style={{ textAlign: 'center', padding: '48px 32px', background: 'var(--teal-light)', borderRadius: 24, border: '1px solid rgba(15,157,126,0.2)' }}>
              <div style={{ width: 72, height: 72, background: 'var(--teal)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.6rem', fontWeight: 700, marginBottom: 10 }}>¡Cuenta creada!</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: 32, maxWidth: 340, margin: '0 auto 32px' }}>
                Tu cuenta fue creada correctamente. Ahora podés iniciar sesión.
              </p>
              <Link to="/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: 'var(--teal)', color: 'white', fontSize: '0.95rem', fontWeight: 500,
                padding: '14px 32px', borderRadius: 100, textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(15,157,126,0.3)',
              }}>
                Ir al login →
              </Link>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 40 }}>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Crear cuenta</h2>
                <p style={{ color: 'var(--muted)', fontSize: '0.92rem' }}>Completá tus datos para registrarte en VetFlow.</p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }} noValidate>

                <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--teal)', paddingBottom: 10, borderBottom: '1px solid rgba(15,157,126,0.15)' }}>
                  Datos personales
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Nombre</label>
                    <input style={inputStyle('nombre')} type="text" placeholder="Juan" value={form.nombre} onChange={e => set('nombre', e.target.value)} />
                    {errors.nombre && <span style={errStyle}>{errors.nombre}</span>}
                  </div>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Apellido</label>
                    <input style={inputStyle('apellido')} type="text" placeholder="Pérez" value={form.apellido} onChange={e => set('apellido', e.target.value)} />
                    {errors.apellido && <span style={errStyle}>{errors.apellido}</span>}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>DNI</label>
                    <input style={inputStyle('dni')} type="text" placeholder="12345678" value={form.dni} onChange={e => set('dni', e.target.value)} maxLength={10} />
                    {errors.dni && <span style={errStyle}>{errors.dni}</span>}
                  </div>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Teléfono</label>
                    <input style={inputStyle('telefono')} type="tel" placeholder="+54 299 000 0000" value={form.telefono} onChange={e => set('telefono', e.target.value)} />
                    {errors.telefono && <span style={errStyle}>{errors.telefono}</span>}
                  </div>
                </div>

                <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--teal)', paddingBottom: 10, borderBottom: '1px solid rgba(15,157,126,0.15)', marginTop: 4 }}>
                  Datos de acceso
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Nombre de usuario</label>
                  <input style={inputStyle('username')} type="text" placeholder="juanperez123" value={form.username} onChange={e => set('username', e.target.value)} />
                  {errors.username && <span style={errStyle}>{errors.username}</span>}
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Contraseña</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPw ? 'text' : 'password'} placeholder="Mínimo 6 caracteres"
                      value={form.password} onChange={e => set('password', e.target.value)}
                      style={{ ...inputStyle('password'), paddingRight: 48 }}
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {showPw
                          ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                          : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                        }
                      </svg>
                    </button>
                  </div>
                  {errors.password && <span style={errStyle}>{errors.password}</span>}
                </div>

                {apiError && (
                  <div style={{ background: '#fff5f5', border: '1px solid rgba(229,62,62,0.25)', borderRadius: 12, padding: '13px 16px', fontSize: '0.88rem', color: 'var(--error)' }}>
                    {apiError}
                  </div>
                )}

                <button type="submit" disabled={loading} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-mid) 100%)',
                  color: 'white', fontFamily: 'DM Sans, sans-serif', fontSize: '1rem', fontWeight: 500,
                  padding: '15px 28px', borderRadius: 100, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1, boxShadow: '0 8px 28px rgba(15,157,126,0.32)', marginTop: 4,
                }}>
                  {loading ? 'Registrando...' : 'Crear cuenta'}
                </button>

              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}