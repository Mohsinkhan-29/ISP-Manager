import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, Wifi, CreditCard, FileText,
  DollarSign, ArrowUpRight, Plus,
  TrendingUp, Activity,
} from 'lucide-react'
import { usersApi, plansApi, subscriptionsApi, invoicesApi, paymentsApi } from '../../api/services'
import { useAuth } from '../../context/AuthContext'

// ─── Animated counter ────────────────────────────────────────────────────────
function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (target == null || target === '—') return
    const n = Number(target)
    if (isNaN(n)) return
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(eased * n))
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return value
}

// ─── Stat card ───────────────────────────────────────────────────────────────
const COLOR_MAP = {
  blue: { ring: 'ring-blue-500/20', icon: 'bg-blue-500/10 text-blue-500 dark:text-blue-400', bar: 'bg-blue-500' },
  purple: { ring: 'ring-purple-500/20', icon: 'bg-purple-500/10 text-purple-500 dark:text-purple-400', bar: 'bg-purple-500' },
  green: { ring: 'ring-emerald-500/20', icon: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400', bar: 'bg-emerald-500' },
  amber: { ring: 'ring-amber-500/20', icon: 'bg-amber-500/10 text-amber-500 dark:text-amber-400', bar: 'bg-amber-500' },
}

function StatCard({ label, value, icon: Icon, color, to, loading, index }) {
  const c = COLOR_MAP[color]
  const animated = useCountUp(loading ? null : value)

  return (
    <Link
      to={to}
      className={`
        group relative overflow-hidden rounded-xl
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-800
        ring-1 ${c.ring}
        p-5 flex flex-col gap-3
        hover:shadow-lg hover:-translate-y-0.5
        transition-all duration-200 ease-out
      `}
      style={{
        animationDelay: `${index * 80}ms`,
        animation: 'slideUp 0.4s ease-out both',
      }}
    >
      {/* Glow blob */}
      <div
        className={`absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-[0.07] blur-xl ${c.bar}`}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${c.icon}`}>
          <Icon className="h-[18px] w-[18px]" />
        </div>
        <ArrowUpRight
          className="h-3.5 w-3.5 text-gray-300 dark:text-gray-700
                     group-hover:text-gray-500 dark:group-hover:text-gray-400
                     group-hover:translate-x-0.5 group-hover:-translate-y-0.5
                     transition-all duration-150"
        />
      </div>

      <div>
        {loading ? (
          <div className="h-8 w-14 bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse mb-1" />
        ) : (
          <p className="text-[28px] font-bold leading-none tracking-tight text-gray-900 dark:text-gray-50 tabular-nums">
            {animated.toLocaleString()}
          </p>
        )}
        <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mt-1.5 uppercase tracking-wider">
          {label}
        </p>
      </div>

      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-0 right-0 h-[2px] ${c.bar} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
    </Link>
  )
}

// ─── Quick action button ──────────────────────────────────────────────────────
function QuickAction({ label, to, icon: Icon, index }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-2.5 rounded-lg
             border border-gray-200 dark:border-gray-800
             bg-white dark:bg-gray-900
             px-4 py-3
             hover:border-blue-400 dark:hover:border-blue-500
             hover:bg-blue-50 dark:hover:bg-slate-800
             hover:shadow-sm
             transition-all duration-150"
    >
      <span className="flex items-center justify-center w-6 h-6 rounded-md
                   bg-gray-100 dark:bg-gray-800
                   group-hover:bg-blue-100 dark:group-hover:bg-blue-500/15
                   transition-colors duration-150">
        <Icon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400
                     group-hover:text-blue-600 dark:group-hover:text-blue-400
                     transition-colors" />
      </span>

      <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300
                   group-hover:text-blue-700 dark:group-hover:text-white
                   transition-colors">
        {label}
      </span>

      <Plus className="h-3 w-3 ml-auto text-gray-300 dark:text-gray-700
                   group-hover:text-blue-400 dark:group-hover:text-blue-400
                   group-hover:rotate-90 transition-all duration-200" />
    </Link>
  )
}

// ─── Live clock ──────────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <span className="text-[20px] font-mono text-gray-400 dark:text-gray-600 tabular-nums">
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      usersApi.getAll({ limit: 1, status: 'active' }),
      plansApi.getAll({ limit: 1, status: 'active' }),
      subscriptionsApi.getAll({ limit: 1, status: 'active' }),
      invoicesApi.getAll({ limit: 1, status: 'unpaid' }),
      invoicesApi.getAll({ limit: 1, status: 'partial' }),
      paymentsApi.getAll({ limit: 1 }),
    ]).then(([customers, plans, subs, unpaid, partial, payments]) => {
      setStats({
        customers: customers.data.total,
        plans: plans.data.total,
        subs: subs.data.total,
        unpaid: unpaid.data.total + partial.data.total,
        payments: payments.data.total,
      })
    }).catch(() => { }).finally(() => setLoading(false))
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const firstName = user?.name?.split(' ')[0]

  const STATS = [
    { label: 'Active customers', key: 'customers', icon: Users, color: 'blue', to: '/customers' },
    { label: 'Active plans', key: 'plans', icon: Wifi, color: 'purple', to: '/plans' },
    { label: 'Active subscriptions', key: 'subs', icon: Activity, color: 'green', to: '/subscriptions' },
    { label: 'Outstanding invoices', key: 'unpaid', icon: FileText, color: 'amber', to: '/invoices' },
    { label: 'Total payments', key: 'payments', icon: TrendingUp, color: 'green', to: '/payments' },
  ]

  const ACTIONS = [
    { label: 'Add customer', to: '/customers', icon: Users },
    { label: 'New subscription', to: '/subscriptions', icon: CreditCard },
    { label: 'Create invoice', to: '/invoices', icon: FileText },
    { label: 'Record payment', to: '/payments', icon: DollarSign },
  ]

  return (
    <>
      {/* Keyframe injection */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>

      <div className="space-y-8">

        {/* Header */}
        <div
          className="flex items-end justify-between"
          style={{ animation: 'slideUp 0.35s ease-out both' }}
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-1">
              Overview
            </p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-900 leading-tight">
              {greeting()}{firstName ? `, ${firstName}` : ''} 👋
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Here's what's happening across your network.
            </p>
          </div>
          <LiveClock />
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {STATS.map((s, i) => (
            <StatCard
              key={s.key}
              label={s.label}
              value={stats?.[s.key] ?? '—'}
              icon={s.icon}
              color={s.color}
              to={s.to}
              loading={loading}
              index={i}
            />
          ))}
        </div>

        {/* Quick actions */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-3">
            Quick actions
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {ACTIONS.map((a, i) => (
              <QuickAction key={a.to} {...a} index={i} />
            ))}
          </div>
        </div>

      </div>
    </>
  )
}