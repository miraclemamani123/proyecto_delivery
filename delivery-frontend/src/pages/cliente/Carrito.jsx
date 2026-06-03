import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const ClienteCarrito = () => {
  const navigate = useNavigate()
  const [carrito, setCarrito] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const carritoGuardado = JSON.parse(localStorage.getItem('carrito')) || []
    setCarrito(carritoGuardado)
  }, [])

  const actualizarCantidad = (id, cantidad) => {
    if (cantidad < 1) {
      eliminarProducto(id)
      return
    }
    const nuevoCarrito = carrito.map(p =>
      p.id === id ? { ...p, cantidad } : p
    )
    setCarrito(nuevoCarrito)
    localStorage.setItem('carrito', JSON.stringify(nuevoCarrito))
  }

  const eliminarProducto = (id) => {
    const nuevoCarrito = carrito.filter(p => p.id !== id)
    setCarrito(nuevoCarrito)
    localStorage.setItem('carrito', JSON.stringify(nuevoCarrito))
    toast.success('Producto eliminado')
  }

  const vaciarCarrito = () => {
    setCarrito([])
    localStorage.removeItem('carrito')
    toast.success('Carrito vaciado')
  }

  const total = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0)
  const totalItems = carrito.reduce((acc, p) => acc + p.cantidad, 0)
  const negocioNombre = carrito[0]?.negocio_nombre || ''

const handleProcederPago = async () => {
    if (carrito.length === 0) {
    toast.error('Tu carrito está vacío')
    return
  }
  setLoading(true)
  try {
    // Obtener ubicación del navegador
    const pos = await new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject)
    )

    // Actualizar ubicación en el backend
    await api.put('/cliente/ubicacion', {
      latitud: pos.coords.latitude,
      longitud: pos.coords.longitude
    })

    navigate('/cliente/pago')
  } catch (err) {
    if (err.code === 1) {
      toast.error('Debes permitir el acceso a tu ubicación')
    } else {
      toast.error(err.response?.data?.message || 'Error al proceder al pago')
    }
  } finally {
    setLoading(false)
  }
}
  if (carrito.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-orange-500 transition"
            >
              ← Volver
            </button>
            <h1 className="text-lg font-bold text-gray-800">Mi carrito</h1>
          </div>
        </header>
        <div className="text-center py-24 text-gray-400">
          <div className="text-6xl mb-4">🛒</div>
          <p className="font-semibold text-lg">Tu carrito está vacío</p>
          <p className="text-sm mt-1 mb-6">Agrega productos de un negocio</p>
          <Link
            to="/cliente"
            className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition"
          >
            Ver negocios
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">

      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-orange-500 transition"
          >
            ← Volver
          </button>
          <h1 className="text-lg font-bold text-gray-800">Mi carrito</h1>
          <button
            onClick={vaciarCarrito}
            className="text-sm text-red-400 hover:text-red-600 transition"
          >
            Vaciar
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* NEGOCIO */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">
            Pedido de
          </p>
          <p className="font-bold text-gray-800">🏪 {negocioNombre}</p>
        </div>

        {/* PRODUCTOS */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-4">
          {carrito.map((producto, index) => (
            <div
              key={producto.id}
              className={`p-4 flex items-center gap-4 ${
                index < carrito.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                🍴
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-sm">{producto.nombre}</p>
                <p className="text-orange-500 font-bold text-sm">
                  S/{producto.precio.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => actualizarCantidad(producto.id, producto.cantidad - 1)}
                  className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 font-bold hover:border-orange-400 hover:text-orange-500 transition"
                >
                  −
                </button>
                <span className="w-6 text-center font-bold text-gray-800">
                  {producto.cantidad}
                </span>
                <button
                  onClick={() => actualizarCantidad(producto.id, producto.cantidad + 1)}
                  className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold hover:bg-orange-600 transition"
                >
                  +
                </button>
              </div>
              <p className="w-16 text-right font-bold text-gray-800 text-sm">
                S/{(producto.precio * producto.cantidad).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {/* RESUMEN */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-gray-800 mb-3">Resumen del pedido</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>{totalItems} productos</span>
              <span>S/{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-400 text-xs">
              <span>Costo de delivery</span>
              <span>Se calcula al confirmar</span>
            </div>
            <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-800">
              <span>Subtotal productos</span>
              <span className="text-orange-500">S/{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* BOTÓN PAGO FIJO */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={handleProcederPago}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition disabled:opacity-60"
          >
            {loading ? 'Verificando...' : `Proceder al pago · S/${total.toFixed(2)}`}
          </button>
        </div>
      </div>

    </div>
  )
}

export default ClienteCarrito