import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Note, SortBy } from '@/types'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

interface NoteStore {
  notes: Note[]
  sortBy: SortBy

  // CRUD
  createNote: (folderId: string | null) => Note
  updateNote: (id: string, updates: Partial<Note>) => void
  deleteNote: (id: string) => void
  restoreNote: (id: string) => void
  permanentDeleteNote: (id: string) => void
  emptyTrash: () => void

  // Actions
  toggleFavorite: (id: string) => void
  togglePin: (id: string) => void
  moveNote: (id: string, folderId: string | null) => void
  addTag: (noteId: string, tagId: string) => void
  removeTag: (noteId: string, tagId: string) => void
  setSortBy: (sortBy: SortBy) => void

  // Queries
  getNotesByFolder: (folderId: string | null) => Note[]
  getNotesByTag: (tagId: string) => Note[]
  getFavoriteNotes: () => Note[]
  getRecentNotes: () => Note[]
  getTrashNotes: () => Note[]
  searchNotes: (query: string) => Note[]
}

function sortNotes(notes: Note[], sortBy: SortBy): Note[] {
  const sorted = [...notes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
    switch (sortBy) {
      case 'updatedAt':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'title':
        return a.title.localeCompare(b.title)
      default:
        return 0
    }
  })
  return sorted
}

export const useNoteStore = create<NoteStore>()(
  persist(
    (set, get) => ({
      notes: [],
      sortBy: 'updatedAt',

      createNote: (folderId) => {
        const now = new Date().toISOString()
        const note: Note = {
          id: generateId(),
          title: '',
          content: '',
          contentText: '',
          folderId,
          tagIds: [],
          isPinned: false,
          isFavorited: false,
          isDeleted: false,
          deletedAt: null,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ notes: [note, ...state.notes] }))
        return note
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
          ),
        }))
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id
              ? { ...n, isDeleted: true, deletedAt: new Date().toISOString() }
              : n
          ),
        }))
      },

      restoreNote: (id) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, isDeleted: false, deletedAt: null } : n
          ),
        }))
      },

      permanentDeleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id),
        }))
      },

      emptyTrash: () => {
        set((state) => ({
          notes: state.notes.filter((n) => !n.isDeleted),
        }))
      },

      toggleFavorite: (id) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, isFavorited: !n.isFavorited } : n
          ),
        }))
      },

      togglePin: (id) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, isPinned: !n.isPinned } : n
          ),
        }))
      },

      moveNote: (id, folderId) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, folderId } : n
          ),
        }))
      },

      addTag: (noteId, tagId) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === noteId && !n.tagIds.includes(tagId)
              ? { ...n, tagIds: [...n.tagIds, tagId] }
              : n
          ),
        }))
      },

      removeTag: (noteId, tagId) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === noteId
              ? { ...n, tagIds: n.tagIds.filter((t) => t !== tagId) }
              : n
          ),
        }))
      },

      setSortBy: (sortBy) => set({ sortBy }),

      getNotesByFolder: (folderId) => {
        const { notes, sortBy } = get()
        const filtered = notes.filter((n) => !n.isDeleted && n.folderId === folderId)
        return sortNotes(filtered, sortBy)
      },

      getNotesByTag: (tagId) => {
        const { notes, sortBy } = get()
        const filtered = notes.filter((n) => !n.isDeleted && n.tagIds.includes(tagId))
        return sortNotes(filtered, sortBy)
      },

      getFavoriteNotes: () => {
        const { notes, sortBy } = get()
        const filtered = notes.filter((n) => !n.isDeleted && n.isFavorited)
        return sortNotes(filtered, sortBy)
      },

      getRecentNotes: () => {
        const { notes } = get()
        return notes
          .filter((n) => !n.isDeleted)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 20)
      },

      getTrashNotes: () => {
        const { notes } = get()
        return notes
          .filter((n) => n.isDeleted)
          .sort((a, b) => new Date(b.deletedAt!).getTime() - new Date(a.deletedAt!).getTime())
      },

      searchNotes: (query) => {
        const { notes, sortBy } = get()
        const lower = query.toLowerCase()
        const filtered = notes.filter(
          (n) =>
            !n.isDeleted &&
            (n.title.toLowerCase().includes(lower) ||
              n.contentText.toLowerCase().includes(lower))
        )
        return sortNotes(filtered, sortBy)
      },
    }),
    { name: 'noteflow-notes' }
  )
)
