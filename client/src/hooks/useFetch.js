import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * useFetch — generic hook for paginated, filterable API calls
 *
 * @param {Function} fetcher  — api function that accepts a params object
 * @param {Object}   defaults — initial query params (page, limit, etc.)
 */
export function useFetch(fetcher, defaults = {}) {
  const [data, setData]       = useState([])
  const [meta, setMeta]       = useState(null)   // page, total, totalPages, etc.
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [params, setParams]   = useState({ page: 1, limit: 10, ...defaults })

  // Keep stable ref so refetch doesn't trigger infinite loops
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const load = useCallback(async (queryParams) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetcherRef.current(queryParams)
      const body = res.data
      setData(body.data ?? [])
      // strip `data` key, keep everything else as meta
      const { data: _d, ...rest } = body
      setMeta(rest)
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(params)
  }, [params, load])

  const updateParams = useCallback((updates) => {
    setParams((prev) => ({ ...prev, ...updates, page: updates.page ?? 1 }))
  }, [])

  const refetch = useCallback(() => load(params), [load, params])

  return { data, meta, loading, error, params, updateParams, refetch }
}