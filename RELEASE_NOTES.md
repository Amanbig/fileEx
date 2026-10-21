# 📝 FileEx Release Notes

This document contains the latest release notes and history for FileEx releases.

---

## 🚀 Latest Release: v0.5.4 (October 2026)

### ✨ Major Features
- **Grid & Card View Mode**:
  - Seamless toggle between Table (Details) view and Grid (Cards) view with saved user preference.
  - Large file-type icons with color coding, item name, and size.
  - Unified multi-selection across Table and Grid views.
- **Native Context Menus**:
  - Right-click on any file/folder (in Table or Grid) for instant actions (Open, Copy, Cut, Copy Path, Rename, Properties, Delete).
  - Right-click on empty canvas to create new folder/file, paste items, or refresh.
- **Global Keyboard Shortcuts**:
  - `Ctrl+C` (Copy), `Ctrl+X` (Cut), `Ctrl+V` (Paste), `Ctrl+A` (Select All).
  - `Delete` (Delete item), `F2` (Rename item), `Enter` (Open item).
  - `Alt+Left` (Back), `Alt+Right` (Forward), `Alt+Up` (Up directory).
- **Native Dialogs & File Properties**:
  - Smart rename modal with filename stem auto-selection.
  - Destructive confirmation dialog for deletions.
  - Detailed File/Folder Properties inspector modal with Unix permissions, size, and item counts.
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

- [v0.5.4 (Latest)](file:///home/amanpreet/Documents/fileEx/releases/v0.5.4.md) - Quick Access Sidebar, Breadcrumb Path Bar, Native Modals, TitleBar, Status Bar, and Linux GPU fixes.
- [v0.1.0 (Initial Release)](file:///home/amanpreet/Documents/fileEx/releases/v0.1.0.md) - Core explorer functionality, file management, clipboard operations, and themes.
