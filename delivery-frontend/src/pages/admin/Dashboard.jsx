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
  const [tarifa, setTarifa] = useState(null)
  const [nuevaTarifa, setNuevaTarifa] = useState('')
  const [guardandoTarifa, setGuardandoTarifa] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

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
    } catch (err) {
      toast.error('Error al cargar estadísticas')
    } finally {
      setLoading(false)
    }
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
    } catch (err) {
      toast.error('Error al actualizar tarifa')
    } finally {
      setGuardandoTarifa(false)
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
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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

            <Link
              to="/admin/auditoria"
              className="bg-white hover:shadow-md border border-gray-100 rounded-xl p-5 flex items-center gap-4 transition"
            >
              <span className="text-4xl">🔍</span>
              <div>
                <p className="font-bold text-gray-800">Auditoría</p>
                <p className="text-gray-500 text-sm">Registro de acciones</p>
              </div>
            </Link>
          </div>

        {/* TARIFA DE DELIVERY */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-800 text-base">Tarifa de delivery</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Precio por kilómetro para calcular el costo de entrega
              </p>
            </div>
            <span className="text-2xl">💰</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
              <span className="text-gray-500 font-semibold text-sm">S/</span>
              <input
                type="number"
                value={nuevaTarifa}
                onChange={e => setNuevaTarifa(e.target.value)}
                step="0.10"
                min="0.1"
                placeholder="0.00"
                className="flex-1 bg-transparent outline-none text-gray-800 font-bold text-sm"
              />
              <span className="text-gray-400 text-xs">por km</span>
            </div>
            <button
              onClick={handleGuardarTarifa}
              disabled={guardandoTarifa}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-3 rounded-lg transition disabled:opacity-50 text-sm"
            >
              {guardandoTarifa ? 'Guardando...' : 'Guardar'}
            </button>
          </div>

          {tarifa && (
            <p className="text-xs text-gray-400 mt-2">
              Tarifa actual: <span className="font-semibold text-gray-600">
                S/{parseFloat(tarifa.precio_por_km).toFixed(2)} / km
              </span>
            </p>
          )}
        </div>

      </div>
    </div>
  )
}

export default AdminDashboard