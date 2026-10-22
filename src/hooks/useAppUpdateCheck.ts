import { useState, useEffect, useCallback } from "react"
import { invoke } from "@tauri-apps/api/core"

const LAST_CHECK_KEY = "fileex-last-update-check-ts"
const CACHED_UPDATE_KEY = "fileex-cached-update-info"
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000 // 6 hours
const FALLBACK_VERSION = "0.6.0"

export interface CachedUpdateInfo {
  hasUpdate: boolean
  latestVersion: string
  releaseName: string
  htmlUrl: string
  checkedAgainstVersion?: string
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

export function useAppUpdateCheck(initialVersion?: string) {
  const [currentVersion, setCurrentVersion] = useState<string>(initialVersion || FALLBACK_VERSION)
  const [hasUpdate, setHasUpdate] = useState(false)
  const [latestVersion, setLatestVersion] = useState<string | null>(null)
  const [releaseUrl, setReleaseUrl] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  // Fetch actual running version from Tauri backend dynamically
  useEffect(() => {
    invoke<{ current_version: string }>("get_install_info")
      .then((info) => {
        if (info?.current_version) {
          setCurrentVersion(info.current_version)
        }
      })
      .catch(() => {
        // Fallback to tauri getVersion if get_install_info fails
        import("@tauri-apps/api/app")
          .then((app) => app.getVersion())
          .then((v) => {
            if (v) setCurrentVersion(v)
          })
          .catch(() => {})
      })
  }, [])

  const check = useCallback(async (force: boolean = false) => {
    const now = Date.now()
    const lastCheck = parseInt(localStorage.getItem(LAST_CHECK_KEY) || "0", 10)

    // Check cache first if not forced, within interval, and checked against the same app version
    if (!force && now - lastCheck < CHECK_INTERVAL_MS) {
      try {
        const cached = localStorage.getItem(CACHED_UPDATE_KEY)
        if (cached) {
          const parsed: CachedUpdateInfo = JSON.parse(cached)
          // Re-evaluate against the current version
          const isStillNewer = isVersionGreater(parsed.latestVersion, currentVersion)
          setHasUpdate(isStillNewer)
          setLatestVersion(parsed.latestVersion)
          setReleaseUrl(parsed.htmlUrl)
          return
        }
      } catch (_) {}
    }

    setIsChecking(true)
    try {
      const res = await fetch("https://api.github.com/repos/Amanbig/fileEx/releases/latest", {
        headers: { "Accept": "application/vnd.github.v3+json" }
      })

      if (!res.ok) return

      const data = await res.json()
      const newer = isVersionGreater(data.tag_name, currentVersion)

      setHasUpdate(newer)
      setLatestVersion(data.tag_name)
      setReleaseUrl(data.html_url)

      localStorage.setItem(LAST_CHECK_KEY, String(now))
      localStorage.setItem(CACHED_UPDATE_KEY, JSON.stringify({
        hasUpdate: newer,
        latestVersion: data.tag_name,
        releaseName: data.name,
        htmlUrl: data.html_url,
        checkedAgainstVersion: currentVersion
      }))
    } catch (err) {
      // Non-blocking fail silently for background check
    } finally {
      setIsChecking(false)
    }
  }, [currentVersion])

  useEffect(() => {
    // Read cache immediately for instant UI, re-evaluating with currentVersion
    try {
      const cached = localStorage.getItem(CACHED_UPDATE_KEY)
      if (cached) {
        const parsed: CachedUpdateInfo = JSON.parse(cached)
        const isStillNewer = isVersionGreater(parsed.latestVersion, currentVersion)
        setHasUpdate(isStillNewer)
        setLatestVersion(parsed.latestVersion)
        setReleaseUrl(parsed.htmlUrl)
      }
    } catch (_) {}

    // Run background check delayed by 3 seconds after app launch
    const timer = setTimeout(() => {
      check(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [check, currentVersion])

  return {
    currentVersion,
    hasUpdate,
    latestVersion,
    releaseUrl,
    isChecking,
    checkForUpdate: () => check(true)
  }
}
