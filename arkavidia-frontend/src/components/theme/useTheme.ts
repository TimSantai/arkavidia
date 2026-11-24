import { createContext, useContext } from "react"

export type ThemeMode = "light" | "dark" | "system"

export interface ThemeContextValue {
  readonly theme: ThemeMode
  readonly resolvedTheme: "light" | "dark"
  readonly setTheme: (next: ThemeMode) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return ctx
}
