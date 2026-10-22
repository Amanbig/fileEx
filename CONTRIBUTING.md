# Contributing to FileEx

Thank you for your interest in contributing to **FileEx**! We welcome all contributions from bug reports and documentation enhancements to new features and performance optimizations.

---

## 📋 Code of Conduct

This project and everyone participating in it is governed by the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## 🛠️ Development Setup

### Prerequisites
- **Node.js**: v18.0 or newer
- **Rust**: Latest stable toolchain (`rustup update stable`)
- **Git**

#### Linux Dependencies (Debian/Ubuntu)
```bash
sudo apt update
sudo apt install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

### Getting Started

1. **Fork and Clone**
   ```bash
   git clone https://github.com/<your-username>/fileEx.git
   cd fileEx
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Run Development Server**
   ```bash
   npm run tauri dev
   ```

4. **Verify Build & Type Safety**
   ```bash
   npm run build
   cd src-tauri && cargo check
   ```

---

## 🌿 Branching & Git Workflow

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```
2. Make your changes in small, logical commits following conventional commit messages:
   - `feat:` for new capabilities
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `style:` for UI/CSS styling
   - `refactor:` for code restructuring
3. Push your branch to your fork and submit a Pull Request against `main`.

---

## 🧪 Testing Guidelines

Before opening a pull request, ensure:
- Frontend compiles with `npm run build` without any TypeScript or Vite warnings.
- Rust backend compiles with `cargo check` and `cargo test` in `src-tauri`.
- Verify behavior in both **Light Mode** and **Dark Mode**.
- Verify keyboard navigation and responsive window resizing.

---

## 📝 Reporting Bugs & Requesting Features

- **Bug Reports**: Open an issue using our [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.yml).
- **Feature Requests**: Propose ideas using our [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.yml).
- **Discussions**: Start a conversation on [GitHub Discussions](https://github.com/Amanbig/fileEx/discussions).

---

Thank you for helping make FileEx better! ❤️
