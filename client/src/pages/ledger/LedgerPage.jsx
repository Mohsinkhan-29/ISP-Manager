import { useState } from 'react'
import {
  BookOpen,
  Search,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  ChevronLeft,
  User,
} from 'lucide-react'
import { ledgerApi } from '../../api/services'
import { useFetch } from '../../hooks/useFetch'
import { Pagination } from '../../components/ui/Pagination'
import { formatDate, formatCurrency } from '../../utils/helpers'

const TYPE_TABS = ['all', 'credit', 'debit', 'invoice', 'payment', 'adjustment']

// ── TypeBadge ─────────────────────────────────────────────────────────────────
function TypeBadge({ type }) {
  const map = {
    credit: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-800',
    payment: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-800',
    debit: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 ring-red-200 dark:ring-red-800',
    invoice: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-blue-200 dark:ring-blue-800',
    adjustment: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 ring-violet-200 dark:ring-violet-800',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${map[type] ?? 'bg-gray-100 dark:bg-gray-800 text-gray-500 ring-gray-200 dark:ring-gray-700'}`}>
      {type}
    </span>
  )
}

// ── AmountCell ────────────────────────────────────────────────────────────────
function AmountCell({ type, amount }) {
  const isPositive = ['credit', 'payment'].includes(type)
  const isNeutral = type === 'adjustment'
  const Icon = isNeutral ? ArrowLeftRight : isPositive ? TrendingUp : TrendingDown
  const color = isNeutral
    ? 'text-violet-600 dark:text-violet-400'
    : isPositive
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-red-600 dark:text-red-400'
  return (
    <span className={`inline-flex items-center gap-1 font-semibold tabular-nums ${color}`}>
      <Icon className="h-3 w-3 shrink-0" />
      {isPositive ? '+' : isNeutral ? '±' : '−'}{formatCurrency(amount)}
    </span>
  )
}

// ── SkeletonRow ───────────────────────────────────────────────────────────────
function SkeletonRow({ cols = 5 }) {
  const widths = cols === 4 ? [14, 18, 24, 14] : [32, 14, 18, 24, 14]
  return (
    <tr className="border-b border-gray-100 dark:border-gray-800">
      {widths.map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <div
            className="h-3.5 rounded bg-gray-100 dark:bg-gray-800 animate-pulse"
            style={{ width: `${w}%`, animationDelay: `${i * 60}ms` }}
          />
        </td>
      ))}
    </tr>
  )
}

// ── CustomerLedger (drill-down view) ─────────────────────────────────────────
function CustomerLedger({ customer, onBack }) {
  const { data, meta, loading, params, updateParams } = useFetch(
    (p) => ledgerApi.getByCustomer(customer.id, p),
    {}
  )

  const currentType = params.type || 'all'

  return (
    <div className="space-y-5 fade-slide">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 dark:border-gray-800
                       text-gray-500 hover:text-gray-900 dark:hover:text-gray-100
                       hover:bg-gray-50 dark:hover:bg-gray-800
                       transition-colors duration-150"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-0.5">
              NetCore ISP · Ledger
            </p>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
              {customer.full_name}
            </h1>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 font-mono mt-0.5">
              {customer.phone}
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={params.search || ''}
            onChange={(e) => updateParams({ search: e.target.value })}
            placeholder="Search reference…"
            className="w-full h-9 pl-8 pr-3 rounded-lg text-[13px]
                       bg-white dark:bg-gray-900
                       border border-gray-200 dark:border-gray-800
                       text-gray-900 dark:text-gray-100
                       placeholder-gray-400 dark:placeholder-gray-600
                       focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
                       transition-shadow duration-150"
          />
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
            {meta.total.toLocaleString()} {meta.total === 1 ? 'entry' : 'entries'}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40">
                {['Type', 'Amount', 'Reference', 'Date'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-600 whitespace-nowrap text-left"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={4} />)
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No entries found</p>
                      <p className="text-xs text-gray-400 dark:text-gray-600">
                        Try adjusting your filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((e) => (
                  <tr
                    key={e.id}
                    className="border-b border-gray-50 dark:border-gray-800/60 last:border-0
                               hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors duration-100"
                  >
                    <td className="px-4 py-3.5"><TypeBadge type={e.type} /></td>
                    <td className="px-4 py-3.5"><AmountCell type={e.type} amount={e.amount} /></td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-[11px] text-gray-400 dark:text-gray-600 truncate max-w-[180px] block">
                        {e.reference_id ?? <span className="text-gray-300 dark:text-gray-700">—</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 dark:text-gray-600 text-[12px] tabular-nums whitespace-nowrap">
                      {formatDate(e.created_at)}
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
  )
}

// ── LedgerPage (main view) ────────────────────────────────────────────────────
export default function LedgerPage() {
  const [drillCustomer, setDrillCustomer] = useState(null)

  const { data, meta, loading, params, updateParams } =
    useFetch(ledgerApi.getAll, {})

  const currentType = params.type || 'all'

  if (drillCustomer) {
    return (
      <>
        <style>{`
          @keyframes fadeSlide {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .fade-slide { animation: fadeSlide 0.3s ease-out both; }
        `}</style>
        <CustomerLedger
          customer={drillCustomer}
          onBack={() => setDrillCustomer(null)}
        />
      </>
    )
  }

  return (
    <>
      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-slide { animation: fadeSlide 0.3s ease-out both; }
        .action-cell { opacity: 0; transition: opacity 150ms ease; }
        tr:hover .action-cell { opacity: 1; }
      `}</style>

      <div className="space-y-5 fade-slide">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-0.5">
              NetCore ISP
            </p>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Ledger</h1>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
              Complete financial transaction log
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={params.search || ''}
              onChange={(e) => updateParams({ search: e.target.value })}
              placeholder="Search customer, reference…"
              className="w-full h-9 pl-8 pr-3 rounded-lg text-[13px]
                         bg-white dark:bg-gray-900
                         border border-gray-200 dark:border-gray-800
                         text-gray-900 dark:text-gray-100
                         placeholder-gray-400 dark:placeholder-gray-600
                         focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
                         transition-shadow duration-150"
            />
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
              {meta.total.toLocaleString()} {meta.total === 1 ? 'entry' : 'entries'}
            </span>
          )}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40">
                  {['Customer', 'Type', 'Amount', 'Reference', 'Date', ''].map((h, i) => (
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
                  Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No entries yet</p>
                        <p className="text-xs text-gray-400 dark:text-gray-600">
                          Entries are created automatically with payments and invoices.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((e) => (
                    <tr
                      key={e.id}
                      className="border-b border-gray-50 dark:border-gray-800/60 last:border-0
                                 hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors duration-100 group"
                    >
                      {/* Customer */}
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 leading-tight">{e.users?.full_name}</p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-600 font-mono mt-0.5">{e.users?.phone}</p>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3.5">
                        <TypeBadge type={e.type} />
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3.5">
                        <AmountCell type={e.type} amount={e.amount} />
                      </td>

                      {/* Reference */}
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-[11px] text-gray-400 dark:text-gray-600 truncate max-w-[180px] block">
                          {e.reference_id ?? <span className="text-gray-300 dark:text-gray-700">—</span>}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-gray-400 dark:text-gray-600 text-[12px] tabular-nums whitespace-nowrap">
                        {formatDate(e.created_at)}
                      </td>

                      {/* Hover action */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="action-cell">
                          <button
                            onClick={() => setDrillCustomer(e.users)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium
                                       text-gray-500 dark:text-gray-400
                                       hover:text-gray-900 dark:hover:text-gray-100
                                       hover:bg-gray-100 dark:hover:bg-gray-800
                                       transition-colors duration-150"
                          >
                            <User className="h-3 w-3" />
                            View customer
                          </button>
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
    </>
  )
}