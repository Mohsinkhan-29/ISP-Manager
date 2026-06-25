export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-gray-400" />
        </div>
      )}
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}