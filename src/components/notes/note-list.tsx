'use client'

import { useMemo } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import {
  Plus,
  Pin,
  Star,
  Trash2,
  RotateCcw,
  ArrowUpDown,
  Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNoteStore } from '@/stores/note-store'
import { useAppStore } from '@/stores/app-store'
import { useFolderStore } from '@/stores/folder-store'
import { useTagStore } from '@/stores/tag-store'
import type { Note, SortBy } from '@/types'

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'updatedAt', label: '最近修改' },
  { value: 'createdAt', label: '创建时间' },
  { value: 'title', label: '标题' },
]

export function NoteList() {
  const {
    notes,
    sortBy,
    setSortBy,
    createNote,
    deleteNote,
    restoreNote,
    permanentDeleteNote,
    emptyTrash,
    toggleFavorite,
    togglePin,
    getNotesByFolder,
    getNotesByTag,
    getFavoriteNotes,
    getRecentNotes,
    getTrashNotes,
    searchNotes,
  } = useNoteStore()

  const {
    sidebarView,
    activeFolderId,
    activeTagId,
    activeNoteId,
    setActiveNoteId,
    searchQuery,
    setSearchQuery,
    isSearching,
    setIsSearching,
  } = useAppStore()

  const { getFolderById } = useFolderStore()
  const { getTagById } = useTagStore()

  const displayNotes = useMemo((): Note[] => {
    if (isSearching && searchQuery.trim()) {
      return searchNotes(searchQuery)
    }
    switch (sidebarView) {
      case 'all':
        return notes
          .filter((n) => !n.isDeleted)
          .sort((a, b) => {
            if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          })
      case 'recent':
        return getRecentNotes()
      case 'favorites':
        return getFavoriteNotes()
      case 'trash':
        return getTrashNotes()
      case 'folder':
        return activeFolderId ? getNotesByFolder(activeFolderId) : []
      case 'tag':
        return activeTagId ? getNotesByTag(activeTagId) : []
      default:
        return []
    }
  }, [
    sidebarView,
    activeFolderId,
    activeTagId,
    notes,
    sortBy,
    isSearching,
    searchQuery,
  ])

  const getTitle = () => {
    if (isSearching) return `搜索: ${searchQuery}`
    switch (sidebarView) {
      case 'all':
        return '所有笔记'
      case 'recent':
        return '最近编辑'
      case 'favorites':
        return '收藏'
      case 'trash':
        return '回收站'
      case 'folder': {
        const folder = activeFolderId ? getFolderById(activeFolderId) : null
        return folder ? folder.name : '文件夹'
      }
      case 'tag': {
        const tag = activeTagId ? getTagById(activeTagId) : null
        return tag ? `# ${tag.name}` : '标签'
      }
    }
  }

  const handleNewNote = () => {
    const folderId = sidebarView === 'folder' ? activeFolderId : null
    const note = createNote(folderId)
    setActiveNoteId(note.id)
  }

  const isTrash = sidebarView === 'trash'

  return (
    <div className="flex h-full flex-col border-r border-border bg-card">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <h2 className="text-sm font-semibold truncate">{getTitle()}</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsSearching(!isSearching)}
          >
            <Search className="h-4 w-4" />
          </Button>
          {!isTrash && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {SORT_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={cn(sortBy === option.value && 'font-medium')}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleNewNote}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </>
          )}
          {isTrash && displayNotes.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-destructive hover:text-destructive"
              onClick={emptyTrash}
            >
              清空回收站
            </Button>
          )}
        </div>
      </div>

      {/* Search bar */}
      {isSearching && (
        <div className="border-b border-border px-3 py-2">
          <Input
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索笔记..."
            className="h-8 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsSearching(false)
                setSearchQuery('')
              }
            }}
          />
        </div>
      )}

      {/* Note list */}
      <ScrollArea className="flex-1">
        {displayNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p className="text-sm">
              {isTrash ? '回收站为空' : isSearching ? '未找到匹配的笔记' : '暂无笔记'}
            </p>
            {!isTrash && !isSearching && (
              <Button
                variant="link"
                size="sm"
                className="mt-2"
                onClick={handleNewNote}
              >
                <Plus className="mr-1 h-3 w-3" />
                新建笔记
              </Button>
            )}
          </div>
        ) : (
          <div className="p-2">
            {displayNotes.map((note) => (
              <NoteListItem
                key={note.id}
                note={note}
                isActive={activeNoteId === note.id}
                isTrash={isTrash}
                onClick={() => setActiveNoteId(note.id)}
                onToggleFavorite={() => toggleFavorite(note.id)}
                onTogglePin={() => togglePin(note.id)}
                onDelete={() => deleteNote(note.id)}
                onRestore={() => restoreNote(note.id)}
                onPermanentDelete={() => permanentDeleteNote(note.id)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

function NoteListItem({
  note,
  isActive,
  isTrash,
  onClick,
  onToggleFavorite,
  onTogglePin,
  onDelete,
  onRestore,
  onPermanentDelete,
}: {
  note: Note
  isActive: boolean
  isTrash: boolean
  onClick: () => void
  onToggleFavorite: () => void
  onTogglePin: () => void
  onDelete: () => void
  onRestore: () => void
  onPermanentDelete: () => void
}) {
  const timeAgo = formatDistanceToNow(new Date(note.updatedAt), {
    addSuffix: true,
    locale: zhCN,
  })
  const preview = note.contentText.slice(0, 80) || '空笔记'

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative cursor-pointer rounded-lg p-3 transition-colors hover:bg-accent',
        isActive && 'bg-accent'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {note.isPinned && <Pin className="h-3 w-3 shrink-0 text-primary" />}
            <h3 className="truncate text-sm font-medium">
              {note.title || '无标题'}
            </h3>
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {preview}
          </p>
          <p className="mt-1.5 text-[11px] text-muted-foreground/70">{timeAgo}</p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-col gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          {isTrash ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation()
                  onRestore()
                }}
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  onPermanentDelete()
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleFavorite()
                }}
              >
                <Star
                  className={cn(
                    'h-3 w-3',
                    note.isFavorited && 'fill-yellow-400 text-yellow-400'
                  )}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
