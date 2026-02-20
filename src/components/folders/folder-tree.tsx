'use client'

import { useState } from 'react'
import {
  Folder,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  FolderPlus,
  Palette,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useFolderStore, FOLDER_COLORS } from '@/stores/folder-store'
import { useAppStore } from '@/stores/app-store'
import { useNoteStore } from '@/stores/note-store'

function FolderItem({
  folderId,
  depth = 0,
}: {
  folderId: string
  depth?: number
}) {
  const { getFolderById, getChildFolders, updateFolder, deleteFolder, createFolder } =
    useFolderStore()
  const { sidebarView, activeFolderId, setSidebarView, setActiveFolderId, setActiveTagId } =
    useAppStore()
  const { notes } = useNoteStore()
  const folder = getFolderById(folderId)
  const children = getChildFolders(folderId)

  const [isExpanded, setIsExpanded] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState('')
  const [isCreatingChild, setIsCreatingChild] = useState(false)
  const [newChildName, setNewChildName] = useState('')

  if (!folder) return null

  const isActive = sidebarView === 'folder' && activeFolderId === folderId
  const noteCount = notes.filter((n) => !n.isDeleted && n.folderId === folderId).length

  const handleClick = () => {
    setSidebarView('folder')
    setActiveFolderId(folderId)
    setActiveTagId(null)
  }

  const handleRename = () => {
    if (renameValue.trim()) {
      updateFolder(folderId, { name: renameValue.trim() })
    }
    setIsRenaming(false)
  }

  const handleCreateChild = () => {
    if (newChildName.trim()) {
      createFolder(newChildName.trim(), folderId)
      setIsExpanded(true)
    }
    setNewChildName('')
    setIsCreatingChild(false)
  }

  if (isRenaming) {
    return (
      <div className="flex items-center gap-1 py-0.5" style={{ paddingLeft: depth * 16 + 12 }}>
        <Input
          autoFocus
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRename()
            if (e.key === 'Escape') setIsRenaming(false)
          }}
          onBlur={handleRename}
          className="h-7 text-sm"
        />
      </div>
    )
  }

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-1 rounded-lg py-1.5 pr-1 text-sm transition-colors hover:bg-sidebar-accent',
          isActive && 'bg-sidebar-accent font-medium'
        )}
        style={{ paddingLeft: depth * 16 + 12 }}
      >
        <button
          onClick={() => children.length > 0 && setIsExpanded(!isExpanded)}
          className="flex h-4 w-4 shrink-0 items-center justify-center"
        >
          {children.length > 0 ? (
            isExpanded ? (
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )
          ) : (
            <span className="h-3 w-3" />
          )}
        </button>

        <button onClick={handleClick} className="flex flex-1 items-center gap-2 overflow-hidden">
          <Folder className="h-4 w-4 shrink-0" style={{ color: folder.color }} />
          <span className="truncate">{folder.name}</span>
          <span className="ml-auto text-xs text-muted-foreground">{noteCount > 0 ? noteCount : ''}</span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem
              onClick={() => {
                setRenameValue(folder.name)
                setIsRenaming(true)
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              重命名
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsCreatingChild(true)}>
              <FolderPlus className="mr-2 h-4 w-4" />
              新建子文件夹
            </DropdownMenuItem>
            <Popover>
              <PopoverTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Palette className="mr-2 h-4 w-4" />
                  更换颜色
                </DropdownMenuItem>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" side="right">
                <div className="flex flex-wrap gap-1.5">
                  {FOLDER_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => updateFolder(folderId, { color })}
                      className={cn(
                        'h-6 w-6 rounded-full transition-transform hover:scale-110',
                        folder.color === color && 'ring-2 ring-offset-2 ring-primary'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => deleteFolder(folderId)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              删除文件夹
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isCreatingChild && (
        <div
          className="flex items-center gap-1 py-0.5"
          style={{ paddingLeft: (depth + 1) * 16 + 12 }}
        >
          <Input
            autoFocus
            value={newChildName}
            onChange={(e) => setNewChildName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateChild()
              if (e.key === 'Escape') setIsCreatingChild(false)
            }}
            onBlur={handleCreateChild}
            placeholder="子文件夹名称"
            className="h-7 text-sm"
          />
        </div>
      )}

      {isExpanded &&
        children.map((child) => (
          <FolderItem key={child.id} folderId={child.id} depth={depth + 1} />
        ))}
    </div>
  )
}

export function FolderTree() {
  const folders = useFolderStore((s) => s.folders)
  const rootFolders = folders
    .filter((f) => f.parentId === null)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <div className="space-y-0.5">
      {rootFolders.map((folder) => (
        <FolderItem key={folder.id} folderId={folder.id} />
      ))}
    </div>
  )
}
