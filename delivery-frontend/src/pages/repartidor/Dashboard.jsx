import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

const RepartidorDashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [estado, setEstado] = useState('inactivo')
  const [pedidosActivos, setPedidosActivos] = useState(0)
  const [loading, setLoading] = useState(true)

  const intervaloRef = useRef(null)

  useEffect(() => {
    fetchDatos()
    if (!intervaloRef.current) {
      intervaloRef.current = setInterval(fetchDatos, 8000)
    }
    return () => {
      clearInterval(intervaloRef.current)
      intervaloRef.current = null
    }
  }, [])

  const fetchDatos = async () => {
    try {
      const [perfilRes, pedidosRes] = await Promise.all([
        api.get('/repartidor/perfil'),
        api.get('/repartidor/pedidos')
      ])
      setEstado(perfilRes.data.estado)
      const activos = pedidosRes.data.filter(p =>
        ['aceptado', 'en_preparacion', 'en_camino'].includes(p.estado)
      )
      setPedidosActivos(activos.length)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const cambiarEstado = async (nuevoEstado) => {
    try {
      await api.patch('/repartidor/estado', { estado: nuevoEstado })
      setEstado(nuevoEstado)
      toast.success(`Estado: ${nuevoEstado}`)
    } catch (err) {
      toast.error('Error al cambiar estado')
    }
  }

  const handleLogout = async () => {
    try { await api.post('/logout') } catch (err) {}
    logout()
    navigate('/')
  }

  const estadoColor = {
    disponible: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    ocupado:    'bg-amber-50 text-amber-700 border-amber-100',
    inactivo:   'bg-slate-100 text-slate-500 border-slate-200',
  }

  return (
    <div className="min-h-screen bg-slate-50/60 antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">
      
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:scale-110 transition-transform">🛵</span>
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              QuillaExpress
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
              <div className="h-6 w-6 rounded-md bg-emerald-500/10 text-emerald-700 font-bold text-xs flex items-center justify-center uppercase">
                {user?.name ? user.name.substring(0, 2) : 'R'}
              </div>
              <span className="text-xs font-medium text-slate-500 hidden sm:inline">
                Hola, <strong className="text-slate-800 font-semibold">{user?.name}</strong>
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 font-bold px-3 py-2 rounded-xl transition-all border border-transparent hover:border-red-100"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* SALUDO DE BIENVENIDA */}
        <div className="mb-8">
          <h2 className="text-3xl font-black tracking-tight text-slate-800">Panel de Repartidor</h2>
          <p className="text-slate-400 text-sm mt-1">Gestiona tu ruta y disponibilidad en tiempo real</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3">
            <svg className="animate-spin h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm font-medium text-slate-400 animate-pulse">Cargando tu sesión de ruta...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* COLUMNA IZQUIERDA: CONTROL DE ESTADO */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Mi disponibilidad</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Define si puedes recibir pedidos</p>
                </div>
                
                {/* Badge de estado con pulso animado si está disponible */}
                <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold border ${estadoColor[estado]}`}>
                  {estado === 'disponible' && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                  {estado === 'ocupado' && <span className="h-2 w-2 rounded-full bg-amber-500"></span>}
                  {estado === 'inactivo' && <span className="h-2 w-2 rounded-full bg-slate-400"></span>}
                  {estado.toUpperCase()}
                </span>
              </div>

              {/* Selector de estados verticales para mayor presencia visual */}
              <div className="flex flex-col gap-2.5">
                {['disponible', 'ocupado', 'inactivo'].map((e) => {
                  const isActive = estado === e;
                  return (
                    <button
                      key={e}
                      onClick={() => cambiarEstado(e)}
                      className={`w-full p-3.5 rounded-xl text-sm font-bold transition-all duration-200 text-left flex items-center justify-between border-2 ${
                        isActive
                          ? e === 'disponible'
                            ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700 shadow-sm shadow-emerald-500/5'
                            : e === 'ocupado'
                            ? 'border-amber-500 bg-amber-50/50 text-amber-700 shadow-sm shadow-amber-500/5'
                            : 'border-slate-400 bg-slate-50 text-slate-700'
                          : 'border-slate-100 text-slate-500 bg-white hover:border-slate-200 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {e === 'disponible' ? '⚡' : e === 'ocupado' ? '⏳' : '💤'}
                        </span>
                        <div className="text-left">
                          <p className="font-bold leading-none capitalize">{e}</p>
                          <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                            {e === 'disponible' ? 'Recibir rutas de inmediato' : 
                             e === 'ocupado' ? 'Terminando entregas' : 'Fuera de servicio'}
                          </p>
                        </div>
                      </div>
                      {isActive && (
                        <span className={`text-xs font-black ${
                          e === 'disponible' ? 'text-emerald-600' : e === 'ocupado' ? 'text-amber-600' : 'text-slate-600'
                        }`}>●</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* COLUMNA DERECHA: MÉTRICAS Y ACCIONES PRINCIPALES */}
            <div className="md:col-span-2 space-y-6">
              
              {/* MÉTRICAS EN TARJETA DINÁMICA */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-6">
                <div className="h-16 w-16 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                  📦
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black tracking-tight text-slate-800">
                      {pedidosActivos}
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Cargas activas
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {pedidosActivos > 0 
                      ? 'Tienes entregas en curso asignadas a tu cuenta. ¡Buen viaje!'
                      : 'No tienes pedidos pendientes en este momento.'}
                  </p>
                </div>
              </div>

              {/* ACCIÓN PRINCIPAL DE ACCESO DIRECTO (Rellena el espacio de manera masiva e integrada) */}
              <Link
                to="/repartidor/pedidos"
                className="group relative block bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl p-6 shadow-md shadow-emerald-600/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* Detalle visual de fondo abstracto geométrico para romper el vacío */}
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 translate-x-8 pointer-events-none group-hover:scale-110 transition-transform duration-300"></div>
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-5">
                    <span className="text-4xl bg-white/10 p-3 rounded-xl backdrop-blur-sm group-hover:rotate-6 transition-transform">
                      🗺️
                    </span>
                    <div>
                      <p className="font-black text-xl tracking-tight">Consola de Pedidos</p>
                      <p className="text-emerald-100/80 text-xs mt-0.5 font-medium">
                        Ver direcciones, mapas de Quillabamba y hojas de ruta
                      </p>
                    </div>
                  </div>
                  <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center font-bold group-hover:translate-x-1 transition-transform">
                    →
                  </div>
                </div>
              </Link>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}

export default RepartidorDashboard