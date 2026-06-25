import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Pagination({ meta, onPageChange }) {
  if (!meta || meta.totalPages <= 1) return null

  const { page, totalPages, total, limit } = meta
  const from = (page - 1) * limit + 1
  const to   = Math.min(page * limit, total)

  return (
    <div className="flex items-center justify-between px-1 pt-4">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="btn-ghost p-1.5 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce((acc, p, idx, arr) => {
            if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
            acc.push(p)
            return acc
          }, [])
          .map((p, i) =>
            p === '...' ? (
              <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-8 h-8 text-xs rounded-lg font-medium transition-colors ${
                  p === page
                    ? 'bg-brand-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {p}
              </button>
            )
          )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="btn-ghost p-1.5 disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}