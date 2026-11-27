import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { convertFileSrc } from "@tauri-apps/api/core"

export const IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "svg",
  "bmp",
  "ico",
  "avif",
])

export function isImageExtension(extension: string | null | undefined): boolean {
  if (!extension) return false
  return IMAGE_EXTENSIONS.has(extension.toLowerCase())
}

export function getLocalAssetUrl(filePath: string): string {
  try {
    return convertFileSrc(filePath)
  } catch {
    return filePath
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateFilename(name: string, maxLength: number = 32): string {
  if (!name || name.length <= maxLength) return name

  const lastDot = name.lastIndexOf('.')
  if (lastDot > 3 && name.length - lastDot <= 8) {
    const ext = name.slice(lastDot)
    const stem = name.slice(0, lastDot)
    const availableStem = maxLength - ext.length - 3
    if (availableStem > 3) {
      return stem.slice(0, availableStem) + '...' + ext
    }
  }

  return name.slice(0, maxLength - 3) + '...'
}
