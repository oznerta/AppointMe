import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "shad-input flex rounded-[8px] h-10 w-full border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-500 focus-visible:outline-none focus-visible:border-primary-500 focus-visible:ring-0",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
