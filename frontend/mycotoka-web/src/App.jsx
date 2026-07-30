import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import DevicesPage from './pages/DevicesPage'
import ClientsPage from './pages/ClientsPage'
import SubscriptionsPage from './pages/SubscriptionsPage'
import UsersPage from './pages/UsersPage'
import { useAuth } from './hooks/useAuth'

function ProtectedRoute({ children, adminOnly }) {
  const { isAuthenticated, isAdmin } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" />
  if (adminOnly && !isAdmin) return <Navigate to="/home" />
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/devices" element={<ProtectedRoute><DevicesPage /></ProtectedRoute>} />
      <Route path="/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
      <Route path="/subscriptions" element={<ProtectedRoute><SubscriptionsPage /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute adminOnly><UsersPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/home" />} />
    </Routes>
  )
}

export default App
