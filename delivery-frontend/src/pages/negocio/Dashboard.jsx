import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bike, Store, Camera, MapPin, Phone, AlertCircle,
  CreditCard, QrCode, Wallet, ChevronRight,
  UtensilsCrossed, Pill, ShoppingBag, Wheat,
  ChefHat, IceCream, Package, LogOut, X,
  ClipboardList, CheckCircle2, Circle
} from 'lucide-react'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

/* ─── Sistema de color consistente con Landing ────────────────────────────── */
const BRAND = {
  dark:    '#0D2B1E',
  primary: '#10B981',
  light:   '#ECFDF5',
}

/* ─── Config de categoría → ícono + colores (mismo que Landing) ──────────── */
const getCategoriaConfig = (nombre) => {
  const n = nombre?.toLowerCase()
  if (n?.includes('restaurante')) return { Icon: UtensilsCrossed, color: '#EA580C', bg: '#FFF7ED' }
  if (n?.includes('farmacia'))    return { Icon: Pill,            color: '#2563EB', bg: '#EFF6FF' }
  if (n?.includes('tienda'))      return { Icon: ShoppingBag,     color: '#7C3AED', bg: '#F5F3FF' }
  if (n?.includes('panaderia') || n?.includes('panadería'))
                                  return { Icon: Wheat,           color: '#CA8A04', bg: '#FEFCE8' }
  if (n?.includes('poller'))      return { Icon: ChefHat,         color: '#DC2626', bg: '#FEF2F2' }
  if (n?.includes('postre'))      return { Icon: IceCream,        color: '#DB2777', bg: '#FDF2F8' }
  return                                 { Icon: Package,         color: '#059669', bg: '#ECFDF5' }
}

/* ─── Métodos de pago ─────────────────────────────────────────────────────── */
const METODOS_QR = [
  { key: 'yape',  label: 'Yape',  bg: '#6D28D9', light: '#EDE9FE' },
  { key: 'plin',  label: 'Plín',  bg: '#059669', light: '#D1FAE5' },
  { key: 'tunki', label: 'Tunki', bg: '#EA580C', light: '#FFEDD5' },
]

/* ─── Componente teléfono ─────────────────────────────────────────────────── */
const TelefonoForm = ({ negocio, onActualizado }) => {
  const [telefono, setTelefono] = useState(negocio.telefono || '')
  const [guardando, setGuardando] = useState(false)

  const handleGuardar = async () => {
    if (!telefono.trim()) { toast.error('Ingresa un número de teléfono'); return }
    setGuardando(true)
    try {
      await api.put(`/negocio/${negocio.id}`, { telefono })
      onActualizado(telefono)
      toast.success('Teléfono actualizado')
    } catch { toast.error('Error al actualizar teléfono') }
    finally { setGuardando(false) }
  }

  return (
    <div className="flex gap-2 mt-2">
      <input
        type="tel"
        value={telefono}
        onChange={e => setTelefono(e.target.value)}
        placeholder="Ej: 987654321"
        maxLength={15}
        className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
      />
      <button
        onClick={handleGuardar}
        disabled={guardando}
        className="text-sm font-bold px-4 py-2 rounded-xl text-white transition disabled:opacity-50"
        style={{ backgroundColor: BRAND.dark }}
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
  const [negocio, setNegocio]                    = useState(null)
  const [pedidosPendientes, setPedidosPendientes] = useState(0)
  const [loading, setLoading]                    = useState(true)
  const [subiendoQR, setSubiendoQR]              = useState(null)
  const [subiendoImagen, setSubiendoImagen]      = useState(false)
  const inputImagenRef                           = useRef(null)
  const inputsQRRef                              = useRef({})

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
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const toggleEstado = async () => {
    if (!negocio) return
    try {
      const res = await api.patch(`/negocio/${negocio.id}/estado`)
      setNegocio({ ...negocio, estado: res.data.estado })
      toast.success(`Negocio ${res.data.estado === 'abierto' ? 'abierto' : 'cerrado'}`)
    } catch { toast.error('Error al cambiar estado') }
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
    } catch { toast.error('Error al subir imagen') }
    finally { setSubiendoImagen(false) }
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
    } catch { toast.error('Error al subir QR') }
    finally { setSubiendoQR(null) }
  }

  const handleEliminarQR = async (tipo) => {
    if (!window.confirm(`¿Eliminar QR de ${tipo}?`)) return
    try {
      await api.delete('/negocio/qr', { data: { tipo } })
      setNegocio(prev => ({ ...prev, [`qr_${tipo}`]: null }))
      toast.success(`QR de ${tipo} eliminado`)
    } catch { toast.error('Error al eliminar QR') }
  }

  const handleLogout = async () => {
    try { await api.post('/logout') } catch {}
    logout()
    navigate('/')
  }

  /* ── Config de categoría del negocio actual ── */
  const catConfig = getCategoriaConfig(negocio?.categoria?.nombre)

  return (
    <div className="min-h-screen bg-slate-50 antialiased">

      {/* ══════════════════════════════════════
          HEADER — igual que Landing
      ══════════════════════════════════════ */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-5 h-16 flex items-center justify-between">

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: BRAND.dark }}>
              <Bike size={16} color="#ffffff" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-black tracking-tight" style={{ color: BRAND.dark }}>
              Quilla<span style={{ color: BRAND.primary }}>Express</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden sm:block">
              Hola, <span className="font-bold text-slate-800">{user?.name}</span>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
            >
              <LogOut size={13} strokeWidth={2} />
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
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            {/* Acento superior — color de la categoría */}
            <div className="h-1 w-full" style={{ backgroundColor: catConfig.color }} />

            <div className="p-5">
              <div className="flex items-start gap-4">

                {/* Foto */}
                <div className="relative shrink-0">
                  <div
                    className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center"
                    style={{ backgroundColor: catConfig.bg }}
                  >
                    {negocio.imagen
                      ? <img src={negocio.imagen} alt="Negocio" className="w-full h-full object-cover" />
                      : <catConfig.Icon size={36} color={catConfig.color} strokeWidth={1.5} />
                    }
                  </div>
                  <button
                    onClick={() => inputImagenRef.current?.click()}
                    disabled={subiendoImagen}
                    className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: BRAND.dark }}
                  >
                    <Camera size={13} strokeWidth={2.5} />
                  </button>
                  <input ref={inputImagenRef} type="file" accept="image/*" className="hidden" onChange={handleSubirImagen} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-black text-slate-900 truncate">{negocio.nombre}</h2>
                    {negocio.categoria?.nombre && (
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-lg capitalize shrink-0 hidden sm:inline"
                        style={{ backgroundColor: catConfig.bg, color: catConfig.color }}
                      >
                        {negocio.categoria.nombre}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 flex items-center gap-1 mb-1 truncate">
                    <MapPin size={11} strokeWidth={2} className="shrink-0" />
                    {negocio.direccion}
                  </p>

                  {negocio.telefono ? (
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Phone size={11} strokeWidth={2} className="shrink-0" />
                      {negocio.telefono}
                    </p>
                  ) : (
                    <div>
                      <p className="text-xs font-semibold flex items-center gap-1"
                        style={{ color: '#F59E0B' }}>
                        <AlertCircle size={11} strokeWidth={2.5} />
                        Agrega tu número de teléfono
                      </p>
                      <TelefonoForm
                        negocio={negocio}
                        onActualizado={(t) => setNegocio(prev => ({ ...prev, telefono: t }))}
                      />
                    </div>
                  )}
                </div>

                {/* Estado + toggle */}
                <div className="shrink-0 flex flex-col items-end gap-2">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border
                    ${negocio.estado === 'abierto'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                    {negocio.estado === 'abierto' ? (
                      <>
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                        </span>
                        Abierto
                      </>
                    ) : (
                      <>
                        <Circle size={8} className="text-rose-400 fill-rose-400" />
                        Cerrado
                      </>
                    )}
                  </span>

                  <button
                    onClick={toggleEstado}
                    className="text-xs font-bold px-4 py-2 rounded-xl text-white transition hover:opacity-90 active:scale-95"
                    style={{
                      backgroundColor: negocio.estado === 'abierto' ? '#DC2626' : '#10B981'
                    }}
                  >
                    {negocio.estado === 'abierto' ? 'Cerrar negocio' : 'Abrir negocio'}
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            MÉTRICAS — Pedidos + Productos
        ══════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* Pedidos pendientes */}
          <Link
            to="/negocio/pedidos"
            className="group relative min-h-[150px] rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            style={{ backgroundColor: BRAND.dark }}
          >
            {/* Decoración */}
            <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full"
              style={{ backgroundColor: 'rgba(16,185,129,0.1)' }} />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full"
              style={{ backgroundColor: 'rgba(16,185,129,0.06)' }} />

            <div className="relative p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(16,185,129,0.15)' }}>
                  <ClipboardList size={18} color="#34D399" strokeWidth={2} />
                </div>
                {pedidosPendientes > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg animate-pulse"
                    style={{ backgroundColor: 'rgba(245,158,11,0.2)', color: '#FCD34D' }}>
                    ● Nuevos
                  </span>
                )}
              </div>

              <p className="text-xs font-bold uppercase tracking-widest mb-1"
                style={{ color: 'rgba(255,255,255,0.4)' }}>
                Pedidos pendientes
              </p>

              <div className="flex items-baseline gap-2">
                <span
                  className="text-5xl font-black leading-none tabular-nums"
                  style={{ color: pedidosPendientes > 0 ? '#F59E0B' : 'rgba(255,255,255,0.3)' }}
                >
                  {pedidosPendientes}
                </span>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {pedidosPendientes === 1 ? 'pedido' : 'pedidos'}
                </span>
              </div>
            </div>

            <div className="relative px-5 pb-4 flex items-center justify-between">
              <span className="text-xs font-semibold flex items-center gap-1"
                style={{ color: 'rgba(255,255,255,0.4)' }}>
                Ver todos
                <ChevronRight size={13} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform"
                  style={{ color: '#34D399' }} />
              </span>
            </div>
          </Link>

          {/* Productos — ícono dinámico por categoría */}
          <Link
            to="/negocio/productos"
            className="group relative min-h-[150px] bg-white rounded-2xl border border-slate-100 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-slate-200"
          >
            <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full"
              style={{ backgroundColor: catConfig.bg, opacity: 0.6 }} />

            <div className="relative p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: catConfig.bg }}>
                  <catConfig.Icon size={18} color={catConfig.color} strokeWidth={2} />
                </div>
                {negocio?.categoria?.nombre && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-lg capitalize"
                    style={{ backgroundColor: catConfig.bg, color: catConfig.color }}
                  >
                    {negocio.categoria.nombre}
                  </span>
                )}
              </div>

              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
                Catálogo
              </p>
              <p className="text-slate-800 font-black text-lg leading-tight">
                Mis productos
              </p>
            </div>

            <div className="relative px-5 pb-4">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 group-hover:text-emerald-600 transition-colors">
                Gestionar catálogo
                <ChevronRight size={13} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </Link>

        </div>

        {/* ══════════════════════════════════════
            MÉTODOS DE PAGO — QR
        ══════════════════════════════════════ */}
        {negocio && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">

            {/* Header de sección */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-100">
                  <CreditCard size={16} strokeWidth={2} className="text-slate-500" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Métodos de pago</h3>
                  <p className="text-xs text-slate-400">Solo aparecen los QR que hayas configurado</p>
                </div>
              </div>
            </div>

            <div className="p-5 grid grid-cols-3 gap-4">
              {METODOS_QR.map(({ key, label, bg, light }) => {
                const qrUrl = negocio[`qr_${key}`]
                return (
                  <div key={key} className="flex flex-col gap-2">

                    {/* Header de método */}
                    <div
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white"
                      style={{ backgroundColor: bg }}
                    >
                      <Wallet size={13} strokeWidth={2.5} />
                      {label}
                    </div>

                    {/* QR / placeholder */}
                    <div
                      className="w-full aspect-square rounded-xl overflow-hidden flex items-center justify-center border-2 border-dashed"
                      style={{
                        borderColor: qrUrl ? bg : '#E2E8F0',
                        backgroundColor: qrUrl ? '#ffffff' : light,
                      }}
                    >
                      {qrUrl ? (
                        <img src={qrUrl} alt={`QR ${label}`} className="w-full h-full object-contain p-1.5" />
                      ) : (
                        <div className="flex flex-col items-center gap-1.5 p-2">
                          <QrCode size={28} strokeWidth={1.5} style={{ color: bg, opacity: 0.5 }} />
                          <p className="text-[10px] font-semibold text-center" style={{ color: bg }}>
                            Sin QR
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Botones */}
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => inputsQRRef.current[key]?.click()}
                        disabled={subiendoQR === key}
                        className="flex-1 text-xs font-bold py-2 rounded-xl text-white transition disabled:opacity-50 hover:opacity-90"
                        style={{ backgroundColor: bg }}
                      >
                        {subiendoQR === key ? '...' : qrUrl ? 'Cambiar' : 'Subir'}
                      </button>
                      {qrUrl && (
                        <button
                          onClick={() => handleEliminarQR(key)}
                          className="px-2.5 py-2 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition flex items-center justify-center"
                        >
                          <X size={13} strokeWidth={2.5} />
                        </button>
                      )}
                    </div>

                    <input
                      ref={el => inputsQRRef.current[key] = el}
                      type="file" accept="image/*" className="hidden"
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