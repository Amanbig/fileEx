import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
}

export function Progress({ className, value = 0, ...props }: ProgressProps) {
  const safeVal = Math.min(Math.max(value || 0, 0), 100)
  return (
    <div
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-secondary/80",
        className
      )}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeVal}
      {...props}
    >
      <div
        className="h-full bg-primary transition-all duration-200 rounded-full"
        style={{ width: `${safeVal}%` }}
      />
    </div>
  )
}
