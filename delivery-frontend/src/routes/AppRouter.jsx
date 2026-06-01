import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/shared/ProtectedRoute'

import Landing from '../pages/Landing'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import AdminDashboard from '../pages/admin/Dashboard'
import AdminNegocios from '../pages/admin/Negocios'
import AdminRepartidores from '../pages/admin/Repartidores'
import AdminPedidos from '../pages/admin/Pedidos'
import NegocioDashboard from '../pages/negocio/Dashboard'
import NegocioProductos from '../pages/negocio/Productos'
import NegocioPedidos from '../pages/negocio/Pedidos'
import ClienteHome from '../pages/cliente/Home'
import ClienteNegocio from '../pages/cliente/Negocio'
import ClienteCarrito from '../pages/cliente/Carrito'
import ClientePago from '../pages/cliente/Pago'
import ClientePedidos from '../pages/cliente/MisPedidos'
import RepartidorDashboard from '../pages/repartidor/Dashboard'
import RepartidorPedidos from '../pages/repartidor/Pedidos'

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/negocios" element={<ProtectedRoute role="admin"><AdminNegocios /></ProtectedRoute>} />
        <Route path="/admin/repartidores" element={<ProtectedRoute role="admin"><AdminRepartidores /></ProtectedRoute>} />
        <Route path="/admin/pedidos" element={<ProtectedRoute role="admin"><AdminPedidos /></ProtectedRoute>} />

        <Route path="/negocio" element={<ProtectedRoute role="negocio"><NegocioDashboard /></ProtectedRoute>} />
        <Route path="/negocio/productos" element={<ProtectedRoute role="negocio"><NegocioProductos /></ProtectedRoute>} />
        <Route path="/negocio/pedidos" element={<ProtectedRoute role="negocio"><NegocioPedidos /></ProtectedRoute>} />

        <Route path="/cliente" element={<ProtectedRoute role="cliente"><ClienteHome /></ProtectedRoute>} />
        <Route path="/cliente/negocio/:id" element={<ProtectedRoute role="cliente"><ClienteNegocio /></ProtectedRoute>} />
        <Route path="/cliente/carrito" element={<ProtectedRoute role="cliente"><ClienteCarrito /></ProtectedRoute>} />
        <Route path="/cliente/pago" element={<ProtectedRoute role="cliente"><ClientePago /></ProtectedRoute>} />
        <Route path="/cliente/pedidos" element={<ProtectedRoute role="cliente"><ClientePedidos /></ProtectedRoute>} />

        <Route path="/repartidor" element={<ProtectedRoute role="repartidor"><RepartidorDashboard /></ProtectedRoute>} />
        <Route path="/repartidor/pedidos" element={<ProtectedRoute role="repartidor"><RepartidorPedidos /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter