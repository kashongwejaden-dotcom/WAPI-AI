import * as React from "react"
import { cn } from "@/src/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold tracking-widest uppercase transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-amber-500 text-slate-950 shadow hover:bg-amber-400": variant === "default",
            "border border-slate-800 bg-slate-900 shadow-sm hover:bg-slate-800 text-slate-200": variant === "outline",
            "hover:bg-slate-800 hover:text-slate-200": variant === "ghost",
            "bg-slate-800 text-slate-200 shadow-sm hover:bg-slate-700": variant === "secondary",
            "h-10 px-4 py-2": size === "default",
            "h-8 rounded-lg px-3 text-[10px]": size === "sm",
            "h-12 rounded-xl px-8": size === "lg",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
