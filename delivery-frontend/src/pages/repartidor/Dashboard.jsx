import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

const RepartidorDashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [estado, setEstado] = useState('inactivo')
  const [pedidosActivos, setPedidosActivos] = useState(0)
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    fetchDatos()
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
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const cambiarEstado = async (nuevoEstado) => {
    try {
      await api.patch('/repartidor/estado', { estado: nuevoEstado })
      setEstado(nuevoEstado)
      toast.success(`Estado: ${nuevoEstado}`)
    } catch (err) {
      toast.error('Error al cambiar estado')
    }
  }

  const handleLogout = async () => {
    try { await api.post('/logout') } catch (err) {}
    logout()
    navigate('/')
  }

  const estadoColor = {
    disponible: 'bg-green-100 text-green-600',
    ocupado:    'bg-orange-100 text-orange-600',
    inactivo:   'bg-gray-100 text-gray-500',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-orange-500">🛵 QuillaExpress</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              Hola, <strong>{user?.name}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* ESTADO */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Mi estado</h2>
              <p className="text-sm text-gray-500">Controla tu disponibilidad</p>
            </div>
            <span className={`text-sm px-3 py-1 rounded-full font-semibold ${estadoColor[estado]}`}>
              ● {estado.charAt(0).toUpperCase() + estado.slice(1)}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['disponible', 'ocupado', 'inactivo'].map((e) => (
              <button
                key={e}
                onClick={() => cambiarEstado(e)}
                className={`py-2 rounded-lg text-sm font-semibold transition border-2 ${
                  estado === e
                    ? 'border-orange-500 bg-orange-50 text-orange-600'
                    : 'border-gray-200 text-gray-600 hover:border-orange-300'
                }`}
              >
                {e === 'disponible' ? '✅ Disponible' :
                 e === 'ocupado'    ? '🔄 Ocupado' :
                                     '⏸️ Inactivo'}
              </button>
            ))}
          </div>
        </div>

        {/* MÉTRICAS */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
          <div className="text-4xl font-bold text-orange-500">{pedidosActivos}</div>
          <div className="text-sm text-gray-500 mt-1">Pedidos activos asignados</div>
        </div>

        {/* ACCIONES */}
        <Link
          to="/repartidor/pedidos"
          className="block bg-orange-500 hover:bg-orange-600 text-white rounded-xl p-5 flex items-center gap-4 transition"
        >
          <span className="text-4xl">📦</span>
          <div>
            <p className="font-bold text-lg">Mis pedidos</p>
            <p className="text-orange-100 text-sm">Ver pedidos asignados</p>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default RepartidorDashboard
