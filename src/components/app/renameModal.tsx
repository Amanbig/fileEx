"use client"

import { useState, useEffect, useRef } from "react"
import { invoke } from "@tauri-apps/api/core"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { FileItem } from "./fileStructure"

interface RenameModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: FileItem | null
  onRenamed: () => void
}

export default function RenameModal({
  open,
  onOpenChange,
  item,
  onRenamed,
}: RenameModalProps) {
  const [newName, setNewName] = useState("")
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && item) {
      setNewName(item.name)

      // Auto-select filename stem on next tick
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
          if (item.file_type === "file" && item.name.includes(".")) {
            const lastDotIndex = item.name.lastIndexOf(".")
            if (lastDotIndex > 0) {
              inputRef.current.setSelectionRange(0, lastDotIndex)
              return
            }
          }
          inputRef.current.select()
        }
      }, 50)
    }
  }, [open, item])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!item) return

    const trimmed = newName.trim()
    if (!trimmed) {
      toast.error("Name cannot be empty")
      return
    }

    if (trimmed === item.name) {
      onOpenChange(false)
      return
    }

    if (trimmed.includes("/") || trimmed.includes("\\")) {
      toast.error("Name cannot contain slashes (/ or \\)")
      return
    }

    setLoading(true)
    try {
      await invoke("rename_item", {
        oldPath: item.path,
        newName: trimmed,
      })
      toast.success(`Renamed to "${trimmed}"`)
      onOpenChange(false)
      onRenamed()
    } catch (err) {
      toast.error(`Failed to rename: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Rename {item?.file_type === "folder" ? "Folder" : "File"}</DialogTitle>
          <DialogDescription>
            Enter a new name for this item.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="item-new-name" className="text-xs">
              Name
            </Label>
            <Input
              id="item-new-name"
              ref={inputRef}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter name..."
              disabled={loading}
              className="text-sm font-medium"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || !newName.trim() || newName.trim() === item?.name}
            >
              {loading ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
