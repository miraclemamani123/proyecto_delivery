import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const NegocioProductos = () => {
  const navigate = useNavigate()
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria_producto_id: ''
  })

  useEffect(() => {
    fetchDatos()
  }, [])

  const fetchDatos = async () => {
    try {
      const [productosRes, categoriasRes] = await Promise.all([
        api.get('/negocio/productos'),
        api.get('/negocio/categorias')
      ])
      setProductos(productosRes.data)
      setCategorias(categoriasRes.data)
    } catch (err) {
      toast.error('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

const handleSubmit = async (e) => {
  e.preventDefault()
  try {
    const formData = new FormData()
    formData.append('nombre', form.nombre)
    formData.append('descripcion', form.descripcion)
    formData.append('precio', form.precio)
    formData.append('categoria_producto_id', form.categoria_producto_id)
    if (form.imagen) formData.append('imagen', form.imagen)

    if (editando) {
      // Sin _method — directo POST a la ruta de update
      await api.post(`/negocio/productos/${editando}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Producto actualizado')
    } else {
      await api.post('/negocio/productos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Producto creado')
    }
    setShowForm(false)
    setEditando(null)
    setForm({ nombre: '', descripcion: '', precio: '', categoria_producto_id: '', imagen: null })
    fetchDatos()
  } catch (err) {
    const errors = err.response?.data?.errors
    if (errors) Object.values(errors).forEach(e => toast.error(e[0]))
    else toast.error(err.response?.data?.message || 'Error al guardar')
  }
}

  const handleEditar = (producto) => {
    setEditando(producto.id)
    setForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      categoria_producto_id: producto.categoria_producto_id
    })
    setShowForm(true)
  }

  const toggleDisponible = async (producto) => {
    try {
      await api.patch(`/negocio/productos/${producto.id}/disponible`)
      toast.success(producto.disponible ? 'Producto desactivado' : 'Producto activado')
      fetchDatos()
    } catch (err) {
      toast.error('Error al cambiar disponibilidad')
    }
  }

  const cancelar = () => {
    setShowForm(false)
    setEditando(null)
    setForm({ nombre: '', descripcion: '', precio: '', categoria_producto_id: '' })
  }

  return (
    <div className="min-h-screen bg-gray-50">

{/* HEADER */}
<header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
  <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between gap-3">
    <button
      onClick={() => navigate('/negocio')}
      className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
    >
      <span className="text-base leading-none">←</span>
      Volver
    </button>

    <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
      Mis productos
    </h1>

    <button
      onClick={() => setShowForm(true)}
      className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold shadow-sm hover:bg-emerald-700 hover:shadow-md transition-all duration-300"
    >
      + Agregar
    </button>
  </div>
</header>

<div className="max-w-5xl mx-auto px-5 py-6">

  {/* FORMULARIO */}
  {showForm && (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.25)] p-6 mb-6">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h3 className="text-lg font-black text-slate-900">
            {editando ? 'Editar producto' : 'Nuevo producto'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Completa la información básica del producto
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej: Lomo saltado"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Descripción</label>
          <input
            type="text"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Ej: Con papas fritas y arroz"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Precio (S/)</label>
            <input
              type="number"
              name="precio"
              value={form.precio}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Categoría</label>
            <select
              name="categoria_producto_id"
              value={form.categoria_producto_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition"
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] gap-3 items-start">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Imagen del producto</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setForm({ ...form, imagen: e.target.files[0] })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition"
            />
            {editando && productos.find(p => p.id === editando)?.imagen_url && (
              <img
                src={productos.find(p => p.id === editando)?.imagen_url}
                alt="Imagen actual"
                className="mt-3 h-24 w-24 rounded-2xl object-cover border border-slate-200 shadow-sm"
              />
            )}
          </div>

          <button
            type="submit"
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm hover:shadow-md transition-all duration-300"
          >
            {editando ? 'Actualizar' : 'Crear producto'}
          </button>

          <button
            type="button"
            onClick={cancelar}
            className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )}
        {/* LISTA DE PRODUCTOS */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">🍽️</div>
            <p>Cargando productos...</p>
          </div>
        ) : productos.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">🍽️</div>
            <p className="font-semibold">No tienes productos aún</p>
            <p className="text-sm mt-1">Agrega tu primer producto</p>
          </div>
        ) : (
          <div className="space-y-3">
            {productos.map(producto => (
              <div key={producto.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
              <div className="w-14 h-14 bg-orange-50 rounded-lg flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden">
                {producto.imagen_url
                  ? <img src={producto.imagen_url} alt={producto.nombre} className="w-full h-full object-cover" />
                  : <span>🍴</span>
                }
              </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-800">{producto.nombre}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      producto.disponible
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-500'
                    }`}>
                      {producto.disponible ? '● Activo' : '● Inactivo'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{producto.descripcion}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-orange-500 font-bold text-sm">
                      S/{parseFloat(producto.precio).toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {producto.categoria?.nombre}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => toggleDisponible(producto)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
                      producto.disponible
                        ? 'bg-red-100 hover:bg-red-200 text-red-600'
                        : 'bg-green-100 hover:bg-green-200 text-green-600'
                    }`}
                  >
                    {producto.disponible ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    onClick={() => handleEditar(producto)}
                    className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-blue-100 hover:bg-blue-200 text-blue-600 transition"
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NegocioProductos