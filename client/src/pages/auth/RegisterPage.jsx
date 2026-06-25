import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Wifi, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { getErrorMessage } from '../../utils/helpers'

const STEPS = [
  { key: 'company',  label: 'Company'  },
  { key: 'account',  label: 'Account'  },
  { key: 'security', label: 'Security' },
]

export default function RegisterPage() {
  const { register } = useAuth()
  const toast        = useToast()
  const navigate     = useNavigate()

  const [form, setForm] = useState({
    tenantName: '',
    adminName:  '',
    email:      '',
    password:   '',
  })
  const [showPw,  setShowPw]  = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(form)
      toast('Account created — welcome!', 'success')
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
                  <p className="text-white text-base font-semibold leading-tight">NetCore ISP</p>
                  <p className="text-blue-300 text-[10px] tracking-[3px] uppercase mt-0.5">Management Suite</p>
                </div>
              </div>

              {/* Steps */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="text-blue-300 text-[10px] tracking-[2px] uppercase mb-4">
                  Setup steps
                </p>
                <div className="space-y-0 divide-y divide-white/[0.07]">
                  {[
                    { n: '1', label: 'Company details',  sub: 'Your ISP name'           },
                    { n: '2', label: 'Admin account',    sub: 'Name & email'             },
                    { n: '3', label: 'Secure password',  sub: 'Min 8 characters'         },
                  ].map((s) => (
                    <div key={s.n} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                      <span className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-300 text-xs flex items-center justify-center shrink-0 font-medium">
                        {s.n}
                      </span>
                      <div>
                        <p className="text-slate-200 text-sm leading-tight">{s.label}</p>
                        <p className="text-slate-500 text-xs">{s.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-slate-500 text-xs">© 2025 NetCore ISP · v3.1.4</p>
          </aside>

          {/* ── RIGHT PANEL ── */}
          <main className="flex flex-1 items-center justify-center p-8 sm:p-10">
            <div className="w-full max-w-sm">

              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                Create account
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-7">
                Set up your ISP company
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Company name */}
                <div>
                  <label className="block text-[11px] font-semibold tracking-widest uppercase text-slate-400 dark:text-slate-500 mb-1.5">
                    Company name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.tenantName}
                    onChange={set('tenantName')}
                    placeholder="Acme ISP"
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                  />
                </div>

                {/* Your name */}
                <div>
                  <label className="block text-[11px] font-semibold tracking-widest uppercase text-slate-400 dark:text-slate-500 mb-1.5">
                    Your name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.adminName}
                    onChange={set('adminName')}
                    placeholder="Jane Doe"
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[11px] font-semibold tracking-widest uppercase text-slate-400 dark:text-slate-500 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={set('email')}
                    placeholder="you@company.com"
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
                      minLength={8}
                      value={form.password}
                      onChange={set('password')}
                      placeholder="Min 8 characters"
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

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-lg bg-[#1a3a5c] hover:bg-[#22487a] active:scale-[0.99] text-white text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? 'Creating account…' : 'Create account'}
                </button>
              </form>

              <p className="mt-5 text-center text-xs text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:underline font-medium">
                  Sign in
                </Link>
              </p>

            </div>
          </main>

        </div>
      </div>
    </div>
  )
}