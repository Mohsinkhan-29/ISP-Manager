import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { usersApi } from '../../api/services'
import { useToast } from '../../components/ui/Toast'
import { getErrorMessage } from '../../utils/Helpers'

export default function CustomerForm({ initial, onSuccess }) {
  const toast = useToast()
  const isEdit = !!initial

  const [form, setForm] = useState({
    full_name: initial?.full_name || '',
    phone: initial?.phone || '',
    email: initial?.email || '',
    address: initial?.address || '',
    city: initial?.city || '',
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
      if (isEdit) {
        await usersApi.update(initial.id, form)
        toast('Customer updated', 'success')
      } else {
        await usersApi.create(form)
        toast('Customer added', 'success')
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
          {isEdit ? 'Edit Customer' : 'Add Customer'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Customer information
        </p>
      </div>

      {/* Full Name */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Full Name *
        </label>
        <input
          required
          value={form.full_name}
          onChange={set('full_name')}
          placeholder="Customer Name"
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

      {/* Phone + Email */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone *
          </label>
          <input
            required
            value={form.phone}
            onChange={set('phone')}
            placeholder="03001234567"
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
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="email@example.com"
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

      {/* Address + City */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Address
          </label>
          <input
            value={form.address}
            onChange={set('address')}
            placeholder="House #5, Street 3"
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
            City
          </label>
          <input
            value={form.city}
            onChange={set('city')}
            placeholder="Karachi"
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
              : 'Add Customer'}
        </button>
      </div>
    </form>
  )
}