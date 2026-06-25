import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('theme')
    // Stored manual preference takes priority on mount;
    // otherwise fall back to browser preference
    if (stored) return stored === 'dark'
    return mediaQuery.matches
  })

  // Track whether the user has manually overridden the theme.
  // If they haven't, we follow the browser automatically.
  const [manualOverride, setManualOverride] = useState(() => {
    return localStorage.getItem('theme') !== null
  })

  // Apply the class + persist whenever dark changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    if (manualOverride) {
      localStorage.setItem('theme', dark ? 'dark' : 'light')
    }
  }, [dark, manualOverride])

  // Listen for OS/browser theme changes.
  // Only follow them when there's no manual override.
  useEffect(() => {
    const handler = (e) => {
      if (!manualOverride) {
        setDark(e.matches)
      }
    }
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [manualOverride])

  // User manually toggles → mark as overridden
  const toggle = () => {
    setManualOverride(true)
    setDark((d) => !d)
  }

  // Call this on logout — clears override, reverts to browser theme
  const resetTheme = () => {
    localStorage.removeItem('theme')
    setManualOverride(false)
    setDark(mediaQuery.matches)
  }

  return (
    <ThemeContext.Provider value={{ dark, toggle, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}