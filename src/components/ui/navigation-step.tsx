import * as React from "react"
import { cn } from "@/lib/utils"

interface NavigationStepProps {
  number: number | string
  title: string
  isActive?: boolean
  isCompleted?: boolean
  isLast?: boolean
  size?: 'small' | 'medium'
}

const NavigationStep = React.forwardRef<HTMLDivElement, NavigationStepProps>(
  ({ number, title, isActive = false, isCompleted = false, isLast = false, size = 'medium', ...props }, ref) => {
    const circleSize = size === 'small' ? 'w-5 h-5' : 'w-6 h-6'
    const textSize = size === 'small' ? 'text-xs sm:text-sm' : 'text-sm md:text-base'
    const numberSize = size === 'small' ? 'text-xs' : 'text-sm'

    return (
      <div ref={ref} className="flex items-center" {...props}>
        <div className="flex items-center gap-2 md:gap-3">
          <div className={cn(
            circleSize,
            "rounded-full flex items-center justify-center",
            isActive 
              ? 'bg-[#242424] text-white' 
              : isCompleted 
                ? 'bg-green-600 text-white'
                : 'bg-[#CFCFCF] text-[#242424]'
          )}>
            <span className={cn(
              "font-medium font-['Poppins']",
              numberSize
            )}>
              {isCompleted ? '✓' : number}
            </span>
          </div>
          <span className={cn(
            "text-[#242424] font-medium font-['Poppins'] capitalize tracking-wide",
            textSize,
            isCompleted ? 'text-gray-600' : ''
          )}>
            {title}
          </span>
        </div>
        {!isLast && (
          <div className="w-8 sm:w-10 md:w-14 h-0 border-t-2 border-dashed border-[#242424] mx-2 md:mx-4" />
        )}
      </div>
    )
  }
)

NavigationStep.displayName = "NavigationStep"

export { NavigationStep }