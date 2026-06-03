import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const estadoColor = (estado) => {
  switch (estado) {
    case 'pendiente':     return 'bg-yellow-100 text-yellow-700'
    case 'aceptado':      return 'bg-blue-100 text-blue-700'
    case 'en_preparacion': return 'bg-purple-100 text-purple-700'
    case 'en_camino':     return 'bg-orange-100 text-orange-700'
    case 'entregado':     return 'bg-green-100 text-green-700'
    case 'rechazado':     return 'bg-red-100 text-red-700'
    default:              return 'bg-gray-100 text-gray-700'
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

const MisPedidos = () => {
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPedidos()
  }, [])

  const fetchPedidos = async () => {
    try {
      const res = await api.get('/cliente/pedidos')
      setPedidos(res.data)
    } catch (err) {
      toast.error('Error al cargar pedidos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/cliente')}
            className="text-gray-600 hover:text-orange-500 transition"
          >
            ← Volver
          </button>
          <h1 className="text-lg font-bold text-gray-800">Mis pedidos</h1>
          <button
            onClick={fetchPedidos}
            className="text-sm text-orange-500 font-semibold hover:underline"
          >
            Actualizar
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">🛵</div>
            <p>Cargando pedidos...</p>
          </div>
        ) : pedidos.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">📋</div>
            <p className="font-semibold">No tienes pedidos aún</p>
            <p className="text-sm mt-1 mb-6">¡Haz tu primer pedido!</p>
            <Link
              to="/cliente"
              className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition"
            >
              Ver negocios
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map((pedido) => (
              <div
                key={pedido.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
              >
                {/* Header pedido */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-800">
                      🏪 {pedido.negocio?.nombre}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Pedido #{pedido.id} · {new Date(pedido.created_at).toLocaleDateString('es-PE', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${estadoColor(pedido.estado)}`}>
                    {estadoLabel(pedido.estado)}
                  </span>
                </div>

                {/* Productos */}
                <div className="border-t border-gray-100 pt-3 space-y-1">
                  {pedido.detalles?.map((detalle) => (
                    <div key={detalle.id} className="flex justify-between text-sm text-gray-600">
                      <span>{detalle.producto?.nombre} x{detalle.cantidad}</span>
                      <span>S/{parseFloat(detalle.subtotal).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Totales */}
                <div className="border-t border-gray-100 pt-3 mt-3 space-y-1">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Delivery</span>
                    <span>S/{parseFloat(pedido.costo_delivery).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-800">
                    <span>Total</span>
                    <span className="text-orange-500">
                      S/{(
                        pedido.detalles?.reduce((acc, d) => acc + parseFloat(d.subtotal), 0) +
                        parseFloat(pedido.costo_delivery)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Estado en camino */}
                {pedido.estado === 'en_camino' && (
                  <div className="mt-3 bg-orange-50 rounded-lg p-3 text-sm text-orange-700 font-semibold text-center">
                    🛵 Tu pedido está en camino — prepara S/{parseFloat(pedido.costo_delivery).toFixed(2)} en efectivo
                  </div>
                )}

                {pedido.estado === 'entregado' && (
                  <div className="mt-3 bg-green-50 rounded-lg p-3 text-sm text-green-700 font-semibold text-center">
                    🎉 ¡Pedido entregado! Gracias por usar QuillaExpress
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default MisPedidos