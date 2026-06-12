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

      if (user.rol === 'admin')           navigate('/admin')
      else if (user.rol === 'negocio')    navigate('/negocio')
      else if (user.rol === 'cliente')    navigate('/cliente')
      else if (user.rol === 'repartidor') navigate('/repartidor')

    } catch (err) {
      toast.error(err.response?.data?.message || 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-emerald-50/40 flex flex-col items-center justify-center px-4 antialiased selection:bg-emerald-500 selection:text-white">
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
              Sistema de delivery en Quillabamba
            </p>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 p-6 sm:p-8 transition-all">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Iniciar sesión</h2>
            <p className="text-slate-400 text-sm mt-1">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                required
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm shadow-emerald-600/10 hover:shadow-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Verificando...</span>
                </>
              ) : (
                <span>Ingresar de forma segura</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-sm">
            <span className="text-slate-400">¿No tienes cuenta aún? </span>
            <Link to="/register" className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline transition-colors">
              Regístrate aquí
            </Link>
          </div>
        </div>

        {/* Footer institucional sutil */}
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

export default Login