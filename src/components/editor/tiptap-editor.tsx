'use client'

import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import {
  Star,
  Pin,
  Trash2,
  Tag,
  Plus,
  X,
  MoreHorizontal,
  FolderOpen,
  FileCode,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EditorToolbar } from './toolbar'
import { useNoteStore } from '@/stores/note-store'
import { useAppStore } from '@/stores/app-store'
import { useTagStore } from '@/stores/tag-store'
import { useFolderStore } from '@/stores/folder-store'
import type { EditorMode } from '@/types'

const lowlight = createLowlight(common)

export function TiptapEditor() {
  const { notes, updateNote, toggleFavorite, togglePin, deleteNote, addTag, removeTag } =
    useNoteStore()
  const { activeNoteId, editorMode, setEditorMode, setActiveNoteId, sidebarView } = useAppStore()
  const { tags, createTag, getTagById } = useTagStore()
  const { folders, getFolderById } = useFolderStore()

  const note = useMemo(
    () => notes.find((n) => n.id === activeNoteId),
    [notes, activeNoteId]
  )

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [title, setTitle] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [newTagName, setNewTagName] = useState('')
  const isUpdatingRef = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: '开始写点什么...',
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg',
        },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      CodeBlockLowlight.configure({ lowlight }),
    ],
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'tiptap max-w-none focus:outline-none min-h-[calc(100vh-14rem)] px-8 py-4',
      },
    },
    onUpdate: ({ editor }) => {
      if (isUpdatingRef.current) return
      const json = JSON.stringify(editor.getJSON())
      const text = editor.getText()
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0)
      setCharCount(text.length)

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        if (note) {
          updateNote(note.id, {
            content: json,
            contentText: text,
          })
        }
      }, 1000)
    },
  })

  // Load note content when active note changes
  useEffect(() => {
    if (!editor || !note) return
    isUpdatingRef.current = true
    setTitle(note.title)
    if (note.content) {
      try {
        const json = JSON.parse(note.content)
        editor.commands.setContent(json)
      } catch {
        editor.commands.setContent('')
      }
    } else {
      editor.commands.setContent('')
    }
    const text = editor.getText()
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0)
    setCharCount(text.length)
    isUpdatingRef.current = false
  }, [activeNoteId, editor])

  // Save title with debounce
  const handleTitleChange = useCallback(
    (value: string) => {
      setTitle(value)
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        if (note) {
          updateNote(note.id, { title: value })
        }
      }, 500)
    },
    [note, updateNote]
  )

  const handleAddTag = () => {
    if (!newTagName.trim() || !note) return
    const existing = tags.find(
      (t) => t.name.toLowerCase() === newTagName.trim().toLowerCase()
    )
    if (existing) {
      addTag(note.id, existing.id)
    } else {
      const tag = createTag(newTagName.trim())
      addTag(note.id, tag.id)
    }
    setNewTagName('')
  }

  // Empty state
  if (!note) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
        <FileText className="mb-4 h-12 w-12 opacity-30" />
        <p className="text-sm">选择一篇笔记开始编辑</p>
        <p className="mt-1 text-xs">或创建一篇新笔记</p>
      </div>
    )
  }

  const folder = note.folderId ? getFolderById(note.folderId) : null
  const noteTags = note.tagIds
    .map((id) => getTagById(id))
    .filter((t): t is NonNullable<typeof t> => t != null)

  return (
    <div className="flex h-full flex-col">
      {/* Note header */}
      <div className="flex items-center justify-between border-b border-border px-4 h-14">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {folder && (
            <span className="flex items-center gap-1">
              <FolderOpen className="h-3 w-3" style={{ color: folder.color }} />
              {folder.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Editor mode toggle */}
          <div className="mr-2 flex items-center rounded-lg border border-border bg-muted p-0.5">
            <button
              onClick={() => setEditorMode('richtext')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors',
                editorMode === 'richtext'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <FileText className="h-3 w-3" />
              富文本
            </button>
            <button
              onClick={() => setEditorMode('markdown')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors',
                editorMode === 'markdown'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <FileCode className="h-3 w-3" />
              Markdown
            </button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => togglePin(note.id)}
          >
            <Pin
              className={cn(
                'h-4 w-4',
                note.isPinned && 'fill-primary text-primary'
              )}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => toggleFavorite(note.id)}
          >
            <Star
              className={cn(
                'h-4 w-4',
                note.isFavorited && 'fill-yellow-400 text-yellow-400'
              )}
            />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  deleteNote(note.id)
                  setActiveNoteId(null)
                }}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除笔记
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Toolbar (only in richtext mode) */}
      {editorMode === 'richtext' && <EditorToolbar editor={editor} />}

      {/* Title */}
      <div className="px-8 pt-6">
        <input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="无标题"
          className="w-full bg-transparent text-3xl font-bold outline-none placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-1.5 px-8 py-2">
        {noteTags.map((tag) => (
          <Badge
            key={tag.id}
            variant="secondary"
            className="gap-1 text-xs"
          >
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: tag.color }}
            />
            {tag.name}
            <button
              onClick={() => removeTag(note.id, tag.id)}
              className="ml-0.5 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs text-muted-foreground">
              <Tag className="h-3 w-3" />
              添加标签
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="start">
            <div className="flex gap-1">
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTag()
                }}
                placeholder="标签名称"
                className="h-8 text-sm"
              />
              <Button size="sm" className="h-8" onClick={handleAddTag}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="mt-2 max-h-32 space-y-0.5 overflow-y-auto">
                {tags
                  .filter((t) => !note.tagIds.includes(t.id))
                  .map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => addTag(note.id, tag.id)}
                      className="flex w-full items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent"
                    >
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                    </button>
                  ))}
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between border-t border-border px-4 py-1.5 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>{charCount} 字符</span>
          <span>{wordCount} 词</span>
          <span>约 {Math.max(1, Math.ceil(charCount / 500))} 分钟阅读</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-500">已保存</span>
        </div>
      </div>
    </div>
  )
}
