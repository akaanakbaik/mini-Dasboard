import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { VpsProfile, SystemStats } from '@/types'

interface VpsState {
  activeProfile: VpsProfile | null
  isConnected: boolean
  stats: SystemStats | null
  setActiveProfile: (profile: VpsProfile | null) => void
  setConnected: (status: boolean) => void
  setStats: (stats: SystemStats) => void
  reset: () => void
}

export const useVpsStore = create<VpsState>()(
  persist(
    (set) => ({
      activeProfile: null,
      isConnected: false,
      stats: null,
      setActiveProfile: (profile) => set({ activeProfile: profile }),
      setConnected: (status) => set({ isConnected: status }),
      setStats: (stats) => set({ stats }),
      reset: () => set({ activeProfile: null, isConnected: false, stats: null }),
    }),
    {
      name: 'furinla-storage',
      partialize: (state) => ({ activeProfile: state.activeProfile }),
    }
  )
)
