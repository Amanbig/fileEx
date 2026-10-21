"use client"

import * as React from "react"
import { invoke } from "@tauri-apps/api/core"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
  ColumnSizingState,
} from "@tanstack/react-table"
import { 
  ArrowUpDown, 
  ChevronDown, 
  MoreHorizontal, 
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Home,
  RefreshCw,
  Copy,
  Check,
  Search,
  ChevronRight,
  Edit2,
  LayoutList,
  LayoutGrid,
  Scissors,
  Trash2,
  ExternalLink,
  Info,
  FolderPlus,
  FilePlus
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import CommandsPallet, { getClipboardState, setClipboardState, executePaste } from "./commandsPallet"
import PlacesSidebar from "./placesSidebar"
import PropertiesModal from "./propertiesModal"
import RenameModal from "./renameModal"
import DeleteModal from "./deleteModal"
import FileGrid from "./fileGrid"
import { truncateFilename } from "@/lib/utils"
import { useAppSettings } from "@/hooks/useAppSettings"
import { toast } from "sonner"
import { 
  FaFolder, FaFile, FaFileImage, FaFileAudio, FaFileVideo, FaFileArchive, FaFileCode, 
  FaFileExcel, FaFileWord, FaFilePowerpoint, FaFilePdf, FaFileAlt, FaDatabase 
} from "react-icons/fa"

export type FileItem = {
  id: string
  name: string
  file_type: "file" | "folder"
  size: number | null
  date_modified: string
  extension: string | null
  path: string
}

const getFileIcon = (file_type: string, extension: string | null) => {
  if (file_type === "folder") return <FaFolder className="h-4 w-4 text-blue-500 shrink-0" />
  
  if (!extension) return <FaFile className="h-4 w-4 text-muted-foreground shrink-0" />
  
  const ext = extension.toLowerCase()
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) {
    return <FaFileImage className="h-4 w-4 text-emerald-500 shrink-0" />
  }

  if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'].includes(ext)) {
    return <FaFileAudio className="h-4 w-4 text-purple-500 shrink-0" />
  }

  if (['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm'].includes(ext)) {
    return <FaFileVideo className="h-4 w-4 text-rose-500 shrink-0" />
  }

  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(ext)) {
    return <FaFileArchive className="h-4 w-4 text-amber-500 shrink-0" />
  }

  if (['js', 'ts', 'tsx', 'jsx', 'html', 'css', 'py', 'java', 'cpp', 'c', 'cs', 'go', 'rs', 'php', 'rb', 'swift', 'json', 'yaml', 'yml', 'toml'].includes(ext)) {
    return <FaFileCode className="h-4 w-4 text-sky-600 shrink-0" />
  }

  if (['xlsx', 'xls', 'csv'].includes(ext)) {
    return <FaFileExcel className="h-4 w-4 text-green-600 shrink-0" />
  }

  if (['doc', 'docx', 'odt'].includes(ext)) {
    return <FaFileWord className="h-4 w-4 text-blue-700 shrink-0" />
  }

  if (['ppt', 'pptx', 'odp'].includes(ext)) {
    return <FaFilePowerpoint className="h-4 w-4 text-orange-600 shrink-0" />
  }

  if (['pdf'].includes(ext)) {
    return <FaFilePdf className="h-4 w-4 text-red-600 shrink-0" />
  }

  if (['txt', 'md', 'rtf', 'log', 'ini', 'conf'].includes(ext)) {
    return <FaFileAlt className="h-4 w-4 text-gray-500 shrink-0" />
  }

  if (['sql', 'db', 'sqlite', 'mongodb'].includes(ext)) {
    return <FaDatabase className="h-4 w-4 text-amber-600 shrink-0" />
  }

  return <FaFile className="h-4 w-4 text-muted-foreground shrink-0" />
}

const formatFileSize = (bytes: number | null) => {
  if (bytes === null || bytes === undefined) return ""
  if (bytes === 0) return '0 B'
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

interface BreadcrumbSegment {
  name: string
  path: string
}

function parseBreadcrumbs(fullPath: string): BreadcrumbSegment[] {
  if (!fullPath) return []
  const isWindows = fullPath.includes("\\") && !fullPath.startsWith("/")
  const separator = isWindows ? "\\" : "/"

  if (fullPath === "/") {
    return [{ name: "Root (/)", path: "/" }]
  }

  const parts = fullPath.split(separator).filter(Boolean)
  const segments: BreadcrumbSegment[] = []

  let accumulated = isWindows ? "" : "/"

  if (!isWindows) {
    segments.push({ name: "/", path: "/" })
  }

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (isWindows && i === 0) {
      accumulated = part + "\\"
      segments.push({ name: part, path: accumulated })
    } else {
      accumulated = isWindows
        ? (accumulated.endsWith("\\") ? accumulated + part : accumulated + "\\" + part)
        : (accumulated === "/" ? "/" + part : accumulated + "/" + part)
      segments.push({ name: part, path: accumulated })
    }
  }

  return segments
}

export function FileStructure() {
  const { settings } = useAppSettings()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [currentPath, setCurrentPath] = React.useState("")
  const [pathInput, setPathInput] = React.useState("")
  const [isEditingPath, setIsEditingPath] = React.useState(false)
  const [copiedPath, setCopiedPath] = React.useState(false)
  const [data, setData] = React.useState<FileItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [navigationHistory, setNavigationHistory] = React.useState<string[]>([])
  const [historyIndex, setHistoryIndex] = React.useState(-1)
  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>({
    name: 300,
    date_modified: 130,
    file_type: 90,
    size: 100,
    actions: 50,
  })

  // View mode: "table" or "grid"
  const [viewMode, setViewMode] = React.useState<"table" | "grid">(() => {
    try {
      return (localStorage.getItem("fileex_view_mode") as "table" | "grid") || "table"
    } catch {
      return "table"
    }
  })

  // Modal states for Native Dialogs & Properties
  const [propertiesPath, setPropertiesPath] = React.useState<string | null>(null)
  const [propertiesOpen, setPropertiesOpen] = React.useState(false)
  const [renameItem, setRenameItem] = React.useState<FileItem | null>(null)
  const [renameOpen, setRenameOpen] = React.useState(false)
  const [deleteItem, setDeleteItem] = React.useState<FileItem | null>(null)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  // Canvas new folder / new file modal states
  const [newFolderDialogOpen, setNewFolderDialogOpen] = React.useState(false)
  const [newFolderInput, setNewFolderInput] = React.useState("")
  const [newFileDialogOpen, setNewFileDialogOpen] = React.useState(false)
  const [newFileInput, setNewFileInput] = React.useState("")

  const pathInputRef = React.useRef<HTMLInputElement>(null)

  const handleToggleViewMode = (mode: "table" | "grid") => {
    setViewMode(mode)
    try {
      localStorage.setItem("fileex_view_mode", mode)
    } catch (e) {
      console.error(e)
    }
  }

  // Load initial directory
  React.useEffect(() => {
    const loadInitialDirectory = async () => {
      try {
        const homeDir = await invoke<string>("get_home_directory")
        setCurrentPath(homeDir)
        setPathInput(homeDir)
        const files = await invoke<FileItem[]>("list_directory", { path: homeDir })
        setData(files)
        setNavigationHistory([homeDir])
        setHistoryIndex(0)
      } catch (error) {
        console.error("Failed to load initial directory:", error)
        try {
          const currentDir = await invoke<string>("get_current_directory")
          setCurrentPath(currentDir)
          setPathInput(currentDir)
          const files = await invoke<FileItem[]>("list_directory", { path: currentDir })
          setData(files)
          setNavigationHistory([currentDir])
          setHistoryIndex(0)
        } catch (fallbackError) {
          console.error("Failed to load current directory:", fallbackError)
        }
      } finally {
        setLoading(false)
      }
    }

    loadInitialDirectory()
  }, [])

  // Auto-focus input when entering edit mode
  React.useEffect(() => {
    if (isEditingPath && pathInputRef.current) {
      pathInputRef.current.focus()
      pathInputRef.current.select()
    }
  }, [isEditingPath])

  // Navigate to a new path
  const navigateToPath = async (path: string, addToHistory = true) => {
    if (!path) return
    setLoading(true)
    try {
      const files = await invoke<FileItem[]>("navigate_to_path", { path })
      setData(files)
      setCurrentPath(path)
      setPathInput(path)
      setRowSelection({})
      
      if (addToHistory) {
        const newHistory = navigationHistory.slice(0, historyIndex + 1)
        newHistory.push(path)
        setNavigationHistory(newHistory)
        setHistoryIndex(newHistory.length - 1)
      }
    } catch (error) {
      console.error("Failed to navigate to path:", error)
      toast.error(`Failed to navigate to: ${path}`)
    } finally {
      setLoading(false)
    }
  }

  // Navigate back in history
  const navigateBack = async () => {
    if (historyIndex > 0) {
      const previousPath = navigationHistory[historyIndex - 1]
      setHistoryIndex(historyIndex - 1)
      await navigateToPath(previousPath, false)
    }
  }

  // Navigate forward in history
  const navigateForward = async () => {
    if (historyIndex < navigationHistory.length - 1) {
      const nextPath = navigationHistory[historyIndex + 1]
      setHistoryIndex(historyIndex + 1)
      await navigateToPath(nextPath, false)
    }
  }

  // Navigate up one folder level
  const navigateUp = async () => {
    if (!currentPath || currentPath === "/" || /^[a-zA-Z]:\\?$/.test(currentPath)) return
    const isWindows = currentPath.includes("\\") && !currentPath.startsWith("/")
    const separator = isWindows ? "\\" : "/"
    const parts = currentPath.split(separator).filter(Boolean)

    if (parts.length <= 1) {
      const rootPath = isWindows ? (parts[0] + "\\") : "/"
      if (currentPath !== rootPath) {
        await navigateToPath(rootPath)
      }
      return
    }

    parts.pop()
    const parentPath = isWindows
      ? parts[0] + "\\" + parts.slice(1).join("\\")
      : "/" + parts.join("/")
    await navigateToPath(parentPath)
  }

  // Navigate to home directory
  const navigateHome = async () => {
    try {
      const homeDir = await invoke<string>("get_home_directory")
      await navigateToPath(homeDir)
    } catch (error) {
      console.error("Failed to navigate to home:", error)
    }
  }

  // Copy current path to clipboard
  const handleCopyCurrentPath = async () => {
    if (!currentPath) return
    try {
      await navigator.clipboard.writeText(currentPath)
      setCopiedPath(true)
      toast.success("Path copied to clipboard")
      setTimeout(() => setCopiedPath(false), 2000)
    } catch {
      toast.error("Failed to copy path")
    }
  }

  // Handle double-click on folder or file
  const handleItemDoubleClick = async (item: FileItem) => {
    if (item.file_type === "folder") {
      navigateToPath(item.path)
    } else {
      try {
        const result = await invoke<string>("open_file_with_default_app", { filePath: item.path })
        toast.success(result)
      } catch (error) {
        toast.error(`Failed to open file: ${error}`)
      }
    }
  }

  // Refresh current directory
  const handleRefresh = () => {
    if (currentPath) {
      navigateToPath(currentPath, false)
    }
  }

  // Handle items deleted
  const handleItemsDeleted = () => {
    setRowSelection({})
  }

  // Handle Canvas New Folder
  const handleCanvasCreateFolder = async () => {
    const trimmed = newFolderInput.trim()
    if (!trimmed) {
      toast.error("Please enter a folder name")
      return
    }
    try {
      await invoke("create_folder", { path: currentPath, name: trimmed })
      toast.success(`Created folder "${trimmed}"`)
      setNewFolderInput("")
      setNewFolderDialogOpen(false)
      handleRefresh()
    } catch (err) {
      toast.error(`Failed to create folder: ${err}`)
    }
  }

  // Handle Canvas New File
  const handleCanvasCreateFile = async () => {
    const trimmed = newFileInput.trim()
    if (!trimmed) {
      toast.error("Please enter a file name")
      return
    }
    try {
      await invoke("create_file", { path: currentPath, name: trimmed })
      toast.success(`Created file "${trimmed}"`)
      setNewFileInput("")
      setNewFileDialogOpen(false)
      handleRefresh()
    } catch (err) {
      toast.error(`Failed to create file: ${err}`)
    }
  }

  // Handle Clipboard Copy
  const handleCopyItems = (paths: string[]) => {
    if (paths.length === 0) return
    setClipboardState(paths, 'copy')
    navigator.clipboard.writeText(paths.join("\n"))
    toast.success(`Copied ${paths.length} item(s) to clipboard`)
  }

  // Handle Clipboard Cut
  const handleCutItems = (paths: string[]) => {
    if (paths.length === 0) return
    setClipboardState(paths, 'cut')
    toast.success(`Cut ${paths.length} item(s) to clipboard`)
  }

  // Handle Clipboard Paste
  const handlePasteItems = () => {
    executePaste(currentPath, handleRefresh)
  }

  // Columns definition for Table view
  const columns: ColumnDef<FileItem>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const fileItem = row.original
        const displayName = truncateFilename(fileItem.name, 34)
        return (
          <div 
            className={`flex items-center gap-2 min-w-0 max-w-[280px] sm:max-w-[380px] md:max-w-[480px] overflow-hidden ${fileItem.file_type === "folder" ? "cursor-pointer group" : ""}`}
            onClick={(e) => {
              if (fileItem.file_type === "folder" && !e.ctrlKey && !e.metaKey && !(e as any).shiftKey) {
                e.stopPropagation()
                navigateToPath(fileItem.path)
              }
            }}
          >
            {getFileIcon(fileItem.file_type, fileItem.extension)}
            <span 
              className={`truncate font-medium text-sm ${fileItem.file_type === "folder" ? "group-hover:underline text-foreground" : ""}`} 
              title={fileItem.name}
            >
              {displayName}
            </span>
          </div>
        )
      },
      size: 300,
    },
    {
      accessorKey: "date_modified",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date Modified
            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const dateString = row.getValue("date_modified") as string
        const date = new Date(dateString)
        return (
          <span className="text-muted-foreground text-xs whitespace-nowrap">
            {isNaN(date.getTime()) ? "-" : date.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
          </span>
        )
      },
      size: 130,
    },
    {
      accessorKey: "file_type",
      header: "Type",
      cell: ({ row }) => {
        const fileItem = row.original
        if (fileItem.file_type === "folder") {
          return <span className="text-muted-foreground text-xs font-normal">Folder</span>
        }
        return (
          <span className="text-muted-foreground text-xs uppercase font-normal">
            {fileItem.extension ? `${fileItem.extension} file` : "File"}
          </span>
        )
      },
      size: 90,
    },
    {
      accessorKey: "size",
      header: () => <div className="text-right">Size</div>,
      cell: ({ row }) => {
        const size = row.getValue("size") as number | null
        return <div className="text-right text-xs text-muted-foreground">{formatFileSize(size)}</div>
      },
      size: 90,
    },
    {
      id: "actions",
      enableHiding: false,
      size: 44,
      cell: ({ row }) => {
        const fileItem = row.original

        const handleOpen = async () => {
          if (fileItem.file_type === "folder") {
            navigateToPath(fileItem.path)
          } else {
            try {
              const result = await invoke<string>("open_file_with_default_app", { filePath: fileItem.path })
              toast.success(result)
            } catch (error) {
              toast.error(`Failed to open file: ${error}`)
            }
          }
        }

        const handleRename = () => {
          setRenameItem(fileItem)
          setRenameOpen(true)
        }

        const handleDelete = () => {
          setDeleteItem(fileItem)
          setDeleteOpen(true)
        }

        const handleProperties = () => {
          setPropertiesPath(fileItem.path)
          setPropertiesOpen(true)
        }

        const handleCopyPath = () => {
          navigator.clipboard.writeText(fileItem.path)
            .then(() => toast.success("Path copied to clipboard"))
            .catch(() => toast.error("Failed to copy path"))
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-7 w-7 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={handleOpen}>
                {fileItem.file_type === "folder" ? "Open Folder" : "Open File"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCopyPath}>
                Copy Path
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(fileItem.name)}
              >
                Copy Name
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleRename}>
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleProperties}>
                Properties
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={handleDelete}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const displayedData = React.useMemo(() => {
    if (settings.showHiddenFiles) return data
    return data.filter(item => !item.name.startsWith('.'))
  }, [data, settings.showHiddenFiles])

  const table = useReactTable({
    data: displayedData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    columnResizeMode: 'onChange',
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      columnSizing,
    },
  })

  // Selected items calculation
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedItemPaths = selectedRows.map(row => row.original.path)
  const selectedCount = selectedRows.length
  const totalSelectedBytes = selectedRows.reduce((acc, row) => acc + (row.original.size || 0), 0)

  // Folder and file count
  const folderCount = React.useMemo(() => displayedData.filter(item => item.file_type === "folder").length, [displayedData])
  const fileCount = displayedData.length - folderCount
  const breadcrumbs = React.useMemo(() => parseBreadcrumbs(currentPath), [currentPath])

  const isAtRoot = !currentPath || currentPath === "/" || /^[a-zA-Z]:\\?$/.test(currentPath)

  // Grid Selection Handler
  const handleToggleGridSelect = (path: string, e: React.MouseEvent) => {
    const row = table.getRowModel().rows.find(r => r.original.path === path)
    if (!row) return

    if (e.ctrlKey || e.metaKey || (e as any).shiftKey) {
      row.toggleSelected()
    } else {
      table.resetRowSelection()
      row.toggleSelected(true)
    }
  }

  // Global Keyboard Shortcuts Listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (['INPUT', 'TEXTAREA'].includes(target?.tagName) || target?.isContentEditable) {
        return
      }

      const selected = table.getFilteredSelectedRowModel().rows.map(r => r.original)

      // Ctrl + A / Cmd + A: Select All
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        table.toggleAllPageRowsSelected(true)
        return
      }

      // Ctrl + C / Cmd + C: Copy
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        if (selected.length > 0) {
          e.preventDefault()
          handleCopyItems(selected.map(i => i.path))
        }
        return
      }

      // Ctrl + X / Cmd + X: Cut
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x') {
        if (selected.length > 0) {
          e.preventDefault()
          handleCutItems(selected.map(i => i.path))
        }
        return
      }

      // Ctrl + V / Cmd + V: Paste
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault()
        handlePasteItems()
        return
      }

      // Delete key: Delete selected item(s)
      if (e.key === 'Delete') {
        if (selected.length === 1) {
          e.preventDefault()
          setDeleteItem(selected[0])
          setDeleteOpen(true)
        }
        return
      }

      // F2: Rename single selected item
      if (e.key === 'F2') {
        if (selected.length === 1) {
          e.preventDefault()
          setRenameItem(selected[0])
          setRenameOpen(true)
        }
        return
      }

      // Enter: Open single selected item
      if (e.key === 'Enter') {
        if (selected.length === 1) {
          e.preventDefault()
          handleItemDoubleClick(selected[0])
        }
        return
      }

      // Alt + Left: Navigate Back
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault()
        navigateBack()
        return
      }

      // Alt + Right: Navigate Forward
      if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault()
        navigateForward()
        return
      }

      // Alt + Up: Navigate Up
      if (e.altKey && e.key === 'ArrowUp') {
        e.preventDefault()
        navigateUp()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [table, currentPath, historyIndex, navigationHistory])

  // Get filtered items for Grid View
  const filteredGridItems = React.useMemo(() => {
    return table.getRowModel().rows.map(r => r.original)
  }, [table.getRowModel().rows])

  // Single click row handler: open folders directly or select files
  const handleRowClick = (item: FileItem, row: any, e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('[data-slot="checkbox"], [data-slot="dropdown-menu-trigger"], button')) {
      return
    }

    if (e.ctrlKey || e.metaKey || (e as any).shiftKey) {
      row.toggleSelected()
      return
    }

    if (item.file_type === "folder") {
      navigateToPath(item.path)
    } else {
      table.resetRowSelection()
      row.toggleSelected(true)
    }
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-background">
      {/* Commands Palette Toolbar */}
      <CommandsPallet
        currentPath={currentPath}
        selectedItems={selectedItemPaths}
        onRefresh={handleRefresh}
        onItemsDeleted={handleItemsDeleted}
      />
      
      {/* Body: Sidebar + Main Content */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Quick Access Sidebar */}
        <PlacesSidebar
          currentPath={currentPath}
          onNavigate={(path) => navigateToPath(path)}
        />

        {/* Main Explorer View */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* Navigation and Breadcrumbs Bar */}
          <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/20 flex-shrink-0">
            {/* Navigation History & Direction Buttons */}
            <div className="flex items-center gap-0.5">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={navigateBack}
                disabled={loading || historyIndex <= 0}
                className="h-8 w-8 p-0"
                title="Back (Alt+Left)"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <Button 
                variant="ghost" 
                size="sm"
                onClick={navigateForward}
                disabled={loading || historyIndex >= navigationHistory.length - 1}
                className="h-8 w-8 p-0"
                title="Forward (Alt+Right)"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Button 
                variant="ghost" 
                size="sm"
                onClick={navigateUp}
                disabled={loading || isAtRoot}
                className="h-8 w-8 p-0"
                title="Up to parent folder (Alt+Up)"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>

              <Button 
                variant="ghost" 
                size="sm"
                onClick={navigateHome}
                disabled={loading}
                className="h-8 w-8 p-0"
                title="Home"
              >
                <Home className="h-4 w-4" />
              </Button>

              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="h-8 w-8 p-0"
                title="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {/* Breadcrumb Path Bar with Direct Edit Mode */}
            <div className="flex-1 min-w-0 flex items-center bg-background border rounded-md px-2 h-8 shadow-xs focus-within:ring-1 focus-within:ring-ring">
              {isEditingPath ? (
                <div className="flex items-center w-full gap-1">
                  <Input
                    ref={pathInputRef}
                    value={pathInput}
                    onChange={(e) => setPathInput(e.target.value)}
                    onBlur={() => {
                      setIsEditingPath(false)
                      setPathInput(currentPath)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setIsEditingPath(false)
                        navigateToPath(pathInput.trim())
                      } else if (e.key === "Escape") {
                        setIsEditingPath(false)
                        setPathInput(currentPath)
                      }
                    }}
                    className="h-7 border-0 p-0 shadow-none font-mono text-xs focus-visible:ring-0"
                    placeholder="Enter path and press Enter..."
                  />
                </div>
              ) : (
                <div 
                  className="flex items-center gap-1 w-full overflow-x-auto no-scrollbar cursor-pointer py-1 select-none"
                  onClick={() => {
                    setPathInput(currentPath)
                    setIsEditingPath(true)
                  }}
                >
                  <div className="flex items-center gap-0.5 flex-1 min-w-0">
                    {breadcrumbs.map((crumb, idx) => (
                      <React.Fragment key={crumb.path + idx}>
                        {idx > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/60 shrink-0" />}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigateToPath(crumb.path)
                          }}
                          className="px-1.5 py-0.5 text-xs rounded hover:bg-accent hover:text-accent-foreground font-medium truncate shrink-0 max-w-[140px]"
                          title={crumb.path}
                        >
                          {crumb.name}
                        </button>
                      </React.Fragment>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 ml-auto shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setPathInput(currentPath)
                        setIsEditingPath(true)
                      }}
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent"
                      title="Edit path directly"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCopyCurrentPath()
                      }}
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent"
                      title="Copy path"
                    >
                      {copiedPath ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="relative w-40 md:w-52 shrink-0">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search..."
                value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("name")?.setFilterValue(event.target.value)
                }
                className="pl-8 h-8 text-xs"
              />
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center border rounded-md p-0.5 bg-muted/30 shrink-0">
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => handleToggleViewMode("table")}
                title="Table view"
              >
                <LayoutList className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => handleToggleViewMode("grid")}
                title="Grid view"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Column Visibility Selector (only relevant for Table view) */}
            {viewMode === "table" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1 text-xs shrink-0">
                    Columns <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize text-xs"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {column.id === "date_modified" ? "Date Modified" : column.id.replace("_", " ")}
                        </DropdownMenuCheckboxItem>
                      )
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Main Canvas Context Menu wrapper */}
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <div className="flex-1 min-h-0 p-3 overflow-hidden flex flex-col">
                <div className="flex-1 min-h-0 rounded-md border bg-card overflow-hidden flex flex-col">
                  {viewMode === "table" ? (
                    <ScrollArea className="h-full w-full">
                      <Table className="table-fixed w-full">
                        <TableHeader className="sticky top-0 bg-card z-10">
                          {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                              {headerGroup.headers.map((header) => {
                                return (
                                  <TableHead key={header.id} style={{ width: header.getSize() }}>
                                    {header.isPlaceholder
                                      ? null
                                      : flexRender(
                                          header.column.columnDef.header,
                                          header.getContext()
                                        )}
                                  </TableHead>
                                )
                              })}
                            </TableRow>
                          ))}
                        </TableHeader>
                        <TableBody>
                          {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                              <ContextMenu key={row.id}>
                                <ContextMenuTrigger asChild>
                                  <TableRow
                                    data-state={row.getIsSelected() && "selected"}
                                    onDoubleClick={() => handleItemDoubleClick(row.original)}
                                    onClick={(e) => handleRowClick(row.original, row, e)}
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                  >
                                    {row.getVisibleCells().map((cell) => (
                                      <TableCell key={cell.id} style={{ width: cell.column.getSize() }} className="overflow-hidden truncate">
                                        {flexRender(
                                          cell.column.columnDef.cell,
                                          cell.getContext()
                                        )}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                </ContextMenuTrigger>
                                <ContextMenuContent className="w-48">
                                  <ContextMenuItem onClick={() => handleItemDoubleClick(row.original)}>
                                    <ExternalLink className="h-3.5 w-3.5 mr-2" />
                                    {row.original.file_type === "folder" ? "Open Folder" : "Open"}
                                    <ContextMenuShortcut>↵</ContextMenuShortcut>
                                  </ContextMenuItem>
                                  <ContextMenuSeparator />
                                  <ContextMenuItem onClick={() => handleCopyItems([row.original.path])}>
                                    <Copy className="h-3.5 w-3.5 mr-2" />
                                    Copy
                                    <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
                                  </ContextMenuItem>
                                  <ContextMenuItem onClick={() => handleCutItems([row.original.path])}>
                                    <Scissors className="h-3.5 w-3.5 mr-2" />
                                    Cut
                                    <ContextMenuShortcut>Ctrl+X</ContextMenuShortcut>
                                  </ContextMenuItem>
                                  <ContextMenuItem onClick={() => {
                                    navigator.clipboard.writeText(row.original.path)
                                    toast.success("Path copied to clipboard")
                                  }}>
                                    Copy Path
                                  </ContextMenuItem>
                                  <ContextMenuSeparator />
                                  <ContextMenuItem onClick={() => {
                                    setRenameItem(row.original)
                                    setRenameOpen(true)
                                  }}>
                                    Rename
                                    <ContextMenuShortcut>F2</ContextMenuShortcut>
                                  </ContextMenuItem>
                                  <ContextMenuItem onClick={() => {
                                    setPropertiesPath(row.original.path)
                                    setPropertiesOpen(true)
                                  }}>
                                    <Info className="h-3.5 w-3.5 mr-2" />
                                    Properties
                                  </ContextMenuItem>
                                  <ContextMenuSeparator />
                                  <ContextMenuItem 
                                    variant="destructive"
                                    onClick={() => {
                                      setDeleteItem(row.original)
                                      setDeleteOpen(true)
                                    }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                                    Delete
                                    <ContextMenuShortcut>Del</ContextMenuShortcut>
                                  </ContextMenuItem>
                                </ContextMenuContent>
                              </ContextMenu>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={columns.length}
                                className="h-32 text-center text-muted-foreground text-sm"
                              >
                                {loading ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                                    <span>Reading folder contents...</span>
                                  </div>
                                ) : (
                                  "No files or folders found."
                                )}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  ) : (
                    <ScrollArea className="h-full w-full">
                      {filteredGridItems.length ? (
                        <FileGrid
                          items={filteredGridItems}
                          selectedPaths={selectedItemPaths}
                          clickMode={settings.clickMode}
                          onToggleSelect={handleToggleGridSelect}
                          onItemDoubleClick={handleItemDoubleClick}
                          onRename={(item) => {
                            setRenameItem(item)
                            setRenameOpen(true)
                          }}
                          onDelete={(item) => {
                            setDeleteItem(item)
                            setDeleteOpen(true)
                          }}
                          onProperties={(item) => {
                            setPropertiesPath(item.path)
                            setPropertiesOpen(true)
                          }}
                          onCopy={handleCopyItems}
                          onCut={handleCutItems}
                        />
                      ) : (
                        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                          {loading ? (
                            <div className="flex items-center gap-2">
                              <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                              <span>Reading folder contents...</span>
                            </div>
                          ) : (
                            "No files or folders found."
                          )}
                        </div>
                      )}
                    </ScrollArea>
                  )}
                </div>
              </div>
            </ContextMenuTrigger>

            {/* Background Canvas Context Menu */}
            <ContextMenuContent className="w-48">
              <ContextMenuItem onClick={() => setNewFolderDialogOpen(true)}>
                <FolderPlus className="h-3.5 w-3.5 mr-2 text-sky-500" />
                New Folder
              </ContextMenuItem>
              <ContextMenuItem onClick={() => setNewFileDialogOpen(true)}>
                <FilePlus className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                New File
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem 
                onClick={handlePasteItems}
                disabled={getClipboardState().items.length === 0}
              >
                Paste
                <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem onClick={handleRefresh}>
                <RefreshCw className="h-3.5 w-3.5 mr-2" />
                Refresh
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => table.toggleAllPageRowsSelected(true)}>
                Select All
                <ContextMenuShortcut>Ctrl+A</ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>

          {/* Bottom Status Bar */}
          <footer className="h-7 border-t bg-muted/40 px-3 flex items-center justify-between text-xs text-muted-foreground flex-shrink-0 select-none">
            <div className="flex items-center gap-3">
              <span>
                {loading ? "Loading..." : `${data.length} item${data.length === 1 ? '' : 's'} (${folderCount} folder${folderCount === 1 ? '' : 's'}, ${fileCount} file${fileCount === 1 ? '' : 's'})`}
              </span>
              {table.getColumn("name")?.getFilterValue() ? (
                <span className="text-primary font-medium">
                  (Filtered: {table.getRowModel().rows.length} shown)
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-4">
              {selectedCount > 0 ? (
                <span className="font-medium text-foreground">
                  {selectedCount} item{selectedCount === 1 ? '' : 's'} selected {totalSelectedBytes > 0 ? `(${formatFileSize(totalSelectedBytes)})` : ''}
                </span>
              ) : (
                <span>Ready</span>
              )}
            </div>
          </footer>

          {/* Canvas New Folder Dialog */}
          <Dialog open={newFolderDialogOpen} onOpenChange={setNewFolderDialogOpen}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>New Folder</DialogTitle>
                <DialogDescription>Create a new folder in this directory.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <Label htmlFor="canvas-folder-name" className="text-xs">Folder Name</Label>
                <Input
                  id="canvas-folder-name"
                  value={newFolderInput}
                  onChange={(e) => setNewFolderInput(e.target.value)}
                  placeholder="New Folder"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCanvasCreateFolder()
                  }}
                  autoFocus
                />
              </div>
              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setNewFolderDialogOpen(false)}>Cancel</Button>
                <Button size="sm" onClick={handleCanvasCreateFolder} disabled={!newFolderInput.trim()}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Canvas New File Dialog */}
          <Dialog open={newFileDialogOpen} onOpenChange={setNewFileDialogOpen}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>New File</DialogTitle>
                <DialogDescription>Create a new file in this directory.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <Label htmlFor="canvas-file-name" className="text-xs">File Name (with extension)</Label>
                <Input
                  id="canvas-file-name"
                  value={newFileInput}
                  onChange={(e) => setNewFileInput(e.target.value)}
                  placeholder="example.txt"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCanvasCreateFile()
                  }}
                  autoFocus
                />
              </div>
              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setNewFileDialogOpen(false)}>Cancel</Button>
                <Button size="sm" onClick={handleCanvasCreateFile} disabled={!newFileInput.trim()}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Properties Modal */}
          <PropertiesModal
            open={propertiesOpen}
            onOpenChange={setPropertiesOpen}
            itemPath={propertiesPath}
            onNavigateToFolder={(path) => navigateToPath(path)}
          />

          {/* Rename Modal */}
          <RenameModal
            open={renameOpen}
            onOpenChange={setRenameOpen}
            item={renameItem}
            onRenamed={handleRefresh}
          />

          {/* Delete Confirmation Modal */}
          <DeleteModal
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            item={deleteItem}
            onDeleted={handleRefresh}
          />
        </div>
      </div>
    </div>
  )
}
