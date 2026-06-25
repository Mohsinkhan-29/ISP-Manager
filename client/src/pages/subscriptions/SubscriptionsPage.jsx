import { useState } from 'react'
import { Plus, CreditCard, Search, Zap, RefreshCw } from 'lucide-react'
import { subscriptionsApi } from '../../api/services'
import { useFetch } from '../../hooks/useFetch'
import { useToast } from '../../components/ui/Toast'
import { Pagination } from '../../components/ui/Pagination'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { formatDate, formatCurrency, getErrorMessage } from '../../utils/helpers'
import SubscriptionForm from './SubscriptionForm'

const STATUS_OPTIONS = ['active', 'suspended', 'terminated']

// ── Status pill ───────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const map = {
    active: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-800',
    suspended: 'bg-amber-50  dark:bg-amber-900/20  text-amber-600  dark:text-amber-400  ring-amber-200  dark:ring-amber-800',
    terminated: 'bg-gray-100  dark:bg-gray-800      text-gray-500   dark:text-gray-400   ring-gray-200   dark:ring-gray-700',
  }
  const dot = {
    active: 'bg-emerald-500 animate-pulse',
    suspended: 'bg-amber-400',
    terminated: 'bg-gray-400',
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${map[status] ?? map.terminated}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status] ?? dot.terminated}`} />
      {status}
    </span>
  )
}

// ── Speed badge ───────────────────────────────────────────────────────────────
function SpeedBadge({ mbps }) {
  const color =
    mbps >= 100 ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 ring-violet-200 dark:ring-violet-800'
      : mbps >= 25 ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-blue-200 dark:ring-blue-800'
        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 ring-gray-200 dark:ring-gray-700'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold font-mono ring-1 ${color}`}>
      <Zap className="h-2.5 w-2.5" />
      {mbps} Mbps
    </span>
  )
}

// ── Billing cycle badge ───────────────────────────────────────────────────────
function BillingBadge({ cycle }) {
  return (
    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
      {cycle}
    </span>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-800">
      {[36, 24, 20, 16, 14, 14, 18].map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-3.5 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" style={{ width: `${w}%`, animationDelay: `${i * 60}ms` }} />
        </td>
      ))}
      <td className="px-4 py-3.5">
        <div className="h-3.5 w-20 rounded bg-gray-100 dark:bg-gray-800 animate-pulse ml-auto" />
      </td>
    </tr>
  )
}

// ── Action button ─────────────────────────────────────────────────────────────
function ActionButton({ onClick, variant = 'default', loading = false, children }) {
  const styles = {
    default: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100',
    warning: 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-700 dark:hover:text-amber-300',
    danger: 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300',
    activate: 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SubscriptionsPage() {
  const toast = useToast()
  const { data, meta, loading, params, updateParams, refetch } =
    useFetch(subscriptionsApi.getAll, { status: 'active' })

  const [modalOpen, setModalOpen] = useState(false)
  const [confirm, setConfirm] = useState(null)   // { sub, nextStatus }
  const [actionLoading, setActionLoading] = useState(null)

  const currentStatus = params.status || 'active'

  const requestStatusChange = (sub, nextStatus) => {
    if (sub.status === nextStatus) return
    setConfirm({ sub, nextStatus })
  }

  const handleStatusChange = async () => {
    const { sub, nextStatus } = confirm
    setActionLoading(sub.id)
    try {
      await subscriptionsApi.updateStatus(sub.id, nextStatus)
      toast(`Subscription ${nextStatus}`, 'success')
      refetch()
    } catch (err) {
      toast(getErrorMessage(err), 'error')
    } finally {
      setActionLoading(null)
      setConfirm(null)
    }
  }

  // Which action buttons to show per current status
  const getActions = (s) => {
    const isProcessing = actionLoading === s.id
    if (s.status === 'active') return (
      <>
        <ActionButton variant="warning" loading={isProcessing} onClick={() => requestStatusChange(s, 'suspended')}>Suspend</ActionButton>
        <ActionButton variant="danger" loading={isProcessing} onClick={() => requestStatusChange(s, 'terminated')}>Terminate</ActionButton>
      </>
    )
    if (s.status === 'suspended') return (
      <>
        <ActionButton variant="activate" loading={isProcessing} onClick={() => requestStatusChange(s, 'active')}>Reactivate</ActionButton>
        <ActionButton variant="danger" loading={isProcessing} onClick={() => requestStatusChange(s, 'terminated')}>Terminate</ActionButton>
      </>
    )
    // terminated — no further actions
    return null
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
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-900">Subscriptions</h1>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
              Customer plan assignments
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700
                       active:scale-95 text-white text-[13px] font-semibold px-4 py-2.5
                       shadow-sm shadow-blue-500/20 transition-all duration-150 shrink-0"
          >
            <Plus className="h-4 w-4" />
            New subscription
          </button>
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={params.search || ''}
              onChange={(e) => updateParams({ search: e.target.value })}
              placeholder="Search customer name, phone…"
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
            {['active', 'suspended', 'terminated', 'all'].map((s) => (
              <button
                key={s}
                onClick={() => updateParams({ status: s === 'all' ? undefined : s })}
                className={`px-3 py-1.5 rounded-md text-[12px] font-medium capitalize transition-all duration-150 ${(s === 'all' ? !params.status : currentStatus === s)
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                {s}
              </button>
            ))}
          </div>

          {meta?.total != null && !loading && (
            <span className="ml-auto text-[12px] text-gray-400 dark:text-gray-600 font-medium tabular-nums">
              {meta.total.toLocaleString()} {meta.total === 1 ? 'subscription' : 'subscriptions'}
            </span>
          )}
        </div>

        {/* ── Table ── */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40">
                  {['Customer', 'Plan', 'Speed', 'Price', 'Billing', 'Start date', 'Status', ''].map((h, i) => (
                    <th
                      key={i}
                      className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-600 whitespace-nowrap ${i === 7 ? 'text-right' : 'text-left'
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
                    <td colSpan={8} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No subscriptions found</p>
                        <p className="text-xs text-gray-400 dark:text-gray-600">Assign a plan to a customer to get started.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((s) => {
                    const speed = s.custom_speed_mbps ?? s.plans?.speed_mbps
                    const price = s.custom_price ?? s.plans?.price
                    return (
                      <tr
                        key={s.id}
                        className="border-b border-gray-50 dark:border-gray-800/60 last:border-0
                                   hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors duration-100 group"
                      >
                        {/* Customer */}
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 leading-tight">{s.users?.full_name}</p>
                          <p className="text-[11px] text-gray-400 dark:text-gray-600 font-mono mt-0.5">{s.users?.phone}</p>
                        </td>

                        {/* Plan */}
                        <td className="px-4 py-3.5 text-gray-700 dark:text-gray-300 font-medium">
                          {s.plans?.name}
                        </td>

                        {/* Speed */}
                        <td className="px-4 py-3.5">
                          <SpeedBadge mbps={speed} />
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                            {formatCurrency(price)}
                          </span>
                          {s.custom_price && (
                            <span className="ml-1 text-[10px] text-amber-500 font-semibold uppercase tracking-wide">custom</span>
                          )}
                        </td>

                        {/* Billing */}
                        <td className="px-4 py-3.5">
                          <BillingBadge cycle={s.billing_cycle} />
                        </td>

                        {/* Start date */}
                        <td className="px-4 py-3.5 text-gray-400 dark:text-gray-600 text-[12px] tabular-nums whitespace-nowrap">
                          {formatDate(s.start_date)}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <StatusPill status={s.status} />
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                            {getActions(s)}
                          </div>
                        </td>
                      </tr>
                    )
                  })
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New subscription"
        description="Assign an internet plan to a customer."
      >
        <SubscriptionForm onSuccess={() => { setModalOpen(false); refetch() }} />
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleStatusChange}
        title={`${confirm?.nextStatus?.charAt(0).toUpperCase()}${confirm?.nextStatus?.slice(1)} subscription`}
        message={
          confirm?.nextStatus === 'terminated'
            ? `Terminate ${confirm?.sub?.users?.full_name}'s subscription? This cannot be undone.`
            : confirm?.nextStatus === 'suspended'
              ? `Suspend ${confirm?.sub?.users?.full_name}'s subscription? They'll lose access until reactivated.`
              : `Reactivate ${confirm?.sub?.users?.full_name}'s subscription? They'll regain access immediately.`
        }
        confirmLabel={confirm?.nextStatus?.charAt(0).toUpperCase() + confirm?.nextStatus?.slice(1)}
        danger={confirm?.nextStatus === 'terminated'}
      />
    </>
  )
}