"use client"

import React, { useState, useEffect } from "react"
import { invoke } from "@tauri-apps/api/core"
import { 
  Home, 
  Monitor, 
  FileText, 
  Download, 
  Image, 
  Film, 
  Music, 
  HardDrive, 
  Folder, 
  Pin, 
  X, 
  PanelLeftClose, 
  PanelLeftOpen,
  Settings
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import SettingsModal from "./settingsModal"
import { toast } from "sonner"

export interface SystemPlace {
  id: string
  name: string
  path: string
  icon: string
}

export interface PinnedPlace {
  id: string
  name: string
  path: string
}

interface PlacesSidebarProps {
  currentPath: string
  onNavigate: (path: string) => void
}

const PINNED_STORAGE_KEY = "fileex_pinned_places"

export default function PlacesSidebar({ currentPath, onNavigate }: PlacesSidebarProps) {
  const [places, setPlaces] = useState<SystemPlace[]>([])
  const [pinned, setPinned] = useState<PinnedPlace[]>([])
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Load system places from Rust backend
  useEffect(() => {
    const loadPlaces = async () => {
      try {
        const result = await invoke<SystemPlace[]>("get_system_places")
        setPlaces(result)
      } catch (err) {
        console.error("Failed to load system places:", err)
      }
    }
    loadPlaces()

    // Load pinned from localStorage
    try {
      const stored = localStorage.getItem(PINNED_STORAGE_KEY)
      if (stored) {
        setPinned(JSON.parse(stored))
      }
    } catch (e) {
      console.error("Failed to read pinned places from localStorage", e)
    }
  }, [])

  const savePinned = (newPinned: PinnedPlace[]) => {
    setPinned(newPinned)
    try {
      localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(newPinned))
    } catch (e) {
      console.error("Failed to persist pinned places", e)
    }
  }

  const handlePinCurrentFolder = () => {
    if (!currentPath) return

    // Check if already in system places or pinned
    if (places.some(p => p.path === currentPath)) {
      toast.info("This folder is already in Quick Access")
      return
    }
    if (pinned.some(p => p.path === currentPath)) {
      toast.info("This folder is already pinned")
      return
    }

    // Extract folder name from path
    const separator = currentPath.includes("\\") ? "\\" : "/"
    const parts = currentPath.split(separator).filter(Boolean)
    const folderName = parts.length > 0 ? parts[parts.length - 1] : currentPath

    const newPinned = [
      ...pinned,
      {
        id: `pin-${Date.now()}`,
        name: folderName,
        path: currentPath,
      }
    ]

    savePinned(newPinned)
    toast.success(`Pinned "${folderName}" to sidebar`)
  }

  const handleUnpin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = pinned.filter(p => p.id !== id)
    savePinned(updated)
    toast.success("Folder unpinned")
  }

  const getPlaceIcon = (iconName: string) => {
    const iconClass = "h-4 w-4 shrink-0"
    switch (iconName) {
      case "home":
        return <Home className={`${iconClass} text-sky-500`} />
      case "desktop":
        return <Monitor className={`${iconClass} text-indigo-500`} />
      case "documents":
        return <FileText className={`${iconClass} text-blue-500`} />
      case "downloads":
        return <Download className={`${iconClass} text-emerald-500`} />
      case "pictures":
        return <Image className={`${iconClass} text-violet-500`} />
      case "videos":
        return <Film className={`${iconClass} text-rose-500`} />
      case "music":
        return <Music className={`${iconClass} text-amber-500`} />
      case "drive":
        return <HardDrive className={`${iconClass} text-slate-500`} />
      default:
        return <Folder className={`${iconClass} text-blue-500`} />
    }
  }

  const isPlaceActive = (path: string) => {
    return currentPath === path
  }

  return (
    <TooltipProvider delayDuration={300}>
      <aside 
        className={`h-full border-r bg-muted/20 flex flex-col transition-all duration-200 select-none ${
          isCollapsed ? "w-14" : "w-56"
        }`}
      >
        {/* Sidebar Header & Collapse Toggle */}
        <div className="h-10 px-3 flex items-center justify-between border-b border-border/40 shrink-0">
          {!isCollapsed && (
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Explorer
            </span>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 w-7 p-0 ${isCollapsed ? "mx-auto" : "ml-auto"}`}
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? (
                  <PanelLeftOpen className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <PanelLeftClose className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{isCollapsed ? "Expand sidebar" : "Collapse sidebar"}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Places List */}
        <ScrollArea className="flex-1 w-full py-2">
          <div className="space-y-4 px-2">
            {/* Quick Access Section */}
            <div>
              {!isCollapsed && (
                <div className="px-2 py-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Quick Access
                </div>
              )}
              <div className="space-y-0.5 mt-0.5">
                {places.map((place) => {
                  const active = isPlaceActive(place.path)
                  const buttonContent = (
                    <button
                      key={place.id}
                      type="button"
                      onClick={() => onNavigate(place.path)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-left ${
                        active
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      } ${isCollapsed ? "justify-center px-0" : ""}`}
                    >
                      {getPlaceIcon(place.icon)}
                      {!isCollapsed && (
                        <span className="truncate">{place.name}</span>
                      )}
                    </button>
                  )

                  if (isCollapsed) {
                    return (
                      <Tooltip key={place.id}>
                        <TooltipTrigger asChild>
                          {buttonContent}
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p className="font-medium">{place.name}</p>
                          <p className="text-[10px] text-muted-foreground">{place.path}</p>
                        </TooltipContent>
                      </Tooltip>
                    )
                  }

                  return buttonContent
                })}
              </div>
            </div>

            {/* Pinned Bookmarks Section */}
            <div>
              <div className="flex items-center justify-between px-2 py-1">
                {!isCollapsed && (
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    Favorites
                  </span>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={handlePinCurrentFolder}
                      className={`p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors ${
                        isCollapsed ? "mx-auto" : ""
                      }`}
                    >
                      <Pin className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Pin current folder</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="space-y-0.5 mt-0.5">
                {pinned.length === 0 && !isCollapsed && (
                  <div className="px-2.5 py-2 text-[11px] text-muted-foreground/60 italic">
                    No pinned folders
                  </div>
                )}

                {pinned.map((item) => {
                  const active = isPlaceActive(item.path)
                  const buttonContent = (
                    <div
                      key={item.id}
                      onClick={() => onNavigate(item.path)}
                      className={`group relative w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer text-left ${
                        active
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      } ${isCollapsed ? "justify-center px-0" : ""}`}
                    >
                      <Folder className="h-4 w-4 shrink-0 text-amber-500" />
                      {!isCollapsed && (
                        <>
                          <span className="truncate flex-1">{item.name}</span>
                          <button
                            type="button"
                            onClick={(e) => handleUnpin(item.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-destructive/10 hover:text-destructive transition-opacity"
                            title="Unpin"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </>
                      )}
                    </div>
                  )

                  if (isCollapsed) {
                    return (
                      <Tooltip key={item.id}>
                        <TooltipTrigger asChild>
                          {buttonContent}
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground">{item.path}</p>
                        </TooltipContent>
                      </Tooltip>
                    )
                  }

                  return buttonContent
                })}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Sidebar Footer with Settings */}
        <div className="p-2 border-t border-border/40 shrink-0">
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  className="w-full flex items-center justify-center p-2 rounded-md text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <Settings className="h-4 w-4 shrink-0" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="font-medium">Settings (Ctrl+,)</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <Settings className="h-4 w-4 shrink-0" />
              <span>Settings</span>
            </button>
          )}
        </div>

        <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      </aside>
    </TooltipProvider>
  )
}
