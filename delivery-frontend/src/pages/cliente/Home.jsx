import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

const ClienteHome = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [negocios, setNegocios] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoriaActiva, setCategoriaActiva] = useState('Todos')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    fetchNegocios()
  }, [])

  const fetchNegocios = async () => {
    try {
      const res = await api.get('/negocios')
      setNegocios(res.data.data || res.data)
    } catch (err) {
      toast.error('Error al cargar negocios')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try { await api.post('/logout') } catch (err) {}
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
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Hola, <strong>{user?.name}</strong>
            </span>
            <Link to="/cliente/pedidos" className="text-sm text-orange-500 font-semibold hover:underline">
              Mis pedidos
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-br from-orange-500 to-orange-600 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-2">¿Qué quieres pedir hoy?</h2>
          <p className="text-orange-100 mb-6">Paga con Yape o Plin — Delivery en Quillabamba</p>
          <div className="max-w-xl mx-auto relative">
            <input
              type="text"
              placeholder="Buscar negocios o productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-6 py-4 rounded-xl text-gray-800 text-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <span className="absolute right-4 top-4 text-2xl">🔍</span>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaActiva(cat)}
              className={`flex flex-col items-center gap-1 px-5 py-3 rounded-xl border-2 transition min-w-fit text-xs font-semibold
                ${categoriaActiva === cat
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
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
          {busqueda
            ? `Resultados para "${busqueda}" (${negociosFiltrados.length})`
            : 'Negocios disponibles'
          }
        </h3>

        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">🛵</div>
            <p>Cargando negocios...</p>
          </div>
        ) : negociosFiltrados.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">🏪</div>
            <p>No se encontraron negocios</p>
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="mt-3 text-sm text-orange-500 font-semibold hover:underline"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {negociosFiltrados.map((negocio) => (
              <Link
                to={`/cliente/negocio/${negocio.id}`}
                key={negocio.id}
                className={`bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition overflow-hidden group
                  ${negocio.estado !== 'abierto' ? 'opacity-70' : ''}`}
              >
                <div className="h-32 bg-orange-50 flex items-center justify-center text-6xl group-hover:bg-orange-100 transition overflow-hidden">
                  {negocio.imagen
                    ? <img src={negocio.imagen} alt={negocio.nombre} className="w-full h-full object-cover" />
                    : iconoCategoria(negocio.categoria?.nombre)
                  }
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-bold text-gray-800 text-sm leading-tight">{negocio.nombre}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${
                      negocio.estado === 'abierto'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-500'
                    }`}>
                      {negocio.estado === 'abierto' ? '● Abierto' : '● Cerrado'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1 line-clamp-1">📍 {negocio.direccion}</p>
                  <p className="text-xs text-orange-400 font-semibold capitalize">
                    {negocio.categoria?.nombre || 'Negocio'}
                  </p>
                  {negocio.estado !== 'abierto' && (
                    <p className="text-xs text-red-400 mt-1">No disponible ahora</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default ClienteHome