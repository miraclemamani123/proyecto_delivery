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
      const res = await api.post('/register', form)
      const { user, token } = res.data
      setAuth(user, token)

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-emerald-50/40 flex flex-col items-center justify-center px-4 py-12 antialiased selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8 group">
          <Link to="/" className="inline-flex flex-col items-center gap-1 focus:outline-none">
            <div className="flex items-center gap-2">
              <span className="text-3xl group-hover:animate-bounce transition-transform">🛵</span>
              <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                QuillaExpress
              </h1>
            </div>
            <p className="text-xs font-medium text-slate-400 tracking-wide uppercase mt-1">
              Crea tu cuenta gratis en la plataforma
            </p>
          </Link>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 p-6 sm:p-8 transition-all">

          {/* ── PASO 1: Datos de cuenta ── */}
          {paso === 1 && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Regístrate</h2>
                <p className="text-slate-400 text-sm mt-0.5">¿Cómo quieres unirte a nosotros?</p>
              </div>

              {/* Selector de rol */}
              <div className="grid grid-cols-3 gap-2.5 mb-6">
                {roles.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setForm({ ...form, rol: r.key })}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all duration-200 focus:outline-none ${
                      form.rol === r.key
                        ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/10 shadow-sm shadow-emerald-500/5'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-2xl mb-0.5">{r.icon}</span>
                    <span className={`text-xs font-bold ${form.rol === r.key ? 'text-emerald-700' : 'text-slate-700'}`}>{r.label}</span>
                    <span className="text-[10px] text-slate-400 text-center leading-tight mt-0.5">{r.desc}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={handleSiguiente} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nombre</label>
                    <input type="text" name="name" value={form.name} onChange={handleChange}
                      placeholder="Tu nombre" required
                      className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-200" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Apellido</label>
                    <input type="text" name="apellido" value={form.apellido} onChange={handleChange}
                      placeholder="Tu apellido" required
                      className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-200" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Teléfono <span className="text-slate-400 font-normal lowercase">(opcional)</span>
                  </label>
                  <input type="tel" name="telefono" value={form.telefono} onChange={handleChange}
                    placeholder="Ej: 987654321" maxLength={15}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-200" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Correo electrónico</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="correo@ejemplo.com" required
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-200" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Contraseña</label>
                  <input type="password" name="password" value={form.password} onChange={handleChange}
                    placeholder="Mínimo 6 caracteres" required
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-200" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Confirmar contraseña</label>
                  <input type="password" name="password_confirmation" value={form.password_confirmation} onChange={handleChange}
                    placeholder="Repite tu contraseña" required
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-200" />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm shadow-emerald-600/10 hover:shadow-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Procesando...</span>
                    </>
                  ) : form.rol === 'negocio' ? (
                    <span className="flex items-center gap-1">Siguiente — Datos del negocio <span className="text-base leading-none">→</span></span>
                  ) : (
                    <span>Registrarse ahora</span>
                  )}
                </button>
              </form>
            </>
          )}

          {/* ── PASO 2: Datos del negocio ── */}
          {paso === 2 && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setPaso(1)} className="text-slate-400 hover:text-emerald-600 transition-colors text-xl p-1 rounded-lg hover:bg-slate-50 focus:outline-none">
                  ←
                </button>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight">Tu negocio</h2>
                  <p className="text-slate-400 text-xs">Completa el perfil comercial del local</p>
                </div>
              </div>

              <form onSubmit={handleRegistrar} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nombre del negocio</label>
                  <input type="text" name="nombre" value={negocioForm.nombre} onChange={handleNegocioChange}
                    placeholder="Ej: Restaurante El Fogón" required
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-200" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Categoría</label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {CATEGORIAS.map((c) => (
                      <button key={c.id} type="button"
                        onClick={() => setNegocioForm({ ...negocioForm, categoria_negocio_id: c.id.toString() })}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all duration-200 focus:outline-none ${
                          negocioForm.categoria_negocio_id === c.id.toString()
                            ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/10 shadow-sm'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-xl">{c.icon}</span>
                        <span className={`text-xs font-bold ${negocioForm.categoria_negocio_id === c.id.toString() ? 'text-emerald-700' : 'text-slate-700'}`}>{c.nombre}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Dirección</label>
                  <input type="text" name="direccion" value={negocioForm.direccion} onChange={handleNegocioChange}
                    placeholder="Ej: Jr. Quillabamba 123" required
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-200" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Descripción <span className="text-slate-400 font-normal lowercase">(opcional)</span>
                  </label>
                  <textarea name="descripcion" value={negocioForm.descripcion} onChange={handleNegocioChange}
                    placeholder="Describe brevemente tu negocio..." rows={2}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-200 resize-none" />
                </div>

                {/* Geolocalización */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Ubicación geográfica</label>
                  {negocioForm.latitud && negocioForm.longitud ? (
                    <div className="flex items-center justify-between bg-emerald-50/50 border border-emerald-200 rounded-xl px-4 py-3">
                      <span className="text-xs text-emerald-800 font-bold flex items-center gap-1.5">
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Coordenadas obtenidas ✓
                      </span>
                      <button type="button" onClick={obtenerUbicacion}
                        className="text-xs text-emerald-600 font-semibold underline hover:text-emerald-700 transition-colors">
                        Actualizar
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={obtenerUbicacion} disabled={obteniendo}
                      className="w-full border border-dashed border-slate-300 hover:border-emerald-400 bg-slate-50/30 hover:bg-emerald-50/10 rounded-xl py-3 text-xs text-slate-600 font-bold transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-1.5"
                    >
                      {obteniendo ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span className="text-emerald-700">Obteniendo ubicación...</span>
                        </>
                      ) : (
                        <span>📍 Usar mi ubicación actual</span>
                      )}
                    </button>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">
                    Asegúrate de estar físicamente en el establecimiento comercial al presionar el botón.
                  </p>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm shadow-emerald-600/10 hover:shadow-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Guardando datos...</span>
                    </>
                  ) : (
                    <span>🏪 Registrar comercio y cuenta</span>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Enlace de redirección */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-sm">
            <span className="text-slate-400">¿Ya tienes cuenta? </span>
            <Link to="/login" className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline transition-colors">
              Inicia sesión
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
            Universidad Andina del Cusco
          </p>
          <p className="text-[11px] text-slate-400/80">
            Filial Quillabamba
          </p>
        </div>

      </div>
    </div>
  )
}

export default Register 