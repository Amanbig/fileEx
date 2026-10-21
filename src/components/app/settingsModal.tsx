"use client"

import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from "@/components/ui/dialog"
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
  MousePointerClick
} from "lucide-react"
import { useAppSettings, FontSize, FontFamily } from "@/hooks/useAppSettings"
import { toast } from "sonner"

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { settings, updateSettings, resetDefaults, theme, setTheme } = useAppSettings()
  const [activeTab, setActiveTab] = useState<"appearance" | "typography" | "explorer" | "about">("appearance")

  const handleReset = () => {
    resetDefaults()
    toast.success("Settings reset to defaults")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden gap-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-base font-semibold">Settings</DialogTitle>
          <DialogDescription className="text-xs">
            Customize the look, typography, and behavior of FileEx.
          </DialogDescription>
        </DialogHeader>

        {/* Tab navigation */}
        <div className="flex border-b bg-muted/30 px-3 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("appearance")}
            className={`flex items-center gap-1.5 py-2 px-3 text-xs font-medium border-b-2 transition-colors ${
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
            className={`flex items-center gap-1.5 py-2 px-3 text-xs font-medium border-b-2 transition-colors ${
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
            className={`flex items-center gap-1.5 py-2 px-3 text-xs font-medium border-b-2 transition-colors ${
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
            onClick={() => setActiveTab("about")}
            className={`flex items-center gap-1.5 py-2 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "about"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            About
          </button>
        </div>

        {/* Tab contents */}
        <div className="p-5 max-h-[380px] overflow-y-auto space-y-5 text-xs">
          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-semibold text-foreground">Theme Mode</Label>
                <p className="text-[11px] text-muted-foreground mb-3">
                  Choose between Light, Dark, or automatically adapt to your system preferences.
                </p>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all ${
                      theme === "light"
                        ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary"
                        : "border-border hover:bg-accent/50 text-muted-foreground"
                    }`}
                  >
                    <Sun className="h-5 w-5 mb-1.5 text-amber-500" />
                    <span>Light</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all ${
                      theme === "dark"
                        ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary"
                        : "border-border hover:bg-accent/50 text-muted-foreground"
                    }`}
                  >
                    <Moon className="h-5 w-5 mb-1.5 text-indigo-400" />
                    <span>Dark</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme("system")}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all ${
                      theme === "system"
                        ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary"
                        : "border-border hover:bg-accent/50 text-muted-foreground"
                    }`}
                  >
                    <Laptop className="h-5 w-5 mb-1.5 text-sky-500" />
                    <span>System</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Typography Tab */}
          {activeTab === "typography" && (
            <div className="space-y-5">
              {/* Font Size */}
              <div>
                <Label className="text-xs font-semibold text-foreground">Font Size</Label>
                <p className="text-[11px] text-muted-foreground mb-3">
                  Adjust UI scale and text size across the application.
                </p>

                <div className="grid grid-cols-3 gap-3">
                  {(["small", "medium", "large"] as FontSize[]).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => updateSettings({ fontSize: size })}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                        settings.fontSize === size
                          ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary"
                          : "border-border hover:bg-accent/50 text-muted-foreground"
                      }`}
                    >
                      <span className={`capitalize ${
                        size === "small" ? "text-xs" : size === "medium" ? "text-sm" : "text-base font-medium"
                      }`}>
                        {size}
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">
                        {size === "small" ? "Compact (13px)" : size === "medium" ? "Normal (14px)" : "Large (16px)"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Font Family */}
              <div>
                <Label className="text-xs font-semibold text-foreground">Font Family</Label>
                <p className="text-[11px] text-muted-foreground mb-3">
                  Choose your preferred font typeface.
                </p>

                <div className="space-y-2">
                  {[
                    { id: "sans", title: "Modern Sans-Serif", desc: "System UI, Inter, Roboto", style: "font-sans" },
                    { id: "mono", title: "Developer Monospace", desc: "JetBrains Mono, Fira Code", style: "font-mono" },
                    { id: "serif", title: "Classic Serif", desc: "Georgia, Cambria, Editorial", style: "font-serif" },
                  ].map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => updateSettings({ fontFamily: font.id as FontFamily })}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                        settings.fontFamily === font.id
                          ? "border-primary bg-primary/10 ring-1 ring-primary"
                          : "border-border hover:bg-accent/40"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className={`font-medium text-xs ${font.style}`}>{font.title}</div>
                        <div className="text-[10px] text-muted-foreground">{font.desc}</div>
                      </div>
                      {settings.fontFamily === font.id && (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Explorer Tab */}
          {activeTab === "explorer" && (
            <div className="space-y-5">
              {/* Click Mode */}
              <div>
                <Label className="text-xs font-semibold text-foreground">Navigation Click Mode</Label>
                <p className="text-[11px] text-muted-foreground mb-3">
                  Choose how folders and items are opened.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => updateSettings({ clickMode: "single" })}
                    className={`flex items-start gap-2.5 p-3 rounded-lg border text-left transition-all ${
                      settings.clickMode === "single"
                        ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary"
                        : "border-border hover:bg-accent/40 text-muted-foreground"
                    }`}
                  >
                    <MousePointerClick className="h-4 w-4 mt-0.5 shrink-0 text-sky-500" />
                    <div>
                      <div className="text-xs font-medium">Single-Click</div>
                      <div className="text-[10px] text-muted-foreground">Click folder once to navigate inside</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateSettings({ clickMode: "double" })}
                    className={`flex items-start gap-2.5 p-3 rounded-lg border text-left transition-all ${
                      settings.clickMode === "double"
                        ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary"
                        : "border-border hover:bg-accent/40 text-muted-foreground"
                    }`}
                  >
                    <MousePointerClick className="h-4 w-4 mt-0.5 shrink-0 text-indigo-500" />
                    <div>
                      <div className="text-xs font-medium">Double-Click</div>
                      <div className="text-[10px] text-muted-foreground">Click to select, double-click to open</div>
                    </div>
                  </button>
                </div>
              </div>

              <Separator />

              {/* Hidden Files */}
              <div className="flex items-center justify-between p-2 rounded-lg border bg-muted/20">
                <div className="space-y-0.5">
                  <Label htmlFor="hidden-files" className="text-xs font-medium cursor-pointer">
                    Show Hidden Files (Dotfiles)
                  </Label>
                  <p className="text-[10px] text-muted-foreground">
                    Display files beginning with a period (e.g. .git, .config, .env)
                  </p>
                </div>
                <Checkbox
                  id="hidden-files"
                  checked={settings.showHiddenFiles}
                  onCheckedChange={(checked) => updateSettings({ showHiddenFiles: !!checked })}
                />
              </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === "about" && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                <div className="p-2.5 bg-primary/10 rounded-lg text-primary font-bold text-sm">
                  FE
                </div>
                <div>
                  <h4 className="font-semibold text-sm">FileEx</h4>
                  <p className="text-[11px] text-muted-foreground">Modern Desktop File Explorer • Version 0.5.4</p>
                </div>
              </div>

              <div className="space-y-2 text-muted-foreground text-xs leading-relaxed">
                <p>
                  Built with Tauri v2, React 19, TypeScript, and shadcn/ui. Designed for high performance, smooth animations, and native desktop integration.
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-[11px]">Source Code</span>
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
            </div>
          )}
        </div>

        <DialogFooter className="p-3 border-t bg-muted/20 flex items-center justify-between sm:justify-between w-full">
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
            className="text-xs"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
