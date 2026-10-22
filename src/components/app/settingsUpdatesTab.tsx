import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { 
  DownloadCloud, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  ExternalLink, 
  Package, 
  Terminal, 
  HardDriveDownload,
  Laptop,
  Github
} from "lucide-react"
import { invoke } from "@tauri-apps/api/core"
import { listen } from "@tauri-apps/api/event"
import { toast } from "sonner"

export interface InstallInfo {
  os: "linux" | "windows" | "macos" | string
  arch: "x86_64" | "aarch64" | string
  install_type: "deb" | "appimage" | "rpm" | "msi" | "dmg" | "unknown"
  current_version: string
  exe_path: string
  is_debian_based: boolean
}

export interface GithubAsset {
  id: number
  name: string
  size: number
  browser_download_url: string
  content_type: string
}

export interface GithubRelease {
  tag_name: string
  name: string
  body: string
  published_at: string
  html_url: string
  assets: GithubAsset[]
}

export interface DownloadProgressPayload {
  bytes_downloaded: number
  total_bytes: number
  percentage: number
  finished: boolean
  error?: string | null
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function cleanSemver(tag: string): string {
  return tag.replace(/^app-/, "").replace(/^v/, "").trim()
}

function isVersionGreater(remote: string, local: string): boolean {
  const parse = (v: string) => v.split(".").map(num => parseInt(num, 10) || 0)
  const [rMaj = 0, rMin = 0, rPatch = 0] = parse(cleanSemver(remote))
  const [lMaj = 0, lMin = 0, lPatch = 0] = parse(cleanSemver(local))

  if (rMaj > lMaj) return true
  if (rMaj < lMaj) return false
  if (rMin > lMin) return true
  if (rMin < lMin) return false
  return rPatch > lPatch
}

export default function SettingsUpdatesTab() {
  const [installInfo, setInstallInfo] = useState<InstallInfo | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [release, setRelease] = useState<GithubRelease | null>(null)
  const [matchedAsset, setMatchedAsset] = useState<GithubAsset | null>(null)
  const [hasUpdate, setHasUpdate] = useState<boolean | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgressPayload | null>(null)
  const [downloadedFilePath, setDownloadedFilePath] = useState<string | null>(null)
  const [isInstalling, setIsInstalling] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  const handleRestartApp = async () => {
    try {
      await invoke("restart_app")
    } catch {
      window.location.reload()
    }
  }

  // Fetch installation information on mount
  useEffect(() => {
    invoke<InstallInfo>("get_install_info")
      .then((info) => {
        setInstallInfo(info)
        // Auto-check for updates on tab open
        checkUpdates(info)
      })
      .catch((err) => {
        console.error("Failed to get install info:", err)
      })
  }, [])

  // Listen to streaming download progress from Tauri
  useEffect(() => {
    let unlisten: (() => void) | undefined

    listen<DownloadProgressPayload>("update-download-progress", (event) => {
      setDownloadProgress(event.payload)
      if (event.payload.finished) {
        setIsDownloading(false)
      }
    })
      .then((fn) => {
        unlisten = fn
      })
      .catch((err) => console.error("Could not register listener:", err))

    return () => {
      if (unlisten) unlisten()
    }
  }, [])

  const findMatchingAsset = (assets: GithubAsset[], info: InstallInfo): GithubAsset | null => {
    if (!assets || assets.length === 0) return null
    const os = info.os.toLowerCase()
    const arch = info.arch.toLowerCase()
    const type = info.install_type.toLowerCase()

    if (os === "linux") {
      if (type === "deb" || info.is_debian_based) {
        const deb = assets.find(a => 
          a.name.endsWith(".deb") && 
          (arch.includes("64") ? (a.name.includes("amd64") || a.name.includes("x86_64")) : a.name.includes("arm64"))
        ) || assets.find(a => a.name.endsWith(".deb"))
        if (deb) return deb
      }

      if (type === "appimage") {
        const appimage = assets.find(a => a.name.endsWith(".AppImage") || a.name.endsWith(".appimage"))
        if (appimage) return appimage
      }

      if (type === "rpm") {
        const rpm = assets.find(a => a.name.endsWith(".rpm"))
        if (rpm) return rpm
      }

      // Default Linux fallbacks
      return assets.find(a => a.name.endsWith(".deb")) ||
             assets.find(a => a.name.endsWith(".AppImage") || a.name.endsWith(".appimage")) ||
             null
    }

    if (os === "windows") {
      return assets.find(a => a.name.endsWith(".msi") || a.name.endsWith("-setup.exe") || a.name.endsWith(".exe")) || null
    }

    if (os === "macos") {
      const dmg = assets.find(a => 
        a.name.endsWith(".dmg") && 
        (arch.includes("arm") || arch.includes("aarch64") ? a.name.includes("aarch64") : a.name.includes("x64"))
      ) || assets.find(a => a.name.endsWith(".dmg"))
      return dmg || assets.find(a => a.name.endsWith(".app.tar.gz")) || null
    }

    return null
  }

  const checkUpdates = async (infoToUse?: InstallInfo | null) => {
    const info = infoToUse || installInfo
    setIsChecking(true)
    setDownloadedFilePath(null)
    setDownloadProgress(null)

    try {
      const res = await fetch("https://api.github.com/repos/Amanbig/fileEx/releases/latest", {
        headers: {
          "Accept": "application/vnd.github.v3+json"
        }
      })

      if (!res.ok) {
        throw new Error(`GitHub API returned status ${res.status}`)
      }

      const data: GithubRelease = await res.json()
      setRelease(data)

      const currentVer = info ? info.current_version : "0.6.0"
      const newer = isVersionGreater(data.tag_name, currentVer)
      setHasUpdate(newer)

      if (info) {
        const matched = findMatchingAsset(data.assets, info)
        setMatchedAsset(matched)
      }
    } catch (err: any) {
      toast.error(`Update check failed: ${err.message || err}`)
      setHasUpdate(false)
    } finally {
      setIsChecking(false)
    }
  }

  const handleStartDownload = async (assetToDownload?: GithubAsset) => {
    const target = assetToDownload || matchedAsset
    if (!target) {
      toast.error("No compatible installation package found for this release.")
      return
    }

    setIsDownloading(true)
    setDownloadProgress({
      bytes_downloaded: 0,
      total_bytes: target.size,
      percentage: 0,
      finished: false,
    })

    try {
      toast.info(`Downloading ${target.name}...`)
      const savedPath = await invoke<string>("download_update_file", {
        url: target.browser_download_url,
        fileName: target.name
      })

      setDownloadedFilePath(savedPath)
      toast.success(`Download complete! Saved to ${savedPath}`)
    } catch (err: any) {
      toast.error(`Download failed: ${err.message || err}`)
      setIsDownloading(false)
    }
  }

  const handleInstall = async () => {
    if (!downloadedFilePath || !installInfo) return

    setIsInstalling(true)
    try {
      const result = await invoke<string>("install_update_package", {
        filePath: downloadedFilePath,
        installType: installInfo.install_type
      })

      setIsInstalled(true)
      toast.success(result)
    } catch (err: any) {
      toast.error(`Installation error: ${err.message || err}`)
    } finally {
      setIsInstalling(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* App Brand Header */}
      <div className="flex items-center gap-3.5 p-3.5 rounded-xl border bg-muted/20">
        <img src="/app-icon.png" alt="FileEx Icon" className="w-12 h-12 rounded-lg object-contain shadow-xs" />
        <div>
          <h4 className="font-semibold text-sm">FileEx</h4>
          <p className="text-[11px] text-muted-foreground">Modern Desktop File Explorer</p>
          <span className="inline-block mt-1 text-[10px] text-primary font-mono bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
            Version v{installInfo?.current_version || "0.6.0"}
          </span>
        </div>
      </div>

      <div className="text-muted-foreground text-xs leading-relaxed">
        <p>
          A fast, lightweight cross-platform desktop file explorer built for everyday productivity and speed.
        </p>
      </div>

      <Separator />

      {/* Current System & Version Summary */}
      <div className="p-4 rounded-xl border bg-muted/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Package className="h-5 w-5 text-primary" />
            <div>
              <h4 className="font-semibold text-xs leading-none">Current Installation</h4>
              <p className="text-[11px] text-muted-foreground mt-1">
                Version <span className="font-mono font-medium text-foreground">v{installInfo?.current_version || "0.6.0"}</span>
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => checkUpdates()}
            disabled={isChecking || isDownloading}
            className="text-xs h-7 px-2.5 gap-1.5"
          >
            <RefreshCw className={`h-3 w-3 ${isChecking ? "animate-spin" : ""}`} />
            Check Updates
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-border/40">
          <div>
            <span className="text-muted-foreground">Platform: </span>
            <span className="font-medium text-foreground capitalize">
              {installInfo?.os || "Linux"} ({installInfo?.arch || "x86_64"})
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Package Format: </span>
            <span className="font-mono font-medium text-foreground uppercase">
              .{installInfo?.install_type || "deb"}
            </span>
          </div>
        </div>
      </div>

      {/* Status banner */}
      {isChecking && (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-primary/20 bg-primary/5 text-xs">
          <RefreshCw className="h-4 w-4 text-primary animate-spin" />
          <span>Checking GitHub repository for latest release...</span>
        </div>
      )}

      {!isChecking && hasUpdate === false && release && (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-xs">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-medium text-emerald-600 dark:text-emerald-400">
              You are using the latest version of FileEx!
            </p>
            <p className="text-[11px] text-muted-foreground">
              Current version v{installInfo?.current_version || "0.6.0"} is up to date with the latest GitHub release ({release.tag_name}).
            </p>
          </div>
        </div>
      )}

      {!isChecking && hasUpdate === true && release && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-500/30 bg-blue-500/10 text-xs">
            <DownloadCloud className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground text-xs">
                  Update Available: {release.name || release.tag_name}
                </span>
                <span className="text-[10px] font-mono bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                  {release.tag_name}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                A new version is available for your system.
              </p>
            </div>
          </div>

          {/* Matched target package */}
          {matchedAsset && (
            <div className="p-3.5 rounded-lg border bg-muted/15 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-medium text-xs">
                    <Laptop className="h-3.5 w-3.5 text-primary" />
                    <span>Target Package for your system:</span>
                  </div>
                  <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
                    {matchedAsset.name} ({formatBytes(matchedAsset.size)})
                  </p>
                </div>
              </div>

              {/* Linux Permission guidance banner */}
              {installInfo?.install_type === "deb" && (
                <div className="flex items-start gap-2 p-2.5 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-400">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <p>
                    <strong>Administrator Permissions:</strong> Installing Debian packages requires root access. You will be prompted with your Linux administrator credentials (`pkexec`) to complete installation.
                  </p>
                </div>
              )}

              {/* Download Progress Bar */}
              {isDownloading && downloadProgress && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Downloading...</span>
                    <span>{downloadProgress.percentage.toFixed(0)}%</span>
                  </div>
                  <Progress value={downloadProgress.percentage} className="h-1.5" />
                  <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                    <span>{formatBytes(downloadProgress.bytes_downloaded)}</span>
                    <span>{formatBytes(downloadProgress.total_bytes)}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                {!downloadedFilePath ? (
                  <Button
                    size="sm"
                    disabled={isDownloading}
                    onClick={() => handleStartDownload()}
                    className="w-full text-xs gap-1.5"
                  >
                    <HardDriveDownload className="h-3.5 w-3.5" />
                    {isDownloading ? "Downloading Update..." : `Download & Prepare (${formatBytes(matchedAsset.size)})`}
                  </Button>
                ) : isInstalled ? (
                  <div className="space-y-2.5 w-full p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Update Installed Successfully!</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      The new version has been installed to your system. Restart FileEx to launch the updated version.
                    </p>
                    <Button
                      size="sm"
                      onClick={handleRestartApp}
                      className="w-full text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Restart FileEx Now
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 w-full">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Downloaded to: <span className="font-mono text-[10px] truncate max-w-[260px]">{downloadedFilePath}</span>
                    </div>

                    <Button
                      size="sm"
                      disabled={isInstalling}
                      onClick={handleInstall}
                      className="w-full text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                    >
                      <Terminal className={`h-3.5 w-3.5 ${isInstalling ? 'animate-spin' : ''}`} />
                      {isInstalling ? "Installing update... please authenticate if prompted" : "Install Update Now"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <Separator />

      {/* Links & Safety */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Source Code</span>
          <a
            href="https://github.com/Amanbig/fileEx"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-primary hover:underline font-medium text-xs"
          >
            <Github className="h-3.5 w-3.5" />
            <span>GitHub Repository</span>
          </a>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Release Notes & Changelog</span>
          <a
            href={release?.html_url || "https://github.com/Amanbig/fileEx/releases"}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-primary hover:underline font-medium text-xs"
          >
            <span>View Releases on GitHub</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Open Source License</span>
          <a
            href="https://github.com/Amanbig/fileEx/blob/main/LICENSE"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-primary hover:underline font-medium text-xs"
          >
            <span>MIT License</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  )
}
