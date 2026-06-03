import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const ClientePago = () => {
  const navigate = useNavigate()
  const [carrito, setCarrito] = useState([])
  const [pedido, setPedido] = useState(null)
  const [metodoPago, setMetodoPago] = useState('yape')
  const [loading, setLoading] = useState(false)
  const [creandoPedido, setCreandoPedido] = useState(true)

  useEffect(() => {
    const carritoGuardado = JSON.parse(localStorage.getItem('carrito')) || []
    if (carritoGuardado.length === 0) {
      navigate('/cliente')
      return
    }
    setCarrito(carritoGuardado)

    // Si ya hay un pedido pendiente no crear otro
    const pedidoPendiente = JSON.parse(sessionStorage.getItem('pedido_pendiente'))
    if (pedidoPendiente) {
      setPedido(pedidoPendiente)
      setCreandoPedido(false)
      return
    }

    crearPedido(carritoGuardado)
  }, [])

  const crearPedido = async (carritoData) => {
    try {
      const productos = carritoData.map(p => ({
        producto_id: p.id,
        cantidad: p.cantidad
      }))

      const res = await api.post('/cliente/pedidos', {
        negocio_id: carritoData[0].negocio_id,
        productos
      })

      setPedido(res.data)
      sessionStorage.setItem('pedido_pendiente', JSON.stringify(res.data))

    } catch (err) {
      const msg = err.response?.data?.message || 'Error al crear el pedido'
      toast.error(msg)
      navigate('/cliente/carrito')
    } finally {
      setCreandoPedido(false)
    }
  }

  const handleConfirmarPago = async () => {
    if (!pedido) return
    setLoading(true)
    try {
      await api.post(`/cliente/pedidos/${pedido.pedido_id}/pago`, {
        metodo: metodoPago,
        monto: pedido.subtotal
      })

      localStorage.removeItem('carrito')
      sessionStorage.removeItem('pedido_pendiente')
      toast.success('¡Pago confirmado! Tu pedido está en camino 🛵')
      navigate('/cliente/pedidos')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al confirmar el pago')
    } finally {
      setLoading(false)
    }
  }

  const metodos = [
    { key: 'yape',  icon: '💜', label: 'Yape',  },
    { key: 'plin',  icon: '💚', label: 'Plin',  },
    { key: 'tunki', icon: '🧡', label: 'Tunki', },
  ]

  if (creandoPedido) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center text-gray-400">
        <div className="text-5xl mb-4">🛵</div>
        <p className="font-semibold">Preparando tu pedido...</p>
        <p className="text-sm mt-1">Calculando costo de delivery</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-32">

      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate('/cliente/carrito')}
            className="text-gray-600 hover:text-orange-500 transition"
          >
            ← Volver
          </button>
          <h1 className="text-lg font-bold text-gray-800">Confirmar pago</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

        {/* RESUMEN DEL PEDIDO */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-4">Resumen del pedido</h3>
          <div className="space-y-2 text-sm">
            {carrito.map(p => (
              <div key={p.id} className="flex justify-between text-gray-600">
                <span>{p.nombre} x{p.cantidad}</span>
                <span>S/{(p.precio * p.cantidad).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-2 mt-2 space-y-1">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal productos</span>
                <span>S/{pedido?.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Distancia</span>
                <span>{pedido?.distancia_km} km</span>
              </div>
              <div className="flex justify-between text-gray-500 text-xs">
                <span>Costo de delivery</span>
                <span className="text-blue-500 font-semibold">
                  S/{pedido?.costo_delivery?.toFixed(2)} (pagar al repartidor)
                </span>
              </div>
              <div className="flex justify-between font-bold text-gray-800 text-base pt-1">
                <span>Total a pagar ahora</span>
                <span className="text-orange-500">S/{pedido?.subtotal?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* NOTA DELIVERY */}
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
          <p className="font-semibold mb-1">💡 ¿Cómo funciona el pago?</p>
          <p>Pagas <strong>S/{pedido?.subtotal?.toFixed(2)}</strong> por los productos ahora con Yape, Plin o Tunki.</p>
          <p className="mt-1">El delivery de <strong>S/{pedido?.costo_delivery?.toFixed(2)}</strong> lo pagas en efectivo al repartidor cuando llegue.</p>
        </div>

        {/* MÉTODO DE PAGO */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-4">Método de pago digital</h3>
          <div className="grid grid-cols-3 gap-3">
            {metodos.map((m) => (
              <button
                key={m.key}
                onClick={() => setMetodoPago(m.key)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition
                  ${metodoPago === m.key
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300'
                  }`}
              >
                <span className="text-3xl">{m.icon}</span>
                <span className="text-sm font-bold text-gray-700">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* INSTRUCCIONES PAGO */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-2">
            Instrucciones de pago con {metodoPago.charAt(0).toUpperCase() + metodoPago.slice(1)}
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>1. Abre tu app de <strong>{metodoPago.charAt(0).toUpperCase() + metodoPago.slice(1)}</strong></p>
            <p>2. Transfiere <strong className="text-orange-500">S/{pedido?.subtotal?.toFixed(2)}</strong> al número <strong>999-888-777</strong></p>
            <p>3. Usa como referencia tu <strong>pedido #{pedido?.pedido_id}</strong></p>
            <p>4. Presiona <strong>"Confirmar pago"</strong> abajo</p>
          </div>
        </div>

      </div>

      {/* BOTÓN CONFIRMAR FIJO */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={handleConfirmarPago}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition disabled:opacity-60"
          >
            {loading
              ? 'Confirmando...'
              : `✅ Confirmar pago con ${metodoPago.charAt(0).toUpperCase() + metodoPago.slice(1)} · S/${pedido?.subtotal?.toFixed(2)}`
            }
          </button>
        </div>
      </div>

    </div>
  )
}

export default ClientePago