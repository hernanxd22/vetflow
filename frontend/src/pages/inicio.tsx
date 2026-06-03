import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const API = 'https://proyec1-server.bxyea0.easypanel.host/api'

// ─── Types ───────────────────────────────────────────────
type Mascota = {
  id: number; nombre: string; especie: string; raza?: string
  fecha_nacimiento?: string; peso?: number; notas_medicas?: string
}
type ChatMsg = { role: 'user' | 'bot'; text: string }
type View = 'home' | 'registrar' | 'mascotas' | 'chat'

// ─── Emoji helper ─────────────────────────────────────────
const emojis: Record<string, string> = { perro: '🐶', gato: '🐱', conejo: '🐰', pajaro: '🐦', hamster: '🐹', otro: '🐾' }

// ─── Loading dots ─────────────────────────────────────────
function LoadingDots() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: 48 }}>
      {[0, 0.2, 0.4].map((delay, i) => (
        <span key={i} style={{ width: 8, height: 8, background: 'var(--teal)', borderRadius: '50%', display: 'inline-block', animation: `dot 1.2s ease-in-out ${delay}s infinite` }} />
      ))}
    </div>
  )
}

// ─── Chat bubble ──────────────────────────────────────────
function ChatBubble({ msg }: { msg: ChatMsg }) {
  const isBot = msg.role === 'bot'
  return (
    <div style={{ display: 'flex', justifyContent: isBot ? 'flex-start' : 'flex-end', marginBottom: 10 }}>
      <div style={{
        maxWidth: '78%', padding: '10px 14px', borderRadius: isBot ? '4px 18px 18px 18px' : '18px 4px 18px 18px',
        background: isBot ? 'var(--teal-light)' : 'var(--teal)',
        color: isBot ? 'var(--text)' : 'white', fontSize: '0.9rem', lineHeight: 1.5,
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
      }}>
        {msg.text}
      </div>
    </div>
  )
}

// ─── Chat widget ──────────────────────────────────────────
function ChatWidget({ clienteId, nombre }: { clienteId: string; nombre: string }) {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<ChatMsg[]>([{ role: 'bot', text: `¡Hola ${nombre}! 🐾 ¿En qué puedo ayudarte hoy? Podés pedirme agendar, reprogramar o cancelar un turno.` }])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, typing])

  async function sendMsg() {
    const text = input.trim()
    if (!text) return
    setInput('')
    setMsgs(m => [...m, { role: 'user', text }])
    setTyping(true)
    try {
      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente_id: clienteId, mensaje: text }),
      })
      const data = await res.json()
      setMsgs(m => [...m, { role: 'bot', text: data.respuesta || 'No pude procesar tu mensaje. Intentá de nuevo.' }])
    } catch {
      setMsgs(m => [...m, { role: 'bot', text: 'Hubo un error de conexión. Intentá de nuevo.' }])
    } finally {
      setTyping(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg() }
  }

  return (
    <>
      {/* Burbuja flotante */}
      <button onClick={() => setOpen(!open)} style={{
        position: 'fixed', bottom: 28, right: 28, width: 58, height: 58,
        borderRadius: '50%', background: 'linear-gradient(135deg, var(--teal), var(--teal-mid))',
        border: 'none', cursor: 'pointer', boxShadow: '0 8px 28px rgba(15,157,126,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        transition: 'transform 0.2s', fontSize: 24,
      }}>
        {open ? '✕' : '🐾'}
      </button>

      {/* Ventana del chat */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 100, right: 28, width: 340,
          background: 'white', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column', zIndex: 999, overflow: 'hidden',
          border: '1px solid var(--border)',
        }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, var(--navy), #1a5a4a)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>🐾</span>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>Asistente VetFlow</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>Turnos veterinarios · 24/7</div>
            </div>
            <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 6px #4ADE80' }} />
          </div>

          {/* Mensajes */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', minHeight: 260, maxHeight: 340 }}>
            {msgs.map((m, i) => <ChatBubble key={i} msg={m} />)}
            {typing && (
              <div style={{ display: 'flex', gap: 5, padding: '10px 14px', alignItems: 'center' }}>
                {[0, 0.15, 0.3].map((d, i) => (
                  <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--teal)', display: 'inline-block', animation: `dot 1s ease-in-out ${d}s infinite` }} />
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
            <input
              value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
              placeholder="Escribí tu mensaje..."
              style={{
                flex: 1, padding: '10px 14px', border: '1.5px solid rgba(15,157,126,0.2)',
                borderRadius: 100, fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem',
                color: 'var(--text)', outline: 'none', background: 'var(--cream)',
              }}
            />
            <button onClick={sendMsg} style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--teal), var(--teal-mid))',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, boxShadow: '0 4px 12px rgba(15,157,126,0.3)',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Main component ───────────────────────────────────────
export default function Inicio() {
  const navigate = useNavigate()
  const clienteId = sessionStorage.getItem('cliente_id') || ''
  const nombre = sessionStorage.getItem('nombre') || ''
  const apellido = sessionStorage.getItem('apellido') || ''

  useEffect(() => { if (!clienteId) navigate('/login') }, [clienteId, navigate])

  const [view, setView] = useState<View>('home')
  const [mascotas, setMascotas] = useState<Mascota[]>([])
  const [loadingMascotas, setLoadingMascotas] = useState(false)

  // Form mascota
  const [mNombre, setMNombre] = useState('')
  const [mEspecie, setMEspecie] = useState('')
  const [mRaza, setMRaza] = useState('')
  const [mFecha, setMFecha] = useState('')
  const [mPeso, setMPeso] = useState('')
  const [mNotas, setMNotas] = useState('')
  const [formMsg, setFormMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)
  const [saving, setSaving] = useState(false)

  // Chat view state
  const [msgs2, setMsgs2] = useState<ChatMsg[]>([{ role: 'bot', text: `¡Hola ${nombre.split(' ')[0] || 'usuario'}! 🐾 ¿En qué puedo ayudarte hoy? Podés pedirme agendar, reprogramar o cancelar un turno.` }])
  const [input2, setInput2] = useState('')
  const [typing2, setTyping2] = useState(false)
  const bottomRef2 = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef2.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs2, typing2])

  async function sendMsg2() {
    const text = input2.trim()
    if (!text) return
    setInput2('')
    setMsgs2(m => [...m, { role: 'user', text }])
    setTyping2(true)
    try {
      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente_id: clienteId, mensaje: text }),
      })
      const data = await res.json()
      setMsgs2(m => [...m, { role: 'bot', text: data.respuesta || 'No pude procesar tu mensaje. Intentá de nuevo.' }])
    } catch {
      setMsgs2(m => [...m, { role: 'bot', text: 'Hubo un error de conexión. Intentá de nuevo.' }])
    } finally {
      setTyping2(false)
    }
  }

  function handleKey2(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg2() }
  }

  async function cargarMascotas() {
    setLoadingMascotas(true)
    try {
      const res = await fetch(`${API}/mascotas?cliente_id=${clienteId}`)
      const data = await res.json()
      setMascotas(Array.isArray(data) ? data : [])
    } catch { setMascotas([]) }
    finally { setLoadingMascotas(false) }
  }

  function switchView(v: View) {
    setView(v)
    if (v === 'mascotas') cargarMascotas()
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault()
    setFormMsg(null)
    if (!mNombre.trim() || !mEspecie) { setFormMsg({ type: 'error', text: 'El nombre y la especie son obligatorios.' }); return }
    setSaving(true)
    try {
      const res = await fetch(`${API}/mascotas?cliente_id=${clienteId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
        nombre: mNombre.trim(), 
        especie: mEspecie, 
        raza: mRaza || null, 
        fecha_nacimiento: mFecha || null, 
        peso: mPeso ? parseFloat(mPeso) : null, 
        notas_medicas: mNotas || null 
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al guardar')
      setFormMsg({ type: 'ok', text: '¡Mascota registrada correctamente!' })
      setMNombre(''); setMEspecie(''); setMRaza(''); setMFecha(''); setMPeso(''); setMNotas('')
    } catch (err: any) {
      setFormMsg({ type: 'error', text: err.message })
    } finally { setSaving(false) }
  }

  function logout() { sessionStorage.clear(); navigate('/login') }

  const navBtn = (id: View, label: string, icon: React.ReactNode) => (
    <button onClick={() => switchView(id)} style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
      borderRadius: 12, cursor: 'pointer', color: view === id ? 'var(--teal-mid)' : 'rgba(255,255,255,0.6)',
      fontSize: '0.9rem', fontWeight: view === id ? 500 : 400, marginBottom: 2,
      border: 'none', background: view === id ? 'rgba(27,191,160,0.2)' : 'none', width: '100%', textAlign: 'left',
    }}>
      {icon}{label}
    </button>
  )

  const inputStyle: React.CSSProperties = {
    padding: '13px 16px', border: '1.5px solid rgba(15,157,126,0.2)', borderRadius: 12,
    fontFamily: 'DM Sans, sans-serif', fontSize: '0.93rem', color: 'var(--text)',
    background: 'var(--cream)', outline: 'none', width: '100%',
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 260, minHeight: '100vh',
        background: 'linear-gradient(170deg, var(--navy) 0%, #0f4d3a 100%)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 200,
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 10% 90%, rgba(27,191,160,0.18) 0%, transparent 60%)', pointerEvents: 'none' }} />

        {/* Brand */}
        <div style={{ padding: '28px 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 26 }}>🐾</span>
            <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.4rem', fontWeight: 800, color: 'white', letterSpacing: -1 }}>VetFlow</span>
          </div>
        </div>

        {/* User */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'relative' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '1.8px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 5 }}>Bienvenido</div>
          <div style={{ fontSize: '1rem', fontWeight: 500, color: 'white' }}>{[nombre, apellido].filter(Boolean).join(' ') || 'Usuario'}</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', position: 'relative' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', padding: '8px 12px 6px' }}>Menú</div>
          {navBtn('home', 'Inicio', <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>)}
          {navBtn('registrar', 'Registrar mascota', <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>)}
          {navBtn('mascotas', 'Mis mascotas', <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>)}
          {navBtn('chat', 'Turnos / Chat', <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>)}
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.07)', position: 'relative' }}>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', border: 'none', background: 'none', width: '100%' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ marginLeft: 260, flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* HOME */}
        {view === 'home' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <section style={{
              minHeight: '100vh', background: 'linear-gradient(135deg, var(--navy) 0%, #1a6b5a 50%, var(--teal) 100%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              textAlign: 'center', padding: '80px 48px 100px', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 80%, rgba(27,191,160,0.2) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(15,157,126,0.15) 0%, transparent 50%)', pointerEvents: 'none' }} />
              <div style={{ fontSize: 48, marginBottom: 16, animation: 'float 3s ease-in-out infinite', position: 'relative' }}>🐾</div>
              <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.9)', fontSize: '0.8rem', fontWeight: 500, padding: '6px 18px', borderRadius: 100, marginBottom: 28, position: 'relative' }}>
                Sistema de turnos veterinarios
              </div>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(3rem,7vw,5.5rem)', fontWeight: 800, color: 'white', letterSpacing: -3, lineHeight: 1, marginBottom: 20, position: 'relative' }}>VetFlow</h1>
              <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.72)', maxWidth: 460, lineHeight: 1.75, fontWeight: 300, marginBottom: 36, position: 'relative' }}>
                Hola, <span style={{ color: 'var(--teal-mid)', fontWeight: 500 }}>{nombre.split(' ')[0] || 'usuario'}</span>. Gestioná los turnos de tus mascotas en segundos.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', position: 'relative' }}>
                <button onClick={() => switchView('registrar')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: 'var(--navy)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.95rem', fontWeight: 500, padding: '14px 30px', borderRadius: 100, border: 'none', cursor: 'pointer', boxShadow: '0 8px 28px rgba(0,0,0,0.18)' }}>
                  + Registrar mascota
                </button>
              </div>
            </section>

            <section style={{ padding: '96px 48px', background: 'var(--cream)' }}>
              <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--teal)', marginBottom: 14 }}>Nuestros servicios</p>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.7rem,3.5vw,2.4rem)', fontWeight: 700, color: 'var(--text)', marginBottom: 52, letterSpacing: -1 }}>Todo lo que tu mascota necesita</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 22 }}>
                  {[
                    { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>, title: 'Consultas veterinarias', desc: 'Atención médica completa y personalizada para todas tus mascotas.' },
                    { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, title: 'Vacunación segura', desc: 'Protocolos actualizados para mantener la salud de tu mascota protegida.' },
                    { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>, title: 'Peluquería y baño', desc: 'Servicios de estética profesional para que tu mascota luzca genial.' },
                  ].map((s, i) => (
                    <div key={i} style={{ background: 'white', border: '1px solid rgba(15,157,126,0.1)', borderRadius: 20, padding: '36px 28px' }}>
                      <div style={{ width: 50, height: 50, background: 'var(--teal-light)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22, color: 'var(--teal)' }}>
                        <div style={{ width: 22, height: 22 }}>{s.icon}</div>
                      </div>
                      <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>{s.title}</h3>
                      <p style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.7 }}>{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <footer style={{ background: 'var(--navy)', padding: '24px 48px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
              © 2026 VetFlow — Sistema de turnos veterinarios
            </footer>
          </div>
        )}

        {/* REGISTRAR */}
        {view === 'registrar' && (
          <div style={{ padding: '48px 40px' }}>
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Registrar mascota</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>Completá los datos de tu mascota para agregarla a tu cuenta</p>
            </div>
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 24, padding: 40, maxWidth: 540 }}>
              <form onSubmit={handleGuardar} style={{ display: 'flex', flexDirection: 'column', gap: 20 }} noValidate>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 500 }}>Nombre de la mascota</label>
                  <input style={inputStyle} type="text" placeholder="Rex, Luna, Simba..." value={mNombre} onChange={e => setMNombre(e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 500 }}>Especie</label>
                    <select style={inputStyle} value={mEspecie} onChange={e => setMEspecie(e.target.value)}>
                      <option value="">Seleccioná</option>
                      <option value="perro">🐶 Perro</option>
                      <option value="gato">🐱 Gato</option>
                      <option value="conejo">🐰 Conejo</option>
                      <option value="pajaro">🐦 Pájaro</option>
                      <option value="hamster">🐹 Hámster</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 500 }}>Raza</label>
                    <input style={inputStyle} type="text" placeholder="Opcional" value={mRaza} onChange={e => setMRaza(e.target.value)} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 500 }}>Fecha de nacimiento</label>
                    <input style={inputStyle} type="date" value={mFecha} onChange={e => setMFecha(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 500 }}>Peso (kg)</label>
                    <input style={inputStyle} type="number" placeholder="0.0" step="0.1" min="0" value={mPeso} onChange={e => setMPeso(e.target.value)} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 500 }}>Notas médicas</label>
                  <input style={inputStyle} type="text" placeholder="Alergias, condiciones especiales... (opcional)" value={mNotas} onChange={e => setMNotas(e.target.value)} />
                </div>
                {formMsg && (
                  <div style={{ borderRadius: 12, padding: '12px 16px', fontSize: '0.85rem', background: formMsg.type === 'ok' ? 'var(--teal-light)' : '#fff5f5', border: `1px solid ${formMsg.type === 'ok' ? 'rgba(15,157,126,0.2)' : 'rgba(229,62,62,0.25)'}`, color: formMsg.type === 'ok' ? 'var(--teal-dark)' : 'var(--error)' }}>
                    {formMsg.text}
                  </div>
                )}
                <button type="submit" disabled={saving} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-mid) 100%)', color: 'white', fontFamily: 'DM Sans, sans-serif', fontSize: '0.95rem', fontWeight: 500, padding: 15, borderRadius: 100, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, boxShadow: '0 6px 24px rgba(15,157,126,0.3)', marginTop: 4 }}>
                  {saving ? 'Guardando...' : 'Guardar mascota'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MIS MASCOTAS */}
        {view === 'mascotas' && (
          <div style={{ padding: '48px 40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Mis mascotas</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>Todas tus mascotas registradas</p>
              </div>
              <button onClick={() => switchView('registrar')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-mid) 100%)', color: 'white', fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', fontWeight: 500, padding: '10px 20px', borderRadius: 100, border: 'none', cursor: 'pointer', boxShadow: '0 6px 20px rgba(15,157,126,0.28)' }}>
                + Agregar
              </button>
            </div>
            {loadingMascotas ? <LoadingDots /> : mascotas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '72px 24px', color: 'var(--muted)' }}>
                <span style={{ fontSize: 60, marginBottom: 18, display: 'block', opacity: 0.5 }}>🐾</span>
                <h4 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Todavía no tenés mascotas registradas</h4>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 24 }}>Registrá tu primera mascota para empezar a agendar turnos.</p>
                <button onClick={() => switchView('registrar')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-mid) 100%)', color: 'white', fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', fontWeight: 500, padding: '10px 20px', borderRadius: 100, border: 'none', cursor: 'pointer' }}>+ Registrar mascota</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
                {mascotas.map((m) => (
                  <div key={m.id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 20, padding: '28px 24px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--teal), var(--teal-mid))' }} />
                    <span style={{ fontSize: 36, marginBottom: 14, display: 'block' }}>{emojis[m.especie] || '🐾'}</span>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{m.nombre}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--teal)', fontWeight: 500, textTransform: 'capitalize', background: 'var(--teal-light)', display: 'inline-block', padding: '3px 10px', borderRadius: 100, marginBottom: 12 }}>{m.especie || 'mascota'}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.8 }}>
                      {m.raza && <div><strong style={{ color: 'var(--text)', fontWeight: 500 }}>Raza:</strong> {m.raza}</div>}
                      {m.fecha_nacimiento && <div><strong style={{ color: 'var(--text)', fontWeight: 500 }}>Nacimiento:</strong> {new Date(m.fecha_nacimiento).toLocaleDateString('es-AR')}</div>}
                      {m.peso && <div><strong style={{ color: 'var(--text)', fontWeight: 500 }}>Peso:</strong> {m.peso} kg</div>}
                      {m.notas_medicas && <div><strong style={{ color: 'var(--text)', fontWeight: 500 }}>Notas:</strong> {m.notas_medicas}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CHAT */}
        {view === 'chat' && (
          <div style={{ padding: '48px 40px' }}>
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Turnos / Chat</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>Hablá con nuestro asistente para agendar, reprogramar o cancelar turnos</p>
            </div>
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 24, maxWidth: 680, overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ background: 'linear-gradient(135deg, var(--navy), #1a5a4a)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 28 }}>🐾</span>
                <div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>Asistente VetFlow</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>Turnos · 24/7</div>
                </div>
                <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 6px #4ADE80', animation: 'pulse 2s infinite' }} />
              </div>
              {/* Mensajes */}
              <div style={{ minHeight: 400, maxHeight: 480, overflowY: 'auto', padding: '16px 14px' }}>
                {msgs2.map((m, i) => <ChatBubble key={i} msg={m} />)}
                {typing2 && (
                  <div style={{ display: 'flex', gap: 5, padding: '10px 14px', alignItems: 'center' }}>
                    {[0, 0.15, 0.3].map((d, i) => (
                      <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--teal)', display: 'inline-block', animation: `dot 1s ease-in-out ${d}s infinite` }} />
                    ))}
                  </div>
                )}
                <div ref={bottomRef2} />
              </div>
              {/* Input */}
              <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
                <input
                  value={input2} onChange={e => setInput2(e.target.value)} onKeyDown={handleKey2}
                  placeholder="Escribí tu mensaje..."
                  style={{
                    flex: 1, padding: '10px 14px', border: '1.5px solid rgba(15,157,126,0.2)',
                    borderRadius: 100, fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem',
                    color: 'var(--text)', outline: 'none', background: 'var(--cream)',
                  }}
                />
                <button onClick={sendMsg2} style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--teal), var(--teal-mid))',
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, boxShadow: '0 4px 12px rgba(15,157,126,0.3)',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Chat widget flotante */}
      {view !== 'chat' && <ChatWidget clienteId={clienteId} nombre={nombre.split(' ')[0] || 'usuario'} />}
    </div>
  )
}