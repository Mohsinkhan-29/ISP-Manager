import { Bell, Search, Mail, CreditCard, AlertTriangle, Settings, RefreshCw } from 'lucide-react'
import { notificationsApi } from '../../api/services'
import { useFetch } from '../../hooks/useFetch'
import { useToast } from '../../components/ui/Toast'
import { Pagination } from '../../components/ui/Pagination'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { formatDate, getErrorMessage } from '../../utils/Helpers'
import { useState } from 'react'

const STATUS_TABS = ['all', 'pending', 'sent', 'failed']
const TYPE_TABS = ['all', 'invoice', 'payment', 'alert', 'system']

// ── Type badge ────────────────────────────────────────────────────────────────
const TYPE_ICON = {
  invoice: CreditCard,
  payment: CreditCard,
  alert: AlertTriangle,
  system: Settings,
}
const TYPE_COLOR = {
  invoice: 'bg-blue-50   dark:bg-blue-900/20   text-blue-600   dark:text-blue-400   ring-blue-200   dark:ring-blue-800',
  payment: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-800',
  alert: 'bg-amber-50  dark:bg-amber-900/20  text-amber-600  dark:text-amber-400  ring-amber-200  dark:ring-amber-800',
  system: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 ring-violet-200 dark:ring-violet-800',
}
function TypeBadge({ type }) {
  const Icon = TYPE_ICON[type] ?? Mail
  const color = TYPE_COLOR[type] ?? 'bg-gray-100 dark:bg-gray-800 text-gray-500 ring-gray-200 dark:ring-gray-700'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${color}`}>
      <Icon className="h-2.5 w-2.5" />
      {type}
    </span>
  )
}

// ── Status pill ───────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const map = {
    pending: 'bg-amber-50  dark:bg-amber-900/20  text-amber-600  dark:text-amber-400  ring-amber-200  dark:ring-amber-800',
    sent: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-800',
    failed: 'bg-red-50    dark:bg-red-900/20    text-red-600    dark:text-red-400    ring-red-200    dark:ring-red-800',
  }
  const dot = {
    pending: 'bg-amber-400 animate-pulse',
    sent: 'bg-emerald-500',
    failed: 'bg-red-500',
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${map[status] ?? 'bg-gray-100 dark:bg-gray-800 text-gray-400 ring-gray-200'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status] ?? 'bg-gray-400'}`} />
      {status}
    </span>
  )
}

// ── Action button ─────────────────────────────────────────────────────────────
function ActionButton({ onClick, variant = 'default', loading = false, children }) {
  const styles = {
    default: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100',
    warning: 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30',
    success: 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
    danger: 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30',
  }
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors duration-100 disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]}`}
    >
      {loading ? (
        <span className="flex items-center gap-1">
          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          {children}
        </span>
      ) : children}
    </button>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-800">
      {[28, 14, 40, 14, 12, 12].map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-3.5 rounded bg-gray-100 dark:bg-gray-800 animate-pulse"
            style={{ width: `${w}%`, animationDelay: `${i * 60}ms` }} />
        </td>
      ))}
      <td className="px-4 py-3.5">
        <div className="h-3.5 w-16 rounded bg-gray-100 dark:bg-gray-800 animate-pulse ml-auto" />
      </td>
    </tr>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const toast = useToast()
  const { data, meta, loading, params, updateParams, refetch } =
    useFetch(notificationsApi.getAll, {})

  const [confirm, setConfirm] = useState(null)   // { notif, nextStatus }
  const [actionLoading, setActionLoading] = useState(null)

  const currentStatus = params.status || 'all'
  const currentType = params.type || 'all'

  const requestChange = (notif, nextStatus) => {
    if (notif.status === nextStatus) return
    setConfirm({ notif, nextStatus })
  }

  const handleStatusChange = async () => {
    const { notif, nextStatus } = confirm
    setActionLoading(notif.id)
    try {
      await notificationsApi.updateStatus(notif.id, nextStatus)
      toast('Status updated', 'success')
      refetch()
    } catch (err) {
      toast(getErrorMessage(err), 'error')
    } finally {
      setActionLoading(null)
      setConfirm(null)
    }
  }

  // Which actions to show per current status
  const getActions = (n) => {
    const isProcessing = actionLoading === n.id
    if (n.status === 'pending') return (
      <>
        <ActionButton variant="success" loading={isProcessing} onClick={() => requestChange(n, 'sent')}>
          Mark sent
        </ActionButton>
        <ActionButton variant="danger" loading={isProcessing} onClick={() => requestChange(n, 'failed')}>
          Mark failed
        </ActionButton>
      </>
    )
    if (n.status === 'failed') return (
      <ActionButton variant="warning" loading={isProcessing} onClick={() => requestChange(n, 'pending')}>
        <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3" />Retry</span>
      </ActionButton>
    )
    return null // sent — immutable
  }

  return (
    <>
      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-slide { animation: fadeSlide 0.3s ease-out both; }
      `}</style>

      <div className="space-y-5 fade-slide">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-0.5">
              NetCore ISP
            </p>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-900">Notifications</h1>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
              System and billing alerts
            </p>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={params.search || ''}
              onChange={(e) => updateParams({ search: e.target.value })}
              placeholder="Search message, type…"
              className="w-full h-9 pl-8 pr-3 rounded-lg text-[13px]
                         bg-white dark:bg-gray-900
                         border border-gray-200 dark:border-gray-800
                         text-gray-900 dark:text-gray-100
                         placeholder-gray-400 dark:placeholder-gray-600
                         focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
                         transition-shadow duration-150"
            />
          </div>

          {/* Status tabs */}
          <div className="flex items-center gap-0.5 rounded-lg p-0.5 bg-gray-100 dark:bg-gray-800">
            {STATUS_TABS.map((s) => (
              <button
                key={s}
                onClick={() => updateParams({ status: s === 'all' ? undefined : s })}
                className={`px-3 py-1.5 rounded-md text-[12px] font-medium capitalize transition-all duration-150 ${currentStatus === s
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Type tabs */}
          <div className="flex items-center gap-0.5 rounded-lg p-0.5 bg-gray-100 dark:bg-gray-800">
            {TYPE_TABS.map((t) => (
              <button
                key={t}
                onClick={() => updateParams({ type: t === 'all' ? undefined : t })}
                className={`px-3 py-1.5 rounded-md text-[12px] font-medium capitalize transition-all duration-150 ${currentType === t
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                {t}
              </button>
            ))}
          </div>

          {meta?.total != null && !loading && (
            <span className="ml-auto text-[12px] text-gray-400 dark:text-gray-600 font-medium tabular-nums">
              {meta.total.toLocaleString()} {meta.total === 1 ? 'notification' : 'notifications'}
            </span>
          )}
        </div>

        {/* ── Table ── */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40">
                  {['Customer', 'Type', 'Message', 'Status', 'Sent at', 'Created', ''].map((h, i) => (
                    <th
                      key={i}
                      className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-600 whitespace-nowrap ${i === 6 ? 'text-right' : 'text-left'
                        }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <Bell className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No notifications</p>
                        <p className="text-xs text-gray-400 dark:text-gray-600">Notifications are generated automatically by the system.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((n) => (
                    <tr
                      key={n.id}
                      className="border-b border-gray-50 dark:border-gray-800/60 last:border-0
                                 hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors duration-100 group"
                    >
                      {/* Customer */}
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 leading-tight">{n.users?.full_name}</p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-600 font-mono mt-0.5">{n.users?.phone}</p>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3.5">
                        <TypeBadge type={n.type} />
                      </td>

                      {/* Message */}
                      <td className="px-4 py-3.5 max-w-[260px]">
                        <p className="text-[12px] text-gray-600 dark:text-gray-400 truncate">{n.message}</p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <StatusPill status={n.status} />
                      </td>

                      {/* Sent at */}
                      <td className="px-4 py-3.5 text-gray-400 dark:text-gray-600 text-[12px] tabular-nums whitespace-nowrap">
                        {n.sent_at ? formatDate(n.sent_at) : <span className="text-gray-300 dark:text-gray-700">—</span>}
                      </td>

                      {/* Created */}
                      <td className="px-4 py-3.5 text-gray-400 dark:text-gray-600 text-[12px] tabular-nums whitespace-nowrap">
                        {formatDate(n.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          {getActions(n)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && data.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
              <Pagination meta={meta} onPageChange={(p) => updateParams({ page: p })} />
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleStatusChange}
        title={confirm?.nextStatus === 'sent' ? 'Mark as sent' : confirm?.nextStatus === 'failed' ? 'Mark as failed' : 'Retry notification'}
        message={
          confirm?.nextStatus === 'sent' ? `Mark this notification to ${confirm?.notif?.users?.full_name} as sent?` :
            confirm?.nextStatus === 'failed' ? `Mark this notification as failed? It won't be retried automatically.` :
              `Reset this notification to pending so it can be retried?`
        }
        confirmLabel={confirm?.nextStatus === 'sent' ? 'Mark sent' : confirm?.nextStatus === 'failed' ? 'Mark failed' : 'Retry'}
        danger={confirm?.nextStatus === 'failed'}
      />
    </>
  )
}