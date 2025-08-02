import * as React from "react"
import { cn } from "@/lib/utils"

interface QuestionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const QuestionCard = React.forwardRef<HTMLDivElement, QuestionCardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn(
          "bg-white/90 backdrop-blur rounded-2xl shadow-xl p-6 sm:p-8",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

QuestionCard.displayName = "QuestionCard"

export { QuestionCard }