import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bike, Search, MapPin, Lock, Store, LogOut,
  LayoutGrid, ChevronRight, ClipboardList,
  UtensilsCrossed, Pill, ShoppingBag, Wheat,
  ChefHat, IceCream, Package, X
} from 'lucide-react'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

/* ─── Sistema de color — igual en todos los componentes ──────────────────── */
const BRAND = { dark: '#0D2B1E', primary: '#10B981' }

/* ─── Config de categoría → ícono + colores ──────────────────────────────── */
const getCategoriaConfig = (nombre) => {
  const n = nombre?.toLowerCase()
  if (n?.includes('restaurante')) return { Icon: UtensilsCrossed, color: '#EA580C', bg: '#FFF7ED' }
  if (n?.includes('farmacia'))    return { Icon: Pill,            color: '#2563EB', bg: '#EFF6FF' }
  if (n?.includes('tienda'))      return { Icon: ShoppingBag,     color: '#7C3AED', bg: '#F5F3FF' }
  if (n?.includes('panaderia') || n?.includes('panadería'))
                                  return { Icon: Wheat,           color: '#CA8A04', bg: '#FEFCE8' }
  if (n?.includes('poller'))      return { Icon: ChefHat,         color: '#DC2626', bg: '#FEF2F2' }
  if (n?.includes('postre'))      return { Icon: IceCream,        color: '#DB2777', bg: '#FDF2F8' }
  return                                 { Icon: Package,         color: '#059669', bg: '#ECFDF5' }
}

/* ─── ClienteHome ─────────────────────────────────────────────────────────── */
const ClienteHome = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [negocios, setNegocios]             = useState([])
  const [loading, setLoading]               = useState(true)
  const [categoriaActiva, setCategoriaActiva] = useState('Todos')
  const [busqueda, setBusqueda]             = useState('')

  useEffect(() => { fetchNegocios() }, [])

  const fetchNegocios = async () => {
    try {
      const res = await api.get('/negocios')
      setNegocios(res.data.data || res.data)
    } catch { toast.error('Error al cargar negocios') }
    finally { setLoading(false) }
  }

  const handleLogout = async () => {
    try { await api.post('/logout') } catch {}
    logout()
    navigate('/')
  }

  const categorias = ['Todos', ...new Set(negocios.map(n => n.categoria?.nombre).filter(Boolean))]

  const negociosFiltrados = negocios
    .filter(n => categoriaActiva === 'Todos' || n.categoria?.nombre === categoriaActiva)
    .filter(n => {
      if (!busqueda) return true
      const texto = busqueda.toLowerCase()
      return (
        n.nombre?.toLowerCase().includes(texto) ||
        n.direccion?.toLowerCase().includes(texto) ||
        n.categoria?.nombre?.toLowerCase().includes(texto)
      )
    })

  return (
    <div className="min-h-screen bg-slate-50 antialiased">

      {/* ══════════════════════════════════════
          HEADER
      ══════════════════════════════════════ */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: BRAND.dark }}>
              <Bike size={16} color="#ffffff" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-black tracking-tight" style={{ color: BRAND.dark }}>
              Quilla<span style={{ color: BRAND.primary }}>Express</span>
            </span>
          </div>

          {/* Nav derecha */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 hidden sm:block">
              Hola, <span className="font-bold text-slate-800">{user?.name}</span>
            </span>
            <Link
              to="/cliente/pedidos"
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              <ClipboardList size={13} strokeWidth={2} />
              Mis pedidos
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 px-3 py-2 rounded-xl hover:bg-slate-50 transition"
            >
              <LogOut size={13} strokeWidth={2} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-14 sm:py-20 px-4"
        style={{ backgroundColor: BRAND.dark }}
      >
        {/* Decoración */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
        <div className="absolute -top-28 -right-28 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: 'rgba(16,185,129,0.12)' }} />

        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
            ¿Qué quieres{' '}
            <span style={{ color: '#34D399' }}>pedir hoy?</span>
          </h2>
          <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Paga con Yape o Plin — Delivery en Quillabamba
          </p>

          {/* Barra de búsqueda funcional */}
          <div className="max-w-xl mx-auto relative">
            <div className="absolute inset-0 rounded-2xl blur-xl opacity-20 pointer-events-none"
              style={{ backgroundColor: BRAND.primary }} />
            <div className="relative bg-white rounded-2xl p-1.5 flex items-center shadow-2xl">
              <Search size={16} className="absolute left-4 text-slate-400 shrink-0" strokeWidth={2} />
              <input
                type="text"
                placeholder="Buscar negocios o productos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-transparent text-slate-800 text-sm placeholder-slate-400 focus:outline-none"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda('')}
                  className="absolute right-16 text-slate-400 hover:text-slate-600 transition"
                >
                  <X size={15} strokeWidth={2.5} />
                </button>
              )}
              <button
                className="p-3 rounded-xl text-white shrink-0 transition hover:opacity-90"
                style={{ backgroundColor: BRAND.primary }}
              >
                <Search size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CATEGORÍAS
      ══════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-5 pt-8 pb-5">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          Categorías
        </p>
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {categorias.map((cat) => {
            const esActivo = categoriaActiva === cat
            const config = cat === 'Todos'
              ? { Icon: LayoutGrid, color: BRAND.primary, bg: '#ECFDF5' }
              : getCategoriaConfig(cat)
            const { Icon } = config

            return (
              <button
                key={cat}
                onClick={() => setCategoriaActiva(cat)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-bold whitespace-nowrap transition-all duration-200
                  ${esActivo
                    ? 'text-white border-transparent shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                style={esActivo ? { backgroundColor: BRAND.primary } : {}}
              >
                <Icon size={14} strokeWidth={2} color={esActivo ? '#ffffff' : config.color} />
                {cat}
              </button>
            )
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════
          NEGOCIOS
      ══════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-5 pb-14">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">
          {busqueda
            ? `Resultados para "${busqueda}" (${negociosFiltrados.length})`
            : `Negocios disponibles (${negociosFiltrados.length})`
          }
        </p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                <div className="h-40 bg-slate-100" />
                <div className="p-4 space-y-2.5">
                  <div className="h-3.5 bg-slate-100 rounded-lg w-3/4" />
                  <div className="h-3 bg-slate-100 rounded-lg w-1/2" />
                  <div className="h-3 bg-slate-100 rounded-lg w-1/3 mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : negociosFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-14 text-center max-w-sm mx-auto shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
              <Store size={28} className="text-slate-300" />
            </div>
            <h4 className="font-bold text-slate-700 mb-1">Sin resultados</h4>
            <p className="text-xs text-slate-400 mb-4">
              {busqueda ? `No se encontraron resultados para "${busqueda}"` : 'No hay negocios disponibles'}
            </p>
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="text-xs font-bold px-4 py-2 rounded-xl text-white transition hover:opacity-90"
                style={{ backgroundColor: BRAND.primary }}
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {negociosFiltrados.map((negocio) => {
              const estaAbierto = negocio.estado === 'abierto'
              const config = getCategoriaConfig(negocio.categoria?.nombre)
              const { Icon } = config

              return (
                <Link
                  to={`/cliente/negocio/${negocio.id}`}
                  key={negocio.id}
                  className={`group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col
                    ${!estaAbierto ? 'opacity-70' : ''}`}
                >
                  {/* Imagen / ícono */}
                  <div
                    className="h-40 flex items-center justify-center relative overflow-hidden shrink-0"
                    style={{ backgroundColor: config.bg }}
                  >
                    {negocio.imagen ? (
                      <img
                        src={negocio.imagen}
                        alt={negocio.nombre}
                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${!estaAbierto ? 'grayscale' : ''}`}
                      />
                    ) : (
                      <Icon
                        size={52}
                        color={config.color}
                        strokeWidth={1.5}
                        className="transition-transform duration-300 group-hover:scale-110 opacity-80"
                      />
                    )}

                    {/* Badge estado */}
                    {estaAbierto ? (
                      <span className="absolute top-3 right-3 flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full text-white"
                        style={{ backgroundColor: BRAND.primary }}>
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                        </span>
                        ABIERTO
                      </span>
                    ) : (
                      <span className="absolute top-3 right-3 flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full text-white bg-slate-500">
                        <Lock size={9} strokeWidth={2.5} />
                        CERRADO
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col flex-1">
                    <h4 className="font-bold text-slate-800 text-sm leading-snug line-clamp-1 mb-1 group-hover:text-emerald-600 transition-colors">
                      {negocio.nombre}
                    </h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1 line-clamp-1 mb-4">
                      <MapPin size={10} strokeWidth={2} className="shrink-0" />
                      {negocio.direccion}
                    </p>

                    <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg capitalize"
                        style={{ backgroundColor: config.bg, color: config.color }}
                      >
                        {negocio.categoria?.nombre || 'Comercio'}
                      </span>
                      {estaAbierto ? (
                        <span className="text-xs font-bold flex items-center gap-0.5 group-hover:gap-1.5 transition-all duration-200"
                          style={{ color: BRAND.primary }}>
                          Ver tienda
                          <ChevronRight size={12} strokeWidth={2.5} />
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">No disponible</span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

    </div>
  )
}

export default ClienteHome