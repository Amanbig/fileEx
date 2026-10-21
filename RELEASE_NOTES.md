# 📝 FileEx Release Notes

This document contains the latest release notes and history for FileEx releases.

---

## 🚀 Latest Release: v0.5.4 (October 2026)

### ✨ Major Features
- **In-App Updater & Release Manager**:
  - Dedicated **Updates** tab in Settings drawer.
  - **Optimized Background Update Check**: Runs silently in the background (delayed by 4s on startup, throttled to once every 6 hours via local storage caching) without slowing down app startup or spamming the GitHub API.
  - **Live Indicator Badges**: Shows an animated indicator dot on the Settings gear button (TitleBar and Sidebar footer) whenever a newer release is published.
  - Automatically queries GitHub Releases API (`api.github.com/repos/Amanbig/fileEx/releases/latest`) and compares semantic versions.
  - **Smart Package Matching**: Automatically detects user's OS and installation method:
    - **Linux**: Matches `.deb` (Debian/Ubuntu), `.AppImage`, or `.rpm` according to architecture (`x86_64` / `aarch64`).
    - **Windows**: Matches `.msi` or `.exe` setup installers.
    - **macOS**: Matches `.dmg` disk images.
  - **Download Streaming with Live Progress**: Displays percentage, bytes transferred, and total file size.
  - **Elevated Permissions Handling**:
    - For Linux `.deb` packages, uses `pkexec apt-get install -y` to trigger native Linux polkit administrator prompt, with fallback to system GUI software managers (e.g. Ubuntu Software, GDebi).
    - For `.AppImage`, sets executable permissions (`chmod 0755`) and launches.
    - For Windows/macOS, opens installer directly.
- **Application Settings & Customization**:
  - Dedicated Settings Dialog (`Ctrl+,` shortcut, sidebar button, or TitleBar gear).
  - **Themes**: Switch between Light, Dark, or System mode.
  - **Typography & Font Sizing**: Choose Small (13px), Medium (14px), or Large (16px) with dynamic UI scaling; switch between System Sans, Monospace, and Elegant Serif fonts.
  - **Explorer Navigation**: Configurable Single-Click or Double-Click folder navigation.
  - **Hidden Files**: Toggle dotfiles (`.git`, `.config`, etc.) visibility with 1 click.
  - Quick Reset to Defaults.
- **Grid & Card View Mode**:
  - Seamless toggle between Table (Details) view and Grid (Cards) view with saved user preference.
  - Large file-type icons with color coding, item name, and size.
  - Unified multi-selection across Table and Grid views.
- **Native Context Menus**:
  - Right-click on any file/folder (in Table or Grid) for instant actions (Open, Open in Terminal, Copy, Cut, Copy Path, Copy Name, Rename, Properties, Delete).
  - Right-click on empty canvas to create new folder/file, paste items, refresh, or **Open Terminal Here**.
- **Integrated Terminal Launcher**:
  - Cross-platform terminal emulator launcher (`open_terminal` command).
  - Automatically identifies available terminal:
    - **Linux**: Respects `$TERMINAL`, falls back to `x-terminal-emulator`, `gnome-terminal`, `ptyxis`, `konsole`, `xfce4-terminal`, `kitty`, `alacritty`, `foot`, `tilix`.
    - **Windows**: Launches Windows Terminal (`wt -d`), PowerShell, or `cmd.exe`.
    - **macOS**: Launches native `Terminal.app` (`open -a Terminal`).
  - Available via canvas right-click, folder right-click, and top toolbar button.
- **Global Keyboard Shortcuts**:
  - `Ctrl+C` (Copy), `Ctrl+X` (Cut), `Ctrl+V` (Paste), `Ctrl+A` (Select All), `Ctrl+,` (Settings).
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
- **Title Bar, Window Controls & UX Polish**:
  - Native Tauri v2 window controls (Minimize, Maximize/Restore with toggle fix, Close).
  - Version badge displayed directly in TitleBar (`v0.5.4`).
  - Ellipsis (`...`) text truncation for long file/folder names with full-name tooltip on hover.
  - Removed redundant `...` action column and card buttons in favor of the full-featured right-click context menu (including new "Copy Name" action).
  - Harmonized dark mode color palette (unified neutral-slate background, cards, and sidebar with vibrant blue brand accents).
  - Added MIT License and repository links.
  - Default window size updated to 1100x720 centered.
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
