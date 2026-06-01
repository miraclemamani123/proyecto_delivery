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
        setLoading(false)
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
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-orange-500">🛵 QuillaExpress</h1>
          <div className="flex gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-orange-500 border border-orange-500 rounded-lg font-semibold hover:bg-orange-50 transition text-sm"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition text-sm"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-br from-orange-500 to-orange-600 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-3">
            Quillabamba <span className="text-yellow-300">a domicilio</span>
          </h2>
          <p className="text-orange-100 text-lg mb-8">
            Restaurantes, tiendas y farmacias locales — Paga con Yape o Plin
          </p>
          <div className="max-w-xl mx-auto relative">
            <input
              type="text"
              placeholder="¿Qué quieres pedir hoy?"
              className="w-full px-6 py-4 rounded-xl text-gray-800 text-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <span className="absolute right-4 top-4 text-2xl">🔍</span>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
          Categorías
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaActiva(cat)}
              className={`flex flex-col items-center gap-1 px-5 py-3 rounded-xl border transition min-w-fit text-xs font-semibold
                ${categoriaActiva === cat
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-600 border-gray-100 hover:border-orange-400'
                }`}
            >
              <span className="text-2xl">{iconoCategoria(cat)}</span>
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </section>

      {/* NEGOCIOS */}
      <section className="max-w-6xl mx-auto px-4 pb-10">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
          Negocios disponibles
        </h3>

        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">🛵</div>
            <p>Cargando negocios...</p>
          </div>
        ) : negociosFiltrados.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">🏪</div>
            <p>No hay negocios disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {negociosFiltrados.map((negocio) => (
              <Link
                to="/login"
                key={negocio.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition overflow-hidden group"
              >
                {/* Imagen / Emoji */}
                <div className="h-32 bg-orange-50 flex items-center justify-center text-6xl group-hover:bg-orange-100 transition">
                  {iconoCategoria(negocio.categoria?.nombre)}
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-bold text-gray-800 text-sm leading-tight">
                      {negocio.nombre}
                    </h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${
                      negocio.estado === 'abierto'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-500'
                    }`}>
                      {negocio.estado === 'abierto' ? '● Abierto' : '● Cerrado'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1 line-clamp-1">
                    📍 {negocio.direccion}
                  </p>
                  <p className="text-xs text-orange-400 font-semibold capitalize">
                    {negocio.categoria?.nombre || 'Negocio'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER CTA */}
      <section className="bg-white border-t border-gray-100 py-10 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-orange-50 rounded-xl p-6 flex items-center gap-4">
            <span className="text-4xl">🏪</span>
            <div>
              <h4 className="font-bold text-gray-800 mb-1">¿Tienes un negocio?</h4>
              <p className="text-sm text-gray-500 mb-3">
                Únete a QuillaExpress y llega a más clientes en Quillabamba
              </p>
              <Link
                to="/register?rol=negocio"
                className="text-sm bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
              >
                Registrar negocio
              </Link>
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl p-6 flex items-center gap-4">
            <span className="text-4xl">🛵</span>
            <div>
              <h4 className="font-bold text-gray-800 mb-1">¿Quieres repartir?</h4>
              <p className="text-sm text-gray-500 mb-3">
                Trabaja independiente y gana el costo de delivery en Quillabamba
              </p>
              <Link
                to="/register?rol=repartidor"
                className="text-sm bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
              >
                Ser repartidor
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

export default Landing