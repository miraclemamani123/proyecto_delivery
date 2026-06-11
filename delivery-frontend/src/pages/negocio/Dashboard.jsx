import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

const METODOS_QR = [
  { key: 'yape',  label: 'Yape',  bg: '#6D28D9', light: '#EDE9FE', icon: '💜' },
  { key: 'plin',  label: 'Plín',  bg: '#059669', light: '#D1FAE5', icon: '💚' },
  { key: 'tunki', label: 'Tunki', bg: '#EA580C', light: '#FFEDD5', icon: '🧡' },
]

/* ─── Componente teléfono ─────────────────────────────────────────────────── */
const TelefonoForm = ({ negocio, onActualizado }) => {
  const [telefono, setTelefono] = useState(negocio.telefono || '')
  const [guardando, setGuardando] = useState(false)

  const handleGuardar = async () => {
    if (!telefono.trim()) {
      toast.error('Ingresa un número de teléfono')
      return
    }
    setGuardando(true)
    try {
      await api.put(`/negocio/${negocio.id}`, { telefono })
      onActualizado(telefono)
      toast.success('Teléfono actualizado')
    } catch (err) {
      toast.error('Error al actualizar teléfono')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="flex gap-2 mt-2">
      <input
        type="tel"
        value={telefono}
        onChange={e => setTelefono(e.target.value)}
        placeholder="Ej: 987654321"
        maxLength={15}
        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 text-sm bg-white"
        style={{ '--tw-ring-color': '#F59E0B' }}
      />
      <button
        onClick={handleGuardar}
        disabled={guardando}
        className="text-sm font-bold px-4 py-2 rounded-lg text-white transition disabled:opacity-50"
        style={{ backgroundColor: '#0F2D1E' }}
      >
        {guardando ? '...' : 'Guardar'}
      </button>
    </div>
  )
}

/* ─── Dashboard principal ─────────────────────────────────────────────────── */
const NegocioDashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [negocio, setNegocio]                     = useState(null)
  const [pedidosPendientes, setPedidosPendientes]  = useState(0)
  const [loading, setLoading]                     = useState(true)
  const [subiendoQR, setSubiendoQR]               = useState(null)
  const [subiendoImagen, setSubiendoImagen]       = useState(false)
  const inputImagenRef                            = useRef(null)
  const inputsQRRef                               = useRef({})

  useEffect(() => { fetchDatos() }, [])

  const fetchDatos = async () => {
    try {
      const [negocioRes, pedidosRes] = await Promise.all([
        api.get('/negocio/perfil').catch(() => null),
        api.get('/negocio/pedidos')
      ])
      if (negocioRes) setNegocio(negocioRes.data)
      const pendientes = pedidosRes.data.filter(p => p.estado === 'pendiente')
      setPedidosPendientes(pendientes.length)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleEstado = async () => {
    if (!negocio) return
    try {
      const res = await api.patch(`/negocio/${negocio.id}/estado`)
      setNegocio({ ...negocio, estado: res.data.estado })
      toast.success(`Negocio ${res.data.estado === 'abierto' ? 'abierto' : 'cerrado'}`)
    } catch (err) {
      toast.error('Error al cambiar estado')
    }
  }

  const handleSubirImagen = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setSubiendoImagen(true)
    try {
      const formData = new FormData()
      formData.append('imagen', file)
      const res = await api.post('/negocio/imagen', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setNegocio(prev => ({ ...prev, imagen: res.data.imagen }))
      toast.success('Imagen del negocio actualizada')
    } catch (err) {
      toast.error('Error al subir imagen')
    } finally {
      setSubiendoImagen(false)
    }
  }

  const handleSubirQR = async (tipo, file) => {
    if (!file) return
    setSubiendoQR(tipo)
    try {
      const formData = new FormData()
      formData.append('tipo', tipo)
      formData.append('image', file)
      const res = await api.post('/negocio/qr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setNegocio(prev => ({ ...prev, [`qr_${tipo}`]: res.data.url }))
      toast.success(`QR de ${tipo} actualizado`)
    } catch (err) {
      toast.error('Error al subir QR')
    } finally {
      setSubiendoQR(null)
    }
  }

  const handleEliminarQR = async (tipo) => {
    if (!window.confirm(`¿Eliminar QR de ${tipo}?`)) return
    try {
      await api.delete('/negocio/qr', { data: { tipo } })
      setNegocio(prev => ({ ...prev, [`qr_${tipo}`]: null }))
      toast.success(`QR de ${tipo} eliminado`)
    } catch (err) {
      toast.error('Error al eliminar QR')
    }
  }

  const handleLogout = async () => {
    try { await api.post('/logout') } catch (err) {}
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F6F0' }}>

      {/* ══════════════════════════════════════
          HEADER
      ══════════════════════════════════════ */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
              style={{ backgroundColor: '#0F2D1E' }}
            >
              🛵
            </div>
            <span className="text-base font-black tracking-tight text-gray-900">
              Quilla<span style={{ color: '#F59E0B' }}>Express</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">
              Hola, <span className="font-bold text-gray-800">{user?.name}</span>
            </span>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-gray-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

        {/* ══════════════════════════════════════
            TARJETA DEL NEGOCIO
        ══════════════════════════════════════ */}
        {negocio && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Acento superior verde selva */}
            <div className="h-1.5 w-full" style={{ backgroundColor: '#0F2D1E' }} />

            <div className="p-5">
              <div className="flex items-start gap-4">

                {/* Foto del negocio */}
                <div className="relative shrink-0">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center"
                    style={{ backgroundColor: '#F9F6F0' }}>
                    {negocio.imagen
                      ? <img src={negocio.imagen} alt="Negocio" className="w-full h-full object-cover" />
                      : <span className="text-4xl">🏪</span>
                    }
                  </div>
                  <button
                    onClick={() => inputImagenRef.current?.click()}
                    disabled={subiendoImagen}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold shadow-sm transition"
                    style={{ backgroundColor: '#0F2D1E' }}
                  >
                    {subiendoImagen ? '…' : '📷'}
                  </button>
                  <input ref={inputImagenRef} type="file" accept="image/*" className="hidden" onChange={handleSubirImagen} />
                </div>

                {/* Info del negocio */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-black text-gray-900 leading-tight truncate mb-0.5">
                    {negocio.nombre}
                  </h2>
                  <p className="text-sm text-gray-400 mb-0.5 truncate">📍 {negocio.direccion}</p>
                  {negocio.telefono
                    ? <p className="text-sm text-gray-400">📞 {negocio.telefono}</p>
                    : (
                      <div>
                        <p className="text-xs font-semibold" style={{ color: '#F59E0B' }}>
                          ⚠ Agrega tu número de teléfono
                        </p>
                        <TelefonoForm negocio={negocio} onActualizado={(t) => setNegocio(prev => ({ ...prev, telefono: t }))} />
                      </div>
                    )
                  }
                </div>

                {/* Estado + toggle */}
                <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto pt-4 sm:pt-0 border-t border-slate-100 sm:border-0 gap-3">
                  <span className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm border transition-all duration-300
                    ${negocio.estado === 'abierto'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                    {negocio.estado === 'abierto' ? (
                      <>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        Abierto ahora
                      </>
                    ) : (
                      <>
                        <span className="h-2 w-2 rounded-full bg-rose-400 inline-block animate-pulse" />
                        Cerrado temporalmente
                      </>
                    )}
                  </span>
                  
                  <button
                    onClick={toggleEstado}
                    className={`text-xs font-bold px-4 py-2.5 rounded-xl text-white transition-all duration-200 hover:shadow-md active:scale-95 shadow-sm w-full sm:w-auto text-center border
                      ${negocio.estado === 'abierto' 
                        ? 'bg-rose-600 hover:bg-rose-700 border-rose-700 shadow-rose-600/10' 
                        : 'bg-emerald-600 hover:bg-emerald-700 border-emerald-700 shadow-emerald-600/10'
                      }`}
                  >
                    {negocio.estado === 'abierto' ? 'Cerrar negocio' : 'Abrir negocio'}
                  </button>
                </div>

                </div>
                </div>
                </div>
                )}

            {/* ══════════════════════════════════════
                MÉTRICAS + ACCIONES RÁPIDAS (Estilo Premium Claro / Minimalista)
            ══════════════════════════════════════ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* Pedidos pendientes — Card estilo premium */}
              <Link
                to="/negocio/pedidos"
                className="group relative min-h-[150px] rounded-3xl p-6 bg-white border border-slate-200 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.25)] flex flex-col justify-between overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_16px_40px_-20px_rgba(16,185,129,0.16)]"
              >
                {/* Glow sutil */}
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-emerald-50/60 blur-3xl transition-all duration-500 group-hover:scale-150 group-hover:bg-emerald-100/50" />

                {/* Línea de acento lateral */}
                <div className="absolute left-0 top-5 bottom-5 w-[3px] rounded-r bg-emerald-500/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Pedidos pendientes
                    </p>

                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                      </span>
                      Activo
                    </span>
                  </div>

                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-black tracking-tight text-slate-900 leading-none">
                      {pedidosPendientes}
                    </span>
                    <p className="text-xs font-medium text-slate-500">
                      {pedidosPendientes === 1 ? 'pedido en espera' : 'pedidos por atender'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1 group-hover:text-emerald-700 transition-colors">
                    Revisar pedidos
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 text-emerald-600">→</span>
                  </span>

                  {pedidosPendientes > 0 && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60">
                      Por revisar
                    </span>
                  )}
                </div>
              </Link>



          {/* Ir a Productos */}
          <Link
            to="/negocio/productos"
            className="group relative min-h-[150px] bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between overflow-hidden shadow-[0_10px_30px_-24px_rgba(15,23,42,0.25)] transition-all duration-300 hover:-translate-y-1 hover:border-amber-200 hover:shadow-[0_16px_40px_-20px_rgba(245,158,11,0.16)]"
            style={{ minHeight: '130px' }}
          >
            <div
              className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-amber-50/60 blur-3xl transition-all duration-500 group-hover:scale-150 group-hover:bg-amber-100/50"
            />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 mb-2">
                Productos
              </p>
              <span className="text-3xl">
                🍽️
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-500 mt-3 group-hover:text-amber-700 transition-colors">
              Gestionar menú →
            </span>
          </Link>

        </div>

        {/* ══════════════════════════════════════
            MÉTODOS DE PAGO — QR
        ══════════════════════════════════════ */}
        {negocio && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">

            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-black text-gray-900 text-base">Métodos de pago</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Solo aparecen los QR que hayas configurado
                </p>
              </div>
              <span className="text-xl">💳</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {METODOS_QR.map(({ key, label, bg, light, icon }) => {
                const qrUrl = negocio[`qr_${key}`]
                return (
                  <div key={key} className="flex flex-col items-center gap-2">

                    {/* Cabecera de marca */}
                    <div
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-t-xl text-xs font-bold text-white"
                      style={{ backgroundColor: bg }}
                    >
                      {icon} {label}
                    </div>

                    {/* QR / placeholder */}
                    <div
                      className="w-full aspect-square border-2 border-dashed rounded-xl overflow-hidden flex items-center justify-center"
                      style={{
                        borderColor: qrUrl ? bg : '#E5E7EB',
                        backgroundColor: qrUrl ? '#fff' : light,
                      }}
                    >
                      {qrUrl
                        ? <img src={qrUrl} alt={`QR ${label}`} className="w-full h-full object-contain p-1" />
                        : (
                          <div className="text-center px-2">
                            <div className="text-3xl mb-1">{icon}</div>
                            <p className="text-xs font-medium" style={{ color: bg }}>Sin QR</p>
                          </div>
                        )
                      }
                    </div>

                    {/* Botones */}
                    <div className="flex gap-1.5 w-full">
                      <button
                        onClick={() => inputsQRRef.current[key]?.click()}
                        disabled={subiendoQR === key}
                        className="flex-1 text-xs font-bold py-2 rounded-lg text-white transition disabled:opacity-50"
                        style={{ backgroundColor: bg }}
                      >
                        {subiendoQR === key ? '...' : qrUrl ? 'Cambiar' : 'Subir'}
                      </button>
                      {qrUrl && (
                        <button
                          onClick={() => handleEliminarQR(key)}
                          className="text-xs font-bold px-2.5 py-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <input
                      ref={el => inputsQRRef.current[key] = el}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleSubirQR(key, e.target.files[0])}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default NegocioDashboard