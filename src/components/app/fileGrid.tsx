"use client"

import React from "react"
import { invoke } from "@tauri-apps/api/core"
import { FileItem } from "./fileStructure"
import { Checkbox } from "@/components/ui/checkbox"
import { truncateFilename, isImageExtension, getLocalAssetUrl } from "@/lib/utils"
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
  Info,
  Terminal,
  Eye
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

const MAX_INLINE_THUMBNAIL_BYTES = 15 * 1024 * 1024 // 15 MB cap to keep Grid view RAM low

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
  const [failedThumbnails, setFailedThumbnails] = React.useState<Record<string, boolean>>({})

  // Clear thumbnail error cache when directory items change to prevent unbounded state growth
  React.useEffect(() => {
    setFailedThumbnails({})
  }, [items])

  const handleCardClick = (item: FileItem, e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('[data-slot="checkbox"], button')) {
      return
    }

    if (e.ctrlKey || e.metaKey || (e as any).shiftKey) {
      onToggleSelect(item.path, e)
      return
    }

    if (clickMode === "single") {
      onItemDoubleClick(item)
    } else {
      onToggleSelect(item.path, e)
    }
  }

  const handleOpenExternal = async (item: FileItem) => {
    try {
      const result = await invoke<string>("open_file_with_default_app", { filePath: item.path })
      toast.success(result)
    } catch (error) {
      toast.error(`Failed to open file: ${error}`)
    }
  }

  const handleOpenTerminal = async (path: string) => {
    try {
      const res = await invoke<string>("open_terminal", { path })
      toast.success(res)
    } catch (err: any) {
      toast.error(`Terminal error: ${err.message || err}`)
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
                onDoubleClick={() => {
                  if (clickMode === "double") {
                    onItemDoubleClick(item)
                  }
                }}
                className={`group relative flex flex-col items-center justify-between p-3 rounded-lg border transition-all cursor-pointer select-none aspect-square text-center [content-visibility:auto] [contain-intrinsic-size:160px] ${
                  isSelected
                    ? "bg-primary/15 border-primary ring-2 ring-primary/40 shadow-sm"
                    : "bg-card hover:bg-card/90 border-border/70 dark:border-white/10 hover:border-border hover:shadow-md hover:-translate-y-0.5 shadow-xs transition-all duration-150"
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

                {/* Center Icon or Image Thumbnail */}
                <div className="my-auto py-1 flex items-center justify-center w-full h-14 overflow-hidden">
                  {item.file_type === "file" &&
                  isImageExtension(item.extension) &&
                  (item.size === null || item.size <= MAX_INLINE_THUMBNAIL_BYTES) &&
                  !failedThumbnails[item.path] ? (
                    <img
                      src={getLocalAssetUrl(item.path)}
                      alt={item.name}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      onError={() =>
                        setFailedThumbnails((prev) => ({ ...prev, [item.path]: true }))
                      }
                      className="max-h-14 max-w-full rounded object-cover shadow-xs"
                    />
                  ) : (
                    getLargeFileIcon(item.file_type, item.extension)
                  )}
                </div>

                {/* Bottom Label and Size */}
                <div className="w-full space-y-0.5 overflow-hidden">
                  <p 
                    className={`text-xs font-medium truncate w-full px-1 ${
                      clickMode === "single" ? "group-hover:underline" : ""
                    }`}
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
                {item.file_type === "file" && isImageExtension(item.extension) ? (
                  <Eye className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                ) : (
                  <ExternalLink className="h-3.5 w-3.5 mr-2" />
                )}
                {item.file_type === "folder"
                  ? "Open Folder"
                  : isImageExtension(item.extension)
                    ? "Preview Image"
                    : "Open"}
                <ContextMenuShortcut>↵</ContextMenuShortcut>
              </ContextMenuItem>
              {item.file_type === "file" && isImageExtension(item.extension) && (
                <ContextMenuItem onClick={() => handleOpenExternal(item)}>
                  <ExternalLink className="h-3.5 w-3.5 mr-2" />
                  Open with Default App
                </ContextMenuItem>
              )}
              {item.file_type === "folder" && (
                <ContextMenuItem onClick={() => handleOpenTerminal(item.path)}>
                  <Terminal className="h-3.5 w-3.5 mr-2 text-primary" />
                  Open in Terminal
                </ContextMenuItem>
              )}
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
