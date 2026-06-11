import { Outlet } from 'react-router-dom'
import EscuchadorRepartidor from '../../components/shared/EscuchadorRepartidor'

const RepartidorLayout = () => {
  return (
    <>
      <EscuchadorRepartidor />
      <Outlet />
    </>
  )
}

export default RepartidorLayout