import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/shared/ProtectedRoute'

import Landing from '../pages/Landing'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import AdminDashboard from '../pages/admin/Dashboard'
import AdminNegocios from '../pages/admin/Negocios'
import AdminRepartidores from '../pages/admin/Repartidores'
import AdminPedidos from '../pages/admin/Pedidos'

// 🏪 IMPORTACIÓN DEL NUEVO LAYOUT DEL COMERCIO
import NegocioLayout from '../pages/negocio/NegocioLayout'
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
import RepartidorLayout from '../pages/repartidor/RepartidorLayout'


const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🛡️ RUTAS ADMINISTRADOR */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/negocios" element={<ProtectedRoute role="admin"><AdminNegocios /></ProtectedRoute>} />
        <Route path="/admin/repartidores" element={<ProtectedRoute role="admin"><AdminRepartidores /></ProtectedRoute>} />
        <Route path="/admin/pedidos" element={<ProtectedRoute role="admin"><AdminPedidos /></ProtectedRoute>} />

        {/* 🏪 RUTAS NEGOCIO AGRUPADAS CON EL ESCUCHADOR GLOBAL DE CAMPANA */}
        <Route element={<ProtectedRoute role="negocio"><NegocioLayout /></ProtectedRoute>}>
          <Route path="/negocio" element={<NegocioDashboard />} />
          <Route path="/negocio/productos" element={<NegocioProductos />} />
          <Route path="/negocio/pedidos" element={<NegocioPedidos />} />
        </Route>

        {/* 👤 RUTAS CLIENTE */}
        <Route path="/cliente" element={<ProtectedRoute role="cliente"><ClienteHome /></ProtectedRoute>} />
        <Route path="/cliente/negocio/:id" element={<ProtectedRoute role="cliente"><ClienteNegocio /></ProtectedRoute>} />
        <Route path="/cliente/carrito" element={<ProtectedRoute role="cliente"><ClienteCarrito /></ProtectedRoute>} />
        <Route path="/cliente/pago" element={<ProtectedRoute role="cliente"><ClientePago /></ProtectedRoute>} />
        <Route path="/cliente/pedidos" element={<ProtectedRoute role="cliente"><ClientePedidos /></ProtectedRoute>} />

        {/* 🛵 RUTAS REPARTIDOR */}
        <Route element={<ProtectedRoute role="repartidor"><RepartidorLayout /></ProtectedRoute>}>
          <Route path="/repartidor" element={<RepartidorDashboard />} />
          <Route path="/repartidor/pedidos" element={<RepartidorPedidos />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
