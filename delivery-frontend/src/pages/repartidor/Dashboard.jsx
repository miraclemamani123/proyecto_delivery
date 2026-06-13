import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bike, Package, Map, Zap, Clock, PowerOff,
  ChevronRight, LogOut, Loader2, Navigation
} from 'lucide-react'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

/* ─── Sistema de color ────────────────────────────────────────────────────── */
const BRAND = { dark: '#0D2B1E', primary: '#10B981' }

/* ─── Config de estados del repartidor ───────────────────────────────────── */
const ESTADOS = [
  {
    key: 'disponible',
    label: 'Disponible',
    desc: 'Recibir rutas de inmediato',
    Icon: Zap,
    color: '#059669',
    bg: '#ECFDF5',
    border: '#6EE7B7',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pulse: true,
  },
  {
    key: 'ocupado',
    label: 'Ocupado',
    desc: 'Terminando entregas',
    Icon: Clock,
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FCD34D',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    pulse: false,
  },
  {
    key: 'inactivo',
    label: 'Inactivo',
    desc: 'Fuera de servicio',
    Icon: PowerOff,
    color: '#64748B',
    bg: '#F8FAFC',
    border: '#CBD5E1',
    badge: 'bg-slate-100 text-slate-500 border-slate-200',
    pulse: false,
  },
]

/* ─── RepartidorDashboard ─────────────────────────────────────────────────── */
const RepartidorDashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [estado, setEstado]               = useState('inactivo')
  const [pedidosActivos, setPedidosActivos] = useState(0)
  const [loading, setLoading]             = useState(true)
  const intervaloRef                      = useRef(null)

  useEffect(() => {
    fetchDatos()
    if (!intervaloRef.current) {
      intervaloRef.current = setInterval(fetchDatos, 8000)
    }
    return () => { clearInterval(intervaloRef.current); intervaloRef.current = null }
  }, [])

  const fetchDatos = async () => {
    try {
      const [perfilRes, pedidosRes] = await Promise.all([
        api.get('/repartidor/perfil'),
        api.get('/repartidor/pedidos')
      ])
      setEstado(perfilRes.data.estado)
      const activos = pedidosRes.data.filter(p =>
        ['aceptado', 'en_preparacion', 'en_camino'].includes(p.estado)
      )
      setPedidosActivos(activos.length)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const cambiarEstado = async (nuevoEstado) => {
    try {
      await api.patch('/repartidor/estado', { estado: nuevoEstado })
      setEstado(nuevoEstado)
      toast.success(`Estado: ${nuevoEstado}`)
    } catch { toast.error('Error al cambiar estado') }
  }

  const handleLogout = async () => {
    try { await api.post('/logout') } catch {}
    logout()
    navigate('/')
  }

  const estadoActual = ESTADOS.find(e => e.key === estado) || ESTADOS[2]

  return (
    <div className="min-h-screen bg-slate-50 antialiased text-slate-800">

      {/* ══════════════════════════════════════
          HEADER — igual en todos los paneles
      ══════════════════════════════════════ */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: BRAND.dark }}>
              <Bike size={16} color="#ffffff" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-black tracking-tight" style={{ color: BRAND.dark }}>
              Quilla<span style={{ color: BRAND.primary }}>Express</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Avatar + nombre */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-black text-white"
                style={{ backgroundColor: BRAND.dark }}>
                {user?.name ? user.name.substring(0, 2).toUpperCase() : 'R'}
              </div>
              <span className="text-xs font-medium text-slate-500 hidden sm:inline">
                <span className="font-bold text-slate-800">{user?.name}</span>
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 px-3 py-2 rounded-xl hover:bg-slate-50 border border-slate-200 transition"
            >
              <LogOut size={13} strokeWidth={2} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Saludo */}
        <div className="mb-7">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Panel de Repartidor</h2>
          <p className="text-sm text-slate-400 mt-0.5">Gestiona tu disponibilidad y pedidos en tiempo real</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-100 rounded-2xl shadow-sm gap-3">
            <Loader2 size={28} className="animate-spin" style={{ color: BRAND.primary }} />
            <span className="text-sm font-medium text-slate-400">Cargando tu sesión...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">

            {/* ── COLUMNA IZQUIERDA: disponibilidad ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

              {/* Acento superior con color del estado actual */}
              <div className="h-1 w-full transition-colors duration-300"
                style={{ backgroundColor: estadoActual.color }} />

              <div className="p-5">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">Mi disponibilidad</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Define si recibes pedidos</p>
                  </div>

                  {/* Badge estado actual */}
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-xl border ${estadoActual.badge}`}>
                    {estadoActual.pulse ? (
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                          style={{ backgroundColor: estadoActual.color }} />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5"
                          style={{ backgroundColor: estadoActual.color }} />
                      </span>
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full inline-block"
                        style={{ backgroundColor: estadoActual.color }} />
                    )}
                    {estadoActual.label.toUpperCase()}
                  </span>
                </div>

                {/* Botones de estado */}
                <div className="flex flex-col gap-2">
                  {ESTADOS.map((e) => {
                    const isActive = estado === e.key
                    const { Icon } = e
                    return (
                      <button
                        key={e.key}
                        onClick={() => cambiarEstado(e.key)}
                        className="w-full p-3.5 rounded-xl text-left flex items-center justify-between border-2 transition-all duration-200"
                        style={isActive
                          ? { borderColor: e.border, backgroundColor: e.bg }
                          : { borderColor: '#F1F5F9', backgroundColor: '#FFFFFF' }
                        }
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: isActive ? e.bg : '#F8FAFC',
                                     border: `1px solid ${isActive ? e.border : '#E2E8F0'}` }}>
                            <Icon size={15} strokeWidth={2}
                              style={{ color: isActive ? e.color : '#94A3B8' }} />
                          </div>
                          <div>
                            <p className="text-xs font-bold leading-none capitalize"
                              style={{ color: isActive ? e.color : '#475569' }}>
                              {e.label}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{e.desc}</p>
                          </div>
                        </div>
                        {isActive && (
                          <span className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: e.color }} />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* ── COLUMNA DERECHA: métricas + acceso ── */}
            <div className="md:col-span-2 flex flex-col gap-5">

              {/* Pedidos activos */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="h-1 w-full" style={{ backgroundColor: BRAND.dark }} />
                <div className="p-5 flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: '#ECFDF5' }}>
                    <Package size={26} strokeWidth={1.5} style={{ color: BRAND.primary }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
                      Pedidos activos
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black tracking-tight"
                        style={{ color: pedidosActivos > 0 ? BRAND.dark : '#CBD5E1' }}>
                        {pedidosActivos}
                      </span>
                      {pedidosActivos > 0 && (
                        <span className="text-xs font-bold animate-pulse"
                          style={{ color: BRAND.primary }}>
                          en curso
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {pedidosActivos > 0
                        ? '¡Tienes entregas en curso! Buen viaje.'
                        : 'Sin pedidos activos en este momento.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ir a pedidos — CTA grande */}
              <Link
                to="/repartidor/pedidos"
                className="group relative rounded-2xl overflow-hidden flex items-center justify-between p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                style={{ backgroundColor: BRAND.dark, minHeight: '120px' }}
              >
                {/* Decoración */}
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
                  style={{ backgroundColor: 'rgba(16,185,129,0.1)' }} />
                <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full pointer-events-none"
                  style={{ backgroundColor: 'rgba(16,185,129,0.06)' }} />

                <div className="relative flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'rgba(16,185,129,0.15)' }}>
                    <Navigation size={22} strokeWidth={2} style={{ color: '#34D399' }} />
                  </div>
                  <div>
                    <p className="font-black text-white text-lg leading-tight">Consola de Pedidos</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      Ver direcciones, mapas y hojas de ruta
                    </p>
                  </div>
                </div>

                <div
                  className="relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                >
                  <ChevronRight size={18} color="#34D399" strokeWidth={2.5} />
                </div>
              </Link>

            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RepartidorDashboard