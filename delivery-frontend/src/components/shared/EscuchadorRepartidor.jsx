import { useEffect, useRef } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const EscuchadorRepartidor = () => {
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
          (
            (n.tipo === 'sistema' && n.titulo.includes('MOTO_RESERVA')) ||
            (n.tipo === 'pedido' && n.titulo.includes('¡Viaje confirmado!'))
          )
        )

        for (const noti of nuevas) {
          mostradas.current.add(noti.id)

          try {
            await api.patch(`/notificaciones/${noti.id}/leer`)
          } catch (err) {
            console.error('Error al marcar como leída:', err)
          }

          try {
            const audio = new Audio('/sounds/notificacion-repartidor.mp3')
            await audio.play()
          } catch {
            // Navegador bloquea audio sin interacción previa — silencioso
          }

          const esMomento1 = noti.titulo.includes('MOTO_RESERVA')

          toast.custom(
            (t) => (
              <div
                className={`max-w-md w-full bg-white shadow-2xl rounded-xl pointer-events-auto flex border-l-4 p-4 justify-between items-center ring-1 ring-black ring-opacity-5 ${
                  esMomento1 ? 'border-yellow-400' : 'border-green-500'
                }`}
              >
                <div className="flex-1 pr-4">
                  <p className="text-sm font-bold text-gray-900">
                    {esMomento1 ? '🔒 Estás en reserva' : '✅ ¡Viaje asignado!'}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">{noti.mensaje}</p>
                </div>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className={`text-white text-xs font-bold px-3 py-2 rounded-lg transition ${
                    esMomento1
                      ? 'bg-yellow-400 hover:bg-yellow-500'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  Ok ✓
                </button>
              </div>
            ),
            { id: `repartidor-noti-${noti.id}`, duration: Infinity }
          )
        }
      } catch (err) {
        console.error('Error en EscuchadorRepartidor:', err)
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

export default EscuchadorRepartidor