import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const TIEMPO_LIMITE = 4 * 60

const ClientePago = () => {
  const navigate = useNavigate()
  const [carrito, setCarrito]                   = useState([])
  const [cotizacion, setCotizacion]             = useState(null)
  const [metodoPago, setMetodoPago]             = useState('yape')
  const [loading, setLoading]                   = useState(false)
  const [segundosRestantes, setSegundosRestantes] = useState(TIEMPO_LIMITE)
  const [tiempoAgotado, setTiempoAgotado]       = useState(false)
  const [negocio, setNegocio]                   = useState(null)
  const [numeroOperacion, setNumeroOperacion]   = useState('')
  const intervaloRef = useRef(null)

  useEffect(() => {
    const carritoGuardado    = JSON.parse(localStorage.getItem('carrito')) || []
    const cotizacionGuardada = JSON.parse(sessionStorage.getItem('cotizacion_delivery'))

    if (carritoGuardado.length > 0) {
      api.get(`/negocios/${carritoGuardado[0].negocio_id}`)
        .then(res => {
          setNegocio(res.data)
          // Auto-seleccionar primer método disponible
          const metodos = ['yape', 'plin', 'tunki']
          const primero = metodos.find(m => res.data[`qr_${m}`])
          if (primero) setMetodoPago(primero)
        })
        .catch(() => {})
    }

    if (carritoGuardado.length === 0 || !cotizacionGuardada) {
      toast.error('Sesión de pedido inválida o carrito vacío')
      navigate('/cliente/carrito')
      return
    }

    setCarrito(carritoGuardado)
    setCotizacion(cotizacionGuardada)

    intervaloRef.current = setInterval(() => {
      setSegundosRestantes(prev => {
        if (prev <= 1) {
          clearInterval(intervaloRef.current)
          setTiempoAgotado(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervaloRef.current)
  }, [navigate])

  useEffect(() => {
    if (!tiempoAgotado || !cotizacion) return
    const liberarYRedirigir = async () => {
      try {
        await api.post('/cliente/pedidos/liberar-reserva', {
          repartidor_id: cotizacion.repartidor_id
        })
      } catch (err) {}
      sessionStorage.removeItem('cotizacion_delivery')
      localStorage.removeItem('carrito')
      toast.error('⏰ Tiempo agotado. El repartidor fue liberado. Intenta de nuevo.')
      navigate('/cliente/carrito')
    }
    liberarYRedirigir()
  }, [tiempoAgotado, cotizacion, navigate])

  const handleConfirmarPago = async () => {
    if (!numeroOperacion.trim()) {
      toast.error('Ingresa el número de operación de tu transferencia')
      return
    }
    clearInterval(intervaloRef.current)
    setLoading(true)
    try {
      const productosMapeados = carrito.map(p => ({
        producto_id: p.id,
        cantidad: p.cantidad
      }))
      await api.post('/cliente/pedidos', {
        negocio_id:    carrito[0]?.negocio_id,
        productos:     productosMapeados,
        metodo_pago:   metodoPago,
        repartidor_id: cotizacion.repartidor_id
      })
      localStorage.removeItem('carrito')
      sessionStorage.removeItem('cotizacion_delivery')
      toast.success('¡Pago confirmado! Tu pedido ha sido enviado al negocio 🛵')
      navigate('/cliente/pedidos')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al confirmar el pago, intenta nuevamente')
      intervaloRef.current = setInterval(() => {
        setSegundosRestantes(prev => {
          if (prev <= 1) {
            clearInterval(intervaloRef.current)
            setTiempoAgotado(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } finally {
      setLoading(false)
    }
  }

  const formatearTiempo = (seg) => {
    const m = Math.floor(seg / 60).toString().padStart(2, '0')
    const s = (seg % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const colorTemporizador = segundosRestantes > 60
    ? 'text-green-600'
    : segundosRestantes > 30
      ? 'text-yellow-500'
      : 'text-red-500'

  const metodos = [
    { key: 'yape',  icon: '💜', label: 'Yape'  },
    { key: 'plin',  icon: '💚', label: 'Plín'  },
    { key: 'tunki', icon: '🧡', label: 'Tunki' },
  ]

  if (!cotizacion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-semibold">Cargando detalles de pago...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => navigate('/cliente/carrito')} className="text-gray-600 hover:text-orange-500 transition">
            ← Volver
          </button>
          <h1 className="text-lg font-bold text-gray-800">Confirmar pago</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

        {/* TEMPORIZADOR */}
        <div className={`bg-white rounded-xl border-2 shadow-sm p-5 flex items-center justify-between ${
          segundosRestantes <= 30 ? 'border-red-300' : 'border-gray-100'
        }`}>
          <div>
            <p className="font-bold text-gray-800">⏳ Tiempo para completar el pago</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Un repartidor está reservado para ti. Si el tiempo se agota, será liberado.
            </p>
          </div>
          <div className={`text-3xl font-bold tabular-nums ${colorTemporizador}`}>
            {formatearTiempo(segundosRestantes)}
          </div>
        </div>

        {/* RESUMEN */}
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
                <span>S/{cotizacion.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Distancia estimada</span>
                <span>{cotizacion.distancia_km} km</span>
              </div>
              <div className="flex justify-between text-gray-500 text-xs">
                <span>Costo de delivery</span>
                <span className="text-blue-500 font-semibold">
                  S/{cotizacion.costo_delivery.toFixed(2)} (pagar en efectivo al repartidor)
                </span>
              </div>
              <div className="flex justify-between font-bold text-gray-800 text-base pt-1">
                <span>Total a pagar ahora</span>
                <span className="text-orange-500">S/{cotizacion.subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* NOTA DELIVERY */}
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
          <p className="font-semibold mb-1">💡 ¿Cómo funciona el pago?</p>
          <p>Pagas <strong>S/{cotizacion.subtotal.toFixed(2)}</strong> por los productos ahora con tu billetera digital.</p>
          <p className="mt-1">El monto de delivery de <strong>S/{cotizacion.costo_delivery.toFixed(2)}</strong> lo pagas directamente en efectivo al motorizado al recibir tu pedido.</p>
        </div>

        {/* MÉTODO DE PAGO */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-4">Método de pago digital</h3>
          {negocio && !negocio.qr_yape && !negocio.qr_plin && !negocio.qr_tunki ? (
            <p className="text-sm text-gray-500 text-center py-4">
              El negocio aún no tiene métodos de pago configurados
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {metodos
                .filter(m => !negocio || negocio[`qr_${m.key}`])
                .map((m) => (
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
                ))
              }
            </div>
          )}
        </div>

        {/* QR DEL NEGOCIO */}
        {negocio?.[`qr_${metodoPago}`] && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
            <p className="font-bold text-gray-800 mb-3">
              Escanea el QR de {metodoPago.charAt(0).toUpperCase() + metodoPago.slice(1)}
            </p>
            <img
              src={negocio[`qr_${metodoPago}`]}
              alt={`QR ${metodoPago}`}
              className="w-48 h-48 object-contain mx-auto rounded-xl border border-gray-100"
            />
            <p className="text-xs text-gray-500 mt-2">
              Transfiere <strong>S/{cotizacion.subtotal.toFixed(2)}</strong>
            </p>
          </div>
        )}

        {/* INSTRUCCIONES */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-2">
            Instrucciones de pago con {metodoPago.charAt(0).toUpperCase() + metodoPago.slice(1)}
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>1. Abre tu aplicación de <strong>{metodoPago.charAt(0).toUpperCase() + metodoPago.slice(1)}</strong></p>
            <p>2. Transfiere <strong className="text-orange-500">S/{cotizacion.subtotal.toFixed(2)}</strong> al número del negocio
              {negocio?.telefono
                ? <strong> {negocio.telefono}</strong>
                : <span className="text-gray-400"> (el negocio aún no registró su número)</span>
              }
            </p>
            <p>3. Completa la transferencia e ingresa el número de operación</p>
            <p>4. Presiona <strong>"Confirmar pago"</strong> para enviar tu pedido</p>
          </div>
        </div>

        {/* NÚMERO DE OPERACIÓN */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <label className="block font-bold text-gray-800 mb-2">
            🔢 Número de operación
          </label>
          <input
            type="text"
            value={numeroOperacion}
            onChange={e => setNumeroOperacion(e.target.value)}
            placeholder="Ej: 12345678"
            maxLength={20}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition text-center text-lg font-bold tracking-widest"
          />
          <p className="text-xs text-gray-500 mt-1 text-center">
            Encuéntralo en el comprobante de tu app de pagos
          </p>
        </div>

      </div>

      {/* BOTÓN CONFIRMAR FIJO */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={handleConfirmarPago}
            disabled={loading || tiempoAgotado}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition disabled:opacity-60"
          >
            {loading
              ? 'Procesando Pedido...'
              : `✅ Confirmar pago con ${metodoPago.charAt(0).toUpperCase() + metodoPago.slice(1)} · S/${cotizacion.subtotal.toFixed(2)}`
            }
          </button>
        </div>
      </div>
    </div>
  )
}

export default ClientePago