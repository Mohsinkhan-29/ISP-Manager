import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, CreditCard, FileText,
  DollarSign, BookOpen, Bell, ShieldCheck,
  Wifi, LogOut, ChevronRight,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../utils/Helpers'

const NAV = [
  { label: 'Dashboard',     icon: LayoutDashboard, to: '/' },
  { label: 'Customers',     icon: Users,            to: '/customers' },
  { label: 'Plans',         icon: Wifi,             to: '/plans' },
  { label: 'Subscriptions', icon: CreditCard,       to: '/subscriptions' },
  { label: 'Invoices',      icon: FileText,         to: '/invoices' },
  { label: 'Payments',      icon: DollarSign,       to: '/payments' },
  { label: 'Ledger',        icon: BookOpen,         to: '/ledger' },
  { label: 'Notifications', icon: Bell,             to: '/notifications' },
  { label: 'Admins',        icon: ShieldCheck,      to: '/admins',
    roles: ['OWNER', 'ADMIN'] },
]

export function Sidebar({ onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const visible = NAV.filter(
    (n) => !n.roles || n.roles.includes(user?.role)
  )

  return (
    <aside className="flex flex-col h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-200 dark:border-gray-800">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
          <Wifi className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            ISP Manager
          </p>
          <p className="text-[10px] text-gray-400 truncate">{user?.role}</p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visible.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('h-4 w-4 flex-shrink-0',
                  isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                )} />
                {label}
                {isActive && (
                  <ChevronRight className="h-3 w-3 ml-auto text-brand-400" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-brand-700 dark:text-brand-300">
              {user?.name?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
            <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-500 hover:text-red-600
                     hover:bg-red-50 dark:hover:bg-red-950/30 dark:hover:text-red-400
                     rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}