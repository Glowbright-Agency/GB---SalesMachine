import * as React from "react"
import { cn } from "@/lib/utils"

interface PurpleContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'full' | 'contained'
}

const PurpleContainer = React.forwardRef<HTMLDivElement, PurpleContainerProps>(
  ({ size = 'full', className, children, ...props }, ref) => {
    const containerStyles = {
      full: "px-4 py-8",
      contained: "flex-1 flex items-center justify-center px-3 sm:px-4 lg:px-6 min-h-0"
    }

    const purpleStyles = {
      full: "bg-[#ceb3fc] rounded-3xl mx-4 min-h-[calc(100vh-200px)] flex items-center justify-center",
      contained: "bg-[#ceb3fc] rounded-3xl p-12 sm:p-16 lg:p-20 xl:p-24 w-[96vw] h-[calc(100vh-140px)] flex items-center justify-center"
    }

    return (
      <main 
        ref={ref}
        className={cn(containerStyles[size], className)}
        {...props}
      >
        <div className={purpleStyles[size]}>
          {children}
        </div>
      </main>
    )
  }
)

PurpleContainer.displayName = "PurpleContainer"

export { PurpleContainer }