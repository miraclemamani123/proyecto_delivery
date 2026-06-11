import { Outlet } from 'react-router-dom'
import EscuchadorNegocio from '../../components/shared/EscuchadorNegocio'

const NegocioLayout = () => {
  return (
    <>
      {/* 🔔 EL ESCUCHADOR QUEDA INSTALADO DE FONDO EN TODO EL ROL DE NEGOCIO */}
      <EscuchadorNegocio />
      
      {/* El Outlet renderiza de forma dinámica la página actual (Dashboard, Pedidos o Productos) */}
      <Outlet />
    </>
  )
}

export default NegocioLayout
