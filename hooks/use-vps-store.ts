import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface VpsConfig {
  id?: string
  name: string
  ip: string
  port: number
  username: string
  workingDir: string
}

interface VpsState {
  config: VpsConfig | null
  isConnected: boolean
  lastUsed: string | null
  setConfig: (config: VpsConfig) => void
  setConnected: (status: boolean) => void
  logout: () => void
}

export const useVpsStore = create<VpsState>()(
  persist(
    (set) => ({
      config: null,
      isConnected: false,
      lastUsed: null,
      setConfig: (config) => set({ config, lastUsed: new Date().toISOString() }),
      setConnected: (status) => set({ isConnected: status }),
      logout: () => set({ config: null, isConnected: false }),
    }),
    {
      name: 'furinla-vps-storage',
    }
  )
)
