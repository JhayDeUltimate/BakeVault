import React from 'react'

export type SettingsMap = Record<string, string>

const SettingsContext = React.createContext<{ settings: SettingsMap; loading: boolean } | null>(null)

export default SettingsContext
