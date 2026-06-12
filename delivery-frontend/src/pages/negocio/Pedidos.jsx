import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const estadoColor = (estado) => {
  switch (estado) {
    case 'pendiente':      return 'bg-yellow-100 text-yellow-700'
    case 'aceptado':       return 'bg-blue-100 text-blue-700'
    case 'en_preparacion': return 'bg-purple-100 text-purple-700'
    case 'listo':          return 'bg-teal-100 text-teal-700'
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
    case 'en_preparacion': return '👨‍🍳 Preparando pedido'
    case 'listo':          return '📦 Listo para recoger'
    case 'en_camino':      return '🛵 En camino'
    case 'entregado':      return '🎉 Entregado'
    case 'rechazado':      return '❌ Rechazado'
    default:               return estado
  }
}

const ITEMS_POR_PAGINA = 5

const NegocioPedidos = () => {
  const navigate = useNavigate()
  const [pedidos, setPedidos]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [pestaña, setPestaña]     = useState('pedidos')
  const [paginaHistorial, setPaginaHistorial] = useState(1)
  const intervaloRef              = useRef(null)

  useEffect(() => {
    fetchPedidos()
    if (!intervaloRef.current) {
      intervaloRef.current = setInterval(fetchPedidos, 8000)
    }
    return () => {
      clearInterval(intervaloRef.current)
      intervaloRef.current = null
    }
  }, [])

  // Resetear página al cambiar de pestaña
  useEffect(() => {
    setPaginaHistorial(1)
  }, [pestaña])

  const fetchPedidos = async () => {
    try {
      const res = await api.get('/negocio/pedidos')
      setPedidos(res.data)
    } catch (err) {
      toast.error('Error al cargar pedidos')
    } finally {
      setLoading(false)
    }
  }

  const cambiarEstado = async (pedidoId, estado) => {
    try {
      await api.patch(`/negocio/pedidos/${pedidoId}/estado`, { estado })
      toast.success(`Pedido ${estadoLabel(estado)}`)
      fetchPedidos()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cambiar estado')
    }
  }

  const pedidosActuales  = pedidos.filter(p =>
    ['pendiente', 'aceptado', 'en_preparacion', 'listo', 'en_camino'].includes(p.estado)
  )
  const pedidosHistorial = pedidos.filter(p =>
    ['entregado', 'rechazado'].includes(p.estado)
  )

  // Paginación del historial
  const totalPaginas     = Math.ceil(pedidosHistorial.length / ITEMS_POR_PAGINA)
  const historialPaginado = pedidosHistorial.slice(
    (paginaHistorial - 1) * ITEMS_POR_PAGINA,
    paginaHistorial * ITEMS_POR_PAGINA
  )

  const PedidoCard = ({ pedido }) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-gray-800">
            👤 {pedido.cliente?.usuario?.name} {pedido.cliente?.usuario?.apellido}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">✉️ {pedido.cliente?.usuario?.email}</p>
          {pedido.cliente?.telefono && (
            <p className="text-xs text-gray-500 mt-0.5">📞 {pedido.cliente?.telefono}</p>
          )}
          <p className="text-xs text-gray-400 mt-0.5">
            Pedido #{pedido.id} · {new Date(pedido.created_at).toLocaleDateString('es-PE', {
              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${estadoColor(pedido.estado)}`}>
          {estadoLabel(pedido.estado)}
        </span>
      </div>

      <div className="border-t border-gray-100 pt-3 space-y-1 mb-3">
        {pedido.detalles?.map((detalle) => (
          <div key={detalle.id} className="flex justify-between text-sm text-gray-600">
            <span>{detalle.producto?.nombre} x{detalle.cantidad}</span>
            <span>S/{parseFloat(detalle.subtotal).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold text-gray-800 pt-1 border-t border-gray-100">
          <span>Total productos</span>
          <span className="text-orange-500">
            S/{pedido.detalles?.reduce((acc, d) => acc + parseFloat(d.subtotal), 0).toFixed(2)}
          </span>
        </div>
      </div>

      {pedido.estado === 'pendiente' && (
        <div className="flex gap-2">
          <button onClick={() => cambiarEstado(pedido.id, 'aceptado')}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition text-sm">
            ✅ Aceptar
          </button>
          <button onClick={() => cambiarEstado(pedido.id, 'rechazado')}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition text-sm">
            ❌ Rechazar
          </button>
        </div>
      )}

      {pedido.estado === 'aceptado' && (
        <button onClick={() => cambiarEstado(pedido.id, 'en_preparacion')}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 rounded-lg transition text-sm">
          👨‍🍳 Iniciar preparación
        </button>
      )}

      {pedido.estado === 'en_preparacion' && (
        <button onClick={() => cambiarEstado(pedido.id, 'listo')}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 rounded-lg transition text-sm">
          📦 Marcar como listo
        </button>
      )}

      {pedido.estado === 'listo' && (
        <div className="bg-teal-50 rounded-lg p-3 text-sm text-teal-700 text-center font-semibold">
          📦 Pedido listo — esperando que el repartidor lo recoja
        </div>
      )}

      {pedido.estado === 'en_camino' && (
        <div className="bg-orange-50 rounded-lg p-3 text-sm text-orange-700 text-center font-semibold">
          🛵 El repartidor está en camino al cliente
        </div>
      )}

      {pedido.estado === 'rechazado' && (
        <div className="bg-red-50 rounded-lg p-3 text-sm text-red-700">
          <p className="font-semibold">❌ Pedido rechazado</p>
          <p className="mt-1">Contacta al cliente para coordinar:</p>
          <p className="font-bold mt-1">✉️ {pedido.cliente?.usuario?.email}</p>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/negocio')} className="text-gray-600 hover:text-orange-500 transition">
            ← Volver
          </button>
          <h1 className="text-lg font-bold text-gray-800">Pedidos</h1>
          <button onClick={fetchPedidos} className="text-sm text-orange-500 font-semibold hover:underline">
            Actualizar
          </button>
        </div>

        <div className="max-w-3xl mx-auto px-4 flex border-t border-gray-100">
          <button
            onClick={() => setPestaña('pedidos')}
            className={`flex-1 py-3 text-sm font-bold transition border-b-2 ${
              pestaña === 'pedidos'
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            📋 Pedidos
            {pedidosActuales.length > 0 && (
              <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                {pedidosActuales.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setPestaña('historial')}
            className={`flex-1 py-3 text-sm font-bold transition border-b-2 ${
              pestaña === 'historial'
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            🗂️ Historial
            {pedidosHistorial.length > 0 && (
              <span className="ml-2 bg-gray-400 text-white text-xs px-2 py-0.5 rounded-full">
                {pedidosHistorial.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">⏳</div>
            <p>Cargando pedidos...</p>
          </div>
        ) : (
          <>
            {/* PESTAÑA PEDIDOS */}
            {pestaña === 'pedidos' && (
              <div className="space-y-4">
                {pedidosActuales.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <div className="text-5xl mb-4">📋</div>
                    <p className="font-semibold">No hay pedidos activos</p>
                  </div>
                ) : (
                  pedidosActuales.map(p => <PedidoCard key={p.id} pedido={p} />)
                )}
              </div>
            )}

            {/* PESTAÑA HISTORIAL CON PAGINACIÓN */}
            {pestaña === 'historial' && (
              <div className="space-y-4">
                {pedidosHistorial.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <div className="text-5xl mb-4">🗂️</div>
                    <p className="font-semibold">No hay historial aún</p>
                  </div>
                ) : (
                  <>
                    {/* Info de paginación */}
                    <p className="text-xs text-gray-400 text-right">
                      Mostrando {(paginaHistorial - 1) * ITEMS_POR_PAGINA + 1}–{Math.min(paginaHistorial * ITEMS_POR_PAGINA, pedidosHistorial.length)} de {pedidosHistorial.length} pedidos
                    </p>

                    {/* Pedidos de la página actual */}
                    {historialPaginado.map(p => <PedidoCard key={p.id} pedido={p} />)}

                    {/* Controles de paginación */}
                    {totalPaginas > 1 && (
                      <div className="flex items-center justify-center gap-2 pt-4">
                        <button
                          onClick={() => setPaginaHistorial(p => Math.max(1, p - 1))}
                          disabled={paginaHistorial === 1}
                          className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          ← Anterior
                        </button>

                        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
                          <button
                            key={n}
                            onClick={() => setPaginaHistorial(n)}
                            className={`w-9 h-9 text-sm font-bold rounded-lg transition ${
                              paginaHistorial === n
                                ? 'bg-orange-500 text-white border border-orange-500'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {n}
                          </button>
                        ))}

                        <button
                          onClick={() => setPaginaHistorial(p => Math.min(totalPaginas, p + 1))}
                          disabled={paginaHistorial === totalPaginas}
                          className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          Siguiente →
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default NegocioPedidos