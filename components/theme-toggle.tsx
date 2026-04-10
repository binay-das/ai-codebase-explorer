"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Check } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        aria-label="Toggle theme"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 origin-top-right rounded-md bg-white p-1 shadow-lg ring-1 ring-black/5 focus:outline-none dark:bg-zinc-950 dark:border dark:border-zinc-800 z-50">
          <button
            onClick={() => { setTheme("light"); setIsOpen(false); }}
            className="w-full text-left flex items-center justify-between px-2 py-1.5 text-sm rounded-sm transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 text-zinc-700 dark:text-zinc-300"
          >
            <span>Light</span>
            {theme === "light" && <Check className="h-4 w-4" />}
          </button>
          <button
            onClick={() => { setTheme("dark"); setIsOpen(false); }}
            className="w-full text-left flex items-center justify-between px-2 py-1.5 text-sm rounded-sm transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 text-zinc-700 dark:text-zinc-300"
          >
            <span>Dark</span>
            {theme === "dark" && <Check className="h-4 w-4" />}
          </button>
          <button
            onClick={() => { setTheme("system"); setIsOpen(false); }}
            className="w-full text-left flex items-center justify-between px-2 py-1.5 text-sm rounded-sm transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 text-zinc-700 dark:text-zinc-300"
          >
            <span>System</span>
            {theme === "system" && <Check className="h-4 w-4" />}
          </button>
        </div>
      )}
    </div>
  )
}
