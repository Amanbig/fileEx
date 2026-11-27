"use client"

import { useEffect, useState } from "react"
import { invoke } from "@tauri-apps/api/core"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ImageOff,
} from "lucide-react"
import { FileItem } from "./fileStructure"
import { getLocalAssetUrl } from "@/lib/utils"
import { toast } from "sonner"

interface ImagePreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: FileItem | null
  images: FileItem[]
  onSelectImage: (item: FileItem) => void
}

const formatFileSize = (bytes: number | null) => {
  if (bytes === null || bytes === undefined) return ""
  if (bytes === 0) return "0 B"
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`
}

export default function ImagePreviewModal({
  open,
  onOpenChange,
  item,
  images,
  onSelectImage,
}: ImagePreviewModalProps) {
  const [zoom, setZoom] = useState(1)
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)
  const [loadError, setLoadError] = useState(false)

  const currentIndex = item ? images.findIndex((img) => img.path === item.path) : -1
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex >= 0 && currentIndex < images.length - 1

  useEffect(() => {
    setZoom(1)
    setDimensions(null)
    setLoadError(false)
  }, [item?.path, open])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && hasPrev) {
        e.preventDefault()
        onSelectImage(images[currentIndex - 1])
      } else if (e.key === "ArrowRight" && hasNext) {
        e.preventDefault()
        onSelectImage(images[currentIndex + 1])
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault()
        setZoom((z) => Math.min(4, +(z + 0.25).toFixed(2)))
      } else if (e.key === "-") {
        e.preventDefault()
        setZoom((z) => Math.max(0.25, +(z - 0.25).toFixed(2)))
      } else if (e.key === "0") {
        e.preventDefault()
        setZoom(1)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, hasPrev, hasNext, currentIndex, images, onSelectImage])

  const handleOpenExternal = async () => {
    if (!item) return
    try {
      const result = await invoke<string>("open_file_with_default_app", {
        filePath: item.path,
      })
      toast.success(result)
    } catch (error) {
      toast.error(`Failed to open image externally: ${error}`)
    }
  }

  if (!item) return null

  const src = getLocalAssetUrl(item.path)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl w-[92vw] h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-md border-border">
        <DialogHeader className="px-4 py-3 border-b border-border/60 flex-row items-center justify-between space-y-0 pr-12">
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-sm font-semibold truncate" title={item.name}>
              {item.name}
            </DialogTitle>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
              {dimensions && (
                <span>
                  {dimensions.width} × {dimensions.height}
                </span>
              )}
              {item.size !== null && (
                <>
                  {dimensions && <span>•</span>}
                  <span>{formatFileSize(item.size)}</span>
                </>
              )}
              {images.length > 1 && currentIndex >= 0 && (
                <>
                  <span>•</span>
                  <span>
                    {currentIndex + 1} / {images.length}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setZoom((z) => Math.max(0.25, +(z - 0.25).toFixed(2)))}
              title="Zoom Out (-)"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs font-mono w-11 text-center text-muted-foreground select-none">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setZoom((z) => Math.min(4, +(z + 0.25).toFixed(2)))}
              title="Zoom In (+)"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setZoom(1)}
              title="Reset Zoom (0)"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-xs gap-1.5 ml-1"
              onClick={handleOpenExternal}
              title="Open with Default App"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Open App</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Image Viewport */}
        <div className="relative flex-1 min-h-0 flex items-center justify-center overflow-auto bg-black/5 dark:bg-black/40 p-4 select-none">
          {hasPrev && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full shadow-md opacity-80 hover:opacity-100"
              onClick={() => onSelectImage(images[currentIndex - 1])}
              title="Previous Image (←)"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}

          {loadError ? (
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <ImageOff className="h-10 w-10 opacity-60" />
              <p className="text-sm font-medium">Unable to render image preview</p>
              <Button variant="outline" size="sm" onClick={handleOpenExternal}>
                Open with Default App
              </Button>
            </div>
          ) : (
            <img
              src={src}
              alt={item.name}
              onLoad={(e) => {
                const img = e.currentTarget
                setDimensions({ width: img.naturalWidth, height: img.naturalHeight })
              }}
              onError={() => setLoadError(true)}
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "center center",
              }}
              className="max-w-full max-h-full object-contain rounded shadow-sm transition-transform duration-150"
              draggable={false}
            />
          )}

          {hasNext && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full shadow-md opacity-80 hover:opacity-100"
              onClick={() => onSelectImage(images[currentIndex + 1])}
              title="Next Image (→)"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
