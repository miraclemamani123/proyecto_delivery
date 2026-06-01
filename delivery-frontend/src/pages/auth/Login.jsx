import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

const Login = () => {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/login', form)
      const { user, token } = res.data
      setAuth(user, token)
      toast.success(`¡Bienvenido ${user.name}!`)

      if (user.role === 'admin')          navigate('/admin')
      else if (user.role === 'negocio')   navigate('/negocio')
      else if (user.role === 'cliente')   navigate('/cliente')
      else if (user.role === 'repartidor') navigate('/repartidor')

    } catch (err) {
      toast.error(err.response?.data?.message || 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-500">🛵 QuillaExpress</h1>
          <p className="text-gray-500 mt-2">Sistema de delivery en Quillabamba</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Iniciar sesión</h2>
          <p className="text-gray-500 text-sm mb-6">Ingresa tus credenciales para continuar</p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
              />
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>

          </form>

          {/* Link registro */}
          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-orange-500 font-semibold hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Universidad Andina del Cusco — Filial Quillabamba
        </p>

      </div>
    </div>
  )
}

export default Login