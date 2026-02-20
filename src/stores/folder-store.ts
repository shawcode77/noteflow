import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Folder } from '@/types'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

const FOLDER_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#64748b',
]

interface FolderStore {
  folders: Folder[]

  createFolder: (name: string, parentId?: string | null) => Folder
  updateFolder: (id: string, updates: Partial<Folder>) => void
  deleteFolder: (id: string) => void
  moveFolder: (id: string, parentId: string | null) => void
  reorderFolder: (id: string, sortOrder: number) => void

  getRootFolders: () => Folder[]
  getChildFolders: (parentId: string) => Folder[]
  getFolderById: (id: string) => Folder | undefined
  getAllDescendantIds: (id: string) => string[]
}

export { FOLDER_COLORS }

export const useFolderStore = create<FolderStore>()(
  persist(
    (set, get) => ({
      folders: [],

      createFolder: (name, parentId = null) => {
        const now = new Date().toISOString()
        const siblings = parentId
          ? get().getChildFolders(parentId)
          : get().getRootFolders()
        const folder: Folder = {
          id: generateId(),
          name,
          parentId: parentId ?? null,
          color: FOLDER_COLORS[Math.floor(Math.random() * FOLDER_COLORS.length)],
          sortOrder: siblings.length,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ folders: [...state.folders, folder] }))
        return folder
      },

      updateFolder: (id, updates) => {
        set((state) => ({
          folders: state.folders.map((f) =>
            f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f
          ),
        }))
      },

      deleteFolder: (id) => {
        const descendantIds = get().getAllDescendantIds(id)
        const idsToDelete = [id, ...descendantIds]
        set((state) => ({
          folders: state.folders.filter((f) => !idsToDelete.includes(f.id)),
        }))
      },

      moveFolder: (id, parentId) => {
        set((state) => ({
          folders: state.folders.map((f) =>
            f.id === id ? { ...f, parentId, updatedAt: new Date().toISOString() } : f
          ),
        }))
      },

      reorderFolder: (id, sortOrder) => {
        set((state) => ({
          folders: state.folders.map((f) =>
            f.id === id ? { ...f, sortOrder } : f
          ),
        }))
      },

      getRootFolders: () => {
        return get()
          .folders.filter((f) => f.parentId === null)
          .sort((a, b) => a.sortOrder - b.sortOrder)
      },

      getChildFolders: (parentId) => {
        return get()
          .folders.filter((f) => f.parentId === parentId)
          .sort((a, b) => a.sortOrder - b.sortOrder)
      },

      getFolderById: (id) => {
        return get().folders.find((f) => f.id === id)
      },

      getAllDescendantIds: (id) => {
        const children = get().folders.filter((f) => f.parentId === id)
        const ids: string[] = []
        for (const child of children) {
          ids.push(child.id)
          ids.push(...get().getAllDescendantIds(child.id))
        }
        return ids
      },
    }),
    { name: 'noteflow-folders' }
  )
)
