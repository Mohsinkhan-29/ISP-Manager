import { clsx } from 'clsx'

export { clsx as cn }

/** Format a date string to a readable locale format */
export function formatDate(dateStr, opts = {}) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...opts,
  })
}

/** Format a number as currency */
export function formatCurrency(amount, currency = 'PKR') {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

/** Map a status string to a badge class */
export function statusBadge(status) {
  const map = {
    active:      'badge-green',
    paid:        'badge-green',
    sent:        'badge-green',
    partial:     'badge-yellow',
    pending:     'badge-yellow',
    suspended:   'badge-yellow',
    unpaid:      'badge-red',
    failed:      'badge-red',
    terminated:  'badge-red',
    cancelled:   'badge-gray',
    inactive:    'badge-gray',
    invoice:     'badge-blue',
    payment:     'badge-green',
    credit:      'badge-green',
    debit:       'badge-red',
    adjustment:  'badge-yellow',
    alert:       'badge-red',
    system:      'badge-blue',
    OWNER:       'badge-blue',
    ADMIN:       'badge-yellow',
    STAFF:       'badge-gray',
  }
  return map[status] ?? 'badge-gray'
}

/** Extract an error message from an axios error */
export function getErrorMessage(err) {
  return err?.response?.data?.message || err?.message || 'An error occurred'
}