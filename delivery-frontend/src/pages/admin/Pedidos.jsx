import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const estadoColor = (estado) => {
  switch (estado) {
    case 'pendiente':      return 'bg-yellow-100 text-yellow-700'
    case 'aceptado':       return 'bg-blue-100 text-blue-700'
    case 'en_preparacion': return 'bg-purple-100 text-purple-700'
    case 'en_camino':      return 'bg-orange-100 text-orange-700'
    case 'entregado':      return 'bg-green-100 text-green-700'
    case 'rechazado':      return 'bg-red-100 text-red-700'
    default:               return 'bg-gray-100 text-gray-700'
  }
}

const estadoLabel = (estado) => {
  switch (estado) {
    case 'pendiente':      return '⏳ Pendiente'
    case 'aceptado':       return '✅ Aceptado'
    case 'en_preparacion': return '👨‍🍳 En preparación'
    case 'en_camino':      return '🛵 En camino'
    case 'entregado':      return '🎉 Entregado'
    case 'rechazado':      return '❌ Rechazado'
    default:               return estado
  }
}

const AdminPedidos = () => {
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todos')

  useEffect(() => {
    fetchPedidos()
  }, [])

  const fetchPedidos = async () => {
    try {
      const res = await api.get('/admin/pedidos')
      setPedidos(res.data)
    } catch (err) {
      toast.error('Error al cargar pedidos')
    } finally {
      setLoading(false)
    }
  }

  const pedidosFiltrados = filtro === 'todos'
    ? pedidos
    : pedidos.filter(p => p.estado === filtro)

  const filtros = [
    { key: 'todos',         label: 'Todos' },
    { key: 'pendiente',     label: '⏳ Pendiente' },
    { key: 'aceptado',      label: '✅ Aceptado' },
    { key: 'en_preparacion',label: '👨‍🍳 Preparando' },
    { key: 'en_camino',     label: '🛵 En camino' },
    { key: 'entregado',     label: '🎉 Entregado' },
    { key: 'rechazado',     label: '❌ Rechazado' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/admin')}
            className="text-gray-600 hover:text-orange-500 transition"
          >
            ← Volver
          </button>
          <h1 className="text-lg font-bold text-gray-800">Monitoreo de Pedidos</h1>
          <button
            onClick={fetchPedidos}
            className="text-sm text-orange-500 font-semibold hover:underline"
          >
            Actualizar
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">

        {/* FILTROS */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filtros.map(f => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={'px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ' + (
                filtro === f.key
                  ? 'bg-orange-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* CONTADOR */}
        <p className="text-sm text-gray-500">
          Mostrando <strong>{pedidosFiltrados.length}</strong> de {pedidos.length} pedidos
        </p>

        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">📋</div>
            <p>Cargando pedidos...</p>
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">📋</div>
            <p>No hay pedidos con este filtro</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pedidosFiltrados.map(pedido => (
              <div key={pedido.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-800">Pedido #{pedido.id}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(pedido.created_at).toLocaleDateString('es-PE', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className={'text-xs px-3 py-1 rounded-full font-semibold ' + estadoColor(pedido.estado)}>
                    {estadoLabel(pedido.estado)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm mb-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">🏪 Negocio</p>
                    <p className="font-semibold text-gray-700">{pedido.negocio?.nombre}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">👤 Cliente</p>
                    <p className="font-semibold text-gray-700">
                      {pedido.cliente?.usuario?.name} {pedido.cliente?.usuario?.apellido}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">🛵 Repartidor</p>
                    <p className="font-semibold text-gray-700">
                      {pedido.repartidor?.usuario?.name || 'Sin asignar'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between text-sm border-t border-gray-100 pt-3">
                  <span className="text-gray-500">
                    📏 {pedido.distancia_km} km
                  </span>
                  <span className="text-gray-500">
                    Delivery: S/{parseFloat(pedido.costo_delivery).toFixed(2)}
                  </span>
                  <span className="font-bold text-orange-500">
                    Total: S/{(
                      pedido.detalles?.reduce((acc, d) => acc + parseFloat(d.subtotal), 0) +
                      parseFloat(pedido.costo_delivery)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPedidos