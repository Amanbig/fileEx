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
  Edit2
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
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import CommandsPallet from "./commandsPallet"
import PlacesSidebar from "./placesSidebar"
import PropertiesModal from "./propertiesModal"
import RenameModal from "./renameModal"
import DeleteModal from "./deleteModal"
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

  // Modal states for Native Dialogs & Properties
  const [propertiesPath, setPropertiesPath] = React.useState<string | null>(null)
  const [propertiesOpen, setPropertiesOpen] = React.useState(false)
  const [renameItem, setRenameItem] = React.useState<FileItem | null>(null)
  const [renameOpen, setRenameOpen] = React.useState(false)
  const [deleteItem, setDeleteItem] = React.useState<FileItem | null>(null)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const pathInputRef = React.useRef<HTMLInputElement>(null)

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
    } catch (err) {
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

  // Columns definition
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
        return (
          <div className="flex items-center gap-2 min-w-0">
            {getFileIcon(fileItem.file_type, fileItem.extension)}
            <span className="truncate font-medium text-sm" title={fileItem.name}>
              {fileItem.name}
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

  const table = useReactTable({
    data,
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
  const folderCount = React.useMemo(() => data.filter(item => item.file_type === "folder").length, [data])
  const fileCount = data.length - folderCount
  const breadcrumbs = React.useMemo(() => parseBreadcrumbs(currentPath), [currentPath])

  const isAtRoot = !currentPath || currentPath === "/" || /^[a-zA-Z]:\\?$/.test(currentPath)

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
            title="Up to parent folder"
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
        <div className="relative w-44 md:w-56 shrink-0">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search items..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="pl-8 h-8 text-xs"
          />
        </div>

        {/* Column Visibility Selector */}
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
      </div>

      {/* Main File Table Area */}
      <div className="flex-1 min-h-0 p-3 overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 rounded-md border bg-card overflow-hidden flex flex-col">
          <ScrollArea className="h-full w-full">
            <Table>
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
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      onDoubleClick={() => handleItemDoubleClick(row.original)}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
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
        </div>
      </div>

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
