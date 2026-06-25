import { useState } from 'react'
import { Plus, Users, Search } from 'lucide-react'
import { usersApi } from '../../api/services'
import { useFetch } from '../../hooks/useFetch'
import { useToast } from '../../components/ui/Toast'
import { Pagination } from '../../components/ui/Pagination'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { formatDate, getErrorMessage } from '../../utils/helpers'
import CustomerForm from './CustomerForm'

// ── Avatar initials ───────────────────────────────────────────────────────────
function Avatar({ name }) {
  const initials = name?.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?'
  const hue = [...(name || '')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360
  return (
    <span
      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-[11px] font-bold text-white shrink-0 select-none"
      style={{ background: `hsl(${hue} 55% 48%)` }}
    >
      {initials}
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

// ── Row skeleton ──────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-800">
      {[40, 28, 48, 20, 16, 14].map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-3.5 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" style={{ width: `${w}%`, animationDelay: `${i * 60}ms` }} />
        </td>
      ))}
      <td className="px-4 py-3.5">
        <div className="h-3.5 w-24 rounded bg-gray-100 dark:bg-gray-800 animate-pulse ml-auto" />
      </td>
    </tr>
  )
}

// ── Action button ─────────────────────────────────────────────────────────────
function ActionButton({ onClick, variant = 'default', loading = false, children }) {
  const styles = {
    default: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100',
    danger: 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300',
    activate: 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-300',
  }
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`
        relative px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors duration-100
        disabled:opacity-50 disabled:cursor-not-allowed
        ${styles[variant]}
      `}
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

// ── Page ─────────────────────────────────────────────────────────────────────
export default function CustomersPage() {
  const toast = useToast()
  const { data, meta, loading, params, updateParams, refetch } =
    useFetch(usersApi.getAll, { status: 'active' })

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deactivating, setDeactivating] = useState(null)
  const [activating, setActivating] = useState(null)
  const [actionLoading, setActionLoading] = useState(null) // customer id currently processing

  // ── Deactivate ──────────────────────────────────────────────────────────────
  const handleDeactivate = async () => {
    setActionLoading(deactivating.id)
    try {
      await usersApi.deactivate(deactivating.id)
      toast('Customer deactivated', 'success')
      refetch()
    } catch (err) {
      toast(getErrorMessage(err), 'error')
    } finally {
      setActionLoading(null)
      setDeactivating(null)
    }
  }

  // ── Activate ────────────────────────────────────────────────────────────────
  const handleActivate = async () => {
    setActionLoading(activating.id)
    try {
      await usersApi.activate(activating.id)   // e.g. PATCH /users/:id/activate
      toast(`${activating.full_name} reactivated`, 'success')
      refetch()
    } catch (err) {
      toast(getErrorMessage(err), 'error')
    } finally {
      setActionLoading(null)
      setActivating(null)
    }
  }

  const openEdit = (c) => { setEditing(c); setModalOpen(true) }
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
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-900">Customers</h1>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
              Manage your ISP subscribers
            </p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700
                       active:scale-95 text-white text-[13px] font-semibold px-4 py-2.5
                       shadow-sm shadow-blue-500/20 transition-all duration-150 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add customer
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
              placeholder="Search name, phone, email…"
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
              {meta.total.toLocaleString()} {meta.total === 1 ? 'customer' : 'customers'}
            </span>
          )}
        </div>

        {/* ── Table ── */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40">
                  {['Customer', 'Phone', 'Email', 'City', 'Status', 'Joined', ''].map((h, i) => (
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
                          <Users className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No customers found</p>
                        <p className="text-xs text-gray-400 dark:text-gray-600">Add your first customer to get started.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((c, i) => {
                    const isProcessing = actionLoading === c.id
                    return (
                      <tr
                        key={c.id}
                        className="border-b border-gray-50 dark:border-gray-800/60 last:border-0
                                   hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors duration-100 group"
                      >
                        {/* Customer */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={c.full_name} />
                            <span className="font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[160px]">
                              {c.full_name}
                            </span>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-[12px] text-gray-600 dark:text-gray-400">{c.phone}</span>
                        </td>

                        {/* Email */}
                        <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 max-w-[180px] truncate">
                          {c.email || <span className="text-gray-300 dark:text-gray-700">—</span>}
                        </td>

                        {/* City */}
                        <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400">
                          {c.city || <span className="text-gray-300 dark:text-gray-700">—</span>}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <StatusPill active={c.is_active} />
                        </td>

                        {/* Joined */}
                        <td className="px-4 py-3.5 text-gray-400 dark:text-gray-600 text-[12px] tabular-nums whitespace-nowrap">
                          {formatDate(c.created_at)}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                            <ActionButton
                              variant="default"
                              onClick={() => openEdit(c)}
                              loading={false}
                            >
                              Edit
                            </ActionButton>

                            {c.is_active ? (
                              <ActionButton
                                variant="danger"
                                onClick={() => setDeactivating(c)}
                                loading={isProcessing}
                              >
                                Deactivate
                              </ActionButton>
                            ) : (
                              <ActionButton
                                variant="activate"
                                onClick={() => setActivating(c)}
                                loading={isProcessing}
                              >
                                Activate
                              </ActionButton>
                            )}
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

      {/* Create / Edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit customer' : 'Add customer'}
        description={editing ? 'Update subscriber details below.' : 'Fill in the details to add a new subscriber.'}
      >
        <CustomerForm
          initial={editing}
          onSuccess={() => { setModalOpen(false); refetch() }}
        />
      </Modal>

      {/* Deactivate confirm */}
      <ConfirmDialog
        open={!!deactivating}
        onClose={() => setDeactivating(null)}
        onConfirm={handleDeactivate}
        title="Deactivate customer"
        message={`Deactivate ${deactivating?.full_name}? Their active subscriptions will remain but no new ones can be created.`}
        confirmLabel="Deactivate"
        danger
      />

      {/* Activate confirm */}
      <ConfirmDialog
        open={!!activating}
        onClose={() => setActivating(null)}
        onConfirm={handleActivate}
        title="Reactivate customer"
        message={`Reactivate ${activating?.full_name}? They'll be able to have new subscriptions created immediately.`}
        confirmLabel="Activate"
      />
    </>
  )
}