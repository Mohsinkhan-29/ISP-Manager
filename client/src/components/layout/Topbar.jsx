import { Menu, Sun, Moon, Building2 } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'

export function Topbar({ onMenuClick }) {
  const { dark, toggle } = useTheme()
  const { user } = useAuth()

  const company = user?.company_name ?? user?.company ?? null

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
      {/* Left — mobile menu toggle */}
      <button
        className="lg:hidden btn-ghost p-1.5"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden lg:block" />

      {/* Right — actions + identity */}
      <div className="flex items-center gap-1">

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="btn-ghost p-2"
          aria-label="Toggle theme"
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark
            ? <Sun  className="h-4 w-4 text-amber-400" />
            : <Moon className="h-4 w-4 text-gray-400"  />
          }
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-800 mx-1" />

        {/* Company + user */}
        <div className="hidden sm:flex items-center gap-3">

          {/* Company pill */}
          {company && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md
                            bg-gray-100 dark:bg-gray-800
                            border border-gray-200 dark:border-gray-700">
              <Building2 className="h-3 w-3 text-gray-400 dark:text-gray-500 shrink-0" />
              <span className="text-[12px] font-medium text-gray-600 dark:text-gray-300 max-w-[140px] truncate">
                {company}
              </span>
            </div>
          )}

          {/* Divider */}
          {company && (
            <div className="w-px h-5 bg-gray-200 dark:bg-gray-800" />
          )}

          {/* User avatar + name */}
          <div className="flex items-center gap-2 pr-1">
            <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40
                            flex items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300">
                {user?.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[12px] font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[100px]">
                {user?.name}
              </span>
              {user?.role && (
                <span className="text-[10px] text-gray-400 dark:text-gray-600 capitalize">
                  {user.role.toLowerCase()}
                </span>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  )
}