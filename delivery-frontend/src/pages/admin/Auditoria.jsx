import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const AdminAuditoria = () => {
  const navigate = useNavigate()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const res = await api.get('/admin/auditoria')
      setLogs(res.data)
    } catch (err) {
      toast.error('Error al cargar auditoría')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/admin')} className="text-gray-600 hover:text-orange-500 transition">
            ← Volver
          </button>
          <h1 className="text-lg font-bold text-gray-800">Auditoría del sistema</h1>
          <button onClick={fetchLogs} className="text-sm text-orange-500 font-semibold hover:underline">
            Actualizar
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">📋</div>
            <p>Cargando registros...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">📋</div>
            <p className="font-semibold">No hay registros aún</p>
            <p className="text-sm mt-1">Las acciones del sistema aparecerán aquí</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">{log.fecha}</td>
                    <td className="px-5 py-3 font-semibold text-gray-700 whitespace-nowrap">{log.usuario}</td>
                    <td className="px-5 py-3 text-gray-600">{log.descripcion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminAuditoria