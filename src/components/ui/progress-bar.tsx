import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  showLabel?: boolean
  label?: string
  className?: string
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ value, max = 100, showLabel = false, label, className, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    return (
      <div ref={ref} className={cn("mb-6", className)} {...props}>
        {showLabel && (
          <div className="flex justify-between text-sm text-[#242424] mb-2 font-['Poppins']">
            <span>{label || `Progress ${value} of ${max}`}</span>
            <span>{Math.round(percentage)}% Complete</span>
          </div>
        )}
        <div className="w-full bg-white rounded-full h-2">
          <div 
            className="bg-[#242424] h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }
)

ProgressBar.displayName = "ProgressBar"

export { ProgressBar }