
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import MapaEntrega, { obtenerRutaOSRM } from '../../components/shared/MapaEntrega'

const INICIO_DEMO = { lat: -12.8563, lng: -72.6926 }
const VELOCIDAD_MS = 400

const calcularMetros = (p1, p2) => {
  const R = 6371000
  const dLat = (p2.lat - p1.lat) * Math.PI / 180
  const dLng = (p2.lng - p1.lng) * Math.PI / 180
  const a = Math.sin(dLat/2) ** 2 +
    Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
    Math.sin(dLng/2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const useSimulacion = (pedidos) => {
  const [posiciones, setPosiciones] = useState({})
  const animRef = useRef({})
  const posRef  = useRef({})
  const notifEnviadaRef = useRef({})

  const detener = (id) => {
    if (animRef.current[id]) {
      clearInterval(animRef.current[id].timer)
      delete animRef.current[id]
    }
  }

  const iniciar = async (pedido) => {
    const id    = pedido.id
    const esNeg = ['aceptado', 'en_preparacion'].includes(pedido.estado)

    const latDest = parseFloat(esNeg
      ? (pedido.distancia?.latitud_negocio  || pedido.negocio?.latitud)
      : (pedido.distancia?.latitud_cliente  || pedido.cliente?.latitud))
    const lngDest = parseFloat(esNeg
      ? (pedido.distancia?.longitud_negocio || pedido.negocio?.longitud)
      : (pedido.distancia?.longitud_cliente || pedido.cliente?.longitud))

    if (isNaN(latDest) || isNaN(lngDest)) return

    const destinoKey = `${latDest},${lngDest}`
    if (animRef.current[id]?.destinoKey === destinoKey) return

    detener(id)

    const inicio = posRef.current[id] ?? INICIO_DEMO
    const puntos = await obtenerRutaOSRM(inicio, { lat: latDest, lng: lngDest })
    if (!puntos || puntos.length < 2) return

    let step = 0

    animRef.current[id] = {
      destinoKey,
      timer: setInterval(async () => {
        step++
        if (step >= puntos.length) { detener(id); return }

        const pos = puntos[step]
        posRef.current[id] = pos
        setPosiciones(prev => ({ ...prev, [id]: pos }))

        if (step % 5 === 0) {
          try {
            await api.post('/repartidor/ubicacion', { latitud: pos.lat, longitud: pos.lng })
          } catch (e) {}
        }

        if (pedido.estado === 'en_camino') {
          const latCli = parseFloat(pedido.distancia?.latitud_cliente || pedido.cliente?.latitud)
          const lngCli = parseFloat(pedido.distancia?.longitud_cliente || pedido.cliente?.longitud)
          if (!isNaN(latCli) && !isNaN(lngCli)) {
            const metros = calcularMetros(pos, { lat: latCli, lng: lngCli })
            if (metros < 300 && !notifEnviadaRef.current[`cerca_${id}`]) {
              notifEnviadaRef.current[`cerca_${id}`] = true
              api.post('/repartidor/notificar-cliente', { pedido_id: id, tipo: 'cerca' }).catch(() => {})
            }
          }
        }
      }, VELOCIDAD_MS)
    }
  }

  useEffect(() => {
    const activos = pedidos.filter(p =>
      ['aceptado', 'en_preparacion','listo', 'en_camino'].includes(p.estado)
    )
    Object.keys(animRef.current).forEach(id => {
      if (!activos.find(p => String(p.id) === id)) detener(id)
    })
    activos.forEach(p => iniciar(p))
    return () => Object.keys(animRef.current).forEach(id => detener(id))
  }, [pedidos])

  return posiciones
}

const estadoColor = (estado) => {
  switch (estado) {
    case 'pendiente':      return 'bg-yellow-100 text-yellow-700'
    case 'aceptado':       return 'bg-blue-100 text-blue-700'
    case 'en_preparacion': return 'bg-purple-100 text-purple-700'
    case 'listo':        return 'bg-teal-100 text-teal-700'
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
    case 'listo':        return '📦 Listo para recoger'
    case 'en_camino':      return '🛵 En camino'
    case 'entregado':      return '🎉 Entregado'
    case 'rechazado':      return '❌ Rechazado'
    default:               return estado
  }
}

const PedidoCard = ({ pedido, cambiarEstado, posSimulada }) => {
  const [notificando, setNotificando] = useState(false)

  const handleYaLlegue = async () => {
    setNotificando(true)
    try {
      await api.post('/repartidor/notificar-cliente', { pedido_id: pedido.id, tipo: 'llegue' })
      toast.success('Cliente notificado ✓')
    } catch (e) {
      toast.error('Error al notificar')
    } finally {
      setNotificando(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-gray-800">🏪 {pedido.negocio?.nombre}</p>
          <p className="text-xs text-gray-400 mt-0.5">Pedido #{pedido.id}</p>
        </div>
        <span className={'text-xs px-3 py-1 rounded-full font-semibold ' + estadoColor(pedido.estado)}>
          {estadoLabel(pedido.estado)}
        </span>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-1 text-sm">
        <p className="text-gray-600">👤 Cliente: <strong>{pedido.cliente?.usuario?.name} {pedido.cliente?.usuario?.apellido}</strong></p>
        <p className="text-gray-600">🏪 Recoger en: <strong>{pedido.negocio?.direccion}</strong></p>
        <p className="text-gray-600">📏 Distancia: <strong>{pedido.distancia_km} km</strong></p>
        <p className="text-green-600 font-semibold">💵 Cobrar en efectivo: S/{parseFloat(pedido.costo_delivery).toFixed(2)}</p>
      </div>

      <div className="border-t border-gray-100 pt-3 space-y-1 mb-3">
        {pedido.detalles?.map((detalle) => (
          <div key={detalle.id} className="flex justify-between text-sm text-gray-600">
            <span>{detalle.producto?.nombre} x{detalle.cantidad}</span>
            <span>S/{parseFloat(detalle.subtotal).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {pedido.estado === 'aceptado' && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">📍 Dirígete al negocio</p>
          <MapaEntrega negocio={pedido.negocio} cliente={pedido.cliente} repartidor={pedido.repartidor}
            distancia={pedido.distancia} modo="ir_a_negocio" posSimulada={posSimulada} />
          <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700 text-center font-semibold">
            ⏳ Esperando que el negocio marque "en preparación"
          </div>
        </div>
      )}

        {pedido.estado === 'en_preparacion' && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">📍 Ve al negocio</p>
            <MapaEntrega negocio={pedido.negocio} cliente={pedido.cliente} repartidor={pedido.repartidor}
              distancia={pedido.distancia} modo="ir_a_negocio" posSimulada={posSimulada} />
            <div className="bg-purple-50 rounded-lg p-3 text-sm text-purple-700 text-center font-semibold">
              👨‍🍳 El negocio está preparando el pedido — espera la señal
            </div>
          </div>
        )}

        {pedido.estado === 'listo' && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">📍 ¡Pedido listo! Ve a recogerlo</p>
            <MapaEntrega negocio={pedido.negocio} cliente={pedido.cliente} repartidor={pedido.repartidor}
              distancia={pedido.distancia} modo="ir_a_negocio" posSimulada={posSimulada} />
            <button onClick={() => cambiarEstado(pedido.id, 'en_camino')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition text-sm">
              🛵 Recoger pedido — salir a entregar
            </button>
          </div>
        )}

      {pedido.estado === 'en_camino' && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">🛵 Ruta hacia el cliente</p>
          <MapaEntrega negocio={null} cliente={pedido.cliente} repartidor={pedido.repartidor}
            distancia={pedido.distancia} modo="ir_a_cliente" posSimulada={posSimulada} />
          <div className="bg-orange-50 rounded-lg p-3 text-sm text-orange-700 text-center font-semibold">
            💵 Cobrar S/{parseFloat(pedido.costo_delivery).toFixed(2)} en efectivo al entregar
          </div>
          <button onClick={handleYaLlegue} disabled={notificando}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition text-sm disabled:opacity-60">
            {notificando ? 'Notificando...' : '📍 Ya llegué — notificar al cliente'}
          </button>
          <button onClick={() => cambiarEstado(pedido.id, 'entregado')}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition text-sm">
            🎉 Confirmar entrega
          </button>
        </div>
      )}

      {pedido.estado === 'entregado' && (
        <div className="bg-green-50 rounded-lg p-3 text-sm text-green-700 text-center font-semibold">
          🎉 Pedido entregado correctamente
        </div>
      )}

      {pedido.estado === 'rechazado' && (
        <div className="bg-red-50 rounded-lg p-3 text-sm text-red-700 text-center font-semibold">
          ❌ Pedido rechazado por el negocio
        </div>
      )}
    </div>
  )
}

const RepartidorPedidos = () => {
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [pestaña, setPestaña] = useState('pedidos')
  const intervaloPedidosRef   = useRef(null)

  const posicionesSimuladas = useSimulacion(pedidos)

  useEffect(() => {
    fetchPedidos()
    if (!intervaloPedidosRef.current) {
      intervaloPedidosRef.current = setInterval(fetchPedidos, 8000)
    }
    return () => {
      clearInterval(intervaloPedidosRef.current)
      intervaloPedidosRef.current = null
    }
  }, [])

  const fetchPedidos = async () => {
    try {
      const res = await api.get('/repartidor/pedidos')
      setPedidos(res.data)
    } catch (err) {
      toast.error('Error al cargar pedidos')
    } finally {
      setLoading(false)
    }
  }

  const cambiarEstado = async (pedidoId, estado) => {
    try {
      await api.patch(`/repartidor/pedidos/${pedidoId}/estado`, { estado })
      toast.success('Estado actualizado')
      fetchPedidos()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cambiar estado')
    }
  }

  // Pestaña pedidos: todo excepto entregado y rechazado
  const pedidosActuales  = pedidos.filter(p => !['entregado', 'rechazado'].includes(p.estado))
  const pedidosHistorial = pedidos.filter(p => ['entregado', 'rechazado'].includes(p.estado))

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/repartidor')} className="text-gray-600 hover:text-orange-500 transition">
            ← Volver
          </button>
          <h1 className="text-lg font-bold text-gray-800">Mis pedidos</h1>
          <button onClick={fetchPedidos} className="text-sm text-orange-500 font-semibold hover:underline">
            Actualizar
          </button>
        </div>

        {/* Pestañas */}
        <div className="max-w-3xl mx-auto px-4 flex border-t border-gray-100">
          <button
            onClick={() => setPestaña('pedidos')}
            className={`flex-1 py-3 text-sm font-bold transition border-b-2 ${
              pestaña === 'pedidos'
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            🛵 Pedidos
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
            <div className="text-5xl mb-4">🛵</div>
            <p>Cargando pedidos...</p>
          </div>
        ) : (
          <>
            {pestaña === 'pedidos' && (
              <div className="space-y-4">
                {pedidosActuales.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <div className="text-5xl mb-4">📦</div>
                    <p className="font-semibold">No tienes pedidos activos</p>
                  </div>
                ) : (
                  pedidosActuales.map(p => (
                    <PedidoCard key={p.id} pedido={p} cambiarEstado={cambiarEstado}
                      posSimulada={posicionesSimuladas[p.id]} />
                  ))
                )}
              </div>
            )}

            {pestaña === 'historial' && (
              <div className="space-y-4">
                {pedidosHistorial.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <div className="text-5xl mb-4">🗂️</div>
                    <p className="font-semibold">No hay historial aún</p>
                  </div>
                ) : (
                  pedidosHistorial.map(p => (
                    <PedidoCard key={p.id} pedido={p} cambiarEstado={cambiarEstado}
                      posSimulada={posicionesSimuladas[p.id]} />
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default RepartidorPedidos
