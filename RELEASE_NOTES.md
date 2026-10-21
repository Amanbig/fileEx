# 📝 FileEx Release Notes

This document contains the latest release notes and history for FileEx releases.

---

## 🚀 Latest Release: v1.0.0 (October 2026)

### ✨ Major Features
- **Places & Quick Access Sidebar**:
  - Instant navigation to Home, Documents, Downloads, Desktop, Pictures, Videos, Music, and Root.
  - Custom folder pinning/unpinning (Favorites).
  - Collapsible sidebar mode with tooltips.
- **Interactive Breadcrumb Navigation**:
  - Clickable breadcrumbs (`Root > home > user > Documents`).
  - Click-to-edit mode with keyboard navigation.
  - Added Forward and Up-one-level (`..`) directory buttons.
- **Title Bar & Window Controls**:
  - Native Tauri v2 window controls (Minimize, Maximize/Restore, Close).
  - Double-click to maximize and window drag support.
- **Status Bar**:
  - Live directory item counts, search filter tracking, and selected items byte size summary.

### 🛠️ Fixes & Dependencies
- Fixed Linux WebKitGTK DRM/GBM buffer creation permission denied errors (`10de` NVIDIA GPUs).
- Upgraded npm dependencies and Rust crates.
- GitHub Actions release workflow now strictly publishes on tag pushes (`v*` / `app-v*`).

---

## 📜 Release History

- [v1.0.0 (Latest)](file:///home/amanpreet/Documents/fileEx/releases/v1.0.0.md) - Quick Access Sidebar, Breadcrumb Path Bar, TitleBar, Status Bar, and Linux GPU fixes.
- [v0.1.0 (Initial Release)](file:///home/amanpreet/Documents/fileEx/releases/v0.1.0.md) - Core explorer functionality, file management, clipboard operations, and themes.
