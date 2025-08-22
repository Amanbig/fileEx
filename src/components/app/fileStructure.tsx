"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { 
  ArrowUpDown, 
  ChevronDown, 
  MoreHorizontal, 
  Folder, 
  File, 
  FileText, 
  Image, 
  Music, 
  Video,
  Archive,
  Code,
  FileSpreadsheet
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

const data: FileItem[] = [
  {
    id: "1",
    name: "Documents",
    type: "folder",
    size: null,
    dateModified: new Date("2024-01-15"),
    extension: null,
  },
  {
    id: "2",
    name: "Pictures",
    type: "folder",
    size: null,
    dateModified: new Date("2024-01-10"),
    extension: null,
  },
  {
    id: "3",
    name: "project-report.pdf",
    type: "file",
    size: 2048576, // 2MB
    dateModified: new Date("2024-01-20"),
    extension: "pdf",
  },
  {
    id: "4",
    name: "vacation-photo.jpg",
    type: "file",
    size: 5242880, // 5MB
    dateModified: new Date("2024-01-18"),
    extension: "jpg",
  },
  {
    id: "5",
    name: "music-playlist.mp3",
    type: "file",
    size: 8388608, // 8MB
    dateModified: new Date("2024-01-16"),
    extension: "mp3",
  },
  {
    id: "6",
    name: "presentation.pptx",
    type: "file",
    size: 15728640, // 15MB
    dateModified: new Date("2024-01-14"),
    extension: "pptx",
  },
  {
    id: "7",
    name: "src",
    type: "folder",
    size: null,
    dateModified: new Date("2024-01-22"),
    extension: null,
  },
  {
    id: "8",
    name: "index.html",
    type: "file",
    size: 4096, // 4KB
    dateModified: new Date("2024-01-22"),
    extension: "html",
  },
  {
    id: "9",
    name: "package.json",
    type: "file",
    size: 2048,
    dateModified: new Date("2024-01-21"),
    extension: "json",
  },
  {
    id: "10",
    name: "README.md",
    type: "file",
    size: 1024,
    dateModified: new Date("2024-01-20"),
    extension: "md",
  },
  {
    id: "11",
    name: "node_modules",
    type: "folder",
    size: null,
    dateModified: new Date("2024-01-19"),
    extension: null,
  },
  {
    id: "12",
    name: "style.css",
    type: "file",
    size: 8192,
    dateModified: new Date("2024-01-18"),
    extension: "css",
  },
  {
    id: "13",
    name: "script.js",
    type: "file",
    size: 16384,
    dateModified: new Date("2024-01-17"),
    extension: "js",
  },
  {
    id: "14",
    name: "image1.png",
    type: "file",
    size: 1048576,
    dateModified: new Date("2024-01-16"),
    extension: "png",
  },
  {
    id: "15",
    name: "video.mp4",
    type: "file",
    size: 52428800,
    dateModified: new Date("2024-01-15"),
    extension: "mp4",
  },
  {
    id: "16",
    name: "archive.zip",
    type: "file",
    size: 10485760,
    dateModified: new Date("2024-01-14"),
    extension: "zip",
  },
  {
    id: "17",
    name: "data.xlsx",
    type: "file",
    size: 3145728,
    dateModified: new Date("2024-01-13"),
    extension: "xlsx",
  },
  {
    id: "18",
    name: "temp",
    type: "folder",
    size: null,
    dateModified: new Date("2024-01-12"),
    extension: null,
  },
  {
    id: "19",
    name: "backup.tar.gz",
    type: "file",
    size: 20971520,
    dateModified: new Date("2024-01-11"),
    extension: "tar",
  },
  {
    id: "20",
    name: "config.json",
    type: "file",
    size: 512,
    dateModified: new Date("2024-01-10"),
    extension: "json",
  },
]

export type FileItem = {
  id: string
  name: string
  type: "file" | "folder"
  size: number | null // in bytes, null for folders
  dateModified: Date
  extension: string | null
}

// Helper function to get file icon
const getFileIcon = (type: string, extension: string | null) => {
  if (type === "folder") return <Folder className="h-4 w-4 text-blue-500" />
  
  if (!extension) return <File className="h-4 w-4" />
  
  const ext = extension.toLowerCase()
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
    return <Image className="h-4 w-4 text-green-500" />
  }
  if (['mp3', 'wav', 'flac', 'aac'].includes(ext)) {
    return <Music className="h-4 w-4 text-purple-500" />
  }
  if (['mp4', 'avi', 'mkv', 'mov'].includes(ext)) {
    return <Video className="h-4 w-4 text-red-500" />
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return <Archive className="h-4 w-4 text-orange-500" />
  }
  if (['js', 'ts', 'tsx', 'jsx', 'html', 'css', 'py', 'java', 'cpp'].includes(ext)) {
    return <Code className="h-4 w-4 text-blue-600" />
  }
  if (['xlsx', 'xls', 'csv'].includes(ext)) {
    return <FileSpreadsheet className="h-4 w-4 text-green-600" />
  }
  if (['txt', 'md', 'pdf', 'doc', 'docx'].includes(ext)) {
    return <FileText className="h-4 w-4 text-gray-600" />
  }
  
  return <File className="h-4 w-4" />
}

// Helper function to format file size
const formatFileSize = (bytes: number | null) => {
  if (bytes === null) return ""
  
  const sizes = ['B', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 B'
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

export const columns: ColumnDef<FileItem>[] = [
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
        <div className="flex items-center gap-2">
          {getFileIcon(fileItem.type, fileItem.extension)}
          <span>{fileItem.name}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "dateModified",
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
      const date = row.getValue("dateModified") as Date
      return <div>{date.toLocaleDateString()}</div>
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const fileItem = row.original
      if (fileItem.type === "folder") return <div>Folder</div>
      return <div className="capitalize">{fileItem.extension || "File"}</div>
    },
  },
  {
    accessorKey: "size",
    header: () => <div className="text-right">Size</div>,
    cell: ({ row }) => {
      const size = row.getValue("size") as number | null
      return <div className="text-right">{formatFileSize(size)}</div>
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const fileItem = row.original

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
            <DropdownMenuItem>
              Open
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(fileItem.name)}
            >
              Copy name
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuItem>Properties</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function FileStructure() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [currentPath, setCurrentPath] = React.useState("C:\\Users\\Documents")

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full h-full flex flex-col p-4">
      {/* Path Navigation Bar */}
      <div className="flex items-center gap-2 mb-4">
        <Input
          placeholder="Path: C:\Users\Documents"
          value={currentPath}
          onChange={(event) => setCurrentPath(event.target.value)}
          className="flex-1 font-mono text-sm"
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              // Handle path navigation here
              console.log('Navigate to:', currentPath)
            }
          }}
        />
        <Button variant="outline" size="sm">
          Go
        </Button>
      </div>
      
      {/* Search and Controls Bar */}
      <div className="flex items-center py-4 flex-shrink-0">
        <Input
          placeholder="Search files and folders..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
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
        <ScrollArea className="h-[calc(100vh-200px)]">
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
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
      <div className="flex items-center justify-end space-x-2 py-2 flex-shrink-0">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          {/* <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button> */}
        </div>
      </div>
    </div>
  )
}
