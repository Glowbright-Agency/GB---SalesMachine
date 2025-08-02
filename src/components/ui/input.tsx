import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'bottom-border'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'default', ...props }, ref) => {
    const baseStyles = "w-full bg-transparent focus:outline-none font-['Poppins'] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    
    const variantStyles = {
      default: cn(
        "flex h-9 rounded-md border border-input px-3 py-1 text-base",
        "file:text-foreground placeholder:text-muted-foreground",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
        "disabled:pointer-events-none md:text-sm"
      ),
      'bottom-border': cn(
        "border-0 border-b-2 border-gray-700 focus:border-gray-900 py-3 text-center",
        "text-xl text-gray-600 placeholder-gray-400"
      )
    }

    return (
      <input
        type={type}
        className={cn(baseStyles, variantStyles[variant], className)}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }