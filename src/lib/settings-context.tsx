import React from 'react'

export type SettingsMap = Record<string, string>

export const SettingsContext = React.createContext<{ settings: SettingsMap; loading: boolean } | null>(null)

export function useSettingsContext() {
  return React.useContext(SettingsContext)
}

export default SettingsContext
