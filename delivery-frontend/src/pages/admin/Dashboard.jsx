import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [stats, setStats] = useState({
    negocios: 0, negociosPendientes: 0,
    repartidores: 0, repartidoresPendientes: 0,
    pedidos: 0, pedidosHoy: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [negociosRes, repartidoresRes, pedidosRes] = await Promise.all([
        api.get('/admin/negocios'),
        api.get('/admin/repartidores'),
        api.get('/admin/pedidos')
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
    } catch (err) {
      toast.error('Error al cargar estadísticas')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try { await api.post('/logout') } catch (err) {}
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-orange-500">🛵 QuillaExpress</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              Admin: <strong>{user?.name}</strong>
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

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        <h2 className="text-2xl font-bold text-gray-800">Panel de Administración</h2>

        {/* STATS */}
        {loading ? (
          <div className="text-center py-10 text-gray-400">Cargando...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
              <div className="text-3xl font-bold text-orange-500">{stats.negocios}</div>
              <div className="text-sm text-gray-500 mt-1">Negocios totales</div>
              {stats.negociosPendientes > 0 && (
                <div className="text-xs text-red-500 font-semibold mt-1">
                  {stats.negociosPendientes} pendientes
                </div>
              )}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
              <div className="text-3xl font-bold text-blue-500">{stats.repartidores}</div>
              <div className="text-sm text-gray-500 mt-1">Repartidores totales</div>
              {stats.repartidoresPendientes > 0 && (
                <div className="text-xs text-red-500 font-semibold mt-1">
                  {stats.repartidoresPendientes} pendientes
                </div>
              )}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
              <div className="text-3xl font-bold text-green-500">{stats.pedidosHoy}</div>
              <div className="text-sm text-gray-500 mt-1">Pedidos hoy</div>
              <div className="text-xs text-gray-400 mt-1">{stats.pedidos} totales</div>
            </div>
          </div>
        )}

        {/* ACCIONES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/admin/negocios"
            className="bg-white hover:shadow-md border border-gray-100 rounded-xl p-5 flex items-center gap-4 transition"
          >
            <span className="text-4xl">🏪</span>
            <div>
              <p className="font-bold text-gray-800">Negocios</p>
              <p className="text-gray-500 text-sm">Aprobar y gestionar</p>
            </div>
          </Link>

          <Link
            to="/admin/repartidores"
            className="bg-white hover:shadow-md border border-gray-100 rounded-xl p-5 flex items-center gap-4 transition"
          >
            <span className="text-4xl">🛵</span>
            <div>
              <p className="font-bold text-gray-800">Repartidores</p>
              <p className="text-gray-500 text-sm">Aprobar y gestionar</p>
            </div>
          </Link>

          <Link
            to="/admin/pedidos"
            className="bg-white hover:shadow-md border border-gray-100 rounded-xl p-5 flex items-center gap-4 transition"
          >
            <span className="text-4xl">📋</span>
            <div>
              <p className="font-bold text-gray-800">Pedidos</p>
              <p className="text-gray-500 text-sm">Monitorear todos</p>
            </div>
          </Link>
        </div>

      </div>
    </div>
  )
}

export default AdminDashboard