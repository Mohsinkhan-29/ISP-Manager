import { useState } from 'react'
import { Plus, Wifi, Search, Zap } from 'lucide-react'
import { plansApi } from '../../api/services'
import { useFetch } from '../../hooks/useFetch'
import { useToast } from '../../components/ui/Toast'
import { Pagination } from '../../components/ui/Pagination'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { formatDate, formatCurrency, getErrorMessage } from '../../utils/helpers'
import PlanForm from './PlanForm'

// ── Speed badge ───────────────────────────────────────────────────────────────
function SpeedBadge({ mbps }) {
  const tier =
    mbps >= 100 ? { label: `${mbps} Mbps`, color: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 ring-violet-200 dark:ring-violet-800' }
      : mbps >= 25 ? { label: `${mbps} Mbps`, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-blue-200 dark:ring-blue-800' }
        : { label: `${mbps} Mbps`, color: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 ring-gray-200 dark:ring-gray-700' }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold font-mono ring-1 ${tier.color}`}>
      <Zap className="h-2.5 w-2.5" />
      {tier.label}
    </span>
  )
}

// ── Status pill ───────────────────────────────────────────────────────────────
function StatusPill({ active }) {
  return active ? (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 ring-1 ring-gray-200 dark:ring-gray-700">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
      Inactive
    </span>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-800">
      {[38, 22, 18, 16, 14].map((w, i) => (
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
function ActionButton({ onClick, variant = 'default', children }) {
  const styles = {
    default: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100',
    danger: 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300',
    activate: 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-300',
  }
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors duration-100 ${styles[variant]}`}
    >
      {children}
    </button>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PlansPage() {
  const toast = useToast()
  const { data, meta, loading, params, updateParams, refetch } =
    useFetch(plansApi.getAll, { status: 'active' })

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deactivating, setDeactivating] = useState(null)
  const [reactivating, setReactivating] = useState(null)

  const handleDeactivate = async () => {
    try {
      await plansApi.deactivate(deactivating.id)
      toast('Plan deactivated', 'success')
      refetch()
    } catch (err) {
      toast(getErrorMessage(err), 'error')
    } finally {
      setDeactivating(null)
    }
  }

  const handleReactivate = async () => {
    try {
      await plansApi.activate(reactivating.id)
      toast('Plan reactivated', 'success')
      refetch()
    } catch (err) {
      toast(getErrorMessage(err), 'error')
    } finally {
      setReactivating(null)
    }
  }

  const openEdit = (p) => { setEditing(p); setModalOpen(true) }
  const openCreate = () => { setEditing(null); setModalOpen(true) }
  const currentStatus = params.status || 'active'

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
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-900">Plans</h1>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
              Internet packages offered to customers
            </p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700
                       active:scale-95 text-white text-[13px] font-semibold px-4 py-2.5
                       shadow-sm shadow-blue-500/20 transition-all duration-150 shrink-0"
          >
            <Plus className="h-4 w-4" />
            New plan
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
              placeholder="Search plans…"
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
            {['active', 'inactive', 'all'].map((s) => (
              <button
                key={s}
                onClick={() => updateParams({ status: s })}
                className={`px-3 py-1.5 rounded-md text-[12px] font-medium capitalize transition-all duration-150 ${currentStatus === s
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
              {meta.total.toLocaleString()} {meta.total === 1 ? 'plan' : 'plans'}
            </span>
          )}
        </div>

        {/* ── Table ── */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40">
                  {['Plan', 'Speed', 'Price', 'Status', 'Created', ''].map((h, i) => (
                    <th
                      key={i}
                      className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-600 whitespace-nowrap ${i === 5 ? 'text-right' : 'text-left'
                        }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <Wifi className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No plans found</p>
                        <p className="text-xs text-gray-400 dark:text-gray-600">Create your first internet package to get started.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-gray-50 dark:border-gray-800/60 last:border-0
                                 hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors duration-100 group"
                    >
                      {/* Plan name */}
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{p.name}</span>
                      </td>

                      {/* Speed */}
                      <td className="px-4 py-3.5">
                        <SpeedBadge mbps={p.speed_mbps} />
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                          {formatCurrency(p.price)}
                        </span>
                        <span className="text-[11px] text-gray-400 dark:text-gray-600 ml-1">/mo</span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <StatusPill active={p.is_active} />
                      </td>

                      {/* Created */}
                      <td className="px-4 py-3.5 text-gray-400 dark:text-gray-600 text-[12px] tabular-nums whitespace-nowrap">
                        {formatDate(p.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <ActionButton onClick={() => openEdit(p)}>Edit</ActionButton>
                          {p.is_active ? (
                            <ActionButton variant="danger" onClick={() => setDeactivating(p)}>
                              Deactivate
                            </ActionButton>
                          ) : (
                            <ActionButton variant="activate" onClick={() => setReactivating(p)}>
                              Reactivate
                            </ActionButton>
                          )}
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit plan' : 'New plan'}
        description={editing ? 'Update plan details below.' : 'Fill in the details to create a new package.'}
      >
        <PlanForm initial={editing} onSuccess={() => { setModalOpen(false); refetch() }} />
      </Modal>

      <ConfirmDialog
        open={!!deactivating}
        onClose={() => setDeactivating(null)}
        onConfirm={handleDeactivate}
        title="Deactivate plan"
        message={`Deactivate "${deactivating?.name}"? New subscriptions won't be able to use this plan.`}
        confirmLabel="Deactivate"
        danger
      />

      <ConfirmDialog
        open={!!reactivating}
        onClose={() => setReactivating(null)}
        onConfirm={handleReactivate}
        title="Reactivate plan"
        message={`Reactivate "${reactivating?.name}"? Customers will be able to subscribe to this plan again.`}
        confirmLabel="Reactivate"
      />
    </>
  )
}