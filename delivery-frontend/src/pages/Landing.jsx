import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import useAuthStore from '../store/authStore'

const Landing = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [negocios, setNegocios] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoriaActiva, setCategoriaActiva] = useState('Todos')

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

  const iconoCategoria = (nombre) => {
    const n = nombre?.toLowerCase()
    if (n?.includes('restaurante')) return '🍽️'
    if (n?.includes('farmacia'))    return '💊'
    if (n?.includes('tienda'))      return '🛒'
    if (n?.includes('panaderia') || n?.includes('panadería')) return '🍞'
    if (n?.includes('poller'))      return '🍗'
    if (n?.includes('postre'))      return '🍰'
    return '🏪'
  }

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-700 antialiased selection:bg-emerald-500 selection:text-white">

      {/* HEADER */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group">
            <span className="text-2xl group-hover:animate-bounce">🛵</span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              QuillaExpress
            </h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-slate-500 rounded-xl text-sm font-medium hover:bg-slate-100 hover:text-slate-800 transition-all duration-200"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-semibold shadow-sm shadow-emerald-600/10 hover:shadow-lg hover:shadow-emerald-600/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-emerald-950 to-slate-900 text-white py-16 sm:py-24 px-4">
        {/* Patrón geométrico sutil de fondo */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 mb-4 backdrop-blur-sm border border-emerald-500/20">
            📍 Entregas rápidas en Quillabamba
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 leading-[1.15]">
            Todo lo que necesitas, <br className="sm:hidden" />
            <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300 bg-clip-text text-transparent">directo a tu puerta</span>
          </h2>
          <p className="text-slate-300/90 text-sm sm:text-base max-w-lg mx-auto mb-8 font-normal">
            Pide en tus restaurantes, tiendas y farmacias favoritas de confianza. Paga al instante con Yape o Plin.
          </p>
          
          <div className="max-w-xl mx-auto group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl opacity-15 blur-xl group-hover:opacity-25 transition-all duration-300"></div>
            <div className="relative bg-white rounded-2xl p-1.5 shadow-xl flex items-center border border-slate-200/10">
              <input
                type="text"
                placeholder="¿Qué te gustaría pedir hoy?"
                className="w-full pl-4 pr-12 py-3 bg-transparent text-slate-800 text-base placeholder-slate-400 focus:outline-none"
              />
              <button className="absolute right-3 p-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl shadow-md shadow-emerald-600/10 hover:from-emerald-600 hover:to-teal-700 transition-all">
                <span className="text-lg block -scale-x-100">🔍</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Categorías principales
          </h3>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-4 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
          {categorias.map((cat) => {
            const esActivo = categoriaActiva === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoriaActiva(cat)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl border transition-all duration-200 min-w-fit text-sm font-semibold select-none
                  ${esActivo
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/10 scale-[1.01]'
                    : 'bg-white text-slate-600 border-slate-200/60 hover:border-emerald-500/40 hover:bg-emerald-50/30'
                  }`}
              >
                <span className="text-xl">{iconoCategoria(cat)}</span>
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* NEGOCIOS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
          Comercios Activos ({negociosFiltrados.length})
        </h3>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="text-5xl animate-bounce mb-4 text-emerald-500/80">🛵</div>
            <p className="text-sm font-medium animate-pulse text-slate-500">Buscando los locales más cercanos...</p>
          </div>
        ) : negociosFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400 max-w-md mx-auto shadow-sm">
            <div className="text-5xl mb-4">🏪</div>
            <h4 className="text-slate-700 font-bold mb-1">No hay negocios disponibles</h4>
            <p className="text-sm">Intenta cambiando la categoría seleccionada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {negociosFiltrados.map((negocio) => {
              const estaAbierto = negocio.estado === 'abierto';
              return (
                <Link
                  to="/login"
                  key={negocio.id}
                  className={`group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col
                    ${!estaAbierto && 'opacity-80 bg-slate-50/50'}`}
                >
                  {/* Contenedor Imagen / Emoji */}
                  <div className="h-40 bg-gradient-to-br from-emerald-50/40 to-teal-50/20 flex items-center justify-center text-6xl relative overflow-hidden shrink-0">
                    {negocio.imagen ? (
                      <img 
                        src={negocio.imagen} 
                        alt={negocio.nombre} 
                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${!estaAbierto && 'grayscale'}`} 
                      />
                    ) : (
                      <span className="transition-transform duration-300 group-hover:scale-110 block">
                        {iconoCategoria(negocio.categoria?.nombre)}
                      </span>
                    )}
                    
                    {/* Badge de Estado */}
                    <span className={`absolute top-3 right-3 text-[10px] tracking-wide px-2.5 py-1 rounded-full font-bold shadow-sm border backdrop-blur-sm ${
                      estaAbierto
                        ? 'bg-emerald-500 text-white border-emerald-400/20'
                        : 'bg-slate-500 text-white border-slate-400/20'
                    }`}>
                      {estaAbierto ? '● ABIERTO' : '🔒 CERRADO'}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div>
                      <h4 className="font-bold text-slate-800 text-base leading-snug group-hover:text-emerald-600 transition-colors duration-200 line-clamp-1 mb-1">
                        {negocio.nombre}
                      </h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mb-3 line-clamp-1">
                        <span>📍</span> {negocio.direccion}
                      </p>
                    </div>
                    
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-lg capitalize">
                        {negocio.categoria?.nombre || 'Comercio'}
                      </span>
                      <span className="text-xs text-emerald-600 font-bold group-hover:translate-x-1 transition-transform duration-200 hidden sm:inline-flex items-center gap-0.5">
                        Ver tienda →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* FOOTER CTA */}
      <section className="bg-white border-t border-slate-100 py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* CTA Negocio */}
          <div className="bg-gradient-to-br from-emerald-50/50 to-slate-50 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-4 border border-emerald-100/30 relative overflow-hidden group">
            <span className="text-4xl bg-white p-3 rounded-2xl shadow-sm shrink-0 border border-slate-100">🏪</span>
            <div className="flex flex-col h-full justify-between items-start">
              <div>
                <h4 className="font-bold text-slate-800 text-lg mb-1">¿Tienes un negocio local?</h4>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">
                  Digitaliza tus ventas en QuillaExpress y conecta con cientos de clientes diarios en Quillabamba.
                </p>
              </div>
              <Link
                to="/register?rol=negocio"
                className="text-xs bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-emerald-600 hover:shadow-md hover:shadow-emerald-600/10 transition-all duration-200"
              >
                Afiliar mi negocio
              </Link>
            </div>
          </div>

          {/* CTA Repartidor */}
          <div className="bg-gradient-to-br from-teal-50/40 to-slate-50 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-4 border border-teal-100/30 relative overflow-hidden group">
            <span className="text-4xl bg-white p-3 rounded-2xl shadow-sm shrink-0 border border-slate-100"> 🛵</span>
            <div className="flex flex-col h-full justify-between items-start">
              <div>
                <h4 className="font-bold text-slate-800 text-lg mb-1">¿Quieres generar ingresos?</h4>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">
                  Sé parte de nuestro equipo de repartidores. Elige tus horarios y quédate con tus ganancias de envío.
                </p>
              </div>
              <Link
                to="/register?rol=repartidor"
                className="text-xs bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-600/10 transition-all duration-200"
              >
                Registrarme como repartidor
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  )
}

export default Landing