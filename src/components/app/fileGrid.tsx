"use client"

import React from "react"
import { FileItem } from "./fileStructure"
import { Checkbox } from "@/components/ui/checkbox"
import { truncateFilename } from "@/lib/utils"
import { 
  Folder, 
  File, 
  FileText, 
  FileImage, 
  FileAudio, 
  FileVideo, 
  FileArchive, 
  FileCode, 
  Copy, 
  Scissors, 
  Trash2, 
  ExternalLink,
  Info
} from "lucide-react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { toast } from "sonner"

interface FileGridProps {
  items: FileItem[]
  selectedPaths: string[]
  clickMode?: "single" | "double"
  onToggleSelect: (path: string, e: React.MouseEvent) => void
  onItemDoubleClick: (item: FileItem) => void
  onRename: (item: FileItem) => void
  onDelete: (item: FileItem) => void
  onProperties: (item: FileItem) => void
  onCopy: (paths: string[]) => void
  onCut: (paths: string[]) => void
}

const getLargeFileIcon = (file_type: string, extension: string | null) => {
  const iconClass = "h-11 w-11 shrink-0 drop-shadow-xs"

  if (file_type === "folder") {
    return <Folder className={`${iconClass} text-sky-500 fill-sky-500/20`} />
  }

  if (!extension) {
    return <File className={`${iconClass} text-muted-foreground`} />
  }

  const ext = extension.toLowerCase()

  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) {
    return <FileImage className={`${iconClass} text-emerald-500`} />
  }

  if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'].includes(ext)) {
    return <FileAudio className={`${iconClass} text-purple-500`} />
  }

  if (['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm'].includes(ext)) {
    return <FileVideo className={`${iconClass} text-rose-500`} />
  }

  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(ext)) {
    return <FileArchive className={`${iconClass} text-amber-500`} />
  }

  if (['js', 'ts', 'tsx', 'jsx', 'html', 'css', 'py', 'java', 'cpp', 'c', 'cs', 'go', 'rs', 'php', 'rb', 'swift', 'json', 'yaml', 'yml', 'toml'].includes(ext)) {
    return <FileCode className={`${iconClass} text-sky-600`} />
  }

  return <FileText className={`${iconClass} text-muted-foreground`} />
}

const formatFileSize = (bytes: number | null) => {
  if (bytes === null || bytes === undefined) return ""
  if (bytes === 0) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

export default function FileGrid({
  items,
  selectedPaths,
  clickMode = "single",
  onToggleSelect,
  onItemDoubleClick,
  onRename,
  onDelete,
  onProperties,
  onCopy,
  onCut,
}: FileGridProps) {
  const handleCardClick = (item: FileItem, e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('[data-slot="checkbox"], button')) {
      return
    }

    if (e.ctrlKey || e.metaKey || (e as any).shiftKey) {
      onToggleSelect(item.path, e)
      return
    }

    if (clickMode === "single" && item.file_type === "folder") {
      onItemDoubleClick(item)
    } else {
      onToggleSelect(item.path, e)
    }
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 p-3">
      {items.map((item) => {
        const isSelected = selectedPaths.includes(item.path)

        return (
          <ContextMenu key={item.path}>
            <ContextMenuTrigger asChild>
              <div
                onClick={(e) => handleCardClick(item, e)}
                onDoubleClick={() => onItemDoubleClick(item)}
                className={`group relative flex flex-col items-center justify-between p-3 rounded-lg border transition-all cursor-pointer select-none aspect-square text-center ${
                  isSelected
                    ? "bg-primary/10 border-primary ring-1 ring-primary shadow-xs"
                    : "bg-card hover:bg-accent/40 hover:border-border/80 border-border/50"
                }`}
              >
                {/* Top Actions Overlay */}
                <div className="w-full flex items-center justify-between pointer-events-none">
                  {/* Select Checkbox */}
                  <div 
                    className={`pointer-events-auto transition-opacity ${
                      isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelect(item.path, { ctrlKey: true } as any)}
                    />
                  </div>
                </div>

                {/* Center Icon */}
                <div className="my-auto py-1">
                  {getLargeFileIcon(item.file_type, item.extension)}
                </div>

                {/* Bottom Label and Size */}
                <div className="w-full space-y-0.5 overflow-hidden">
                  <p 
                    className="text-xs font-medium truncate w-full px-1"
                    title={item.name}
                  >
                    {truncateFilename(item.name, 18)}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {item.file_type === "folder" ? "Folder" : formatFileSize(item.size)}
                  </p>
                </div>
              </div>
            </ContextMenuTrigger>

            {/* Right-click Context Menu */}
            <ContextMenuContent className="w-48">
              <ContextMenuItem onClick={() => onItemDoubleClick(item)}>
                <ExternalLink className="h-3.5 w-3.5 mr-2" />
                {item.file_type === "folder" ? "Open Folder" : "Open"}
                <ContextMenuShortcut>↵</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => onCopy([item.path])}>
                <Copy className="h-3.5 w-3.5 mr-2" />
                Copy
                <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onCut([item.path])}>
                <Scissors className="h-3.5 w-3.5 mr-2" />
                Cut
                <ContextMenuShortcut>Ctrl+X</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem onClick={() => {
                navigator.clipboard.writeText(item.path)
                toast.success("Path copied to clipboard")
              }}>
                Copy Path
              </ContextMenuItem>
              <ContextMenuItem onClick={() => {
                navigator.clipboard.writeText(item.name)
                toast.success("Name copied to clipboard")
              }}>
                Copy Name
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => onRename(item)}>
                Rename
                <ContextMenuShortcut>F2</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onProperties(item)}>
                <Info className="h-3.5 w-3.5 mr-2" />
                Properties
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem 
                variant="destructive"
                onClick={() => onDelete(item)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete
                <ContextMenuShortcut>Del</ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        )
      })}
    </div>
  )
}
