import { useState } from 'react'
import { Plus, DollarSign, Search, Banknote, CreditCard, Smartphone, Landmark } from 'lucide-react'
import { paymentsApi } from '../../api/services'
import { useFetch } from '../../hooks/useFetch'
import { Pagination } from '../../components/ui/Pagination'
import { Modal } from '../../components/ui/Modal'
import { formatDate, formatCurrency } from '../../utils/helpers'
import PaymentForm from './PaymentForm'

// ── Method badge ──────────────────────────────────────────────────────────────
const METHOD_ICON = {
  cash: Banknote,
  card: CreditCard,
  online: Smartphone,
  bank: Landmark,
}
function MethodBadge({ method }) {
  const Icon = METHOD_ICON[method?.toLowerCase()] ?? DollarSign
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize
                     bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
      <Icon className="h-3 w-3" />
      {method}
    </span>
  )
}

// ── Invoice status pill ───────────────────────────────────────────────────────
function StatusPill({ status }) {
  const map = {
    unpaid: 'bg-red-50    dark:bg-red-900/20    text-red-600    dark:text-red-400    ring-red-200    dark:ring-red-800',
    partial: 'bg-amber-50  dark:bg-amber-900/20  text-amber-600  dark:text-amber-400  ring-amber-200  dark:ring-amber-800',
    paid: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-800',
    cancelled: 'bg-gray-100  dark:bg-gray-800      text-gray-400   dark:text-gray-500   ring-gray-200   dark:ring-gray-700',
  }
  const dot = {
    unpaid: 'bg-red-500 animate-pulse', partial: 'bg-amber-400 animate-pulse',
    paid: 'bg-emerald-500', cancelled: 'bg-gray-400',
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${map[status] ?? map.cancelled}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status] ?? dot.cancelled}`} />
      {status}
    </span>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-800">
      {[16, 36, 18, 16, 18, 16, 14].map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-3.5 rounded bg-gray-100 dark:bg-gray-800 animate-pulse"
            style={{ width: `${w}%`, animationDelay: `${i * 60}ms` }} />
        </td>
      ))}
    </tr>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PaymentsPage() {
  const { data, meta, loading, params, updateParams, refetch } =
    useFetch(paymentsApi.getAll, {})

  const [createOpen, setCreateOpen] = useState(false)

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
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-900">Payments</h1>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
              Payment records against invoices
            </p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700
                       active:scale-95 text-white text-[13px] font-semibold px-4 py-2.5
                       shadow-sm shadow-blue-500/20 transition-all duration-150 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Record payment
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
              placeholder="Invoice #, payment method…"
              className="w-full h-9 pl-8 pr-3 rounded-lg text-[13px]
                         bg-white dark:bg-gray-900
                         border border-gray-200 dark:border-gray-800
                         text-gray-900 dark:text-gray-100
                         placeholder-gray-400 dark:placeholder-gray-600
                         focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
                         transition-shadow duration-150"
            />
          </div>

          {meta?.total != null && !loading && (
            <span className="ml-auto text-[12px] text-gray-400 dark:text-gray-600 font-medium tabular-nums">
              {meta.total.toLocaleString()} {meta.total === 1 ? 'payment' : 'payments'}
            </span>
          )}
        </div>

        {/* ── Table ── */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40">
                  {['Invoice', 'Customer', 'Amount paid', 'Method', 'Invoice status', 'Remaining', 'Paid at'].map((h, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-600 whitespace-nowrap text-left"
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
                          <DollarSign className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No payments yet</p>
                        <p className="text-xs text-gray-400 dark:text-gray-600">Record a payment against an invoice to get started.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-gray-50 dark:border-gray-800/60 last:border-0
                                 hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors duration-100"
                    >
                      {/* Invoice # */}
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-[12px] font-semibold text-gray-700 dark:text-gray-300">
                          {p.invoices?.invoice_number}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                          {p.invoices?.users?.full_name}
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-600 font-mono mt-0.5">
                          {p.invoices?.users?.phone}
                        </p>
                      </td>

                      {/* Amount paid */}
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {formatCurrency(p.amount_paid)}
                        </span>
                      </td>

                      {/* Method */}
                      <td className="px-4 py-3.5">
                        <MethodBadge method={p.payment_method} />
                      </td>

                      {/* Invoice status */}
                      <td className="px-4 py-3.5">
                        <StatusPill status={p.invoices?.status} />
                      </td>

                      {/* Remaining */}
                      <td className="px-4 py-3.5">
                        {p.invoices?.remaining_balance > 0 ? (
                          <span className="font-semibold text-red-600 dark:text-red-400 tabular-nums">
                            {formatCurrency(p.invoices.remaining_balance)}
                          </span>
                        ) : (
                          <span className="text-gray-300 dark:text-gray-700 tabular-nums">—</span>
                        )}
                      </td>

                      {/* Paid at */}
                      <td className="px-4 py-3.5 text-gray-400 dark:text-gray-600 text-[12px] tabular-nums whitespace-nowrap">
                        {formatDate(p.paid_at)}
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
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Record payment"
        description="Apply a payment against an outstanding invoice."
      >
        <PaymentForm onSuccess={() => { setCreateOpen(false); refetch() }} />
      </Modal>
    </>
  )
}