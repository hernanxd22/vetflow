import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL || 'https://proyec1-server.bxyea0.easypanel.host/api'

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  function validate() {
    const errs: Record<string, string> = {}
    if (!username.trim()) errs.username = 'Ingresá tu usuario'
    if (!password) errs.password = 'Ingresá tu contraseña'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setApiError('')
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión')
      sessionStorage.setItem('cliente_id', data.cliente_id)
      sessionStorage.setItem('nombre', data.nombre)
      sessionStorage.setItem('apellido', data.apellido)
      sessionStorage.setItem('dni', data.dni)
      sessionStorage.setItem('rol', data.rol)
      navigate('/inicio')
    } catch (err: any) {
      setApiError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', minHeight: '100vh' }}>

      {/* Panel izquierdo */}
      <div style={{
        background: 'linear-gradient(160deg, var(--navy) 0%, #1a6b5a 60%, var(--teal) 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '60px 40px', textAlign: 'center',
        position: 'sticky', top: 0, height: '100vh', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 20% 80%, rgba(27,191,160,0.25) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(15,157,126,0.15) 0%, transparent 50%)',
          pointerEvents: 'none',
        }} />
        <span style={{ fontSize: 52, marginBottom: 20, display: 'block', animation: 'float 3s ease-in-out infinite', position: 'relative' }}>🐾</span>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '3.2rem', fontWeight: 800, color: 'white', letterSpacing: -2, lineHeight: 1, marginBottom: 16, position: 'relative' }}>VetFlow</div>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem', lineHeight: 1.75, fontWeight: 300, maxWidth: 280, position: 'relative' }}>
          Bienvenido de vuelta. Gestioná los turnos de tus mascotas desde un solo lugar.
        </p>
        <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.12)', width: '100%', position: 'relative' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem', marginBottom: 12 }}>¿No tenés cuenta?</p>
          <Link to="/registro" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            color: 'white', fontSize: '0.9rem', fontWeight: 500,
            padding: '11px 24px', borderRadius: 100, textDecoration: 'none',
          }}>
            Crear cuenta
          </Link>
        </div>
      </div>

      {/* Panel derecho */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', padding: '60px 56px' }}>
        <div style={{ maxWidth: 420, width: '100%' }}>
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Iniciar sesión</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.92rem' }}>Ingresá con tu usuario y contraseña</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }} noValidate>

            {/* Username */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <label style={{ fontSize: '0.83rem', fontWeight: 500 }}>Nombre de usuario</label>
              <input
                type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="juanperez123"
                style={{
                  padding: '13px 16px', border: `1.5px solid ${errors.username ? 'var(--error)' : 'rgba(15,157,126,0.2)'}`,
                  borderRadius: 12, fontFamily: 'DM Sans, sans-serif', fontSize: '0.95rem',
                  color: 'var(--text)', background: 'white', outline: 'none',
                }}
              />
              {errors.username && <span style={{ fontSize: '0.78rem', color: 'var(--error)' }}>{errors.username}</span>}
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <label style={{ fontSize: '0.83rem', fontWeight: 500 }}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  style={{
                    padding: '13px 48px 13px 16px', width: '100%',
                    border: `1.5px solid ${errors.password ? 'var(--error)' : 'rgba(15,157,126,0.2)'}`,
                    borderRadius: 12, fontFamily: 'DM Sans, sans-serif', fontSize: '0.95rem',
                    color: 'var(--text)', background: 'white', outline: 'none',
                  }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)',
                  display: 'flex', alignItems: 'center',
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {showPw
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                    }
                  </svg>
                </button>
              </div>
              {errors.password && <span style={{ fontSize: '0.78rem', color: 'var(--error)' }}>{errors.password}</span>}
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
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}