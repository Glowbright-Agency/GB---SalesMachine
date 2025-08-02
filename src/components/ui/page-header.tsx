import * as React from "react"
import { cn } from "@/lib/utils"
import { Logo } from "./logo"
import { NavigationStep } from "./navigation-step"

interface Step {
  title: string
  isActive: boolean
  isCompleted: boolean
}

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  steps?: Step[]
  rightContent?: React.ReactNode
  showNavigation?: boolean
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ steps = [], rightContent, showNavigation = true, className, ...props }, ref) => {
    return (
      <header 
        ref={ref}
        className={cn("bg-white px-6 sm:px-8 lg:px-12 py-4 lg:py-6", className)}
        {...props}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Logo size="md" />
          
          {/* Navigation Steps - Hidden on mobile, shown on desktop */}
          {showNavigation && steps.length > 0 && (
            <nav className="hidden xl:flex items-center justify-center">
              <div className="flex items-center space-x-1">
                {steps.map((step, index) => (
                  <NavigationStep
                    key={index}
                    number={index + 1}
                    title={step.title}
                    isActive={step.isActive}
                    isCompleted={step.isCompleted}
                    isLast={index === steps.length - 1}
                  />
                ))}
              </div>
            </nav>
          )}

          {/* Right Content */}
          {rightContent && (
            <div className="hidden lg:block">
              {rightContent}
            </div>
          )}
        </div>

        {/* Tablet Navigation */}
        {showNavigation && steps.length > 0 && (
          <div className="xl:hidden mt-4 flex justify-center">
            <div className="flex items-center space-x-2 overflow-x-auto">
              {steps.map((step, index) => (
                <NavigationStep
                  key={index}
                  number={index + 1}
                  title={step.title}
                  isActive={step.isActive}
                  isCompleted={step.isCompleted}
                  isLast={index === steps.length - 1}
                  size="small"
                />
              ))}
            </div>
          </div>
        )}
      </header>
    )
  }
)

PageHeader.displayName = "PageHeader"

export { PageHeader }