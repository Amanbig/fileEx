"use client"

import { useState } from "react"
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
import { Trash2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { FileItem } from "./fileStructure"

interface DeleteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: FileItem | null
  onDeleted: () => void
}

export default function DeleteModal({
  open,
  onOpenChange,
  item,
  onDeleted,
}: DeleteModalProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!item) return

    setLoading(true)
    try {
      await invoke("delete_item", { path: item.path })
      toast.success(`Deleted "${item.name}"`)
      onOpenChange(false)
      onDeleted()
    } catch (err) {
      toast.error(`Failed to delete: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-1">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle>Confirm Deletion</DialogTitle>
          </div>
          <DialogDescription className="text-left pt-1 text-sm text-foreground/80">
            Are you sure you want to delete <span className="font-semibold text-foreground">"{item?.name}"</span>?
            {item?.file_type === "folder" && " All files and subfolders within this folder will be permanently removed."}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0 mt-4">
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
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={loading}
            className="gap-1.5"
          >
            <Trash2 className="h-4 w-4" />
            {loading ? "Deleting..." : "Delete Permanently"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
