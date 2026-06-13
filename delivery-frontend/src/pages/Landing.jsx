import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search, MapPin, UtensilsCrossed, Pill, ShoppingBag,
  Wheat, ChefHat, IceCream, Store, Bike, Lock,
  LayoutGrid, ChevronRight, Package
} from 'lucide-react'
import api from '../api/axios'
import useAuthStore from '../store/authStore'

/* ─── Config de categoría → ícono + colores ──────────────────────────────── */
const getCategoriaConfig = (nombre) => {
  const n = nombre?.toLowerCase()
  if (n?.includes('restaurante')) return { Icon: UtensilsCrossed, color: '#EA580C', bg: '#FFF7ED', label: nombre }
  if (n?.includes('farmacia'))    return { Icon: Pill,            color: '#2563EB', bg: '#EFF6FF', label: nombre }
  if (n?.includes('tienda'))      return { Icon: ShoppingBag,     color: '#7C3AED', bg: '#F5F3FF', label: nombre }
  if (n?.includes('panaderia') || n?.includes('panadería'))
                                  return { Icon: Wheat,           color: '#CA8A04', bg: '#FEFCE8', label: nombre }
  if (n?.includes('poller'))      return { Icon: ChefHat,         color: '#DC2626', bg: '#FEF2F2', label: nombre }
  if (n?.includes('postre'))      return { Icon: IceCream,        color: '#DB2777', bg: '#FDF2F8', label: nombre }
  return                                 { Icon: Store,           color: '#059669', bg: '#ECFDF5', label: nombre }
}

/* ─── Landing ────────────────────────────────────────────────────────────── */
const Landing = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [negocios, setNegocios] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoriaActiva, setCategoriaActiva] = useState('Todos')

  /* ── lógica original sin tocar ── */
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin')
      else if (user.role === 'negocio') navigate('/negocio')
      else if (user.role === 'cliente') navigate('/cliente')
      else if (user.role === 'repartidor') navigate('/repartidor')
    }
  }, [user])

  useEffect(() => {
    const fetchNegocios = async () => {
      try {
        const res = await api.get('/negocios')
        setNegocios(res.data.data || res.data)
      } catch (err) {
        console.error(err)
      } finally {
        loading && setLoading(false)
      }
    }
    fetchNegocios()
  }, [])

  const categorias = ['Todos', ...new Set(negocios.map(n => n.categoria?.nombre).filter(Boolean))]

  const negociosFiltrados = categoriaActiva === 'Todos'
    ? negocios
    : negocios.filter(n => n.categoria?.nombre === categoriaActiva)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 antialiased">

      {/* ══════════════════════════════════════
          HEADER
      ══════════════════════════════════════ */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#0D2B1E' }}>
              <Bike size={16} color="#ffffff" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-black tracking-tight" style={{ color: '#0D2B1E' }}>
              Quilla<span style={{ color: '#10B981' }}>Express</span>
            </span>
          </div>

          {/* Nav */}
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-bold text-white rounded-xl transition-all hover:opacity-90"
              style={{ backgroundColor: '#10B981' }}
            >
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-20 sm:py-28 px-4"
        style={{ backgroundColor: '#0D2B1E' }}
      >
        {/* Patrón de puntos sutil */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '22px 22px' }}
        />
        {/* Glow decorativo */}
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: 'rgba(16,185,129,0.12)' }}
        />

        <div className="relative max-w-3xl mx-auto text-center">

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 border"
            style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#6EE7B7', borderColor: 'rgba(16,185,129,0.2)' }}
          >
            <MapPin size={11} strokeWidth={2.5} />
            Entregas rápidas en Quillabamba
          </div>

          {/* Headline */}
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.12] mb-5 text-white">
            Todo lo que necesitas,{' '}
            <span
              className="block sm:inline"
              style={{ color: '#34D399' }}
            >
              directo a tu puerta
            </span>
          </h2>

          <p className="text-sm sm:text-base max-w-md mx-auto mb-10 leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.5)' }}>
            Pide en tus restaurantes, tiendas y farmacias favoritas de confianza.
            Paga al instante con Yape o Plin.
          </p>

          {/* Barra de búsqueda */}
          <div className="max-w-xl mx-auto relative">
            <div
              className="absolute inset-0 rounded-2xl blur-xl opacity-20 pointer-events-none"
              style={{ backgroundColor: '#10B981' }}
            />
            <div className="relative bg-white rounded-2xl p-1.5 flex items-center shadow-2xl">
              <input
                type="text"
                placeholder="¿Qué te gustaría pedir hoy?"
                className="w-full pl-4 pr-3 py-3 bg-transparent text-slate-800 text-sm placeholder-slate-400 focus:outline-none"
              />
              <button
                className="p-3 rounded-xl text-white transition-opacity hover:opacity-90 shrink-0"
                style={{ backgroundColor: '#10B981' }}
              >
                <Search size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
            {[
              { icon: <Bike size={13} />, text: 'Entrega rápida' },
              { icon: <ShoppingBag size={13} />, text: 'Pago con Yape o Plin' },
              { icon: <Store size={13} />, text: 'Negocios locales' },
            ].map((item) => (
              <div key={item.text}
                className="flex items-center gap-1.5 text-xs font-medium"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                {item.icon}
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CATEGORÍAS
      ══════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-6">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          Categorías principales
        </p>
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {categorias.map((cat) => {
            const esActivo = categoriaActiva === cat
            const config = cat === 'Todos'
              ? { Icon: LayoutGrid, color: '#10B981', bg: '#ECFDF5' }
              : getCategoriaConfig(cat)
            const { Icon } = config

            return (
              <button
                key={cat}
                onClick={() => setCategoriaActiva(cat)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-bold whitespace-nowrap transition-all duration-200
                  ${esActivo
                    ? 'text-white border-transparent shadow-md scale-[1.02]'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                style={esActivo ? { backgroundColor: '#10B981', borderColor: '#10B981' } : {}}
              >
                <Icon
                  size={15}
                  strokeWidth={2}
                  color={esActivo ? '#ffffff' : config.color}
                />
                {cat}
              </button>
            )
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════
          NEGOCIOS
      ══════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">
          Comercios activos ({negociosFiltrados.length})
        </p>

        {loading ? (
          /* Skeletons */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                <div className="h-40 bg-slate-100" />
                <div className="p-4 space-y-2.5">
                  <div className="h-3.5 bg-slate-100 rounded-lg w-3/4" />
                  <div className="h-3 bg-slate-100 rounded-lg w-1/2" />
                  <div className="h-3 bg-slate-100 rounded-lg w-1/3 mt-4" />
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
            <p className="text-xs text-slate-400">Intenta cambiando la categoría seleccionada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {negociosFiltrados.map((negocio) => {
              const estaAbierto = negocio.estado === 'abierto'
              const config = getCategoriaConfig(negocio.categoria?.nombre)
              const { Icon } = config

              return (
                <Link
                  to="/login"
                  key={negocio.id}
                  className={`group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col
                    ${!estaAbierto ? 'opacity-75' : ''}`}
                >
                  {/* Área de imagen / ícono */}
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

                    {/* Badge de estado */}
                    {estaAbierto ? (
                      <span className="absolute top-3 right-3 flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full text-white"
                        style={{ backgroundColor: '#10B981' }}>
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
                      <span
                        className="text-xs font-bold flex items-center gap-0.5 group-hover:gap-1.5 transition-all duration-200"
                        style={{ color: '#10B981' }}
                      >
                        Ver tienda
                        <ChevronRight size={12} strokeWidth={2.5} />
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════
          FOOTER CTA
      ══════════════════════════════════════ */}
      <section className="bg-white border-t border-slate-100 py-14 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* CTA Negocio */}
          <div className="rounded-2xl p-7 flex items-start gap-5 border border-slate-100 relative overflow-hidden bg-slate-50">
            <div
              className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
              style={{ backgroundColor: 'rgba(16,185,129,0.06)' }}
            />
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-slate-200 bg-white"
            >
              <Store size={26} strokeWidth={1.5} style={{ color: '#0D2B1E' }} />
            </div>
            <div className="relative">
              <h4 className="font-black text-slate-800 text-base mb-1">¿Tienes un negocio local?</h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Digitaliza tus ventas en QuillaExpress y conecta con cientos de clientes diarios en Quillabamba.
              </p>
              <Link
                to="/register?rol=negocio"
                className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#0D2B1E' }}
              >
                Afiliar mi negocio
                <ChevronRight size={13} strokeWidth={2.5} />
              </Link>
            </div>
          </div>

          {/* CTA Repartidor */}
          <div
            className="rounded-2xl p-7 flex items-start gap-5 relative overflow-hidden"
            style={{ backgroundColor: '#0D2B1E' }}
          >
            <div
              className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
              style={{ backgroundColor: 'rgba(16,185,129,0.1)' }}
            />
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'rgba(16,185,129,0.12)' }}
            >
              <Bike size={26} strokeWidth={1.5} style={{ color: '#34D399' }} />
            </div>
            <div className="relative">
              <h4 className="font-black text-white text-base mb-1">¿Quieres generar ingresos?</h4>
              <p className="text-xs leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Sé parte de nuestro equipo de repartidores. Elige tus horarios y quédate con tus ganancias de envío.
              </p>
              <Link
                to="/register?rol=repartidor"
                className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#10B981' }}
              >
                Registrarme como repartidor
                <ChevronRight size={13} strokeWidth={2.5} />
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  )
}

export default Landing