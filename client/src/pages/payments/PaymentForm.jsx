import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { paymentsApi, invoicesApi } from '../../api/services'
import { useToast } from '../../components/ui/Toast'
import { formatCurrency, getErrorMessage } from '../../utils/Helpers'

const METHODS = [
  'cash',
  'bank_transfer',
  'easypaisa',
  'jazzcash',
  'cheque',
  'other',
]

export default function PaymentForm({ onSuccess, prefillInvoiceId }) {
  const toast = useToast()

  const [form, setForm] = useState({
    invoice_id: prefillInvoiceId || '',
    amount_paid: '',
    payment_method: 'cash',
  })

  const [invoices, setInvoices] = useState([])
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    invoicesApi.getAll({ status: 'unpaid', limit: 50 }).then((r) => {
      invoicesApi.getAll({ status: 'partial', limit: 50 }).then((r2) => {
        setInvoices([...r.data.data, ...r2.data.data])
      })
    })
  }, [])

  useEffect(() => {
    if (form.invoice_id) {
      const inv = invoices.find((i) => i.id === form.invoice_id)
      setSelectedInvoice(inv || null)
    }
  }, [form.invoice_id, invoices])

  const set = (key) => (e) =>
    setForm((f) => ({
      ...f,
      [key]: e.target.value,
    }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await paymentsApi.create({
        ...form,
        amount_paid: Number(form.amount_paid),
      })

      toast('Payment recorded', 'success')
      onSuccess()
    } catch (err) {
      toast(getErrorMessage(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 pb-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Record Payment
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Record a payment against an invoice
        </p>
      </div>

      {/* Invoice */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Invoice *
        </label>

        <select
          required
          value={form.invoice_id}
          onChange={set('invoice_id')}
          className="
            w-full rounded-xl
            border border-gray-300 dark:border-gray-700
            bg-white dark:bg-gray-900
            px-3 py-2.5
            text-sm text-gray-900 dark:text-white
            shadow-sm
            focus:border-brand-500
            focus:ring-2 focus:ring-brand-500/20
            outline-none
            transition-all
          "
        >
          <option value="">Select invoice</option>

          {invoices.map((inv) => (
            <option key={inv.id} value={inv.id}>
              {inv.invoice_number} — {inv.users?.full_name} — Balance:{' '}
              {formatCurrency(inv.remaining_balance)}
            </option>
          ))}
        </select>
      </div>

      {/* Invoice Summary */}
      {selectedInvoice && (
        <div
          className="
            rounded-xl
            border border-gray-200 dark:border-gray-800
            bg-gray-50 dark:bg-gray-800/50
            p-4
            space-y-3
          "
        >
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              Amount Due
            </span>

            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(selectedInvoice.amount_due)}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              Remaining Balance
            </span>

            <span className="font-semibold text-red-600 dark:text-red-400">
              {formatCurrency(selectedInvoice.remaining_balance)}
            </span>
          </div>
        </div>
      )}

      {/* Amount + Method */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Amount (PKR) *
          </label>

          <input
            required
            type="number"
            min="1"
            max={selectedInvoice?.remaining_balance}
            value={form.amount_paid}
            onChange={set('amount_paid')}
            placeholder="Enter amount"
            className="
              w-full rounded-xl
              border border-gray-300 dark:border-gray-700
              bg-white dark:bg-gray-900
              px-3 py-2.5
              text-sm text-gray-900 dark:text-white
              placeholder:text-gray-400
              shadow-sm
              focus:border-brand-500
              focus:ring-2 focus:ring-brand-500/20
              outline-none
              transition-all
            "
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Payment Method *
          </label>

          <select
            value={form.payment_method}
            onChange={set('payment_method')}
            className="
              w-full rounded-xl
              border border-gray-300 dark:border-gray-700
              bg-white dark:bg-gray-900
              px-3 py-2.5
              text-sm text-gray-900 dark:text-white
              shadow-sm
              focus:border-brand-500
              focus:ring-2 focus:ring-brand-500/20
              outline-none
              transition-all
            "
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {m
                  .replace('_', ' ')
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className="
            inline-flex items-center gap-2
            rounded-xl
            bg-brand-600
            px-5 py-2.5
            text-sm font-medium text-white
            shadow-sm
            hover:bg-brand-700
            hover:shadow-md
            disabled:cursor-not-allowed
            disabled:opacity-50
            transition-all
          "
        >
          {loading && (
            <Loader2 size={16} className="animate-spin" />
          )}

          {loading ? 'Recording...' : 'Record Payment'}
        </button>
      </div>
    </form>
  )
}