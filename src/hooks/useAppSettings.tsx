"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useTheme } from "@/components/themeProvider"
import { useAppUpdateCheck } from "./useAppUpdateCheck"

export type FontSize = "small" | "medium" | "large"
export type FontFamily = "sans" | "mono" | "serif"
export type ClickMode = "single" | "double"

export interface AppSettings {
  fontSize: FontSize
  fontFamily: FontFamily
  clickMode: ClickMode
  showHiddenFiles: boolean
  defaultViewMode: "table" | "grid"
}

interface AppSettingsContextType {
  settings: AppSettings
  updateSettings: (partial: Partial<AppSettings>) => void
  resetDefaults: () => void
  theme: string
  setTheme: (theme: "light" | "dark" | "system") => void
  hasUpdate: boolean
  latestVersion: string | null
  checkForUpdate: () => Promise<void>
}

const SETTINGS_KEY = "fileex_app_settings"

const DEFAULT_SETTINGS: AppSettings = {
  fontSize: "medium",
  fontFamily: "sans",
  clickMode: "single",
  showHiddenFiles: false,
  defaultViewMode: "table",
}

const FONT_FAMILY_MAP: Record<FontFamily, string> = {
  sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  serif: "Georgia, Cambria, 'Times New Roman', Times, serif",
}

const FONT_SIZE_MAP: Record<FontSize, string> = {
  small: "13px",
  medium: "14px",
  large: "16px",
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined)

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme()
  const { hasUpdate, latestVersion, checkForUpdate } = useAppUpdateCheck()
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY)
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
      }
    } catch (e) {
      console.error("Failed to load settings:", e)
    }
    return DEFAULT_SETTINGS
  })

  // Apply typography settings to root document
  useEffect(() => {
    const root = document.documentElement
    root.style.fontSize = FONT_SIZE_MAP[settings.fontSize] || "14px"
    root.style.fontFamily = FONT_FAMILY_MAP[settings.fontFamily] || FONT_FAMILY_MAP.sans
  }, [settings.fontSize, settings.fontFamily])

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...partial }
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
      } catch (e) {
        console.error("Failed to save settings:", e)
      }
      return updated
    })
  }

  const resetDefaults = () => {
    setSettings(DEFAULT_SETTINGS)
    setTheme("system")
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS))
    } catch (e) {
      console.error("Failed to reset settings:", e)
    }
  }

  return (
    <AppSettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetDefaults,
        theme,
        setTheme,
        hasUpdate,
        latestVersion,
        checkForUpdate,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  )
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext)
  if (!context) {
    throw new Error("useAppSettings must be used within an AppSettingsProvider")
  }
  return context
}
