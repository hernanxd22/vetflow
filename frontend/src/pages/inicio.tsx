import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Calendario from '../components/Calendario'
import type { CitaCalendario } from '../components/citas'

const API = import.meta.env.VITE_API_URL || 'https://proyec1-server.bxyea0.easypanel.host/api'

// ─── Auth ─────────────────────────────────────────────────
function getToken(): string {
  return sessionStorage.getItem('access_token') || ''
}

// Builds the headers every authenticated request needs.
function authHeaders(withJson = false): Record<string, string> {
  const headers: Record<string, string> = {}
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (withJson) headers['Content-Type'] = 'application/json'
  return headers
}

// Sends the user back to the login screen when the session is no longer valid.
function sesionExpirada(res: Response): boolean {
  if (res.status === 401) {
    sessionStorage.clear()
    window.location.href = '/login'
    return true
  }
  return false
}

// ─── Types ───────────────────────────────────────────────
type Mascota = {
  id: number; nombre: string; especie: string; raza?: string
  fecha_nacimiento?: string; peso?: number; notas_medicas?: string
}
type ChatMsg = { role: 'user' | 'bot'; text: string }
type View = 'home' | 'registrar' | 'mascotas' | 'chat' | 'citas' | 'admin' | 'historial' | 'veterinarios'

// ─── Fechas ───────────────────────────────────────────────
// Local calendar date as YYYY-MM-DD. toISOString() reports UTC, so in Argentina
// (UTC-3) anything after 21:00 is already reported as the next day and every
// date comparison built on it shifts by one.
function ymdLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

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
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)', whiteSpace: 'pre-line',
      }}>
        {msg.text}
      </div>
    </div>
  )
}

// ─── Chat widget ──────────────────────────────────────────
function ChatWidget({ nombre }: { nombre: string }) {
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
        headers: authHeaders(true),
        body: JSON.stringify({ mensaje: text }),
      })
      if (sesionExpirada(res)) return
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
  const rol = sessionStorage.getItem('rol') || ''

  useEffect(() => { if (!clienteId || !getToken()) navigate('/login') }, [clienteId, navigate])

  const [view, setView] = useState<View>('home')
  const [mascotas, setMascotas] = useState<Mascota[]>([])
  const [mascotaSearch, setMascotaSearch] = useState('')
  const [loadingMascotas, setLoadingMascotas] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ nombre: '', especie: '', raza: '', fecha_nacimiento: '', peso: '', notas_medicas: '' })
  const [editMsg, setEditMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)
  const [editSaving, setEditSaving] = useState(false)

  // Form mascota
  const [mNombre, setMNombre] = useState('')
  const [mEspecie, setMEspecie] = useState('')
  const [mRaza, setMRaza] = useState('')
  const [mFecha, setMFecha] = useState('')
  const [mPeso, setMPeso] = useState('')
  const [mNotas, setMNotas] = useState('')
  const [formMsg, setFormMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)
  const [saving, setSaving] = useState(false)

  // Citas
  const [citas, setCitas] = useState<CitaCalendario[]>([])
  const [citasError, setCitasError] = useState<string | null>(null)
  const [loadingCitas, setLoadingCitas] = useState(false)
  const [citasFiltroTexto, setCitasFiltroTexto] = useState('')
  const [citasFiltroEstado, setCitasFiltroEstado] = useState('todas')
  const [citasFiltroFecha, setCitasFiltroFecha] = useState('todas')

  // Historial
  type HistorialRegistro = { id: number; mascota_id: number; fecha: string; tipo: string; descripcion: string; diagnostico?: string; tratamiento?: string; notas?: string }
  const [historialMascotaId, setHistorialMascotaId] = useState<number | null>(null)
  const [historialMascotaNombre, setHistorialMascotaNombre] = useState('')
  const [historialData, setHistorialData] = useState<HistorialRegistro[]>([])
  const [loadingHistorial, setLoadingHistorial] = useState(false)
  const [historialView, setHistorialView] = useState<'list' | 'detail' | 'form'>('list')
  const [historialSelected, setHistorialSelected] = useState<HistorialRegistro | null>(null)
  const [hTipo, setHTipo] = useState('consulta')
  const [hFecha, setHFecha] = useState(() => new Date().toISOString().split('T')[0])
  const [hDescripcion, setHDescripcion] = useState('')
  const [hDiagnostico, setHDiagnostico] = useState('')
  const [hTratamiento, setHTratamiento] = useState('')
  const [hNotas, setHNotas] = useState('')
  const [hMsg, setHMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)
  const [hSaving, setHSaving] = useState(false)

  // Chat view state
  const [msgs2, setMsgs2] = useState<ChatMsg[]>([{ role: 'bot', text: `¡Hola ${nombre.split(' ')[0] || 'usuario'}! 🐾 ¿En qué puedo ayudarte hoy? Podés pedirme agendar, reprogramar o cancelar un turno.` }])
  const [input2, setInput2] = useState('')
  const [typing2, setTyping2] = useState(false)
  const bottomRef2 = useRef<HTMLDivElement>(null)

  // Veterinarios
  type Veterinario = { id: number; nombre: string; apellido: string; dni: string; telefono: string | null; username: string; estado: string }
  const [veterinarios, setVeterinarios] = useState<Veterinario[]>([])
  const [loadingVeterinarios, setLoadingVeterinarios] = useState(false)
  const [vetSearch, setVetSearch] = useState('')
  const [editingVetId, setEditingVetId] = useState<number | null>(null)
  const [vetEditForm, setVetEditForm] = useState({ telefono: '', estado: 'activo' })
  const [vetEditMsg, setVetEditMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)
  const [vetSaving, setVetSaving] = useState(false)

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
        headers: authHeaders(true),
        body: JSON.stringify({ mensaje: text }),
      })
      if (sesionExpirada(res)) return
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
      const url = (rol === 'veterinario' || rol === 'admin')
        ? `${API}/mascotas/todas`
        : `${API}/mascotas/`
      const res = await fetch(url, { headers: authHeaders() })
      if (sesionExpirada(res)) return
      const data = await res.json()
      setMascotas(Array.isArray(data) ? data : [])
    } catch { setMascotas([]) }
    finally { setLoadingMascotas(false) }
  }

  function startEdit(m: Mascota) {
    setEditForm({
      nombre: m.nombre,
      especie: m.especie,
      raza: m.raza || '',
      fecha_nacimiento: m.fecha_nacimiento || '',
      peso: m.peso ? String(m.peso) : '',
      notas_medicas: m.notas_medicas || '',
    })
    setEditingId(m.id)
    setEditMsg(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditMsg(null)
  }

  async function saveEdit(mascotaId: number) {
    setEditMsg(null)
    if (!editForm.nombre.trim() || !editForm.especie) {
      setEditMsg({ type: 'error', text: 'El nombre y la especie son obligatorios.' })
      return
    }
    setEditSaving(true)
    try {
      const res = await fetch(`${API}/mascotas/${mascotaId}`, {
        method: 'PATCH',
        headers: authHeaders(true),
        body: JSON.stringify({
          nombre: editForm.nombre.trim(),
          especie: editForm.especie,
          raza: editForm.raza || null,
          fecha_nacimiento: editForm.fecha_nacimiento || null,
          peso: editForm.peso ? parseFloat(editForm.peso) : null,
          notas_medicas: editForm.notas_medicas || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al guardar')
      setEditMsg({ type: 'ok', text: 'Mascota actualizada' })
      setEditingId(null)
      cargarMascotas()
    } catch (err: any) {
      setEditMsg({ type: 'error', text: err.message })
    } finally { setEditSaving(false) }
  }

  async function cargarCitas() {
    setLoadingCitas(true)
    setCitasError(null)
    try {
      const url = rol === 'cliente'
        ? `${API}/citas/`
        : rol === 'veterinario'
        ? `${API}/citas/mis-citas-vet`
        : `${API}/citas/admin`
      const res = await fetch(url, { headers: authHeaders() })
      if (sesionExpirada(res)) return
      // A failed response used to fall through to an empty array, which showed
      // "no hay citas" while the request had actually errored. Surface it.
      if (!res.ok) throw new Error(`El servidor respondió ${res.status}.`)
      const data = await res.json()
      if (!Array.isArray(data)) throw new Error('El servidor devolvió una respuesta inesperada.')
      setCitas(data)
    } catch (err) {
      setCitas([])
      setCitasError(err instanceof Error ? err.message : 'No se pudieron cargar las citas.')
    }
    finally { setLoadingCitas(false) }
  }

  // Single source of truth for the historial filters. The counter and the table
  // used to run two hand-copied versions of this, which is how one of them ended
  // up querying a field the client response never carries.
  function citasFiltradas(): CitaCalendario[] {
    const texto = citasFiltroTexto.trim().toLowerCase()
    const hoy = ymdLocal(new Date())
    return citas.filter(c => {
      if (texto) {
        const campos = [c.mascota_nombre, c.cliente_nombre, c.veterinario_nombre]
          .filter(Boolean).join(' ').toLowerCase()
        if (!campos.includes(texto)) return false
      }
      if (citasFiltroEstado !== 'todas' && c.estado !== citasFiltroEstado) return false
      if (citasFiltroFecha === 'todas') return true

      const fecha = c.fecha?.slice(0, 10)
      if (!fecha) return false
      if (citasFiltroFecha === 'hoy') return fecha === hoy
      if (citasFiltroFecha === 'futuras') return fecha >= hoy
      if (citasFiltroFecha === 'pasadas') return fecha < hoy

      const d = new Date(fecha + 'T00:00:00')
      const ahora = new Date()
      if (citasFiltroFecha === 'semana') {
        const inicio = new Date(ahora)
        inicio.setDate(ahora.getDate() - ahora.getDay() + (ahora.getDay() === 0 ? -6 : 1))
        inicio.setHours(0, 0, 0, 0)
        const fin = new Date(inicio)
        fin.setDate(inicio.getDate() + 6)
        fin.setHours(23, 59, 59, 999)
        return d >= inicio && d <= fin
      }
      if (citasFiltroFecha === 'mes') {
        return d.getMonth() === ahora.getMonth() && d.getFullYear() === ahora.getFullYear()
      }
      return true
    })
  }

  async function cargarVeterinarios() {
    setLoadingVeterinarios(true)
    try {
      const res = await fetch(`${API}/veterinarios/`, { headers: authHeaders() })
      if (sesionExpirada(res)) return
      const data = await res.json()
      setVeterinarios(Array.isArray(data) ? data : [])
    } catch { setVeterinarios([]) }
    finally { setLoadingVeterinarios(false) }
  }

  function startEditVet(v: Veterinario) {
    setEditingVetId(v.id)
    setVetEditForm({ telefono: v.telefono || '', estado: v.estado })
    setVetEditMsg(null)
  }

  function cancelEditVet() {
    setEditingVetId(null)
    setVetEditMsg(null)
  }

  async function saveEditVet(vetId: number) {
    setVetSaving(true)
    setVetEditMsg(null)
    try {
      const res = await fetch(`${API}/veterinarios/${vetId}`, {
        method: 'PATCH',
        headers: authHeaders(true),
        body: JSON.stringify({
          telefono: vetEditForm.telefono || null,
          estado: vetEditForm.estado,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Error al guardar')
      setVetEditMsg({ type: 'ok', text: 'Veterinario actualizado' })
      setEditingVetId(null)
      cargarVeterinarios()
    } catch (err: any) {
      setVetEditMsg({ type: 'error', text: err.message })
    } finally { setVetSaving(false) }
  }


  function abrirHistorial(mascotaId: number, mascotaNombre: string) {
    setHistorialMascotaId(mascotaId)
    setHistorialMascotaNombre(mascotaNombre)
    setHistorialView('list')
    setHistorialSelected(null)
    setView('historial')
    cargarHistorialData(mascotaId)
  }

  async function cargarHistorialData(mascotaId: number) {
    setLoadingHistorial(true)
    try {
      const res = await fetch(`${API}/mascotas/${mascotaId}/historial`, { headers: authHeaders() })
      if (sesionExpirada(res)) return
      const data = await res.json()
      setHistorialData(Array.isArray(data) ? data : [])
    } catch { setHistorialData([]) }
    finally { setLoadingHistorial(false) }
  }

  async function guardarHistorial(e: React.FormEvent) {
    e.preventDefault()
    setHMsg(null)
    if (!hDescripcion.trim()) { setHMsg({ type: 'error', text: 'La descripción es obligatoria.' }); return }
    if (!historialMascotaId) return
    setHSaving(true)
    try {
      const res = await fetch(`${API}/mascotas/${historialMascotaId}/historial`, {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify({
          fecha: hFecha,
          tipo: hTipo,
          descripcion: hDescripcion.trim(),
          diagnostico: hDiagnostico || null,
          tratamiento: hTratamiento || null,
          notas: hNotas || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Error al guardar')
      setHFecha(new Date().toISOString().split('T')[0])
      setHTipo('consulta')
      setHDescripcion('')
      setHDiagnostico('')
      setHTratamiento('')
      setHNotas('')
      setHMsg(null)
      setHistorialView('list')
      cargarHistorialData(historialMascotaId)
    } catch (err: any) {
      setHMsg({ type: 'error', text: err.message })
    } finally { setHSaving(false) }
  }

  async function eliminarRegistroHistorial(id: number) {
    if (!confirm('¿Eliminar este registro del historial?')) return
    try {
      const res = await fetch(`${API}/historial/${id}`, { method: 'DELETE', headers: authHeaders() })
      if (sesionExpirada(res)) return
      if (!res.ok) throw new Error('Error al eliminar')
      if (historialSelected?.id === id) { setHistorialSelected(null); setHistorialView('list') }
      if (historialMascotaId) cargarHistorialData(historialMascotaId)
    } catch { /* ignore */ }
  }

  function switchView(v: View) {
    setView(v)
    setMascotaSearch('')
    setCitasFiltroTexto('')
    setCitasFiltroEstado('todas')
    setCitasFiltroFecha('todas')
    if (v === 'mascotas') cargarMascotas()
    if (v === 'citas') cargarCitas()
    if (v === 'admin') { cargarCitas(); cargarMascotas(); cargarVeterinarios() }
    if (v === 'veterinarios') cargarVeterinarios()
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault()
    setFormMsg(null)
    if (!mNombre.trim() || !mEspecie) { setFormMsg({ type: 'error', text: 'El nombre y la especie son obligatorios.' }); return }
    setSaving(true)
    try {
      const res = await fetch(`${API}/mascotas/`, {
        method: 'POST',
        headers: authHeaders(true),
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

  const bannerCitasError = () => citasError && (
    <div style={{
      margin: '24px 40px 0', padding: '14px 18px', borderRadius: 12,
      background: 'rgba(229,62,62,0.08)', border: '1px solid rgba(229,62,62,0.25)',
      color: 'var(--error)', fontSize: '0.88rem', display: 'flex',
      alignItems: 'center', gap: 12,
    }}>
      <span style={{ fontSize: 18 }}>⚠</span>
      <span style={{ flex: 1 }}>No se pudieron cargar las citas. {citasError}</span>
      <button onClick={cargarCitas} style={{
        border: '1px solid rgba(229,62,62,0.35)', background: 'white', color: 'var(--error)',
        borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
        fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', fontWeight: 500,
      }}>Reintentar</button>
    </div>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: '1rem', fontWeight: 500, color: 'white' }}>{[nombre, apellido].filter(Boolean).join(' ') || 'Usuario'}</div>
            <span style={{
              fontSize: '0.6rem', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
              padding: '2px 8px', borderRadius: 100,
              background: rol === 'admin' ? 'rgba(255,215,0,0.15)' : rol === 'veterinario' ? 'rgba(124,77,255,0.15)' : 'rgba(27,191,160,0.15)',
              color: rol === 'admin' ? '#FFD54F' : rol === 'veterinario' ? '#B388FF' : 'var(--teal-mid)',
            }}>
              {rol === 'admin' ? 'Admin' : rol === 'veterinario' ? 'Veterinario' : 'Cliente'}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', position: 'relative' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', padding: '8px 12px 6px' }}>Menú</div>
          {navBtn('home', 'Inicio', <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>)}

          {rol === 'cliente' && (
            <>
              {navBtn('registrar', 'Registrar mascota', <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>)}
              {navBtn('mascotas', 'Mis mascotas', <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>)}
              {navBtn('chat', 'Turnos / Chat', <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>)}
              {navBtn('citas', 'Calendario', <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>)}
            </>
          )}

          {rol === 'veterinario' && (
            <>
              {navBtn('mascotas', 'Mascotas', <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>)}
              {navBtn('citas', 'Calendario', <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>)}
            </>
          )}

          {rol === 'admin' && (
            <>
              {navBtn('mascotas', 'Mascotas', <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>)}
              {navBtn('veterinarios', 'Veterinarios', <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>)}
              {navBtn('admin', 'Calendario', <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>)}
            </>
          )}
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
                {rol === 'cliente' && (
                  <button onClick={() => switchView('registrar')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: 'var(--navy)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.95rem', fontWeight: 500, padding: '14px 30px', borderRadius: 100, border: 'none', cursor: 'pointer', boxShadow: '0 8px 28px rgba(0,0,0,0.18)' }}>
                    + Registrar mascota
                  </button>
                )}
                {(rol === 'veterinario' || rol === 'admin') && (
                  <button onClick={() => switchView('mascotas')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: 'var(--navy)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.95rem', fontWeight: 500, padding: '14px 30px', borderRadius: 100, border: 'none', cursor: 'pointer', boxShadow: '0 8px 28px rgba(0,0,0,0.18)' }}>
                    Ver mascotas
                  </button>
                )}
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

        {/* ── MASCOTAS ── */}
        {view === 'mascotas' && (
          <div style={{ padding: '48px 40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{rol === 'cliente' ? 'Mis mascotas' : 'Mascotas'}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>{rol === 'cliente' ? 'Tus mascotas registradas' : 'Todas las mascotas del sistema'}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ position: 'relative' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Buscar mascota por nombre..."
                    value={mascotaSearch}
                    onChange={e => setMascotaSearch(e.target.value)}
                    style={{
                      padding: '10px 16px 10px 40px', border: '1.5px solid rgba(15,157,126,0.2)',
                      borderRadius: 100, fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem',
                      color: 'var(--text)', background: 'white', outline: 'none', width: 260,
                    }}
                  />
                </div>
                {rol === 'cliente' && (
                  <button onClick={() => switchView('registrar')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-mid) 100%)', color: 'white', fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', fontWeight: 500, padding: '10px 20px', borderRadius: 100, border: 'none', cursor: 'pointer', boxShadow: '0 6px 20px rgba(15,157,126,0.28)', flexShrink: 0 }}>
                    + Agregar
                  </button>
                )}
              </div>
            </div>

            {(() => {
              const filtradas = mascotaSearch.trim()
                ? mascotas.filter(m =>
                    m.nombre.toLowerCase().includes(mascotaSearch.trim().toLowerCase())
                  )
                : mascotas

              return loadingMascotas ? <LoadingDots /> : mascotas.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '72px 24px', color: 'var(--muted)' }}>
                  <span style={{ fontSize: 60, marginBottom: 18, display: 'block', opacity: 0.5 }}>🐾</span>
                  <h4 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Todavía no tenés mascotas registradas</h4>
                  <p style={{ fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 24 }}>Registrá tu primera mascota para empezar a agendar turnos.</p>
                  {rol === 'cliente' && (
                    <button onClick={() => switchView('registrar')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-mid) 100%)', color: 'white', fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', fontWeight: 500, padding: '10px 20px', borderRadius: 100, border: 'none', cursor: 'pointer' }}>+ Registrar mascota</button>
                  )}
                </div>
              ) : filtradas.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--muted)', background: 'white', border: '1px solid var(--border)', borderRadius: 20 }}>
                  <span style={{ fontSize: 40, marginBottom: 12, display: 'block', opacity: 0.4 }}>🔍</span>
                  <h4 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Sin resultados</h4>
                  <p style={{ fontSize: '0.85rem' }}>No se encontraron mascotas con "{mascotaSearch.trim()}"</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
                  {filtradas.map((m) => {
                    const isEditing = editingId === m.id
                    return (
                    <div key={m.id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 20, padding: isEditing ? '20px 24px 24px' : '28px 24px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--teal), var(--teal-mid))' }} />

                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <span style={{ fontSize: 28, display: 'block' }}>{emojis[m.especie] || '🐾'}</span>
                        <input style={inputStyle} type="text" placeholder="Nombre" value={editForm.nombre} onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))} />
                        <select style={inputStyle} value={editForm.especie} onChange={e => setEditForm(f => ({ ...f, especie: e.target.value }))}>
                          <option value="">Especie</option>
                          <option value="perro">🐶 Perro</option>
                          <option value="gato">🐱 Gato</option>
                          <option value="conejo">🐰 Conejo</option>
                          <option value="pajaro">🐦 Pájaro</option>
                          <option value="hamster">🐹 Hámster</option>
                          <option value="otro">Otro</option>
                        </select>
                        <input style={inputStyle} type="text" placeholder="Raza" value={editForm.raza} onChange={e => setEditForm(f => ({ ...f, raza: e.target.value }))} />
                        <input style={inputStyle} type="date" value={editForm.fecha_nacimiento} onChange={e => setEditForm(f => ({ ...f, fecha_nacimiento: e.target.value }))} />
                        <input style={inputStyle} type="number" placeholder="Peso (kg)" step="0.1" min="0" value={editForm.peso} onChange={e => setEditForm(f => ({ ...f, peso: e.target.value }))} />
                        <input style={inputStyle} type="text" placeholder="Notas médicas" value={editForm.notas_medicas} onChange={e => setEditForm(f => ({ ...f, notas_medicas: e.target.value }))} />
                        {editMsg && (
                          <div style={{ borderRadius: 10, padding: '8px 12px', fontSize: '0.8rem', background: editMsg.type === 'ok' ? 'var(--teal-light)' : '#fff5f5', border: `1px solid ${editMsg.type === 'ok' ? 'rgba(15,157,126,0.2)' : 'rgba(229,62,62,0.25)'}`, color: editMsg.type === 'ok' ? 'var(--teal-dark)' : 'var(--error)' }}>
                            {editMsg.text}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                          <button onClick={() => saveEdit(m.id)} disabled={editSaving} style={{ flex: 1, background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-mid) 100%)', color: 'white', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', fontWeight: 500, padding: '10px 16px', borderRadius: 100, border: 'none', cursor: editSaving ? 'not-allowed' : 'pointer', opacity: editSaving ? 0.6 : 1 }}>
                            {editSaving ? 'Guardando...' : 'Guardar'}
                          </button>
                          <button onClick={cancelEdit} style={{ flex: 1, background: 'white', color: 'var(--muted)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', fontWeight: 500, padding: '10px 16px', borderRadius: 100, border: '1px solid var(--border)', cursor: 'pointer' }}>
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span style={{ fontSize: 36, marginBottom: 14, display: 'block' }}>{emojis[m.especie] || '🐾'}</span>
                        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{m.nombre}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--teal)', fontWeight: 500, textTransform: 'capitalize', background: 'var(--teal-light)', display: 'inline-block', padding: '3px 10px', borderRadius: 100, marginBottom: 12 }}>{m.especie || 'mascota'}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.8 }}>
                          {m.raza && <div><strong style={{ color: 'var(--text)', fontWeight: 500 }}>Raza:</strong> {m.raza}</div>}
                          {m.fecha_nacimiento && <div><strong style={{ color: 'var(--text)', fontWeight: 500 }}>Nacimiento:</strong> {new Date(m.fecha_nacimiento).toLocaleDateString('es-AR')}</div>}
                          {m.peso && <div><strong style={{ color: 'var(--text)', fontWeight: 500 }}>Peso:</strong> {m.peso} kg</div>}
                          {m.notas_medicas && <div><strong style={{ color: 'var(--text)', fontWeight: 500 }}>Notas:</strong> {m.notas_medicas}</div>}
                        </div>
                        {rol !== 'veterinario' && (
                          <button onClick={() => startEdit(m)} style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--cream)', color: 'var(--teal-dark)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', fontWeight: 500, padding: '7px 16px', borderRadius: 100, border: '1px solid rgba(15,157,126,0.2)', cursor: 'pointer' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            Editar
                          </button>
                        )}
                        <button onClick={() => abrirHistorial(m.id, m.nombre)} style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-mid) 100%)', color: 'white', fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', fontWeight: 500, padding: '7px 16px', borderRadius: 100, border: 'none', cursor: 'pointer' }}>
                          🏥 Ver historial
                        </button>
                      </>
                    )}
                  </div>
                )})}
              </div>
              )
            })()}
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

        {/* CITAS */}
        {view === 'citas' && (
          rol === 'veterinario' ? (
            <>
              {bannerCitasError()}
              <Calendario
                citas={citas}
                loading={loadingCitas}
                titulo="Calendario"
                subtitulo="Los turnos asignados a tu agenda"
                tituloEvento={c => `🐾 ${c.mascota_nombre || 'Sin mascota'}`}
                subtituloEvento={c => c.cliente_nombre}
                onVerHistorial={c => abrirHistorial(c.mascota_id!, c.mascota_nombre || 'Sin mascota')}
              />
            </>
          ) : (
            <>
              {bannerCitasError()}
              <Calendario
                citas={citas}
                loading={loadingCitas}
                titulo="Calendario"
                subtitulo="Los turnos de tus mascotas"
                tituloEvento={c => `🐾 ${c.mascota_nombre || 'Sin mascota'}`}
                onVerHistorial={c => abrirHistorial(c.mascota_id!, c.mascota_nombre || 'Sin mascota')}
              />

            <div style={{ padding: '0 40px 48px' }}>
              <div style={{ marginBottom: 28 }}>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Historial de turnos</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>Todos tus turnos, incluidos los cancelados</p>
              </div>

              {/* ── Filtros ── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input type="text" placeholder="Buscar mascota..." value={citasFiltroTexto} onChange={e => setCitasFiltroTexto(e.target.value)}
                    style={{ padding: '9px 14px 9px 34px', borderRadius: 100, border: '1.5px solid rgba(15,157,126,0.2)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: 'var(--text)', background: 'white', outline: 'none', width: 240 }} />
                </div>

                <select value={citasFiltroEstado} onChange={e => setCitasFiltroEstado(e.target.value)}
                  style={{ padding: '9px 14px', borderRadius: 100, border: '1.5px solid rgba(15,157,126,0.2)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: 'var(--text)', background: 'white', outline: 'none', cursor: 'pointer' }}>
                  <option value="todas">Todos los estados</option>
                  <option value="confirmado">Confirmadas</option>
                  <option value="cancelado">Canceladas</option>
                  <option value="completado">Completadas</option>
                </select>

                <select value={citasFiltroFecha} onChange={e => setCitasFiltroFecha(e.target.value)}
                  style={{ padding: '9px 14px', borderRadius: 100, border: '1.5px solid rgba(15,157,126,0.2)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: 'var(--text)', background: 'white', outline: 'none', cursor: 'pointer' }}>
                  <option value="todas">Cualquier fecha</option>
                  <option value="hoy">Hoy</option>
                  <option value="semana">Esta semana</option>
                  <option value="mes">Este mes</option>
                  <option value="futuras">Futuras</option>
                  <option value="pasadas">Pasadas</option>
                </select>

                {citas.length > 0 && (
                  <span style={{ fontSize: '0.82rem', color: 'var(--muted)', marginLeft: 'auto' }}>
                    {(() => {
                      const filtradas = citasFiltradas()
                      return `${filtradas.length} de ${citas.length}`
                    })()}
                  </span>
                )}
              </div>

              {loadingCitas ? <LoadingDots /> : citas.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '72px 24px', color: 'var(--muted)' }}>
                  <span style={{ fontSize: 60, marginBottom: 18, display: 'block', opacity: 0.5 }}>📅</span>
                  <h4 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>No hay citas registradas</h4>
                  <p style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>Las citas aparecerán aquí cuando se agenden.</p>
                </div>
              ) : (
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--teal-light)', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--teal-dark)' }}>Fecha</th>
                        <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--teal-dark)' }}>Hora</th>
                        <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--teal-dark)' }}>Mascota</th>
                        <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--teal-dark)' }}>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const filtradas = citasFiltradas()

                        if (filtradas.length === 0) return (
                          <tr><td colSpan={4} style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.88rem' }}>Sin resultados con los filtros actuales.</td></tr>
                        )

                        const estadoColor: Record<string, string> = {
                          confirmado: 'var(--teal)',
                          pendiente: '#FF8F00',
                          cancelado: 'var(--error)',
                          completado: '#78909C',
                        }

                        return filtradas.map(c => (
                          <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '14px 20px', fontSize: '0.9rem', color: 'var(--text)', fontWeight: 500 }}>
                              {c.fecha
                                ? new Date(c.fecha.slice(0, 10) + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                : 'Sin fecha'}
                            </td>
                            <td style={{ padding: '14px 20px', fontSize: '0.9rem', color: 'var(--text)' }}>{c.hora ? c.hora.slice(0, 5) : '--:--'}</td>
                            <td style={{ padding: '14px 20px', fontSize: '0.9rem' }}>
                              {c.mascota_id != null ? (
                                <span onClick={() => abrirHistorial(c.mascota_id!, c.mascota_nombre || 'Sin mascota')}
                                  style={{ color: 'var(--teal-mid)', fontWeight: 500, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }} title="Ver historial médico">
                                  🐾 {c.mascota_nombre}
                                </span>
                              ) : (
                                <span style={{ color: 'var(--muted)' }}>🐾 Sin mascota</span>
                              )}
                            </td>
                            <td style={{ padding: '14px 20px' }}>
                              <span style={{ background: `${estadoColor[c.estado] || '#78909C'}15`, color: estadoColor[c.estado] || '#78909C', fontSize: '0.75rem', fontWeight: 600, padding: '4px 12px', borderRadius: 100, display: 'inline-block', textTransform: 'capitalize' }}>
                                {c.estado}
                              </span>
                            </td>
                          </tr>
                        ))
                      })()}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Horarios de atención */}
              {citas.length > 0 && (
                <div style={{ marginTop: 48 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--teal)', marginBottom: 16 }}>Horarios de atención</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
                    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 20, padding: '28px 24px', display: 'flex', alignItems: 'center', gap: 18 }}>
                      <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #FFD54F, #FFB300)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                      </div>
                      <div>
                        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Mañana</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.6 }}>Lunes a Viernes<br/>8:00 – 13:00</div>
                      </div>
                    </div>
                    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 20, padding: '28px 24px', display: 'flex', alignItems: 'center', gap: 18 }}>
                      <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #7C4DFF, #536DFE)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                      </div>
                      <div>
                        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Tarde</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.6 }}>Lunes a Viernes<br/>17:00 – 21:00</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            </>
          )
        )}

        {/* ADMIN */}
        {view === 'admin' && (
          <>
            <div style={{ padding: '40px 40px 0' }}>
            {/* ── Dashboard summary cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 36 }}>
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 20, padding: '28px 24px', display: 'flex', alignItems: 'center', gap: 18 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #7C4DFF, #536DFE)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '2rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{loadingVeterinarios ? '...' : veterinarios.length}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 4 }}>Veterinarios</div>
                </div>
              </div>
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 20, padding: '28px 24px', display: 'flex', alignItems: 'center', gap: 18 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, var(--teal), var(--teal-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </div>
                <div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '2rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{loadingMascotas ? '...' : mascotas.length}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 4 }}>Mascotas</div>
                </div>
              </div>
            </div>
            </div>
            {bannerCitasError()}
            <Calendario
              citas={citas}
              loading={loadingCitas}
              titulo="Calendario"
              subtitulo="Todas las citas de todos los clientes"
              tituloEvento={c => `🐾 ${c.mascota_nombre || 'Sin mascota'}`}
              subtituloEvento={c => c.cliente_nombre}
              onVerHistorial={c => abrirHistorial(c.mascota_id!, c.mascota_nombre || 'Sin mascota')}
            />
          </>
        )}

        {/* VETERINARIOS */}
        {view === 'veterinarios' && (
          <div style={{ padding: '48px 40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Veterinarios</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>Personal de la clínica</p>
              </div>
              <div style={{ position: 'relative' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input value={vetSearch} onChange={e => setVetSearch(e.target.value)} placeholder="Buscar veterinario..."
                  style={{ height: 42, padding: '0 16px 0 42px', borderRadius: 100, border: '1px solid var(--border)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', background: 'white', outline: 'none', width: 240 }} />
              </div>
            </div>

            {loadingVeterinarios ? <LoadingDots /> : (
              (() => {
                const filtrados = veterinarios.filter(v =>
                  `${v.nombre} ${v.apellido}`.toLowerCase().includes(vetSearch.toLowerCase())
                )

                if (veterinarios.length === 0) return (
                  <div style={{ textAlign: 'center', padding: 80, background: 'white', borderRadius: 20, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>👨‍⚕️</div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>No hay veterinarios</div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>Asigná el rol "veterinario" a un cliente desde la base de datos.</div>
                  </div>
                )

                if (filtrados.length === 0) return (
                  <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 20, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '1rem', color: 'var(--muted)' }}>Sin resultados para "{vetSearch}"</div>
                  </div>
                )

                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {filtrados.map(v => {
                      const isEditing = editingVetId === v.id
                      return (
                        <div key={v.id} style={{ background: 'white', border: isEditing ? '2px solid var(--teal)' : '1px solid var(--border)', borderRadius: 20, padding: 28, position: 'relative' }}>
                          {/* Badge estado */}
                          <span style={{
                            position: 'absolute', top: 16, right: 16,
                            fontSize: '0.6rem', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
                            padding: '3px 10px', borderRadius: 100,
                            background: v.estado === 'activo' ? 'rgba(27,191,160,0.12)' : 'rgba(150,150,150,0.12)',
                            color: v.estado === 'activo' ? 'var(--teal)' : 'var(--muted)',
                          }}>
                            {v.estado}
                          </span>

                          {/* Avatar */}
                          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #7C4DFF, #536DFE)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                            <span style={{ color: 'white', fontFamily: 'Syne, sans-serif', fontSize: '1.2rem', fontWeight: 700 }}>{v.nombre.charAt(0)}{v.apellido.charAt(0)}</span>
                          </div>

                          {isEditing ? (
                            <>
                              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', marginBottom: 18 }}>
                                {v.nombre} {v.apellido}
                              </div>
                              <div style={{ marginBottom: 12 }}>
                                <label style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Teléfono</label>
                                <input value={vetEditForm.telefono} onChange={e => setVetEditForm(f => ({ ...f, telefono: e.target.value }))}
                                  style={{ height: 40, padding: '0 12px', borderRadius: 10, border: '1px solid var(--border)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', width: '100%', outline: 'none' }} />
                              </div>
                              <div style={{ marginBottom: 18 }}>
                                <label style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Estado</label>
                                <select value={vetEditForm.estado} onChange={e => setVetEditForm(f => ({ ...f, estado: e.target.value }))}
                                  style={{ height: 40, padding: '0 12px', borderRadius: 10, border: '1px solid var(--border)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', width: '100%', outline: 'none', background: 'white' }}>
                                  <option value="activo">Activo</option>
                                  <option value="desactivado">Desactivado</option>
                                </select>
                              </div>
                              {vetEditMsg && (
                                <div style={{ fontSize: '0.8rem', color: vetEditMsg.type === 'ok' ? 'var(--teal)' : '#E53935', marginBottom: 12, fontWeight: 500 }}>
                                  {vetEditMsg.text}
                                </div>
                              )}
                              <div style={{ display: 'flex', gap: 10 }}>
                                <button onClick={() => saveEditVet(v.id)} disabled={vetSaving}
                                  style={{ flex: 1, height: 40, borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, var(--teal), var(--teal-mid))', color: 'white', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}>
                                  {vetSaving ? 'Guardando...' : 'Guardar'}
                                </button>
                                <button onClick={cancelEditVet}
                                  style={{ height: 40, padding: '0 18px', borderRadius: 10, border: '1px solid var(--border)', background: 'white', color: 'var(--muted)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', cursor: 'pointer' }}>
                                  Cancelar
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
                                {v.nombre} {v.apellido}
                              </div>
                              <div style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 2 }}>
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <span style={{ fontWeight: 500, color: 'var(--text)', minWidth: 70 }}>DNI:</span>
                                  <span>{v.dni}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <span style={{ fontWeight: 500, color: 'var(--text)', minWidth: 70 }}>Tel:</span>
                                  <span>{v.telefono || '—'}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <span style={{ fontWeight: 500, color: 'var(--text)', minWidth: 70 }}>Usuario:</span>
                                  <span>{v.username}</span>
                                </div>
                              </div>
                              <button onClick={() => startEditVet(v)}
                                style={{ marginTop: 20, height: 38, padding: '0 20px', borderRadius: 10, border: '1px solid var(--border)', background: 'white', color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                Editar
                              </button>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })()
            )}
          </div>
        )}

        {/* HISTORIAL */}
        {view === 'historial' && (
          <div style={{ padding: '40px', maxWidth: 960, margin: '0 auto', width: '100%' }}>

            {/* ── Header ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button onClick={() => {
                  if (historialView !== 'list') { setHistorialView('list'); setHistorialSelected(null); setHMsg(null) }
                  else switchView('mascotas')
                }} style={{
                  width: 38, height: 38, borderRadius: 10, border: '1px solid var(--border)',
                  background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: 'var(--text)', flexShrink: 0,
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <div>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Historial médico</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>🐾 {historialMascotaNombre}</p>
                </div>
              </div>
              {historialView === 'list' && rol !== 'cliente' && (
                <button onClick={() => setHistorialView('form')} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-mid) 100%)',
                  color: 'white', fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', fontWeight: 500,
                  padding: '10px 22px', borderRadius: 100, border: 'none', cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(15,157,126,0.28)', flexShrink: 0,
                }}>
                  + Agregar registro
                </button>
              )}
            </div>

            {/* ── LIST VIEW ── */}
            {historialView === 'list' && (
              <>
                {loadingHistorial ? <LoadingDots /> : historialData.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--muted)', background: 'white', border: '1px solid var(--border)', borderRadius: 24 }}>
                    <span style={{ fontSize: 48, marginBottom: 16, display: 'block', opacity: 0.4 }}>📋</span>
                    <h4 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Sin registros médicos</h4>
                    <p style={{ fontSize: '0.85rem', lineHeight: 1.6, marginBottom: rol !== 'cliente' ? 24 : 0 }}>{historialMascotaNombre} todavía no tiene historial médico.</p>
                    {rol !== 'cliente' && (
                      <button onClick={() => setHistorialView('form')} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-mid) 100%)',
                        color: 'white', fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', fontWeight: 500,
                        padding: '11px 24px', borderRadius: 100, border: 'none', cursor: 'pointer',
                        boxShadow: '0 6px 20px rgba(15,157,126,0.28)',
                      }}>+ Agregar primer registro</button>
                    )}
                  </div>
                ) : (
                  <div style={{ position: 'relative', paddingLeft: 32 }}>
                    <div style={{ position: 'absolute', left: 22, top: 8, bottom: 8, width: 2, background: 'rgba(15,157,126,0.15)' }} />
                    {(() => {
                      const tipoConfig: Record<string, { icon: string; color: string }> = {
                        consulta: { icon: '💊', color: '#0F9D7E' },
                        vacuna: { icon: '💉', color: '#7C4DFF' },
                        cirugia: { icon: '🔪', color: '#E53935' },
                        tratamiento: { icon: '🏥', color: '#FF8F00' },
                        otro: { icon: '📋', color: '#78909C' },
                      }
                      return historialData.map((r) => {
                        const cfg = tipoConfig[r.tipo] || tipoConfig.otro
                        return (
                          <div key={r.id}
                            onClick={() => { setHistorialSelected(r); setHistorialView('detail') }}
                            style={{ display: 'flex', gap: 16, marginBottom: 16, position: 'relative', cursor: 'pointer' }}
                          >
                            <div style={{
                              width: 44, height: 44, borderRadius: '50%',
                              background: `${cfg.color}15`, border: `2px solid ${cfg.color}30`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0, fontSize: 18, zIndex: 1,
                            }}>
                              {cfg.icon}
                            </div>
                            <div style={{
                              flex: 1, background: 'white', border: '1px solid var(--border)',
                              borderRadius: 14, padding: '16px 20px',
                              transition: 'box-shadow 0.15s',
                            }}
                              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)')}
                              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{
                                  fontSize: '0.68rem', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase',
                                  color: cfg.color, background: `${cfg.color}12`, padding: '2px 10px', borderRadius: 100,
                                }}>
                                  {r.tipo}
                                </span>
                                <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                                  {new Date(r.fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.93rem', fontWeight: 500, color: 'var(--text)', lineHeight: 1.5, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                                {r.descripcion.length > 100 ? r.descripcion.slice(0, 100) + '...' : r.descripcion}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                )}
              </>
            )}

            {/* ── DETAIL VIEW ── */}
            {historialView === 'detail' && historialSelected && (
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 24, padding: '36px 40px', minWidth: 0, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                {(() => {
                  const tipoConfig: Record<string, { icon: string; color: string }> = {
                    consulta: { icon: '💊', color: '#0F9D7E' },
                    vacuna: { icon: '💉', color: '#7C4DFF' },
                    cirugia: { icon: '🔪', color: '#E53935' },
                    tratamiento: { icon: '🏥', color: '#FF8F00' },
                    otro: { icon: '📋', color: '#78909C' },
                  }
                  const cfg = tipoConfig[historialSelected.tipo] || tipoConfig.otro
                  return (
                    <>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{
                            width: 52, height: 52, borderRadius: '50%',
                            background: `${cfg.color}15`, border: `2px solid ${cfg.color}30`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                          }}>
                            {cfg.icon}
                          </div>
                          <div>
                            <span style={{
                              fontSize: '0.68rem', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase',
                              color: cfg.color, background: `${cfg.color}12`, padding: '3px 12px', borderRadius: 100,
                              display: 'inline-block', marginBottom: 8,
                            }}>
                              {historialSelected.tipo}
                            </span>
                            <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                              {new Date(historialSelected.fecha + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                            </div>
                          </div>
                        </div>
                        {rol === 'admin' && (
                          <button onClick={() => eliminarRegistroHistorial(historialSelected.id)} style={{
                            background: 'none', border: '1px solid rgba(229,62,62,0.2)', borderRadius: 10,
                            cursor: 'pointer', color: 'var(--error)', padding: '8px 12px', display: 'flex',
                            alignItems: 'center', gap: 6, fontSize: '0.8rem',
                          }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                            Eliminar
                          </button>
                        )}
                      </div>

                      <div style={{ marginBottom: 28 }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Descripción</div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 500, color: 'var(--text)', lineHeight: 1.65, overflowWrap: 'break-word', wordBreak: 'break-word' }}>{historialSelected.descripcion}</div>
                      </div>

                      {historialSelected.diagnostico && (
                        <div style={{ marginBottom: 24, background: 'var(--cream)', borderRadius: 14, padding: '20px 22px' }}>
                          <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Diagnóstico</div>
                          <div style={{ fontSize: '0.93rem', color: 'var(--text)', lineHeight: 1.65, whiteSpace: 'pre-line', overflowWrap: 'break-word', wordBreak: 'break-word' }}>{historialSelected.diagnostico}</div>
                        </div>
                      )}

                      {historialSelected.tratamiento && (
                        <div style={{ marginBottom: 24, background: 'rgba(15,157,126,0.04)', borderRadius: 14, padding: '20px 22px', border: '1px solid rgba(15,157,126,0.1)', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                          <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--teal-dark)', marginBottom: 8 }}>Tratamiento</div>
                          <div style={{ fontSize: '0.93rem', color: 'var(--text)', lineHeight: 1.65, whiteSpace: 'pre-line' }}>{historialSelected.tratamiento}</div>
                        </div>
                      )}

                      {historialSelected.notas && (
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                          <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Notas</div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--muted)', fontStyle: 'italic', lineHeight: 1.65, whiteSpace: 'pre-line' }}>{historialSelected.notas}</div>
                        </div>
                      )}

                      {!historialSelected.diagnostico && !historialSelected.tratamiento && !historialSelected.notas && (
                        <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--muted)', fontSize: '0.85rem', background: 'var(--cream)', borderRadius: 14 }}>
                          Sin información adicional para este registro.
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            )}

            {/* ── FORM VIEW ── */}
            {historialView === 'form' && (
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 24, padding: '36px 40px', maxWidth: 560, minWidth: 0 }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>
                  Agregar registro médico
                </div>
                <form onSubmit={guardarHistorial} style={{ display: 'flex', flexDirection: 'column', gap: 18 }} noValidate>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Tipo</label>
                      <select style={inputStyle} value={hTipo} onChange={e => setHTipo(e.target.value)}>
                        <option value="consulta">💊 Consulta</option>
                        <option value="vacuna">💉 Vacuna</option>
                        <option value="cirugia">🔪 Cirugía</option>
                        <option value="tratamiento">🏥 Tratamiento</option>
                        <option value="otro">📋 Otro</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Fecha</label>
                      <input style={inputStyle} type="date" value={hFecha} onChange={e => setHFecha(e.target.value)} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Descripción *</label>
                    <textarea
                      style={{ ...inputStyle, resize: 'vertical', minHeight: 80, fontFamily: 'DM Sans, sans-serif', overflowWrap: 'break-word', wordBreak: 'break-word' }}
                      placeholder="Motivo de la consulta, síntomas, vacuna aplicada..."
                      value={hDescripcion} onChange={e => setHDescripcion(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Diagnóstico</label>
                    <textarea
                      style={{ ...inputStyle, resize: 'vertical', minHeight: 65, fontFamily: 'DM Sans, sans-serif', overflowWrap: 'break-word', wordBreak: 'break-word' }}
                      placeholder="Opcional"
                      value={hDiagnostico} onChange={e => setHDiagnostico(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Tratamiento</label>
                    <textarea
                      style={{ ...inputStyle, resize: 'vertical', minHeight: 65, fontFamily: 'DM Sans, sans-serif', overflowWrap: 'break-word', wordBreak: 'break-word' }}
                      placeholder="Medicación, dosis, indicaciones... (opcional)"
                      value={hTratamiento} onChange={e => setHTratamiento(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Notas</label>
                    <input style={inputStyle} type="text" placeholder="Observaciones adicionales..." value={hNotas} onChange={e => setHNotas(e.target.value)} />
                  </div>

                  {hMsg && (
                    <div style={{ borderRadius: 12, padding: '12px 16px', fontSize: '0.85rem', background: hMsg.type === 'ok' ? 'var(--teal-light)' : '#fff5f5', border: `1px solid ${hMsg.type === 'ok' ? 'rgba(15,157,126,0.2)' : 'rgba(229,62,62,0.25)'}`, color: hMsg.type === 'ok' ? 'var(--teal-dark)' : 'var(--error)' }}>
                      {hMsg.text}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                    <button type="submit" disabled={hSaving} style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-mid) 100%)',
                      color: 'white', fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', fontWeight: 500,
                      padding: '14px', borderRadius: 100, border: 'none',
                      cursor: hSaving ? 'not-allowed' : 'pointer', opacity: hSaving ? 0.6 : 1,
                      boxShadow: '0 6px 20px rgba(15,157,126,0.28)',
                    }}>
                      {hSaving ? 'Guardando...' : 'Guardar registro'}
                    </button>
                    <button type="button" onClick={() => { setHistorialView('list'); setHMsg(null) }} style={{
                      background: 'white', color: 'var(--muted)', fontFamily: 'DM Sans, sans-serif',
                      fontSize: '0.9rem', fontWeight: 500, padding: '14px 24px', borderRadius: 100,
                      border: '1px solid var(--border)', cursor: 'pointer',
                    }}>
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        )}

      </main>

      {/* Chat widget flotante */}
      {view !== 'chat' && <ChatWidget nombre={nombre.split(' ')[0] || 'usuario'} />}
    </div>
  )
}