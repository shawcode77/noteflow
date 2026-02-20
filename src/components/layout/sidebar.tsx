'use client'

import { useState } from 'react'
import {
  FileText,
  Clock,
  Star,
  Trash2,
  FolderPlus,
  ChevronDown,
  ChevronRight,
  Tags,
  Plus,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/stores/app-store'
import { useFolderStore } from '@/stores/folder-store'
import { useTagStore } from '@/stores/tag-store'
import { useNoteStore } from '@/stores/note-store'
import { FolderTree } from '@/components/folders/folder-tree'
import type { SidebarView } from '@/types'

const NAV_ITEMS: { view: SidebarView; label: string; icon: React.ElementType }[] = [
  { view: 'all', label: '所有笔记', icon: FileText },
  { view: 'recent', label: '最近编辑', icon: Clock },
  { view: 'favorites', label: '收藏', icon: Star },
  { view: 'trash', label: '回收站', icon: Trash2 },
]

export function Sidebar() {
  const { sidebarView, setSidebarView, setActiveFolderId, setActiveTagId } = useAppStore()
  const { createFolder } = useFolderStore()
  const { tags, createTag, deleteTag } = useTagStore()
  const { notes } = useNoteStore()
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [showTags, setShowTags] = useState(true)
  const [isCreatingTag, setIsCreatingTag] = useState(false)
  const [newTagName, setNewTagName] = useState('')

  const handleNavClick = (view: SidebarView) => {
    setSidebarView(view)
    setActiveFolderId(null)
    setActiveTagId(null)
  }

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim())
      setNewFolderName('')
      setIsCreatingFolder(false)
    }
  }

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      createTag(newTagName.trim())
      setNewTagName('')
      setIsCreatingTag(false)
    }
  }

  const getTagNoteCount = (tagId: string) => {
    return notes.filter((n) => !n.isDeleted && n.tagIds.includes(tagId)).length
  }

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 px-4 font-semibold">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm">
          N
        </div>
        <span className="text-lg">NoteFlow</span>
      </div>

      <ScrollArea className="flex-1 px-2">
        {/* Navigation */}
        <div className="space-y-0.5 py-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.view}
              onClick={() => handleNavClick(item.view)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent',
                sidebarView === item.view && 'bg-sidebar-accent font-medium'
              )}
            >
              <item.icon className="h-4 w-4 text-muted-foreground" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <Separator className="my-2" />

        {/* Folders */}
        <div className="py-2">
          <div className="flex items-center justify-between px-3 pb-1">
            <span className="text-xs font-medium uppercase text-muted-foreground">
              文件夹
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={() => setIsCreatingFolder(true)}
            >
              <FolderPlus className="h-3.5 w-3.5" />
            </Button>
          </div>

          {isCreatingFolder && (
            <div className="flex items-center gap-1 px-3 py-1">
              <Input
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateFolder()
                  if (e.key === 'Escape') setIsCreatingFolder(false)
                }}
                placeholder="文件夹名称"
                className="h-7 text-sm"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => setIsCreatingFolder(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          <FolderTree />
        </div>

        <Separator className="my-2" />

        {/* Tags */}
        <div className="py-2">
          <div className="flex items-center justify-between px-3 pb-1">
            <button
              onClick={() => setShowTags(!showTags)}
              className="flex items-center gap-1 text-xs font-medium uppercase text-muted-foreground"
            >
              {showTags ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
              <Tags className="h-3 w-3" />
              标签
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={() => setIsCreatingTag(true)}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          {isCreatingTag && (
            <div className="flex items-center gap-1 px-3 py-1">
              <Input
                autoFocus
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateTag()
                  if (e.key === 'Escape') setIsCreatingTag(false)
                }}
                placeholder="标签名称"
                className="h-7 text-sm"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => setIsCreatingTag(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {showTags && (
            <div className="space-y-0.5">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => {
                    setSidebarView('tag')
                    setActiveTagId(tag.id)
                    setActiveFolderId(null)
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-sidebar-accent',
                    sidebarView === 'tag' &&
                      useAppStore.getState().activeTagId === tag.id &&
                      'bg-sidebar-accent font-medium'
                  )}
                >
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="flex-1 truncate text-left">{tag.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {getTagNoteCount(tag.id)}
                  </span>
                </button>
              ))}
              {tags.length === 0 && !isCreatingTag && (
                <p className="px-3 py-2 text-xs text-muted-foreground">
                  暂无标签
                </p>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
