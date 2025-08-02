import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'bottom-border'
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const baseStyles = "w-full bg-transparent focus:outline-none font-['Poppins'] transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none"
    
    const variantStyles = {
      default: cn(
        "flex min-h-[60px] rounded-md border border-input px-3 py-2 text-base",
        "placeholder:text-muted-foreground",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
        "disabled:pointer-events-none md:text-sm"
      ),
      'bottom-border': cn(
        "border-0 border-b-2 border-[#242424] focus:border-[#242424] px-4 py-3",
        "text-[rgba(108,102,109,0.8)] placeholder:text-[rgba(108,102,109,0.6)] tracking-wide"
      )
    }

    return (
      <textarea
        className={cn(baseStyles, variantStyles[variant], className)}
        ref={ref}
        {...props}
      />
    )
  }
)

Textarea.displayName = "Textarea"

export { Textarea }