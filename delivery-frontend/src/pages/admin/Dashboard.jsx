import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bike, Store, ClipboardList, FileSearch,
  DollarSign, LogOut, ChevronRight,
  AlertCircle, TrendingUp, Users, Loader2,
  ShieldCheck
} from 'lucide-react'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

/* ─── Sistema de color ────────────────────────────────────────────────────── */
const BRAND = { dark: '#0D2B1E', primary: '#10B981' }

/* ─── AdminDashboard ──────────────────────────────────────────────────────── */
const AdminDashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [stats, setStats] = useState({
    negocios: 0, negociosPendientes: 0,
    repartidores: 0, repartidoresPendientes: 0,
    pedidos: 0, pedidosHoy: 0
  })
  const [tarifa, setTarifa]               = useState(null)
  const [nuevaTarifa, setNuevaTarifa]     = useState('')
  const [guardandoTarifa, setGuardandoTarifa] = useState(false)
  const [loading, setLoading]             = useState(true)

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    try {
      const [negociosRes, repartidoresRes, pedidosRes, tarifaRes] = await Promise.all([
        api.get('/admin/negocios'),
        api.get('/admin/repartidores'),
        api.get('/admin/pedidos'),
        api.get('/admin/tarifa')
      ])
      const hoy = new Date().toDateString()
      setStats({
        negocios: negociosRes.data.length,
        negociosPendientes: negociosRes.data.filter(n => !n.aprobado).length,
        repartidores: repartidoresRes.data.length,
        repartidoresPendientes: repartidoresRes.data.filter(r => !r.aprobado).length,
        pedidos: pedidosRes.data.length,
        pedidosHoy: pedidosRes.data.filter(p =>
          new Date(p.created_at).toDateString() === hoy
        ).length
      })
      setTarifa(tarifaRes.data)
      setNuevaTarifa(tarifaRes.data?.precio_por_km || '')
    } catch { toast.error('Error al cargar estadísticas') }
    finally { setLoading(false) }
  }

  const handleGuardarTarifa = async () => {
    if (!nuevaTarifa || isNaN(nuevaTarifa) || nuevaTarifa <= 0) {
      toast.error('Ingresa un precio válido')
      return
    }
    setGuardandoTarifa(true)
    try {
      const res = await api.put('/admin/tarifa', { precio_por_km: nuevaTarifa })
      setTarifa(res.data.tarifa)
      toast.success('Tarifa actualizada correctamente')
    } catch { toast.error('Error al actualizar tarifa') }
    finally { setGuardandoTarifa(false) }
  }

  const handleLogout = async () => {
    try { await api.post('/logout') } catch {}
    logout()
    navigate('/')
  }

  /* ── Config de stats cards ── */
  const statCards = [
    {
      label: 'Negocios totales',
      value: stats.negocios,
      pendientes: stats.negociosPendientes,
      Icon: Store,
      color: '#7C3AED',
      bg: '#F5F3FF',
    },
    {
      label: 'Repartidores',
      value: stats.repartidores,
      pendientes: stats.repartidoresPendientes,
      Icon: Bike,
      color: '#0369A1',
      bg: '#EFF6FF',
    },
    {
      label: 'Pedidos hoy',
      value: stats.pedidosHoy,
      sub: `${stats.pedidos} totales`,
      Icon: TrendingUp,
      color: BRAND.primary,
      bg: '#ECFDF5',
    },
  ]

  /* ── Config de acciones ── */
  const acciones = [
    {
      to: '/admin/negocios',
      label: 'Negocios',
      desc: 'Aprobar y gestionar',
      Icon: Store,
      color: '#7C3AED',
      bg: '#F5F3FF',
      badge: stats.negociosPendientes,
    },
    {
      to: '/admin/repartidores',
      label: 'Repartidores',
      desc: 'Aprobar y gestionar',
      Icon: Bike,
      color: '#0369A1',
      bg: '#EFF6FF',
      badge: stats.repartidoresPendientes,
    },
    {
      to: '/admin/pedidos',
      label: 'Pedidos',
      desc: 'Monitorear todos',
      Icon: ClipboardList,
      color: BRAND.primary,
      bg: '#ECFDF5',
      badge: 0,
    },
    {
      to: '/admin/auditoria',
      label: 'Auditoría',
      desc: 'Registro de acciones',
      Icon: FileSearch,
      color: '#D97706',
      bg: '#FFFBEB',
      badge: 0,
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 antialiased">

      {/* ══════════════════════════════════════
          HEADER
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
            {/* Badge Admin */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50">
              <ShieldCheck size={14} strokeWidth={2} style={{ color: BRAND.dark }} />
              <span className="text-xs font-bold text-slate-700 hidden sm:inline">
                {user?.name}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
            >
              <LogOut size={13} strokeWidth={2} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Título */}
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Panel de Administración
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Resumen del sistema QuillaExpress
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 bg-white border border-slate-100 rounded-2xl shadow-sm gap-3">
            <Loader2 size={24} className="animate-spin" style={{ color: BRAND.primary }} />
            <span className="text-sm font-medium text-slate-400">Cargando estadísticas...</span>
          </div>
        ) : (
          <>
            {/* ── STATS ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {statCards.map(({ label, value, pendientes, sub, Icon, color, bg }) => (
                <div key={label}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: bg }}>
                    <Icon size={20} strokeWidth={1.75} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-3xl font-black tracking-tight" style={{ color }}>
                      {value}
                    </p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">{label}</p>
                    {pendientes > 0 && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <AlertCircle size={11} strokeWidth={2.5} className="text-rose-500 shrink-0" />
                        <span className="text-[10px] font-bold text-rose-500">
                          {pendientes} pendiente{pendientes !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                    {sub && (
                      <p className="text-[10px] text-slate-400 mt-1">{sub}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* ── ACCIONES ── */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                Gestión
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {acciones.map(({ to, label, desc, Icon, color, bg, badge }) => (
                  <Link
                    key={to}
                    to={to}
                    className="group bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-slate-200 relative overflow-hidden"
                  >
                    {/* Decoración fondo */}
                    <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
                      style={{ backgroundColor: bg }} />

                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: bg }}>
                        <Icon size={19} strokeWidth={2} style={{ color }} />
                      </div>
                      {badge > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
                          <AlertCircle size={10} strokeWidth={2.5} />
                          {badge}
                        </span>
                      )}
                    </div>

                    <div>
                      <p className="font-black text-slate-800 text-sm">{label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                    </div>

                    <span className="text-xs font-semibold flex items-center gap-0.5 group-hover:gap-1.5 transition-all"
                      style={{ color }}>
                      Ir a {label.toLowerCase()}
                      <ChevronRight size={12} strokeWidth={2.5} />
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* ── TARIFA DE DELIVERY ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="h-1 w-full" style={{ backgroundColor: BRAND.dark }} />
              <div className="p-5">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: '#ECFDF5' }}>
                    <DollarSign size={19} strokeWidth={2} style={{ color: BRAND.primary }} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">Tarifa de delivery</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Precio por kilómetro para calcular el costo de entrega
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition">
                    <span className="text-xs font-black text-slate-400">S/</span>
                    <input
                      type="number"
                      value={nuevaTarifa}
                      onChange={e => setNuevaTarifa(e.target.value)}
                      step="0.10"
                      min="0.1"
                      placeholder="0.00"
                      className="flex-1 bg-transparent outline-none text-slate-800 font-black text-sm"
                    />
                    <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">
                      por km
                    </span>
                  </div>
                  <button
                    onClick={handleGuardarTarifa}
                    disabled={guardandoTarifa}
                    className="text-sm font-bold px-5 py-3 rounded-xl text-white transition hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
                    style={{ backgroundColor: BRAND.dark }}
                  >
                    {guardandoTarifa ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>

                {tarifa && (
                  <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                    Tarifa actual:
                    <span className="font-black text-slate-700 ml-1">
                      S/ {parseFloat(tarifa.precio_por_km).toFixed(2)} / km
                    </span>
                  </p>
                )}
              </div>
            </div>

          </>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard