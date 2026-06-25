import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Wifi, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { getErrorMessage } from '../../utils/helpers'

const STATS = [
  { label: 'Active clients',  value: '1', color: 'bg-emerald-400' },
  { label: 'Pending bills',   value: '0',    color: 'bg-amber-400'   },
  { label: 'Disconnected',    value: '0',    color: 'bg-red-400'     },
  { label: 'Open tickets',    value: '1',    color: 'bg-blue-400'    },
]

const ROLES = ['Admin', 'Staff', 'Technician']

export default function LoginPage() {
  const { login }  = useAuth()
  const toast      = useToast()
  const navigate   = useNavigate()

  const [role,    setRole]    = useState('Admin')
  const [showPw,  setShowPw]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [form,    setForm]    = useState({ email: '', password: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/')
    } catch (err) {
      toast(getErrorMessage(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex min-h-[550px]">

          {/* ── LEFT PANEL ── */}
          <aside className="hidden lg:flex flex-col justify-between w-[320px] shrink-0 bg-[#1a3a5c] p-9">
            <div>
              {/* Logo */}
              <div className="flex items-center gap-3 mb-8">
                <div className="h-11 w-11 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                  <Wifi className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white text-base font-semibold leading-tight">ISP Manager</p>
                  <p className="text-blue-300 text-[10px] tracking-[3px] uppercase mt-0.5">Management Suite</p>
                </div>
              </div>

              {/* Stats */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="text-blue-300 text-[10px] tracking-[2px] uppercase mb-4">
                  Network at a glance
                </p>
                <div className="space-y-0 divide-y divide-white/[0.07]">
                  {STATS.map((s) => (
                    <div key={s.label} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${s.color}`} />
                        <span className="text-slate-300 text-sm">{s.label}</span>
                      </div>
                      <span className="text-white text-sm font-semibold">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-slate-500 text-xs">© 2026 ISP MANAGER · v3.1.4</p>
          </aside>

          {/* ── RIGHT PANEL ── */}
          <main className="flex flex-1 items-center justify-center p-8 sm:p-10">
            <div className="w-full max-w-sm">

              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                Welcome back to ISP MANAGER
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-7">
                Sign in to your management portal
              </p>

              

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Email */}
                <div>
                  <label className="block text-[11px] font-semibold tracking-widest uppercase text-slate-400 dark:text-slate-500 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="you@netcore.io"
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[11px] font-semibold tracking-widest uppercase text-slate-400 dark:text-slate-500 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full h-11 px-3.5 pr-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Forgot */}
                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-xs text-blue-600 hover:underline hover:text-blue-700"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-lg bg-[#1a3a5c] hover:bg-[#22487a] active:scale-[0.99] text-white text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
              </form>

              <p className="mt-5 text-center text-xs text-slate-500">
                New ISP?{' '}
                <Link to="/register" className="text-blue-600 hover:underline font-medium">
                  Create an account
                </Link>
              </p>

            </div>
          </main>

        </div>
      </div>
    </div>
  )
}