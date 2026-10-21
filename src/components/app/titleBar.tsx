import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { 
  VscChromeMinimize, 
  VscChromeMaximize, 
  VscChromeRestore, 
  VscChromeClose 
} from "react-icons/vsc";
import { FolderKanban } from "lucide-react";
import { getCurrentWindow } from '@tauri-apps/api/window';
import ThemeToggle from "./themeToggle";

export default function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);
  const appWindow = getCurrentWindow();

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const checkMaximized = async () => {
      try {
        const maximized = await appWindow.isMaximized();
        setIsMaximized(maximized);
      } catch (err) {
        // Fallback for non-tauri or initial hydration
      }
    };

    checkMaximized();

    appWindow.onResized(() => {
      checkMaximized();
    }).then((cleanup) => {
      unlisten = cleanup;
    }).catch(() => {});

    return () => {
      if (unlisten) unlisten();
    };
  }, [appWindow]);

  const handleToggleMaximize = async () => {
    try {
      const maximized = await appWindow.isMaximized();
      if (maximized) {
        await appWindow.unmaximize();
        setIsMaximized(false);
      } else {
        await appWindow.maximize();
        setIsMaximized(true);
      }
    } catch {
      try {
        await appWindow.toggleMaximize();
        const current = await appWindow.isMaximized();
        setIsMaximized(current);
      } catch (err) {
        console.error("Failed to toggle maximize:", err);
      }
    }
  };

  return (
    <header
      data-tauri-drag-region
      onDoubleClick={handleToggleMaximize}
      className="h-10 w-full select-none flex items-center justify-between px-3 border-b border-border/50 bg-background/80 backdrop-blur-sm z-50 text-foreground text-xs drag"
    >
      <div className="flex items-center gap-2 pointer-events-none select-none">
        <FolderKanban className="h-4 w-4 text-primary" />
        <span className="font-semibold tracking-wide text-xs">FileEx</span>
      </div>

      <div className="flex items-center gap-1 no-drag">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-8 p-0 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground"
          onClick={() => appWindow.minimize()}
          title="Minimize"
        >
          <VscChromeMinimize className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-8 p-0 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground"
          onClick={handleToggleMaximize}
          title={isMaximized ? "Restore Down" : "Maximize"}
        >
          {isMaximized ? (
            <VscChromeRestore className="h-3.5 w-3.5" />
          ) : (
            <VscChromeMaximize className="h-3.5 w-3.5" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-8 p-0 rounded-sm hover:bg-destructive hover:text-destructive-foreground text-muted-foreground transition-colors"
          onClick={() => appWindow.close()}
          title="Close"
        >
          <VscChromeClose className="h-3.5 w-3.5" />
        </Button>
      </div>
    </header>
  );
}
