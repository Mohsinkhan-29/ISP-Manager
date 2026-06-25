import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { subscriptionsApi, usersApi, plansApi } from '../../api/services'
import { useToast } from '../../components/ui/Toast'
import { getErrorMessage } from '../../utils/helpers'

export default function SubscriptionForm({ onSuccess }) {
  const toast = useToast()

  const [form, setForm] = useState({
    user_id: '',
    plan_id: '',
    start_date: new Date().toISOString().split('T')[0],
    billing_cycle: 'monthly',
    custom_speed_mbps: '',
    custom_price: '',
    discount_amount: '',
  })

  const [customers, setCustomers] = useState([])
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    usersApi
      .getAll({ status: 'active', limit: 50 })
      .then((r) => setCustomers(r.data.data))

    plansApi
      .getAll({ status: 'active', limit: 50 })
      .then((r) => setPlans(r.data.data))
  }, [])

  const set = (key) => (e) =>
    setForm((f) => ({
      ...f,
      [key]: e.target.value,
    }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...form,
        custom_speed_mbps: form.custom_speed_mbps
          ? Number(form.custom_speed_mbps)
          : undefined,
        custom_price: form.custom_price
          ? Number(form.custom_price)
          : undefined,
        discount_amount: form.discount_amount
          ? Number(form.discount_amount)
          : undefined,
      }

      await subscriptionsApi.create(payload)

      toast('Subscription created', 'success')
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
          Create Subscription
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Assign a plan to a customer
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

      {/* Plan */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Plan *
        </label>
        <select
          required
          value={form.plan_id}
          onChange={set('plan_id')}
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
          <option value="">Select plan</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — {p.speed_mbps} Mbps
            </option>
          ))}
        </select>
      </div>

      {/* Start Date + Billing Cycle */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Start Date *
          </label>
          <input
            required
            type="date"
            value={form.start_date}
            onChange={set('start_date')}
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
            Billing Cycle
          </label>
          <select
            value={form.billing_cycle}
            onChange={set('billing_cycle')}
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
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      {/* Overrides */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Custom Speed
          </label>
          <input
            type="number"
            value={form.custom_speed_mbps}
            onChange={set('custom_speed_mbps')}
            placeholder="Mbps"
            className="
              w-full rounded-xl border border-gray-300 dark:border-gray-700
              bg-white dark:bg-gray-900 px-3 py-2.5 text-sm
              shadow-sm focus:border-brand-500
              focus:ring-2 focus:ring-brand-500/20
              outline-none transition-all
            "
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Custom Price
          </label>
          <input
            type="number"
            value={form.custom_price}
            onChange={set('custom_price')}
            placeholder="PKR"
            className="
              w-full rounded-xl border border-gray-300 dark:border-gray-700
              bg-white dark:bg-gray-900 px-3 py-2.5 text-sm
              shadow-sm focus:border-brand-500
              focus:ring-2 focus:ring-brand-500/20
              outline-none transition-all
            "
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Discount
          </label>
          <input
            type="number"
            min="0"
            value={form.discount_amount}
            onChange={set('discount_amount')}
            placeholder="0"
            className="
              w-full rounded-xl border border-gray-300 dark:border-gray-700
              bg-white dark:bg-gray-900 px-3 py-2.5 text-sm
              shadow-sm focus:border-brand-500
              focus:ring-2 focus:ring-brand-500/20
              outline-none transition-all
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

          {loading ? 'Creating...' : 'Create Subscription'}
        </button>
      </div>
    </form>
  )
}