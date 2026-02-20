import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Tag } from '@/types'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

const TAG_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#64748b',
]

interface TagStore {
  tags: Tag[]

  createTag: (name: string) => Tag
  updateTag: (id: string, updates: Partial<Tag>) => void
  deleteTag: (id: string) => void
  getTagById: (id: string) => Tag | undefined
}

export { TAG_COLORS }

export const useTagStore = create<TagStore>()(
  persist(
    (set, get) => ({
      tags: [],

      createTag: (name) => {
        const tag: Tag = {
          id: generateId(),
          name,
          color: TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)],
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ tags: [...state.tags, tag] }))
        return tag
      },

      updateTag: (id, updates) => {
        set((state) => ({
          tags: state.tags.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }))
      },

      deleteTag: (id) => {
        set((state) => ({
          tags: state.tags.filter((t) => t.id !== id),
        }))
      },

      getTagById: (id) => {
        return get().tags.find((t) => t.id === id)
      },
    }),
    { name: 'noteflow-tags' }
  )
)
