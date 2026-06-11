import { useEffect, useRef } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const EscuchadorNegocio = () => {
  const mostradas = useRef(new Set())
  const intervaloRef = useRef(null)

  useEffect(() => {
    if (intervaloRef.current) return

    const revisar = async () => {
      try {
        const res = await api.get('/notificaciones')

        const nuevas = res.data.filter(n =>
          !n.leido &&
          !mostradas.current.has(n.id) &&
          n.tipo === 'pedido' &&
          n.titulo.includes('NUEVO_PEDIDO_NEGOCIO')
        )

        for (const noti of nuevas) {
          mostradas.current.add(noti.id)

          try {
            await api.patch(`/notificaciones/${noti.id}/leer`)
          } catch (err) {
            console.error('Error al marcar como leída:', err)
          }

          try {
            const audio = new Audio('/sounds/campana-cocina.mp3')
            await audio.play()
          } catch {
            // Navegador bloquea audio sin interacción previa — silencioso
          }

          toast.custom(
            (t) => (
              <div className="max-w-md w-full bg-white shadow-2xl rounded-xl pointer-events-auto flex border-l-4 border-orange-500 p-4 justify-between items-center ring-1 ring-black ring-opacity-5">
                <div className="flex-1 pr-4">
                  <p className="text-sm font-bold text-gray-900">🏪 ¡Nuevo pedido recibido!</p>
                  <p className="mt-0.5 text-xs text-gray-500">{noti.mensaje}</p>
                </div>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition"
                >
                  Entendido ✅
                </button>
              </div>
            ),
            { id: `negocio-noti-${noti.id}`, duration: Infinity }
          )
        }
      } catch (err) {
        console.error('Error en EscuchadorNegocio:', err)
      }
    }

    revisar()
    intervaloRef.current = setInterval(revisar, 6000)

    return () => {
      clearInterval(intervaloRef.current)
      intervaloRef.current = null
    }
  }, [])

  return null
}

export default EscuchadorNegocio