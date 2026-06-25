import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { adminsApi } from '../../api/services'
import { useToast } from '../../components/ui/Toast'
import { getErrorMessage } from '../../utils/Helpers'

export default function AdminForm({ onSuccess }) {
  const toast = useToast()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STAFF',
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
      await adminsApi.create(form)

      toast('Admin added', 'success')
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
          Add Administrator
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Create a new admin account
        </p>
      </div>

      {/* Full Name */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Full Name *
        </label>

        <input
          required
          value={form.name}
          onChange={set('name')}
          placeholder="Jane Doe"
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

      {/* Email */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email Address *
        </label>

        <input
          required
          type="email"
          value={form.email}
          onChange={set('email')}
          placeholder="jane@isp.com"
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

      {/* Password + Role */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password *
          </label>

          <input
            required
            type="password"
            minLength={8}
            value={form.password}
            onChange={set('password')}
            placeholder="Min 8 characters"
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
            Role *
          </label>

          <select
            value={form.role}
            onChange={set('role')}
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
            <option value="ADMIN">ADMIN</option>
            <option value="STAFF">STAFF</option>
            <option value="OWNER">OWNER</option>
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

          {loading ? 'Adding...' : 'Add Admin'}
        </button>
      </div>
    </form>
  )
}