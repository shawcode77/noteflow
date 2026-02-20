'use client'

import type { Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Minus,
  CodeSquare,
  Table,
  Image,
  Link,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ToolbarProps {
  editor: Editor | null
}

interface ToolbarAction {
  icon: React.ElementType
  label: string
  shortcut?: string
  action: (editor: Editor) => void
  isActive?: (editor: Editor) => boolean
  type?: 'button' | 'separator'
}

const TOOLBAR_GROUPS: ToolbarAction[][] = [
  [
    {
      icon: Undo,
      label: '撤销',
      shortcut: 'Ctrl+Z',
      action: (e) => e.chain().focus().undo().run(),
    },
    {
      icon: Redo,
      label: '重做',
      shortcut: 'Ctrl+Shift+Z',
      action: (e) => e.chain().focus().redo().run(),
    },
  ],
  [
    {
      icon: Heading1,
      label: '标题 1',
      action: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: (e) => e.isActive('heading', { level: 1 }),
    },
    {
      icon: Heading2,
      label: '标题 2',
      action: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: (e) => e.isActive('heading', { level: 2 }),
    },
    {
      icon: Heading3,
      label: '标题 3',
      action: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: (e) => e.isActive('heading', { level: 3 }),
    },
  ],
  [
    {
      icon: Bold,
      label: '加粗',
      shortcut: 'Ctrl+B',
      action: (e) => e.chain().focus().toggleBold().run(),
      isActive: (e) => e.isActive('bold'),
    },
    {
      icon: Italic,
      label: '斜体',
      shortcut: 'Ctrl+I',
      action: (e) => e.chain().focus().toggleItalic().run(),
      isActive: (e) => e.isActive('italic'),
    },
    {
      icon: Underline,
      label: '下划线',
      shortcut: 'Ctrl+U',
      action: (e) => e.chain().focus().toggleUnderline().run(),
      isActive: (e) => e.isActive('underline'),
    },
    {
      icon: Strikethrough,
      label: '删除线',
      action: (e) => e.chain().focus().toggleStrike().run(),
      isActive: (e) => e.isActive('strike'),
    },
    {
      icon: Highlighter,
      label: '高亮',
      action: (e) => e.chain().focus().toggleHighlight().run(),
      isActive: (e) => e.isActive('highlight'),
    },
    {
      icon: Code,
      label: '行内代码',
      action: (e) => e.chain().focus().toggleCode().run(),
      isActive: (e) => e.isActive('code'),
    },
  ],
  [
    {
      icon: AlignLeft,
      label: '左对齐',
      action: (e) => e.chain().focus().setTextAlign('left').run(),
      isActive: (e) => e.isActive({ textAlign: 'left' }),
    },
    {
      icon: AlignCenter,
      label: '居中',
      action: (e) => e.chain().focus().setTextAlign('center').run(),
      isActive: (e) => e.isActive({ textAlign: 'center' }),
    },
    {
      icon: AlignRight,
      label: '右对齐',
      action: (e) => e.chain().focus().setTextAlign('right').run(),
      isActive: (e) => e.isActive({ textAlign: 'right' }),
    },
  ],
  [
    {
      icon: List,
      label: '无序列表',
      action: (e) => e.chain().focus().toggleBulletList().run(),
      isActive: (e) => e.isActive('bulletList'),
    },
    {
      icon: ListOrdered,
      label: '有序列表',
      action: (e) => e.chain().focus().toggleOrderedList().run(),
      isActive: (e) => e.isActive('orderedList'),
    },
    {
      icon: ListChecks,
      label: '待办清单',
      action: (e) => e.chain().focus().toggleTaskList().run(),
      isActive: (e) => e.isActive('taskList'),
    },
  ],
  [
    {
      icon: Quote,
      label: '引用',
      action: (e) => e.chain().focus().toggleBlockquote().run(),
      isActive: (e) => e.isActive('blockquote'),
    },
    {
      icon: Minus,
      label: '分隔线',
      action: (e) => e.chain().focus().setHorizontalRule().run(),
    },
    {
      icon: CodeSquare,
      label: '代码块',
      action: (e) => e.chain().focus().toggleCodeBlock().run(),
      isActive: (e) => e.isActive('codeBlock'),
    },
    {
      icon: Table,
      label: '表格',
      action: (e) =>
        e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
  ],
  [
    {
      icon: Link,
      label: '链接',
      action: (e) => {
        const url = window.prompt('输入链接地址:')
        if (url) {
          e.chain().focus().setLink({ href: url }).run()
        }
      },
      isActive: (e) => e.isActive('link'),
    },
    {
      icon: Image,
      label: '图片',
      action: (e) => {
        const url = window.prompt('输入图片地址:')
        if (url) {
          e.chain().focus().setImage({ src: url }).run()
        }
      },
    },
  ],
]

export function EditorToolbar({ editor }: ToolbarProps) {
  if (!editor) return null

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1.5">
      {TOOLBAR_GROUPS.map((group, groupIndex) => (
        <div key={groupIndex} className="flex items-center gap-0.5">
          {groupIndex > 0 && (
            <Separator orientation="vertical" className="mx-1 h-6" />
          )}
          {group.map((item, itemIndex) => {
            const active = item.isActive?.(editor) ?? false
            return (
              <Tooltip key={itemIndex}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-8 w-8',
                      active && 'bg-accent text-accent-foreground'
                    )}
                    onClick={() => item.action(editor)}
                  >
                    <item.icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {item.label}
                  {item.shortcut && (
                    <span className="ml-2 text-muted-foreground">{item.shortcut}</span>
                  )}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      ))}
    </div>
  )
}
