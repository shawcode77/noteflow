export interface Note {
  id: string
  title: string
  content: string // JSON string from Tiptap
  contentText: string // Plain text for search
  folderId: string | null
  tagIds: string[]
  isPinned: boolean
  isFavorited: boolean
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Folder {
  id: string
  name: string
  parentId: string | null
  color: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface Tag {
  id: string
  name: string
  color: string
  createdAt: string
}

export type EditorMode = 'richtext' | 'markdown'

export type SidebarView = 'all' | 'recent' | 'favorites' | 'trash' | 'folder' | 'tag'

export type SortBy = 'updatedAt' | 'createdAt' | 'title'

export type ThemeMode = 'light' | 'dark' | 'system'
