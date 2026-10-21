"use client"

import { useState, useEffect } from "react"
import { invoke } from "@tauri-apps/api/core"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Copy, Check, ExternalLink, RefreshCw, Calendar, Shield, Folder, File } from "lucide-react"
import { toast } from "sonner"

export interface ItemProperties {
  name: string
  path: string
  file_type: "file" | "folder"
  extension: string | null
  size: number
  date_modified: string
  date_created: string | null
  is_readonly: boolean
  items_count: number | null
  permissions: string
}

interface PropertiesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemPath: string | null
  onNavigateToFolder?: (path: string) => void
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]} (${bytes.toLocaleString()} bytes)`
}

export default function PropertiesModal({ 
  open, 
  onOpenChange, 
  itemPath,
  onNavigateToFolder 
}: PropertiesModalProps) {
  const [properties, setProperties] = useState<ItemProperties | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (open && itemPath) {
      setLoading(true)
      invoke<ItemProperties>("get_item_properties", { path: itemPath })
        .then((res) => {
          setProperties(res)
        })
        .catch((err) => {
          toast.error(`Failed to load properties: ${err}`)
          onOpenChange(false)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setProperties(null)
    }
  }, [open, itemPath])

  const handleCopyPath = async () => {
    if (!properties) return
    try {
      await navigator.clipboard.writeText(properties.path)
      setCopied(true)
      toast.success("Path copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy path")
    }
  }

  const handleOpenItem = async () => {
    if (!properties) return
    if (properties.file_type === "folder") {
      onOpenChange(false)
      if (onNavigateToFolder) {
        onNavigateToFolder(properties.path)
      }
    } else {
      try {
        await invoke("open_file_with_default_app", { filePath: properties.path })
        toast.success("Opened file with default application")
        onOpenChange(false)
      } catch (err) {
        toast.error(`Failed to open: ${err}`)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            {properties?.file_type === "folder" ? (
              <Folder className="h-5 w-5 text-blue-500 shrink-0" />
            ) : (
              <File className="h-5 w-5 text-muted-foreground shrink-0" />
            )}
            <span className="truncate">{properties ? properties.name : "Properties"}</span>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground text-sm">
            <RefreshCw className="h-4 w-4 animate-spin text-primary" />
            <span>Loading properties...</span>
          </div>
        ) : properties ? (
          <div className="space-y-4 py-2 text-xs">
            {/* General Info */}
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Type:</span>
                <span className="col-span-2 font-medium capitalize">
                  {properties.file_type === "folder" 
                    ? "Directory Folder" 
                    : properties.extension 
                      ? `${properties.extension.toUpperCase()} File` 
                      : "File"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 items-start">
                <span className="text-muted-foreground">Location:</span>
                <div className="col-span-2 flex items-center gap-1 font-mono text-[11px] break-all bg-muted/30 p-1.5 rounded">
                  <span className="flex-1 select-all">{properties.path}</span>
                  <button
                    type="button"
                    onClick={handleCopyPath}
                    className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground shrink-0"
                    title="Copy location"
                  >
                    {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>

              {properties.file_type === "folder" ? (
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground">Contains:</span>
                  <span className="col-span-2 font-medium">
                    {properties.items_count !== null ? `${properties.items_count} direct item(s)` : "-"}
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground">Size:</span>
                  <span className="col-span-2 font-medium">
                    {formatBytes(properties.size)}
                  </span>
                </div>
              )}
            </div>

            <Separator />

            {/* Timestamps */}
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Modified:
                </span>
                <span className="col-span-2">
                  {new Date(properties.date_modified).toLocaleString()}
                </span>
              </div>

              {properties.date_created && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Created:
                  </span>
                  <span className="col-span-2">
                    {new Date(properties.date_created).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <Separator />

            {/* Permissions */}
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2 items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" /> Permissions:
                </span>
                <span className="col-span-2 font-mono text-[11px] bg-muted/40 px-2 py-0.5 rounded w-fit">
                  {properties.permissions}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Attributes:</span>
                <span className="col-span-2">
                  {properties.is_readonly ? "Read-only" : "Read & Write"}
                </span>
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenItem}
            disabled={!properties}
            className="gap-1.5"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {properties?.file_type === "folder" ? "Open Folder" : "Open File"}
          </Button>

          <Button
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
