import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const iconoNegocio = new L.Icon({
  iconUrl:   'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})
const iconoCliente = new L.Icon({
  iconUrl:   'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})
const iconoRepartidor = new L.Icon({
  iconUrl:   'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})

const INICIO_DEMO = { lat: -12.8563, lng: -72.6926 }

const AutoCenter = ({ bounds }) => {
  const map = useMap()
  useEffect(() => {
    if (bounds?.length > 0) map.fitBounds(bounds, { padding: [50, 50] })
  }, [bounds, map])
  return null
}

export const obtenerRutaOSRM = async (desde, hasta) => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/` +
      `${desde.lng},${desde.lat};${hasta.lng},${hasta.lat}?overview=full&geometries=geojson`
    const res  = await fetch(url)
    const data = await res.json()
    if (data.code === 'Ok')
      return data.routes[0].geometry.coordinates.map(([lng, lat]) => ({ lat, lng }))
  } catch (e) {
    console.error('OSRM error:', e)
  }
  return null
}

const MapaEntrega = ({ negocio, cliente, repartidor, distancia, modo, posSimulada }) => {
  const [rutaPuntos, setRutaPuntos] = useState([])

  const latNeg = parseFloat(distancia?.latitud_negocio  || negocio?.latitud)
  const lngNeg = parseFloat(distancia?.longitud_negocio || negocio?.longitud)
  const tieneNegocio = !isNaN(latNeg) && !isNaN(lngNeg)

  const latCli = parseFloat(distancia?.latitud_cliente  || cliente?.latitud)
  const lngCli = parseFloat(distancia?.longitud_cliente || cliente?.longitud)
  const tieneCliente = !isNaN(latCli) && !isNaN(lngCli)

  // Posición repartidor: simulada > real > demo
  // En modo 'esperando' no hay repartidor, evitamos mostrar INICIO_DEMO
  const latRepReal = parseFloat(repartidor?.ubicaciones?.[0]?.latitud || repartidor?.latitud)
  const lngRepReal = parseFloat(repartidor?.ubicaciones?.[0]?.longitud || repartidor?.longitud)

  const posRepartidor = modo === 'esperando'
    ? null
    : posSimulada
      ?? (!isNaN(latRepReal) && !isNaN(lngRepReal) ? { lat: latRepReal, lng: lngRepReal } : INICIO_DEMO)

  // Ruta OSRM — solo cuando hay destino claro
  useEffect(() => {
    // 'esperando' = solo marcadores, sin ruta
    if (modo === 'esperando') { setRutaPuntos([]); return }

    const destino =
      modo === 'ir_a_negocio'     && tieneNegocio ? { lat: latNeg, lng: lngNeg } :
      modo === 'ir_a_cliente'     && tieneCliente ? { lat: latCli, lng: lngCli } :
      modo === 'cliente_tracking' && tieneCliente ? { lat: latCli, lng: lngCli } :
      null

    if (!destino || !posRepartidor) { setRutaPuntos([]); return }

    obtenerRutaOSRM(posRepartidor, destino).then(puntos => {
      if (puntos) setRutaPuntos(puntos.map(p => [p.lat, p.lng]))
      else        setRutaPuntos([[posRepartidor.lat, posRepartidor.lng], [destino.lat, destino.lng]])
    })
  }, [modo, posSimulada])

  const bounds = [
    tieneNegocio   ? [latNeg, lngNeg]                       : null,
    tieneCliente   ? [latCli, lngCli]                       : null,
    posRepartidor  ? [posRepartidor.lat, posRepartidor.lng] : null,
  ].filter(Boolean)

  const centro = bounds.length > 0 ? bounds[0] : [INICIO_DEMO.lat, INICIO_DEMO.lng]

  const urlMaps =
    modo === 'ir_a_negocio' && tieneNegocio
      ? `https://www.google.com/maps/dir/?api=1&destination=${latNeg},${lngNeg}&travelmode=driving`
    : (modo === 'ir_a_cliente' || modo === 'cliente_tracking') && tieneCliente
      ? `https://www.google.com/maps/dir/?api=1&destination=${latCli},${lngCli}&travelmode=driving`
    : null

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <div style={{ height: '260px' }}>
        <MapContainer center={centro} zoom={14} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {bounds.length > 0 && <AutoCenter bounds={bounds} />}

          {tieneNegocio && (
            <Marker position={[latNeg, lngNeg]} icon={iconoNegocio}>
              <Popup>🏪 {negocio?.nombre || 'Negocio'}</Popup>
            </Marker>
          )}
          {tieneCliente && (
            <Marker position={[latCli, lngCli]} icon={iconoCliente}>
              <Popup>👤 Ubicación del cliente</Popup>
            </Marker>
          )}
          {posRepartidor && (
            <Marker position={[posRepartidor.lat, posRepartidor.lng]} icon={iconoRepartidor}>
              <Popup>🛵 Repartidor en camino</Popup>
            </Marker>
          )}
          {rutaPuntos.length > 1 && (
            <Polyline positions={rutaPuntos} color="#f97316" weight={4} dashArray="10 8" />
          )}
        </MapContainer>
      </div>

      {urlMaps && (
        <a href={urlMaps} target="_blank" rel="noreferrer"
          className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-2.5 transition">
          🗺️ Abrir ruta en Google Maps
        </a>
      )}
    </div>
  )
}

export default MapaEntrega