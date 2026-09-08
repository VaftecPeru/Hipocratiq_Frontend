"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";

export const THEME_STORAGE_KEY = "hipocratiq-theme";
export type Theme = "light" | "dark" | "system";
const THEME_CHANGED_EVENT = "hipocratiq-theme-changed";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

let volatileTheme: Theme | undefined;

function readStoredTheme(fallback: Theme): Theme {
  if (volatileTheme) return volatileTheme;

  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(storedTheme) ? storedTheme : fallback;
  } catch {
    return fallback;
  }
}

function subscribeToTheme(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(THEME_CHANGED_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(THEME_CHANGED_EVENT, onChange);
  };
}

export function ThemeProvider({ children, defaultTheme = "system" }: { children: ReactNode; defaultTheme?: Theme }) {
  const getThemeSnapshot = useCallback(() => readStoredTheme(defaultTheme), [defaultTheme]);
  const getServerThemeSnapshot = useCallback(() => defaultTheme, [defaultTheme]);
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const preferredTheme = readStoredTheme(theme);
      const resolvedTheme = preferredTheme === "system" ? (mediaQuery.matches ? "dark" : "light") : preferredTheme;
      root.classList.remove("light", "dark");
      root.classList.add(resolvedTheme);
    };

    applyTheme();

    if (theme === "system") {
      mediaQuery.addEventListener("change", applyTheme);
      return () => mediaQuery.removeEventListener("change", applyTheme);
    }

    return undefined;
  }, [theme]);

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    setTheme: (nextTheme) => {
      volatileTheme = nextTheme;

      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      } catch {
        // Keep the in-memory preference when persistent storage is unavailable.
      }
      window.dispatchEvent(new Event(THEME_CHANGED_EVENT));
    },
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
