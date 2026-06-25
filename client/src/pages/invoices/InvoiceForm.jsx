import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { invoicesApi, usersApi, subscriptionsApi } from '../../api/services'
import { useToast } from '../../components/ui/Toast'
import { getErrorMessage } from '../../utils/helpers'

export default function InvoiceForm({ onSuccess }) {
  const toast = useToast()

  const [form, setForm] = useState({
    user_id: '',
    subscription_id: '',
    billing_month: new Date().toISOString().slice(0, 7) + '-01',
    due_date: '',
  })

  const [customers, setCustomers] = useState([])
  const [subs, setSubs] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    usersApi
      .getAll({ status: 'active', limit: 50 })
      .then((r) => setCustomers(r.data.data))
  }, [])

  useEffect(() => {
    if (!form.user_id) {
      setSubs([])
      return
    }

    subscriptionsApi
      .getAll({ status: 'active', limit: 50 })
      .then((r) => {
        setSubs(
          r.data.data.filter((s) => s.user_id === form.user_id)
        )
      })
  }, [form.user_id])

  const set = (key) => (e) =>
    setForm((f) => ({
      ...f,
      [key]: e.target.value,
    }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await invoicesApi.create({
        ...form,
        due_date: form.due_date || undefined,
      })

      toast('Invoice created', 'success')
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
          Create Invoice
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Generate an invoice for a customer subscription
        </p>
      </div>

      {/* Customer */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Customer *
        </label>

        <select
          required
          value={form.user_id}
          onChange={set('user_id')}
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
          <option value="">Select customer</option>

          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.full_name} — {c.phone}
            </option>
          ))}
        </select>
      </div>

      {/* Subscription */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Subscription *
        </label>

        <select
          required
          disabled={!form.user_id}
          value={form.subscription_id}
          onChange={set('subscription_id')}
          className="
            w-full rounded-xl
            border border-gray-300 dark:border-gray-700
            bg-white dark:bg-gray-900
            px-3 py-2.5
            text-sm text-gray-900 dark:text-white
            shadow-sm
            focus:border-brand-500
            focus:ring-2 focus:ring-brand-500/20
            disabled:cursor-not-allowed
            disabled:opacity-60
            outline-none
            transition-all
          "
        >
          <option value="">Select subscription</option>

          {subs.map((s) => (
            <option key={s.id} value={s.id}>
              {s.plans?.name} — {s.billing_cycle}
            </option>
          ))}
        </select>

        {form.user_id && subs.length === 0 && (
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-500">
            No active subscriptions for this customer.
          </p>
        )}
      </div>

      {/* Billing Month + Due Date */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Billing Month *
          </label>

          <input
            required
            type="month"
            value={form.billing_month?.slice(0, 7)}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                billing_month: e.target.value + '-01',
              }))
            }
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
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Due Date
          </label>

          <input
            type="date"
            value={form.due_date}
            onChange={set('due_date')}
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
          />
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

          {loading ? 'Creating...' : 'Create Invoice'}
        </button>
      </div>
    </form>
  )
}