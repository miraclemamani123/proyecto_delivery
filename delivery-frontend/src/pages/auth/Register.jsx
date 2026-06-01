import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const Register = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({
    name: '',
    apellido: '',
    email: '',
    password: '',
    password_confirmation: '',
    rol: searchParams.get('rol') || 'cliente'
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const selectRol = (rol) => {
    setForm({ ...form, rol: rol })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password_confirmation) {
      toast.error('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    try {
      await api.post('/register', form)
      toast.success('¡Cuenta creada! Ahora inicia sesión')
      navigate('/login')
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

  const roles = [
    { key: 'cliente',     icon: '🛒', label: 'Cliente',     desc: 'Haz pedidos a domicilio' },
    { key: 'negocio',     icon: '🏪', label: 'Negocio',     desc: 'Vende tus productos' },
    { key: 'repartidor',  icon: '🛵', label: 'Repartidor',  desc: 'Gana repartiendo' },
  ]

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

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Crear cuenta</h2>
          <p className="text-gray-500 text-sm mb-6">¿Cómo quieres unirte?</p>

          {/* Selector de rol */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {roles.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => selectRol(r.key)}
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

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Tu nombre"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
              />
            </div>
            <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
                Apellido
            </label>
            <input
                type="text"
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                placeholder="Tu apellido"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Mínimo 8 caracteres"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Confirmar contraseña
              </label>
              <input
                type="password"
                name="password_confirmation"
                value={form.password_confirmation}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>

          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-orange-500 font-semibold hover:underline">
              Inicia sesión
            </Link>
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