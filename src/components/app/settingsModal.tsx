import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Sun, 
  Moon, 
  Laptop, 
  Type, 
  Palette, 
  FolderSync, 
  RotateCcw, 
  Github, 
  Check,
  MousePointerClick,
  DownloadCloud
} from "lucide-react"
import { useAppSettings, FontSize } from "@/hooks/useAppSettings"
import { toast } from "sonner"
import SettingsUpdatesTab from "./settingsUpdatesTab"

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { settings, updateSettings, resetDefaults, theme, setTheme } = useAppSettings()
  const [activeTab, setActiveTab] = useState<"appearance" | "typography" | "explorer" | "updates" | "about">("appearance")

  const handleReset = () => {
    resetDefaults()
    toast.success("Settings reset to defaults")
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[460px] p-0 flex flex-col gap-0 h-full border-l shadow-2xl bg-background">
        <SheetHeader className="p-4 border-b shrink-0 pr-12">
          <div className="flex items-center gap-2.5">
            <img src="/app-icon.png" alt="FileEx Logo" className="w-6 h-6 rounded object-contain shadow-xs" />
            <div>
              <SheetTitle className="text-base font-semibold leading-tight">Settings & Preferences</SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                Customize appearance, fonts, and file management behaviors.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Tab navigation */}
        <div className="flex border-b bg-muted/30 px-3 gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("appearance")}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "appearance"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Palette className="h-3.5 w-3.5" />
            Appearance
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("typography")}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "typography"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Type className="h-3.5 w-3.5" />
            Typography
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("explorer")}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "explorer"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FolderSync className="h-3.5 w-3.5" />
            Explorer
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("updates")}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "updates"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <DownloadCloud className="h-3.5 w-3.5" />
            Updates
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("about")}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "about"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            About
          </button>
        </div>

        {/* Tab content area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <div className="space-y-5">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Theme Mode
                </Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Choose your interface color scheme. Changes reflect immediately across the app.
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-lg border text-xs font-medium transition-all ${
                      theme === "light"
                        ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/40 shadow-xs"
                        : "border-border hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <Sun className="h-5 w-5" />
                    <span>Light</span>
                    {theme === "light" && <Check className="h-3.5 w-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-lg border text-xs font-medium transition-all ${
                      theme === "dark"
                        ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/40 shadow-xs"
                        : "border-border hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <Moon className="h-5 w-5" />
                    <span>Dark</span>
                    {theme === "dark" && <Check className="h-3.5 w-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme("system")}
                    className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-lg border text-xs font-medium transition-all ${
                      theme === "system"
                        ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/40 shadow-xs"
                        : "border-border hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <Laptop className="h-5 w-5" />
                    <span>System</span>
                    {theme === "system" && <Check className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Accent Color
                </Label>
                <p className="text-xs text-muted-foreground mb-2 mt-1">
                  Default FileEx accent palette: Sky & Navy Blue.
                </p>
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                  <div className="h-6 w-6 rounded-full bg-blue-500 shadow-xs ring-2 ring-primary/20 flex items-center justify-center text-white text-[10px]">✓</div>
                  <div className="text-xs">
                    <p className="font-medium text-foreground">Glossy Ocean Blue</p>
                    <p className="text-[11px] text-muted-foreground">Integrated with desktop window frame</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Typography Tab */}
          {activeTab === "typography" && (
            <div className="space-y-6">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  UI Font Size
                </Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Scale text across breadcrumbs, tables, sidebar, and cards.
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  {(["small", "medium", "large"] as FontSize[]).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => updateSettings({ fontSize: size })}
                      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border text-xs font-medium capitalize transition-all ${
                        settings.fontSize === size
                          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/40 shadow-xs"
                          : "border-border hover:bg-muted/50 text-foreground"
                      }`}
                    >
                      <span className={size === "small" ? "text-xs" : size === "medium" ? "text-sm font-semibold" : "text-base font-bold"}>
                        Aa
                      </span>
                      <span>{size}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {size === "small" ? "13px" : size === "medium" ? "14px" : "16px"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Font Family
                </Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Select your preferred typography family.
                </p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => updateSettings({ fontFamily: "sans" })}
                    className={`flex items-center justify-between w-full p-3 rounded-lg border text-left transition-all ${
                      settings.fontFamily === "sans"
                        ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/40 shadow-xs"
                        : "border-border hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-medium font-sans">System Sans (Default)</div>
                      <div className="text-[11px] text-muted-foreground font-sans">
                        Clean, modern UI optimized for desktop readability
                      </div>
                    </div>
                    {settings.fontFamily === "sans" && <Check className="h-4 w-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => updateSettings({ fontFamily: "mono" })}
                    className={`flex items-center justify-between w-full p-3 rounded-lg border text-left transition-all ${
                      settings.fontFamily === "mono"
                        ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/40 shadow-xs"
                        : "border-border hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-medium font-mono">Monospace</div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        Developer-friendly fixed-width character alignment
                      </div>
                    </div>
                    {settings.fontFamily === "mono" && <Check className="h-4 w-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => updateSettings({ fontFamily: "serif" })}
                    className={`flex items-center justify-between w-full p-3 rounded-lg border text-left transition-all ${
                      settings.fontFamily === "serif"
                        ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/40 shadow-xs"
                        : "border-border hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-medium font-serif">Elegant Serif</div>
                      <div className="text-[11px] text-muted-foreground font-serif">
                        Classical serif typography for bookish clarity
                      </div>
                    </div>
                    {settings.fontFamily === "serif" && <Check className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Explorer Tab */}
          {activeTab === "explorer" && (
            <div className="space-y-6">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Navigation Behavior
                </Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Choose how folders and files respond to mouse clicks.
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => updateSettings({ clickMode: "single" })}
                    className={`flex flex-col items-center justify-center text-center gap-1.5 p-3.5 rounded-lg border transition-all ${
                      settings.clickMode === "single"
                        ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/40 shadow-xs"
                        : "border-border hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <MousePointerClick className="h-5 w-5" />
                    <span className="text-xs font-semibold">Single Click</span>
                    <span className="text-[10px] text-muted-foreground">Open immediately on 1 click</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateSettings({ clickMode: "double" })}
                    className={`flex flex-col items-center justify-center text-center gap-1.5 p-3.5 rounded-lg border transition-all ${
                      settings.clickMode === "double"
                        ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/40 shadow-xs"
                        : "border-border hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <MousePointerClick className="h-5 w-5 stroke-2" />
                    <span className="text-xs font-semibold">Double Click</span>
                    <span className="text-[10px] text-muted-foreground">Single click to select, double to open</span>
                  </button>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  File Visibility
                </Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Control display of hidden Unix and system files.
                </p>
                <div className="flex items-center space-x-3 p-3.5 rounded-lg border bg-muted/20">
                  <Checkbox
                    id="show-hidden"
                    checked={settings.showHiddenFiles}
                    onCheckedChange={(checked) =>
                      updateSettings({ showHiddenFiles: Boolean(checked) })
                    }
                  />
                  <div className="grid gap-0.5 leading-none cursor-pointer" onClick={() => updateSettings({ showHiddenFiles: !settings.showHiddenFiles })}>
                    <label
                      htmlFor="show-hidden"
                      className="text-xs font-medium cursor-pointer"
                    >
                      Show hidden files and dotfiles
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      Display files starting with a dot (e.g. .git, .env, .config)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Updates Tab */}
          {activeTab === "updates" && <SettingsUpdatesTab />}

          {/* About Tab */}
          {activeTab === "about" && (
            <div className="space-y-4 py-1">
              <div className="flex items-center gap-3.5 p-3.5 rounded-xl border bg-muted/20">
                <img src="/app-icon.png" alt="FileEx Icon" className="w-12 h-12 rounded-lg object-contain shadow-sm" />
                <div>
                  <h4 className="font-semibold text-sm">FileEx</h4>
                  <p className="text-[11px] text-muted-foreground">Modern Desktop File Explorer</p>
                  <span className="inline-block mt-1 text-[10px] text-primary font-mono bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                    Version 0.5.4
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-muted-foreground text-xs leading-relaxed">
                <p>
                  A fast, lightweight cross-platform desktop file explorer built for everyday productivity and speed.
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-[11px]">Source Code & Releases</span>
                <a
                  href="https://github.com/Amanbig/fileEx"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                >
                  <Github className="h-3.5 w-3.5" />
                  GitHub Repository
                </a>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-[11px]">License</span>
                <a
                  href="https://github.com/Amanbig/fileEx/blob/main/LICENSE"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                >
                  MIT License
                </a>
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="p-3 border-t bg-muted/20 flex flex-row items-center justify-between shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs gap-1 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            Reset Defaults
          </Button>

          <Button
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs px-4"
          >
            Done
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
