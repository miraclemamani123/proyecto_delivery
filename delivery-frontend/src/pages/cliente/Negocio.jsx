import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const ClienteNegocio = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [negocio, setNegocio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [carrito, setCarrito] = useState([])

  useEffect(() => {
    fetchNegocio()
    const carritoGuardado = JSON.parse(localStorage.getItem('carrito')) || []
    setCarrito(carritoGuardado)
  }, [])

  const fetchNegocio = async () => {
    try {
      const res = await api.get(`/negocios/${id}`)
      setNegocio(res.data)
    } catch (err) {
      toast.error('Error al cargar el negocio')
      navigate('/cliente')
    } finally {
      setLoading(false)
    }
  }

  const agregarAlCarrito = (producto) => {
    const carritoActual = JSON.parse(localStorage.getItem('carrito')) || []

    if (carritoActual.length > 0 && carritoActual[0].negocio_id !== negocio.id) {
      if (window.confirm(`Ya tienes productos de "${carritoActual[0].negocio_nombre}" en tu carrito. ¿Quieres vaciarlo y empezar un nuevo pedido?`)) {
        localStorage.removeItem('carrito')
          const nuevoCarrito = [{
            id: producto.id,
            nombre: producto.nombre,
            precio: parseFloat(producto.precio),
            imagen_url: producto.imagen_url || null,  // 👈
            cantidad: 1,
            negocio_id: negocio.id,
            negocio_nombre: negocio.nombre
          }]
        localStorage.setItem('carrito', JSON.stringify(nuevoCarrito))
        setCarrito(nuevoCarrito)
        toast.success(`${producto.nombre} agregado`)
      }
      return
    }

    const existe = carritoActual.find(p => p.id === producto.id)
    let nuevoCarrito

    if (existe) {
      nuevoCarrito = carritoActual.map(p =>
        p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
      )
      toast.success(`+1 ${producto.nombre}`)
    } else {
        nuevoCarrito = [...carritoActual, {
          id: producto.id,
          nombre: producto.nombre,
          precio: parseFloat(producto.precio),
          imagen_url: producto.imagen_url || null,  // 👈
          cantidad: 1,
          negocio_id: negocio.id,
          negocio_nombre: negocio.nombre
        }]
      toast.success(`${producto.nombre} agregado`)
    }

    localStorage.setItem('carrito', JSON.stringify(nuevoCarrito))
    setCarrito(nuevoCarrito)
  }

  const cantidadEnCarrito = (productoId) => {
    const item = carrito.find(p => p.id === productoId)
    return item ? item.cantidad : 0
  }

  const totalCarrito = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0)
  const totalItems = carrito.reduce((acc, p) => acc + p.cantidad, 0)

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center text-gray-400">
        <div className="text-5xl mb-4">🛵</div>
        <p>Cargando...</p>
      </div>
    </div>
  )

  if (!negocio) return null

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/cliente')}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition"
          >
            ← Volver
          </button>
          <h1 className="text-lg font-bold text-gray-800">{negocio.nombre}</h1>
          {totalItems > 0 && (
            <Link
              to="/cliente/carrito"
              className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition"
            >
              🛒 {totalItems} · S/{totalCarrito.toFixed(2)}
            </Link>
          )}
          {totalItems === 0 && <div className="w-20" />}
        </div>
      </header>

      {/* INFO NEGOCIO */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-start gap-4">
            {/* ── Imagen del negocio ── */}
            <div className="w-20 h-20 bg-orange-100 rounded-xl flex items-center justify-center text-4xl flex-shrink-0 overflow-hidden">
              {negocio.imagen
                ? <img src={negocio.imagen} alt={negocio.nombre} className="w-full h-full object-cover" />
                : <span>🍽️</span>
              }
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-gray-800">{negocio.nombre}</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  negocio.estado === 'abierto'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-red-100 text-red-500'
                }`}>
                  {negocio.estado === 'abierto' ? '● Abierto' : '● Cerrado'}
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-1">{negocio.descripcion}</p>
              <p className="text-gray-400 text-xs">📍 {negocio.direccion}</p>
            </div>
          </div>
        </div>
      </div>

      {/* PRODUCTOS */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {negocio.estado !== 'abierto' ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">🔒</div>
            <p className="font-semibold">Este negocio está cerrado</p>
            <p className="text-sm mt-1">Vuelve más tarde</p>
          </div>
        ) : (
          <>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
              Productos disponibles
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {negocio.productos?.filter(p => p.disponible).map((producto) => (
                <div
                  key={producto.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-4"
                >
                  {/* ── Imagen del producto ── */}
                  <div className="w-20 h-20 bg-orange-50 rounded-lg flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden">
                    {producto.imagen_url
                      ? <img src={producto.imagen_url} alt={producto.nombre} className="w-full h-full object-cover" />
                      : <span>🍴</span>
                    }
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 text-sm">{producto.nombre}</h4>
                    <p className="text-gray-500 text-xs mb-2">{producto.descripcion}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-orange-500 font-bold">
                        S/{parseFloat(producto.precio).toFixed(2)}
                      </span>
                      <div className="flex items-center gap-2">
                        {cantidadEnCarrito(producto.id) > 0 && (
                          <span className="text-xs bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded-full">
                            x{cantidadEnCarrito(producto.id)}
                          </span>
                        )}
                        <button
                          onClick={() => agregarAlCarrito(producto)}
                          className="bg-orange-500 hover:bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* BOTÓN FLOTANTE CARRITO */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-50">
          <div className="max-w-5xl mx-auto">
            <Link
              to="/cliente/carrito"
              className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center font-bold py-4 rounded-xl shadow-lg transition"
            >
              🛒 Ver carrito · {totalItems} productos · S/{totalCarrito.toFixed(2)}
            </Link>
          </div>
        </div>
      )}

    </div>
  )
}

export default ClienteNegocio