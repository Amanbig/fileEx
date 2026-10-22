import { useTheme } from "../themeProvider";
import { Button } from "../ui/button";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <Button
      variant="ghost"
      size="sm"
      className="relative h-7 w-8 p-0 rounded-sm hover:bg-black/10 dark:hover:bg-white/15 text-muted-foreground hover:text-foreground dark:hover:text-white focus-visible:bg-black/10 dark:focus-visible:bg-white/15 focus-visible:ring-1 focus-visible:ring-primary transition-colors"
      onClick={() => {
        setTheme(isDark ? "light" : "dark");
      }}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}