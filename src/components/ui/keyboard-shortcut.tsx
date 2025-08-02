import * as React from "react"
import { cn } from "@/lib/utils"

interface KeyboardShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {
  keys: string[]
  action?: string
  variant?: 'default' | 'muted'
}

const KeyboardShortcut = React.forwardRef<HTMLSpanElement, KeyboardShortcutProps>(
  ({ keys, action, variant = 'default', className, ...props }, ref) => {
    const textColor = variant === 'muted' ? 'text-gray-600' : 'text-gray-600'
    
    return (
      <span 
        ref={ref}
        className={cn("text-sm font-['Poppins']", textColor, className)}
        {...props}
      >
        Press{' '}
        {keys.map((key, index) => (
          <React.Fragment key={key}>
            <span className="font-semibold">{key}</span>
            {index < keys.length - 1 && ' + '}
          </React.Fragment>
        ))}
        {action && ` ${action}`}
      </span>
    )
  }
)

KeyboardShortcut.displayName = "KeyboardShortcut"

export { KeyboardShortcut }