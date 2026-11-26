import { useEffect, useMemo, useState, type ReactNode } from "react"
import { ThemeContext, type ThemeContextValue, type ThemeMode } from "./useTheme"

export function ThemeProvider({ children }: { readonly children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>("light")

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("dark")
    if (typeof window !== "undefined") {
      window.localStorage.setItem("bersama-theme", "light")
    }
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme: "light",
      setTheme,
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
