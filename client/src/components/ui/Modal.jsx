import { useEffect } from 'react'
import { X } from 'lucide-react'

export function Modal({ open, onClose, title, description, children, size = 'md', variant = 'default' }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    if (open) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const widths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  const accentBar = {
    default: 'from-blue-500 to-indigo-500',
    danger:  'from-red-500 to-rose-500',
    success: 'from-emerald-500 to-teal-500',
    warning: 'from-amber-400 to-orange-500',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`
          relative w-full ${widths[size]}
          bg-white dark:bg-gray-900
          rounded-xl shadow-2xl shadow-black/30
          border border-gray-200 dark:border-gray-700/60
          animate-in fade-in zoom-in-95 duration-200 ease-out
          flex flex-col max-h-[90vh]
        `}
      >
        {/* Accent bar */}
        <div className={`h-[10px] w-full rounded-t-3xl bg-gradient-to-r ${accentBar[variant]}`} />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4">
          <div className="min-w-0">
            <h2
              id="modal-title"
              className="text-[15px] font-semibold leading-snug text-gray-900 dark:text-gray-50 truncate"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-[13px] leading-relaxed text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="
              shrink-0 -mt-0.5 -mr-1.5
              flex items-center justify-center
              h-7 w-7 rounded-md
              text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
              hover:bg-gray-100 dark:hover:bg-gray-800
              transition-colors duration-150
            "
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 dark:bg-gray-800 mx-6" />

        {/* Body — scrollable */}
        <div className="px-6 py-5 overflow-y-auto flex-1 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  )
}