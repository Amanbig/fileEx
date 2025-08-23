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
  ArrowRight,
  ArrowLeft,
  Home
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
import { toast } from "sonner"
import { 
  FaFolder, FaFile, FaFileImage, FaFileAudio, FaFileVideo, FaFileArchive, FaFileCode, 
  FaFileExcel, FaFileWord, FaFilePowerpoint, FaFilePdf, FaFileAlt, FaDatabase 
} from "react-icons/fa"

export type FileItem = {
  id: string
  name: string
  file_type: "file" | "folder" // Changed from 'type' to match Rust struct
  size: number | null // in bytes, null for folders
  date_modified: string // Changed to string to match Rust DateTime serialization
  extension: string | null
  path: string // Added path field
}


const getFileIcon = (file_type: string, extension: string | null) => {
  if (file_type === "folder") return <FaFolder className="h-4 w-4 text-blue-500" />
  
  if (!extension) return <FaFile className="h-4 w-4" />
  
  const ext = extension.toLowerCase()
  
  // Images
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
    return <FaFileImage className="h-4 w-4 text-green-500" />
  }

  // Audio
  if (['mp3', 'wav', 'flac', 'aac'].includes(ext)) {
    return <FaFileAudio className="h-4 w-4 text-purple-500" />
  }

  // Video
  if (['mp4', 'avi', 'mkv', 'mov'].includes(ext)) {
    return <FaFileVideo className="h-4 w-4 text-red-500" />
  }

  // Archives
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return <FaFileArchive className="h-4 w-4 text-orange-500" />
  }

  // Code files
  if (['js', 'ts', 'tsx', 'jsx', 'html', 'css', 'py', 'java', 'cpp', 'c', 'cs', 'go', 'rs', 'php', 'rb', 'swift'].includes(ext)) {
    return <FaFileCode className="h-4 w-4 text-blue-600" />
  }

  // Excel / Spreadsheet
  if (['xlsx', 'xls', 'csv'].includes(ext)) {
    return <FaFileExcel className="h-4 w-4 text-green-600" />
  }

  // Word Docs
  if (['doc', 'docx'].includes(ext)) {
    return <FaFileWord className="h-4 w-4 text-blue-700" />
  }

  // PowerPoint
  if (['ppt', 'pptx'].includes(ext)) {
    return <FaFilePowerpoint className="h-4 w-4 text-orange-600" />
  }

  // PDF
  if (['pdf'].includes(ext)) {
    return <FaFilePdf className="h-4 w-4 text-red-600" />
  }

  // Text & Markdown
  if (['txt', 'md', 'rtf'].includes(ext)) {
    return <FaFileAlt className="h-4 w-4 text-gray-600" />
  }

  // Database files
  if (['sql', 'db', 'sqlite', 'mongodb'].includes(ext)) {
    return <FaDatabase className="h-4 w-4 text-yellow-600" />
  }

  return <FaFile className="h-4 w-4" />
}


// Helper function to format file size
const formatFileSize = (bytes: number | null) => {
  if (bytes === null) return ""
  
  const sizes = ['B', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 B'
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

export function FileStructure() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [currentPath, setCurrentPath] = React.useState("")
  const [data, setData] = React.useState<FileItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [navigationHistory, setNavigationHistory] = React.useState<string[]>([])
  const [historyIndex, setHistoryIndex] = React.useState(-1)
  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>({
    name: 300,
    date_modified: 120,
    file_type: 80,
    size: 100,
    actions: 50,
  })

  // Load initial directory
  React.useEffect(() => {
    const loadInitialDirectory = async () => {
      try {
        const homeDir = await invoke<string>("get_home_directory")
        setCurrentPath(homeDir)
        const files = await invoke<FileItem[]>("list_directory", { path: homeDir })
        setData(files)
        setNavigationHistory([homeDir])
        setHistoryIndex(0)
      } catch (error) {
        console.error("Failed to load initial directory:", error)
        // Fallback to current directory
        try {
          const currentDir = await invoke<string>("get_current_directory")
          setCurrentPath(currentDir)
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

  // Navigate to a new path
  const navigateToPath = async (path: string, addToHistory = true) => {
    setLoading(true)
    try {
      const files = await invoke<FileItem[]>("navigate_to_path", { path })
      setData(files)
      setCurrentPath(path)
      
      if (addToHistory) {
        // Add to navigation history
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

  // Navigate to home directory
  const navigateHome = async () => {
    try {
      const homeDir = await invoke<string>("get_home_directory")
      await navigateToPath(homeDir)
    } catch (error) {
      console.error("Failed to navigate to home:", error)
    }
  }

  // Handle double-click on folder
  const handleItemDoubleClick = (item: FileItem) => {
    if (item.file_type === "folder") {
      navigateToPath(item.path)
    }
  }

  // Get selected item paths
  const getSelectedItemPaths = (): string[] => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    return selectedRows.map(row => row.original.path)
  }

  // Refresh current directory
  const handleRefresh = () => {
    if (currentPath) {
      navigateToPath(currentPath)
    }
  }

  // Handle items deleted (clear selection)
  const handleItemsDeleted = () => {
    setRowSelection({})
  }

  // Define columns inside the component so they have access to functions
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
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => {
        const fileItem = row.original
        return (
          <div className="flex items-center gap-2 min-w-0 max-w-[300px]">
            <div className="flex-shrink-0">
              {getFileIcon(fileItem.file_type, fileItem.extension)}
            </div>
            <span className="truncate" title={fileItem.name}>
              {fileItem.name}
            </span>
          </div>
        )
      },
      size: 300,
      minSize: 150,
      maxSize: 350,
    },
    {
      accessorKey: "date_modified",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date Modified
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => {
        const dateString = row.getValue("date_modified") as string
        const date = new Date(dateString)
        return <div>{date.toLocaleDateString()}</div>
      },
      size: 120,
      minSize: 100,
      maxSize: 150,
    },
    {
      accessorKey: "file_type",
      header: "Type",
      cell: ({ row }) => {
        const fileItem = row.original
        if (fileItem.file_type === "folder") return <div>Folder</div>
        return <div className="capitalize">{fileItem.extension || "File"}</div>
      },
      size: 80,
      minSize: 60,
      maxSize: 100,
    },
    {
      accessorKey: "size",
      header: () => <div className="text-right">Size</div>,
      cell: ({ row }) => {
        const size = row.getValue("size") as number | null
        return <div className="text-right">{formatFileSize(size)}</div>
      },
      size: 100,
      minSize: 80,
      maxSize: 120,
    },
    {
      id: "actions",
      enableHiding: false,
      size: 50,
      minSize: 50,
      maxSize: 50,
      cell: ({ row }) => {
        const fileItem = row.original

        const handleOpen = () => {
          if (fileItem.file_type === "folder") {
            navigateToPath(fileItem.path)
          } else {
            // TODO: Open file with default application
            console.log("Opening file:", fileItem.path)
          }
        }

        const handleRename = async () => {
          const newName = prompt("Enter new name:", fileItem.name)
          if (!newName || newName.trim() === "" || newName === fileItem.name) return

          try {
            await invoke("rename_item", { 
              oldPath: fileItem.path, 
              newName: newName.trim() 
            })
            handleRefresh()
          } catch (error) {
            toast.error(`Failed to rename: ${error}`)
          }
        }

        const handleDelete = async () => {
          const confirmDelete = confirm(`Are you sure you want to delete "${fileItem.name}"?`)
          if (!confirmDelete) return

          try {
            await invoke("delete_item", { path: fileItem.path })
            handleRefresh()
          } catch (error) {
            toast.error(`Failed to delete: ${error}`)
          }
        }

        const handleCopyPath = () => {
          navigator.clipboard.writeText(fileItem.path)
            .then(() => toast.success("Path copied to clipboard"))
            .catch(() => toast.error("Failed to copy path"))
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
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
              <DropdownMenuItem>
                Properties
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
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

  return (
    <div className="w-full h-full flex flex-col">
      {/* Commands Palette */}
      <CommandsPallet
        currentPath={currentPath}
        selectedItems={getSelectedItemPaths()}
        onRefresh={handleRefresh}
        onItemsDeleted={handleItemsDeleted}
      />
      
      {/* Main File Explorer */}
      <div className="flex-1 flex flex-col p-4">
      {/* Path Navigation and Search Bar */}
      <div className="flex items-center gap-4 py-4 flex-shrink-0">
        {/* Navigation Buttons */}
        <div className="flex items-center gap-1">
          <Button 
            variant="outline" 
            size="sm"
            onClick={navigateBack}
            disabled={loading || historyIndex <= 0}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={navigateHome}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <Home className="h-4 w-4" />
          </Button>
        </div>

        {/* Path Input */}
        <div className="flex items-center gap-2 flex-[2]">
          <Input
            placeholder="Enter path..."
            value={currentPath}
            onChange={(event) => setCurrentPath(event.target.value)}
            className="flex-1 font-mono text-sm"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                navigateToPath(currentPath)
              }
            }}
            disabled={loading}
          />
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigateToPath(currentPath)}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Search Input */}
        <Input
          placeholder="Search..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="w-48"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
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
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex-1 rounded-md border overflow-hidden">
        <ScrollArea className="h-[calc(100vh-200px)] w-full">
          <div className="w-full">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
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
                      className="cursor-pointer"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
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
                      className="h-24 text-center"
                    >
                      {loading ? "Loading..." : "No files found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </div>
      </div>
    </div>
  )
}
