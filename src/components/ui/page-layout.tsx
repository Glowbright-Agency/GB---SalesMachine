import * as React from "react"
import { cn } from "@/lib/utils"

interface PageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'full-height' | 'flexible'
}

const PageLayout = React.forwardRef<HTMLDivElement, PageLayoutProps>(
  ({ variant = 'full-height', className, children, ...props }, ref) => {
    const layoutStyles = {
      'full-height': "min-h-screen bg-white",
      'flexible': "bg-white h-screen flex flex-col"
    }

    return (
      <div 
        ref={ref}
        className={cn(layoutStyles[variant], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

PageLayout.displayName = "PageLayout"

export { PageLayout }