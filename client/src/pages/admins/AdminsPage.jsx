import { useState } from 'react'
import { Plus, ShieldCheck, Search, Shield, ShieldAlert, User } from 'lucide-react'
import { adminsApi } from '../../api/services'
import { useFetch } from '../../hooks/useFetch'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../context/AuthContext'
import { Pagination } from '../../components/ui/Pagination'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { formatDate, getErrorMessage } from '../../utils/Helpers'
import AdminForm from './AdminForm'

const ROLE_TABS = ['all', 'OWNER', 'ADMIN', 'STAFF']

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

// ── Role badge ────────────────────────────────────────────────────────────────
const ROLE_CONFIG = {
  OWNER: { icon: ShieldAlert, color: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 ring-violet-200 dark:ring-violet-800' },
  ADMIN: { icon: Shield, color: 'bg-blue-50   dark:bg-blue-900/20   text-blue-600   dark:text-blue-400   ring-blue-200   dark:ring-blue-800' },
  STAFF: { icon: User, color: 'bg-gray-100  dark:bg-gray-800      text-gray-500   dark:text-gray-400   ring-gray-200   dark:ring-gray-700' },
}
function RoleBadge({ role }) {
  const { icon: Icon, color } = ROLE_CONFIG[role] ?? ROLE_CONFIG.STAFF
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${color}`}>
      <Icon className="h-2.5 w-2.5" />
      {role}
    </span>
  )
}

// ── Role selector (owner-only, for other admins) ──────────────────────────────
function RoleSelector({ value, onChange }) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg p-0.5 bg-gray-100 dark:bg-gray-800">
      {['OWNER', 'ADMIN', 'STAFF'].map((r) => {
        const { icon: Icon } = ROLE_CONFIG[r]
        return (
          <button
            key={r}
            onClick={() => onChange(r)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all duration-150 ${value === r
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
          >
            <Icon className="h-3 w-3" />
            {r}
          </button>
        )
      })}
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-800">
      {[36, 40, 20, 14].map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-3.5 rounded bg-gray-100 dark:bg-gray-800 animate-pulse"
            style={{ width: `${w}%`, animationDelay: `${i * 60}ms` }} />
        </td>
      ))}
      <td className="px-4 py-3.5">
        <div className="h-3.5 w-14 rounded bg-gray-100 dark:bg-gray-800 animate-pulse ml-auto" />
      </td>
    </tr>
  )
}

// ── Action button ─────────────────────────────────────────────────────────────
function ActionButton({ onClick, variant = 'default', children }) {
  const styles = {
    default: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100',
    danger: 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300',
  }
  return (
    <button onClick={onClick} className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors duration-100 ${styles[variant]}`}>
      {children}
    </button>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminsPage() {
  const { user } = useAuth()
  const toast = useToast()
  const { data, meta, loading, params, updateParams, refetch } =
    useFetch(adminsApi.getAll, {})

  const [createOpen, setCreateOpen] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [roleConfirm, setRoleConfirm] = useState(null)  // { admin, nextRole }

  const currentRole = params.role || 'all'
  const isOwner = user?.role === 'OWNER'

  const handleDelete = async () => {
    try {
      await adminsApi.delete(deleting.id)
      toast('Admin removed', 'success')
      refetch()
    } catch (err) {
      toast(getErrorMessage(err), 'error')
    } finally {
      setDeleting(null)
    }
  }

  const handleRoleChange = async () => {
    const { admin, nextRole } = roleConfirm
    try {
      await adminsApi.updateRole(admin.id, nextRole)
      toast('Role updated', 'success')
      refetch()
    } catch (err) {
      toast(getErrorMessage(err), 'error')
    } finally {
      setRoleConfirm(null)
    }
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
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-900">Admins</h1>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
              Manage staff access to the system
            </p>
          </div>
          {isOwner && (
            <button
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700
                         active:scale-95 text-white text-[13px] font-semibold px-4 py-2.5
                         shadow-sm shadow-blue-500/20 transition-all duration-150 shrink-0"
            >
              <Plus className="h-4 w-4" />
              Add admin
            </button>
          )}
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={params.search || ''}
              onChange={(e) => updateParams({ search: e.target.value })}
              placeholder="Search name, email…"
              className="w-full h-9 pl-8 pr-3 rounded-lg text-[13px]
                         bg-white dark:bg-gray-900
                         border border-gray-200 dark:border-gray-800
                         text-gray-900 dark:text-gray-100
                         placeholder-gray-400 dark:placeholder-gray-600
                         focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
                         transition-shadow duration-150"
            />
          </div>

          {/* Role tabs */}
          <div className="flex items-center gap-0.5 rounded-lg p-0.5 bg-gray-100 dark:bg-gray-800">
            {ROLE_TABS.map((r) => (
              <button
                key={r}
                onClick={() => updateParams({ role: r === 'all' ? undefined : r })}
                className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all duration-150 ${currentRole === r
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                {r === 'all' ? 'All' : r}
              </button>
            ))}
          </div>

          {meta?.total != null && !loading && (
            <span className="ml-auto text-[12px] text-gray-400 dark:text-gray-600 font-medium tabular-nums">
              {meta.total.toLocaleString()} {meta.total === 1 ? 'admin' : 'admins'}
            </span>
          )}
        </div>

        {/* ── Table ── */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40">
                  {['Admin', 'Email', 'Role', 'Joined', ''].map((h, i) => (
                    <th
                      key={i}
                      className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-600 whitespace-nowrap ${i === 4 ? 'text-right' : 'text-left'
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
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <ShieldCheck className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No admins found</p>
                        <p className="text-xs text-gray-400 dark:text-gray-600">Add a staff member to grant system access.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((a) => {
                    const isSelf = a.id === user?.id
                    const canModify = isOwner && !isSelf
                    return (
                      <tr
                        key={a.id}
                        className="border-b border-gray-50 dark:border-gray-800/60 last:border-0
                                   hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors duration-100 group"
                      >
                        {/* Admin */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={a.name} />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-gray-900 dark:text-gray-100">{a.name}</span>
                                {isSelf && (
                                  <span className="text-[10px] font-semibold uppercase tracking-wide text-blue-500 dark:text-blue-400">
                                    you
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400">
                          {a.email}
                        </td>

                        {/* Role */}
                        <td className="px-4 py-3.5">
                          {canModify ? (
                            <RoleSelector
                              value={a.role}
                              onChange={(nextRole) => {
                                if (nextRole !== a.role) setRoleConfirm({ admin: a, nextRole })
                              }}
                            />
                          ) : (
                            <RoleBadge role={a.role} />
                          )}
                        </td>

                        {/* Joined */}
                        <td className="px-4 py-3.5 text-gray-400 dark:text-gray-600 text-[12px] tabular-nums whitespace-nowrap">
                          {formatDate(a.created_at)}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                            {canModify && (
                              <ActionButton variant="danger" onClick={() => setDeleting(a)}>
                                Remove
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

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add admin"
        description="Grant a staff member access to the system."
      >
        <AdminForm onSuccess={() => { setCreateOpen(false); refetch() }} />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Remove admin"
        message={`Remove ${deleting?.name}? They'll lose all system access immediately.`}
        confirmLabel="Remove"
        danger
      />

      <ConfirmDialog
        open={!!roleConfirm}
        onClose={() => setRoleConfirm(null)}
        onConfirm={handleRoleChange}
        title="Change role"
        message={`Change ${roleConfirm?.admin?.name}'s role from ${roleConfirm?.admin?.role} to ${roleConfirm?.nextRole}?`}
        confirmLabel="Change role"
      />
    </>
  )
}