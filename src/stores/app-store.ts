import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { EditorMode, SidebarView } from '@/types'

interface AppStore {
  // UI state
  sidebarOpen: boolean
  sidebarWidth: number
  activeNoteId: string | null
  activeFolderId: string | null
  activeTagId: string | null
  sidebarView: SidebarView
  editorMode: EditorMode
  searchQuery: string
  isSearching: boolean

  // Actions
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setSidebarWidth: (width: number) => void
  setActiveNoteId: (id: string | null) => void
  setActiveFolderId: (id: string | null) => void
  setActiveTagId: (id: string | null) => void
  setSidebarView: (view: SidebarView) => void
  setEditorMode: (mode: EditorMode) => void
  setSearchQuery: (query: string) => void
  setIsSearching: (isSearching: boolean) => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      sidebarWidth: 260,
      activeNoteId: null,
      activeFolderId: null,
      activeTagId: null,
      sidebarView: 'all',
      editorMode: 'richtext',
      searchQuery: '',
      isSearching: false,

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarWidth: (width) => set({ sidebarWidth: width }),
      setActiveNoteId: (id) => set({ activeNoteId: id }),
      setActiveFolderId: (id) => set({ activeFolderId: id }),
      setActiveTagId: (id) => set({ activeTagId: id }),
      setSidebarView: (view) => set({ sidebarView: view }),
      setEditorMode: (mode) => set({ editorMode: mode }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setIsSearching: (isSearching) => set({ isSearching }),
    }),
    {
      name: 'noteflow-app',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        sidebarWidth: state.sidebarWidth,
        editorMode: state.editorMode,
      }) as AppStore,
    }
  )
)
