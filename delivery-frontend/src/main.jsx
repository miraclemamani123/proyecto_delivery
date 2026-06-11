import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import AppRouter from './routes/AppRouter'
import './index.css'
import 'leaflet/dist/leaflet.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Toaster position="top-right" />
    <AppRouter />
  </StrictMode>
)