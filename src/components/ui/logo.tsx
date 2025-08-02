import * as React from "react"
import { cn } from "@/lib/utils"

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
}

const logoSizes = {
  sm: "h-8 w-auto",
  md: "h-10 w-auto", 
  lg: "h-12 w-auto"
}

const Logo = React.forwardRef<HTMLDivElement, LogoProps>(
  ({ size = 'md', className, ...props }, ref) => {
    return (
      <div 
        ref={ref} 
        className={cn("flex items-center", className)} 
        {...props}
      >
        <img 
          src="/logo.svg" 
          alt="Sales Machine" 
          className={cn("flex-shrink-0", logoSizes[size])} 
        />
      </div>
    )
  }
)

Logo.displayName = "Logo"

export { Logo }