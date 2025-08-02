import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const headingVariants = cva(
  "font-['Poppins'] tracking-wide text-gray-800",
  {
    variants: {
      variant: {
        h1: "text-3xl md:text-4xl font-medium leading-tight",
        h2: "text-2xl font-bold",
        h3: "text-xl font-semibold",
        h4: "text-lg font-medium"
      }
    },
    defaultVariants: {
      variant: "h1"
    }
  }
)

const textVariants = cva(
  "font-['Poppins']",
  {
    variants: {
      variant: {
        body: "text-lg text-gray-600",
        caption: "text-sm text-gray-600",
        muted: "text-sm text-gray-400",
        hint: "text-gray-600 font-light tracking-wide"
      },
      size: {
        sm: "text-sm",
        md: "text-base", 
        lg: "text-lg"
      }
    },
    defaultVariants: {
      variant: "body",
      size: "md"
    }
  }
)

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement>, VariantProps<typeof headingVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement>, VariantProps<typeof textVariants> {
  as?: 'p' | 'span' | 'div'
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, variant, as: Comp = 'h1', ...props }, ref) => {
    return (
      <Comp
        className={cn(headingVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, variant, size, as: Comp = 'p', ...props }, ref) => {
    return (
      <Comp
        className={cn(textVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

Heading.displayName = "Heading"
Text.displayName = "Text"

export { Heading, Text, headingVariants, textVariants }