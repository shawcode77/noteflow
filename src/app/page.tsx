'use client'

import { useEffect, useState } from 'react'
import { PanelLeftClose, PanelLeft, Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sidebar } from '@/components/layout/sidebar'
import { NoteList } from '@/components/notes/note-list'
import { TiptapEditor } from '@/components/editor/tiptap-editor'
import { useAppStore } from '@/stores/app-store'
import { cn } from '@/lib/utils'

export default function Home() {
  const { sidebarOpen, toggleSidebar } = useAppStore()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          'h-full shrink-0 border-r border-border transition-all duration-300',
          sidebarOpen ? 'w-[260px]' : 'w-0'
        )}
      >
        {sidebarOpen && <Sidebar />}
      </div>

      {/* Main content */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Sidebar toggle */}
        <div className="absolute left-2 top-2 z-10 flex items-center gap-1">
          {!sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={toggleSidebar}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        {sidebarOpen && (
          <div className="absolute left-[228px] top-3 z-10">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={toggleSidebar}
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Theme toggle - top right */}
        <div className="absolute right-3 top-3 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                {theme === 'dark' ? (
                  <Moon className="h-4 w-4" />
                ) : theme === 'light' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Monitor className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="mr-2 h-4 w-4" />
                浅色
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="mr-2 h-4 w-4" />
                深色
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Monitor className="mr-2 h-4 w-4" />
                跟随系统
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Note list panel */}
        <div className="h-full w-[300px] shrink-0">
          <NoteList />
        </div>

        {/* Editor panel */}
        <div className="flex-1 overflow-hidden">
          <TiptapEditor />
        </div>
      </div>
    </div>
  )
}
