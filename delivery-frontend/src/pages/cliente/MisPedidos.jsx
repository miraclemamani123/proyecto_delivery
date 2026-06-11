import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import MapaEntrega from '../../components/shared/MapaEntrega'

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

// ─── Hook: sigue posición del repartidor desde BD cada 5s ───────────────────
const useSeguimientoRepartidor = (pedidos) => {
  const [posiciones, setPosiciones] = useState({})
  const intervaloRef = useRef(null)

  useEffect(() => {
    const hayEnCamino = pedidos.some(p => p.estado === 'en_camino')

    if (!hayEnCamino) {
      clearInterval(intervaloRef.current)
      intervaloRef.current = null
      return
    }

    const actualizar = async () => {
      try {
        const res = await api.get('/cliente/pedidos')
        const nuevas = {}
        res.data.forEach(p => {
          if (p.estado !== 'en_camino') return
          const lat = parseFloat(p.repartidor?.ubicaciones?.[0]?.latitud ?? p.repartidor?.latitud)
          const lng = parseFloat(p.repartidor?.ubicaciones?.[0]?.longitud ?? p.repartidor?.longitud)
          if (!isNaN(lat) && !isNaN(lng)) nuevas[p.id] = { lat, lng }
        })
        setPosiciones(prev => ({ ...prev, ...nuevas }))
      } catch (e) {}
    }

    actualizar()
    if (!intervaloRef.current) {
      intervaloRef.current = setInterval(actualizar, 5000)
    }

    return () => {
      clearInterval(intervaloRef.current)
      intervaloRef.current = null
    }
  }, [pedidos])

  return posiciones
}

const MisPedidos = () => {
  const navigate = useNavigate()
  const [pedidos, setPedidos]             = useState([])
  const [perfilCliente, setPerfilCliente] = useState(null)
  const [loading, setLoading]             = useState(true)

  // Deduplicación y control de intervalo para notificaciones
  const mostradas        = useRef(new Set())
  const intervaloNotiRef = useRef(null)
  const intervaloPedidos = useRef(null)

  const posicionesRepartidor = useSeguimientoRepartidor(pedidos)

  // ─── Cargar pedidos y perfil al montar ──────────────────────────────────
  useEffect(() => {
    fetchPedidos()
    fetchPerfil()

    if (!intervaloPedidos.current) {
      intervaloPedidos.current = setInterval(fetchPedidos, 8000)
    }

    return () => {
      clearInterval(intervaloPedidos.current)
      intervaloPedidos.current = null
    }
  }, [])

  // ─── Escuchar notificaciones del cliente ────────────────────────────────
  useEffect(() => {
    if (intervaloNotiRef.current) return

    const escuchar = async () => {
      try {
        const res = await api.get('/notificaciones')
        const nuevas = res.data.filter(n =>
          !n.leido && !mostradas.current.has(n.id)
        )

        for (const noti of nuevas) {
          // 1. Deduplicar antes de todo
          mostradas.current.add(noti.id)

          // 2. Marcar como leída — PATCH correcto
          try { await api.patch(`/notificaciones/${noti.id}/leer`) } catch (e) {}

          // 3. Toast
          toast.custom((t) => (
            <div className="max-w-sm w-full bg-white shadow-2xl rounded-xl border border-gray-100 p-4 flex justify-between items-center gap-3">
              <div className="text-xl">
                {noti.titulo.includes('cerca') ? '🛵' :
                 noti.titulo.includes('llegó') ? '📍' : '🎉'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">{noti.titulo}</p>
                <p className="text-xs text-gray-500 mt-0.5">{noti.mensaje}</p>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="bg-gray-800 text-white text-xs font-semibold px-3 py-2 rounded-lg"
              >
                Ok 👍
              </button>
            </div>
          ), { id: `cli-${noti.id}`, duration: Infinity })
        }
      } catch (e) {}
    }

    escuchar()
    intervaloNotiRef.current = setInterval(escuchar, 6000)

    return () => {
      clearInterval(intervaloNotiRef.current)
      intervaloNotiRef.current = null
    }
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

  const fetchPerfil = async () => {
    try {
      const res = await api.get('/cliente/perfil')
      setPerfilCliente(res.data)
    } catch (err) {
      console.error('Error al cargar perfil:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/cliente')} className="text-gray-600 hover:text-orange-500 transition">
            ← Volver
          </button>
          <h1 className="text-lg font-bold text-gray-800">Mis pedidos</h1>
          <button onClick={fetchPedidos} className="text-sm text-orange-500 font-semibold hover:underline">
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
            <Link to="/cliente" className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition">
              Ver negocios
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map((pedido) => (
              <div key={pedido.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">

                {/* CABECERA */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-800">🏪 {pedido.negocio?.nombre}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Pedido #{pedido.id} · {new Date(pedido.created_at).toLocaleDateString('es-PE', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className={'text-xs px-3 py-1 rounded-full font-semibold ' + estadoColor(pedido.estado)}>
                    {estadoLabel(pedido.estado)}
                  </span>
                </div>

                {/* PRODUCTOS */}
                <div className="border-t border-gray-100 pt-3 space-y-1">
                  {pedido.detalles?.map((detalle) => (
                    <div key={detalle.id} className="flex justify-between text-sm text-gray-600">
                      <span>{detalle.producto?.nombre} x{detalle.cantidad}</span>
                      <span>S/{parseFloat(detalle.subtotal).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* TOTALES */}
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

                {/* MAPA FASE 1: pendiente / aceptado / en_preparacion */}
                {['pendiente', 'aceptado', 'en_preparacion'].includes(pedido.estado) && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      🏪 Tu pedido está siendo preparado
                    </p>
                    <MapaEntrega
                      negocio={pedido.negocio}
                      cliente={perfilCliente}
                      repartidor={null}
                      distancia={pedido.distancia}
                      modo="solo_negocio"
                    />
                    <div className="bg-purple-50 rounded-lg p-3 text-sm text-purple-700 text-center font-semibold">
                      {pedido.estado === 'pendiente'      && '⏳ Esperando que el negocio acepte tu pedido'}
                      {pedido.estado === 'aceptado'       && '✅ Pedido aceptado — el negocio lo está preparando'}
                      {pedido.estado === 'en_preparacion' && '👨‍🍳 Tu pedido está siendo preparado'}
                    </div>
                  </div>
                )}

                {/* MAPA FASE 2: en_camino — tracking del repartidor */}
                {pedido.estado === 'en_camino' && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      🛵 Tu repartidor está en camino
                    </p>
                    <MapaEntrega
                      negocio={null}
                      cliente={perfilCliente}
                      repartidor={
                        posicionesRepartidor[pedido.id]
                          ? {
                              latitud:  posicionesRepartidor[pedido.id].lat,
                              longitud: posicionesRepartidor[pedido.id].lng,
                            }
                          : pedido.repartidor
                      }
                      distancia={pedido.distancia}
                      modo="cliente_tracking"
                    />
                    <div className="bg-orange-50 rounded-lg p-3 text-sm text-orange-700 font-semibold text-center">
                      🛵 En camino — prepara S/{parseFloat(pedido.costo_delivery).toFixed(2)} en efectivo
                    </div>
                  </div>
                )}

                {/* ENTREGADO */}
                {pedido.estado === 'entregado' && (
                  <div className="mt-3 bg-green-50 rounded-lg p-3 text-sm text-green-700 font-semibold text-center">
                    🎉 ¡Pedido entregado! Gracias por usar QuillaExpress
                  </div>
                )}

                {/* RECHAZADO */}
                {pedido.estado === 'rechazado' && (
                  <div className="mt-3 bg-red-50 rounded-lg p-3 text-sm text-red-700 font-semibold text-center">
                    ❌ Pedido rechazado por el negocio
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