import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, RefreshCw, ClipboardList, Archive,
  User, Mail, Phone, Clock, CheckCircle2,
  XCircle, ChefHat, Package, Bike, Loader2,
  ChevronLeft, ChevronRight, AlertTriangle,
  Hash
} from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

/* ─── Sistema de color ────────────────────────────────────────────────────── */
const BRAND = { dark: '#0D2B1E', primary: '#10B981' }

/* ─── Config de estados ───────────────────────────────────────────────────── */
const ESTADO_CONFIG = {
  pendiente:      { label: 'Pendiente',       Icon: Clock,        color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' },
  aceptado:       { label: 'Aceptado',        Icon: CheckCircle2, color: '#2563EB', bg: '#EFF6FF', border: '#93C5FD' },
  en_preparacion: { label: 'Preparando',      Icon: ChefHat,      color: '#7C3AED', bg: '#F5F3FF', border: '#C4B5FD' },
  listo:          { label: 'Listo',           Icon: Package,      color: '#0D9488', bg: '#F0FDFA', border: '#99F6E4' },
  en_camino:      { label: 'En camino',       Icon: Bike,         color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
  entregado:      { label: 'Entregado',       Icon: CheckCircle2, color: '#059669', bg: '#ECFDF5', border: '#6EE7B7' },
  rechazado:      { label: 'Rechazado',       Icon: XCircle,      color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' },
}

const getEstadoConfig = (estado) =>
  ESTADO_CONFIG[estado] || { label: estado, Icon: Clock, color: '#64748B', bg: '#F8FAFC', border: '#CBD5E1' }

const ITEMS_POR_PAGINA = 5

/* ─── Badge de estado ─────────────────────────────────────────────────────── */
const EstadoBadge = ({ estado }) => {
  const { label, Icon, color, bg, border } = getEstadoConfig(estado)
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-xl border"
      style={{ color, backgroundColor: bg, borderColor: border }}>
      <Icon size={11} strokeWidth={2.5} />
      {label}
    </span>
  )
}

/* ─── Card de pedido ──────────────────────────────────────────────────────── */
const PedidoCard = ({ pedido, cambiarEstado }) => {
  const config = getEstadoConfig(pedido.estado)

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Acento lateral de color según estado */}
      <div className="flex">
        <div className="w-1 shrink-0 rounded-l-2xl"
          style={{ backgroundColor: config.color }} />

        <div className="flex-1 p-5">
          {/* Header del pedido */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: config.bg }}>
                  <User size={13} strokeWidth={2} style={{ color: config.color }} />
                </div>
                <p className="font-black text-slate-900 text-sm">
                  {pedido.cliente?.usuario?.name} {pedido.cliente?.usuario?.apellido}
                </p>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 pl-9">
                <Mail size={10} strokeWidth={2} />
                {pedido.cliente?.usuario?.email}
              </p>
              {pedido.cliente?.telefono && (
                <p className="text-xs text-slate-400 flex items-center gap-1.5 pl-9">
                  <Phone size={10} strokeWidth={2} />
                  {pedido.cliente?.telefono}
                </p>
              )}
              <p className="text-xs text-slate-400 flex items-center gap-1.5 pl-9">
                <Hash size={10} strokeWidth={2} />
                Pedido {pedido.id} ·{' '}
                {new Date(pedido.created_at).toLocaleDateString('es-PE', {
                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                })}
              </p>
            </div>
            <EstadoBadge estado={pedido.estado} />
          </div>

          {/* Detalle de productos */}
          <div className="bg-slate-50 rounded-xl p-3 mb-4 space-y-1.5">
            {pedido.detalles?.map((detalle) => (
              <div key={detalle.id} className="flex justify-between text-xs text-slate-600">
                <span className="font-medium">
                  {detalle.producto?.nombre}
                  <span className="text-slate-400 ml-1">×{detalle.cantidad}</span>
                </span>
                <span className="font-bold text-slate-700">
                  S/{parseFloat(detalle.subtotal).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="flex justify-between font-black text-sm pt-2 border-t border-slate-200 mt-1">
              <span className="text-slate-700">Total productos</span>
              <span style={{ color: BRAND.primary }}>
                S/{pedido.detalles?.reduce((acc, d) => acc + parseFloat(d.subtotal), 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Acciones según estado */}
          {pedido.estado === 'pendiente' && (
            <div className="flex gap-2">
              <button
                onClick={() => cambiarEstado(pedido.id, 'aceptado')}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl text-white transition hover:opacity-90"
                style={{ backgroundColor: '#059669' }}
              >
                <CheckCircle2 size={14} strokeWidth={2.5} />
                Aceptar
              </button>
              <button
                onClick={() => cambiarEstado(pedido.id, 'rechazado')}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl text-white transition hover:opacity-90"
                style={{ backgroundColor: '#DC2626' }}
              >
                <XCircle size={14} strokeWidth={2.5} />
                Rechazar
              </button>
            </div>
          )}

          {pedido.estado === 'aceptado' && (
            <button
              onClick={() => cambiarEstado(pedido.id, 'en_preparacion')}
              className="w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-xl text-white transition hover:opacity-90"
              style={{ backgroundColor: '#7C3AED' }}
            >
              <ChefHat size={14} strokeWidth={2.5} />
              Iniciar preparación
            </button>
          )}

          {pedido.estado === 'en_preparacion' && (
            <button
              onClick={() => cambiarEstado(pedido.id, 'listo')}
              className="w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-xl text-white transition hover:opacity-90"
              style={{ backgroundColor: '#0D9488' }}
            >
              <Package size={14} strokeWidth={2.5} />
              Marcar como listo
            </button>
          )}

          {pedido.estado === 'listo' && (
            <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border"
              style={{ backgroundColor: '#F0FDFA', color: '#0D9488', borderColor: '#99F6E4' }}>
              <Package size={14} strokeWidth={2.5} />
              Pedido listo — esperando al repartidor
            </div>
          )}

          {pedido.estado === 'en_camino' && (
            <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border"
              style={{ backgroundColor: '#FFF7ED', color: '#EA580C', borderColor: '#FED7AA' }}>
              <Bike size={14} strokeWidth={2.5} />
              El repartidor está en camino al cliente
            </div>
          )}

          {pedido.estado === 'rechazado' && (
            <div className="rounded-xl p-3 border"
              style={{ backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }}>
              <p className="text-xs font-bold text-rose-700 flex items-center gap-1.5 mb-1">
                <AlertTriangle size={12} strokeWidth={2.5} />
                Pedido rechazado
              </p>
              <p className="text-xs text-rose-600">Contacta al cliente para coordinar:</p>
              <p className="text-xs font-bold text-rose-700 flex items-center gap-1.5 mt-1">
                <Mail size={10} strokeWidth={2} />
                {pedido.cliente?.usuario?.email}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── NegocioPedidos ──────────────────────────────────────────────────────── */
const NegocioPedidos = () => {
  const navigate = useNavigate()
  const [pedidos, setPedidos]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [pestaña, setPestaña]     = useState('pedidos')
  const [paginaHistorial, setPaginaHistorial] = useState(1)
  const [refreshing, setRefreshing] = useState(false)
  const intervaloRef              = useRef(null)

  useEffect(() => {
    fetchPedidos()
    if (!intervaloRef.current) {
      intervaloRef.current = setInterval(fetchPedidos, 8000)
    }
    return () => { clearInterval(intervaloRef.current); intervaloRef.current = null }
  }, [])

  useEffect(() => { setPaginaHistorial(1) }, [pestaña])

  const fetchPedidos = async () => {
    try {
      const res = await api.get('/negocio/pedidos')
      setPedidos(res.data)
    } catch { toast.error('Error al cargar pedidos') }
    finally { setLoading(false) }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchPedidos()
    setRefreshing(false)
  }

  const cambiarEstado = async (pedidoId, estado) => {
    try {
      await api.patch(`/negocio/pedidos/${pedidoId}/estado`, { estado })
      toast.success(`Pedido ${getEstadoConfig(estado).label}`)
      fetchPedidos()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cambiar estado')
    }
  }

  const pedidosActuales  = pedidos.filter(p =>
    ['pendiente', 'aceptado', 'en_preparacion', 'listo', 'en_camino'].includes(p.estado)
  )
  const pedidosHistorial = pedidos.filter(p =>
    ['entregado', 'rechazado'].includes(p.estado)
  )

  const totalPaginas     = Math.ceil(pedidosHistorial.length / ITEMS_POR_PAGINA)
  const historialPaginado = pedidosHistorial.slice(
    (paginaHistorial - 1) * ITEMS_POR_PAGINA,
    paginaHistorial * ITEMS_POR_PAGINA
  )

  return (
    <div className="min-h-screen bg-slate-50 antialiased">

      {/* ══════════════════════════════════════
          HEADER con pestañas integradas
      ══════════════════════════════════════ */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4">

          {/* Barra superior */}
          <div className="h-14 flex items-center justify-between">
            <button
              onClick={() => navigate('/negocio')}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
            >
              <ArrowLeft size={15} strokeWidth={2.5} />
              Volver
            </button>

            <span className="font-black text-slate-900 text-base">Pedidos</span>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition disabled:opacity-50"
            >
              <RefreshCw size={13} strokeWidth={2.5}
                className={refreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
          </div>

          {/* Pestañas */}
          <div className="flex border-t border-slate-100">
            {[
              { key: 'pedidos',   label: 'Pedidos',   Icon: ClipboardList, count: pedidosActuales.length,  countColor: BRAND.primary },
              { key: 'historial', label: 'Historial', Icon: Archive,       count: pedidosHistorial.length, countColor: '#64748B'    },
            ].map(({ key, label, Icon, count, countColor }) => (
              <button
                key={key}
                onClick={() => setPestaña(key)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold border-b-2 transition-colors
                  ${pestaña === key
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
              >
                <Icon size={14} strokeWidth={2} />
                {label}
                {count > 0 && (
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-lg text-white min-w-[18px] text-center"
                    style={{ backgroundColor: countColor }}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-5">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-100 rounded-2xl gap-3">
            <Loader2 size={24} className="animate-spin" style={{ color: BRAND.primary }} />
            <span className="text-sm font-medium text-slate-400">Cargando pedidos...</span>
          </div>
        ) : (
          <>
            {/* ── PEDIDOS ACTIVOS ── */}
            {pestaña === 'pedidos' && (
              <div className="space-y-4">
                {pedidosActuales.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-100 p-14 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
                      <ClipboardList size={26} className="text-slate-300" />
                    </div>
                    <p className="font-bold text-slate-600">No hay pedidos activos</p>
                    <p className="text-xs text-slate-400 mt-1">Los nuevos pedidos aparecerán aquí</p>
                  </div>
                ) : (
                  pedidosActuales.map(p =>
                    <PedidoCard key={p.id} pedido={p} cambiarEstado={cambiarEstado} />
                  )
                )}
              </div>
            )}

            {/* ── HISTORIAL ── */}
            {pestaña === 'historial' && (
              <div className="space-y-4">
                {pedidosHistorial.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-100 p-14 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
                      <Archive size={26} className="text-slate-300" />
                    </div>
                    <p className="font-bold text-slate-600">Sin historial aún</p>
                    <p className="text-xs text-slate-400 mt-1">Los pedidos finalizados aparecerán aquí</p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-slate-400 text-right">
                      {(paginaHistorial - 1) * ITEMS_POR_PAGINA + 1}–
                      {Math.min(paginaHistorial * ITEMS_POR_PAGINA, pedidosHistorial.length)} de {pedidosHistorial.length} pedidos
                    </p>

                    {historialPaginado.map(p =>
                      <PedidoCard key={p.id} pedido={p} cambiarEstado={cambiarEstado} />
                    )}

                    {/* Paginación */}
                    {totalPaginas > 1 && (
                      <div className="flex items-center justify-center gap-2 pt-2">
                        <button
                          onClick={() => setPaginaHistorial(p => Math.max(1, p - 1))}
                          disabled={paginaHistorial === 1}
                          className="flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
                        >
                          <ChevronLeft size={13} strokeWidth={2.5} />
                          Anterior
                        </button>

                        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
                          <button
                            key={n}
                            onClick={() => setPaginaHistorial(n)}
                            className="w-9 h-9 text-xs font-black rounded-xl border transition"
                            style={paginaHistorial === n
                              ? { backgroundColor: BRAND.dark, color: '#fff', borderColor: BRAND.dark }
                              : { backgroundColor: '#fff', color: '#475569', borderColor: '#E2E8F0' }
                            }
                          >
                            {n}
                          </button>
                        ))}

                        <button
                          onClick={() => setPaginaHistorial(p => Math.min(totalPaginas, p + 1))}
                          disabled={paginaHistorial === totalPaginas}
                          className="flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
                        >
                          Siguiente
                          <ChevronRight size={13} strokeWidth={2.5} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default NegocioPedidos