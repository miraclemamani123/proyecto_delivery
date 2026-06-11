import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

const CATEGORIAS = [
  { id: 1, nombre: 'Restaurante', icon: '🍽️' },
  { id: 2, nombre: 'Farmacia',    icon: '💊' },
  { id: 3, nombre: 'Tienda',      icon: '🛍️' },
]

const Register = () => {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [searchParams] = useSearchParams()

  const [paso, setPaso] = useState(1)
  const [form, setForm] = useState({
    name:                  '',
    apellido:              '',
    email:                 '',
    password:              '',
    password_confirmation: '',
    rol:                   searchParams.get('rol') || 'cliente',
    telefono:              '',
  })
  const [negocioForm, setNegocioForm] = useState({
    nombre:               '',
    descripcion:          '',
    direccion:            '',
    telefono:             '',
    categoria_negocio_id: '',
    latitud:              '',
    longitud:             '',
  })
  const [loading, setLoading]         = useState(false)
  const [obteniendo, setObteniendo]   = useState(false)

  const roles = [
    { key: 'cliente',    icon: '🛒', label: 'Cliente',    desc: 'Haz pedidos a domicilio' },
    { key: 'negocio',    icon: '🏪', label: 'Negocio',    desc: 'Vende tus productos'     },
    { key: 'repartidor', icon: '🛵', label: 'Repartidor', desc: 'Gana repartiendo'        },
  ]

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const handleNegocioChange = (e) => setNegocioForm({ ...negocioForm, [e.target.name]: e.target.value })

  const obtenerUbicacion = () => {
    if (!navigator.geolocation) {
      toast.error('Tu navegador no soporta geolocalización')
      return
    }
    setObteniendo(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNegocioForm(prev => ({
          ...prev,
          latitud:  pos.coords.latitude.toString(),
          longitud: pos.coords.longitude.toString(),
        }))
        toast.success('Ubicación obtenida ✓')
        setObteniendo(false)
      },
      () => {
        toast.error('No se pudo obtener la ubicación')
        setObteniendo(false)
      },
      { enableHighAccuracy: true }
    )
  }

  // Paso 1 → Paso 2 (solo si es negocio)
  const handleSiguiente = (e) => {
    e.preventDefault()
    if (form.password !== form.password_confirmation) {
      toast.error('Las contraseñas no coinciden')
      return
    }
    if (form.rol === 'negocio') {
      setPaso(2)
    } else {
      handleRegistrar()
    }
  }

  // Registro final
  const handleRegistrar = async (e) => {
    if (e) e.preventDefault()

    if (form.rol === 'negocio') {
      if (!negocioForm.nombre || !negocioForm.direccion || !negocioForm.categoria_negocio_id) {
        toast.error('Completa todos los campos del negocio')
        return
      }
      if (!negocioForm.latitud || !negocioForm.longitud) {
        toast.error('Necesitas obtener la ubicación del negocio')
        return
      }
    }

    setLoading(true)
    try {
      // 1. Crear usuario
      const res = await api.post('/register', form)
      const { user, token } = res.data
      setAuth(user, token)

      // 2. Si es negocio, crear el negocio con el token ya activo
      if (form.rol === 'negocio') {
        await api.post('/negocio', {
          nombre:               negocioForm.nombre,
          descripcion:          negocioForm.descripcion,
          direccion:            negocioForm.direccion,
          telefono:             negocioForm.telefono,
          categoria_negocio_id: parseInt(negocioForm.categoria_negocio_id),
          latitud:              parseFloat(negocioForm.latitud),
          longitud:             parseFloat(negocioForm.longitud),
        })
      }

      toast.success(`¡Cuenta creada! ${form.rol !== 'cliente' ? 'Pendiente de aprobación del administrador.' : ''}`)

      if (user.rol === 'admin')           navigate('/admin')
      else if (user.rol === 'negocio')    navigate('/negocio')
      else if (user.rol === 'cliente')    navigate('/cliente')
      else if (user.rol === 'repartidor') navigate('/repartidor')

    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        Object.values(errors).forEach(e => toast.error(e[0]))
      } else {
        toast.error(err.response?.data?.message || 'Error al registrarse')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <h1 className="text-4xl font-bold text-orange-500">🛵 QuillaExpress</h1>
          </Link>
          <p className="text-gray-500 mt-2">Crea tu cuenta gratis</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">

          {/* ── PASO 1: Datos de cuenta ── */}
          {paso === 1 && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Crear cuenta</h2>
              <p className="text-gray-500 text-sm mb-6">¿Cómo quieres unirte?</p>

              {/* Selector de rol */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {roles.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setForm({ ...form, rol: r.key })}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition
                      ${form.rol === r.key
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                      }`}
                  >
                    <span className="text-3xl">{r.icon}</span>
                    <span className="text-xs font-bold text-gray-700">{r.label}</span>
                    <span className="text-xs text-gray-400 text-center leading-tight">{r.desc}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={handleSiguiente} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange}
                    placeholder="Tu nombre" required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Apellido</label>
                  <input type="text" name="apellido" value={form.apellido} onChange={handleChange}
                    placeholder="Tu apellido" required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Teléfono <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <input type="tel" name="telefono" value={form.telefono} onChange={handleChange}
                    placeholder="Ej: 987654321" maxLength={15}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Correo electrónico</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="correo@ejemplo.com" required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
                  <input type="password" name="password" value={form.password} onChange={handleChange}
                    placeholder="Mínimo 6 caracteres" required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Confirmar contraseña</label>
                  <input type="password" name="password_confirmation" value={form.password_confirmation} onChange={handleChange}
                    placeholder="Repite tu contraseña" required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition" />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-60">
                  {form.rol === 'negocio' ? 'Siguiente — Datos del negocio →' : loading ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>
              </form>
            </>
          )}

          {/* ── PASO 2: Datos del negocio ── */}
          {paso === 2 && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setPaso(1)} className="text-gray-400 hover:text-orange-500 transition text-lg">←</button>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Tu negocio</h2>
                  <p className="text-gray-500 text-sm">Cuéntanos sobre tu local</p>
                </div>
              </div>

              <form onSubmit={handleRegistrar} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del negocio</label>
                  <input type="text" name="nombre" value={negocioForm.nombre} onChange={handleNegocioChange}
                    placeholder="Ej: Restaurante El Fogón" required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Categoría</label>
                  <div className="grid grid-cols-3 gap-3">
                    {CATEGORIAS.map((c) => (
                      <button key={c.id} type="button"
                        onClick={() => setNegocioForm({ ...negocioForm, categoria_negocio_id: c.id.toString() })}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition
                          ${negocioForm.categoria_negocio_id === c.id.toString()
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300'
                          }`}
                      >
                        <span className="text-2xl">{c.icon}</span>
                        <span className="text-xs font-bold text-gray-700">{c.nombre}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Dirección</label>
                  <input type="text" name="direccion" value={negocioForm.direccion} onChange={handleNegocioChange}
                    placeholder="Ej: Jr. Quillabamba 123" required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción <span className="text-gray-400 font-normal">(opcional)</span></label>
                  <textarea name="descripcion" value={negocioForm.descripcion} onChange={handleNegocioChange}
                    placeholder="Describe brevemente tu negocio..." rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition resize-none" />
                </div>

                {/* Ubicación */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Ubicación del negocio</label>
                  {negocioForm.latitud && negocioForm.longitud ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                      <span className="text-sm text-green-700 font-semibold">✅ Ubicación obtenida</span>
                      <button type="button" onClick={obtenerUbicacion}
                        className="text-xs text-green-600 underline">Actualizar</button>
                    </div>
                  ) : (
                    <button type="button" onClick={obtenerUbicacion} disabled={obteniendo}
                      className="w-full border-2 border-dashed border-orange-300 hover:border-orange-500 rounded-lg py-3 text-sm text-orange-500 font-semibold transition disabled:opacity-60">
                      {obteniendo ? '📍 Obteniendo ubicación...' : '📍 Usar mi ubicación actual'}
                    </button>
                  )}
                  <p className="text-xs text-gray-400 mt-1">Asegúrate de estar en tu local al obtener la ubicación</p>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-60">
                  {loading ? 'Creando cuenta...' : '🏪 Crear cuenta y registrar negocio'}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-orange-500 font-semibold hover:underline">Inicia sesión</Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Universidad Andina del Cusco — Filial Quillabamba
        </p>
      </div>
    </div>
  )
}

export default Register