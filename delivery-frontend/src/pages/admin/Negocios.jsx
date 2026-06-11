import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const AdminNegocios = () => {
  const navigate = useNavigate()
  const [negocios, setNegocios] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNegocios()
  }, [])

  const fetchNegocios = async () => {
    try {
      const res = await api.get('/admin/negocios')
      setNegocios(res.data)
    } catch (err) {
      toast.error('Error al cargar negocios')
    } finally {
      setLoading(false)
    }
  }

  const aprobar = async (id) => {
    try {
      await api.patch(`/admin/negocios/${id}/aprobar`)
      toast.success('Negocio aprobado')
      fetchNegocios()
    } catch (err) {
      toast.error('Error al aprobar')
    }
  }

  const desactivar = async (id) => {
    try {
      await api.patch(`/admin/negocios/${id}/desactivar`)
      toast.success('Negocio desactivado')
      fetchNegocios()
    } catch (err) {
      toast.error('Error al desactivar')
    }
  }

  const negociosPendientes = negocios.filter(n => !n.aprobado)
  const negociosAprobados = negocios.filter(n => n.aprobado)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/admin')}
            className="text-gray-600 hover:text-orange-500 transition"
          >
            ← Volver
          </button>
          <h1 className="text-lg font-bold text-gray-800">Gestión de Negocios</h1>
          <button
            onClick={fetchNegocios}
            className="text-sm text-orange-500 font-semibold hover:underline"
          >
            Actualizar
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">🏪</div>
            <p>Cargando negocios...</p>
          </div>
        ) : (
          <>
            {/* PENDIENTES */}
            {negociosPendientes.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-3">
                  ⏳ Pendientes de aprobación ({negociosPendientes.length})
                </h3>
                <div className="space-y-3">
                  {negociosPendientes.map(negocio => (
                    <div key={negocio.id} className="bg-white rounded-xl border-2 border-yellow-200 shadow-sm p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-bold text-gray-800">{negocio.nombre}</p>
                          <p className="text-xs text-gray-500">{negocio.categoria?.nombre}</p>
                          <p className="text-xs text-gray-400">📍 {negocio.direccion}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            👤 {negocio.usuario?.name} {negocio.usuario?.apellido} — {negocio.usuario?.email}
                          </p>
                        </div>
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-semibold">
                          ⏳ Pendiente
                        </span>
                      </div>
                      <button
                        onClick={() => aprobar(negocio.id)}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition text-sm mt-2"
                      >
                        ✅ Aprobar negocio
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* APROBADOS */}
            <div>
              <h3 className="text-sm font-bold text-green-600 uppercase tracking-wider mb-3">
                ✅ Negocios aprobados ({negociosAprobados.length})
              </h3>
              <div className="space-y-3">
                {negociosAprobados.map(negocio => (
                  <div key={negocio.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-gray-800">{negocio.nombre}</p>
                        <p className="text-xs text-gray-500">{negocio.categoria?.nombre}</p>
                        <p className="text-xs text-gray-400">📍 {negocio.direccion}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          👤 {negocio.usuario?.name} {negocio.usuario?.apellido} — {negocio.usuario?.email}
                        </p>
                      </div>
                      <div className="text-right space-y-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold block ${
                          negocio.estado === 'abierto'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-500'
                        }`}>
                          {negocio.estado === 'abierto' ? '● Abierto' : '● Cerrado'}
                        </span>
                        <button
                          onClick={() => desactivar(negocio.id)}
                          className="text-xs bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded-lg transition font-semibold"
                        >
                          Desactivar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {negocios.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-4">🏪</div>
                <p>No hay negocios registrados</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default AdminNegocios