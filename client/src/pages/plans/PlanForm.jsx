import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { plansApi } from '../../api/services'
import { useToast } from '../../components/ui/Toast'
import { getErrorMessage } from '../../utils/helpers'

export default function PlanForm({ initial, onSuccess }) {
  const toast = useToast()
  const isEdit = !!initial

  const [form, setForm] = useState({
    name: initial?.name || '',
    speed_mbps: initial?.speed_mbps || '',
    price: initial?.price || '',
    is_active: initial?.is_active ?? true,
  })

  const [loading, setLoading] = useState(false)

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
        speed_mbps: Number(form.speed_mbps),
        price: Number(form.price),
      }

      if (isEdit) {
        await plansApi.update(initial.id, payload)
        toast('Plan updated', 'success')
      } else {
        await plansApi.create(payload)
        toast('Plan created', 'success')
      }

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
          {isEdit ? 'Edit Plan' : 'Create Plan'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Internet package details
        </p>
      </div>

      {/* Plan Name */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Plan Name *
        </label>
        <input
          required
          value={form.name}
          onChange={set('name')}
          placeholder="10 Mbps Basic"
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

      {/* Speed + Price */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Speed (Mbps) *
          </label>
          <input
            required
            type="number"
            min="1"
            value={form.speed_mbps}
            onChange={set('speed_mbps')}
            placeholder="10"
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
            Price (PKR) *
          </label>
          <input
            required
            type="number"
            min="0"
            value={form.price}
            onChange={set('price')}
            placeholder="1500"
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
      </div>

      {/* Active Toggle */}
      {isEdit && (
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-800 p-3">
          <input
            type="checkbox"
            id="is_active"
            checked={form.is_active}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                is_active: e.target.checked,
              }))
            }
            className="
              h-4 w-4 rounded
              border-gray-300
              text-brand-600
              focus:ring-brand-500
            "
          />

          <label
            htmlFor="is_active"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Plan is Active
          </label>
        </div>
      )}

      {/* Submit Button */}
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

          {loading
            ? 'Saving...'
            : isEdit
              ? 'Save Changes'
              : 'Create Plan'}
        </button>
      </div>
    </form>
  )
}