import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './components/ui/Toast'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AppLayout } from './components/layout/AppLayout'

// Auth pages
import LoginPage    from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// App pages
import DashboardPage      from './pages/dashboard/DashboardPage'
import CustomersPage      from './pages/customers/CustomersPage'
import PlansPage          from './pages/plans/PlansPage'
import SubscriptionsPage  from './pages/subscriptions/SubscriptionsPage'
import InvoicesPage       from './pages/invoices/InvoicesPage'
import PaymentsPage       from './pages/payments/PaymentsPage'
import LedgerPage         from './pages/ledger/LedgerPage'
import AdminsPage         from './pages/admins/AdminsPage'
import NotificationsPage  from './pages/notifications/NotificationsPage'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/login"    element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/"               element={<DashboardPage />} />
                  <Route path="/customers"      element={<CustomersPage />} />
                  <Route path="/plans"          element={<PlansPage />} />
                  <Route path="/subscriptions"  element={<SubscriptionsPage />} />
                  <Route path="/invoices"       element={<InvoicesPage />} />
                  <Route path="/payments"       element={<PaymentsPage />} />
                  <Route path="/ledger"         element={<LedgerPage />} />
                  <Route path="/notifications"  element={<NotificationsPage />} />

                  {/* OWNER + ADMIN only */}
                  <Route element={<ProtectedRoute roles={['OWNER', 'ADMIN']} />}>
                    <Route path="/admins" element={<AdminsPage />} />
                  </Route>
                </Route>
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}