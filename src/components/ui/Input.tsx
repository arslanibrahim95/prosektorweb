import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean
    leadingIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, error, leadingIcon, ...props }, ref) => {
        return (
            <div className="relative w-full">
                {leadingIcon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-brand-500 transition-colors">
                        {leadingIcon}
                    </div>
                )}
                <input
                    type={type}
                    className={cn(
                        "flex h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 outline-none transition-all disabled:cursor-not-allowed disabled:opacity-50",
                        leadingIcon && "pl-12",
                        error ? "border-red-300 focus:ring-red-100" : "focus:border-brand-500 focus:ring-2 focus:ring-brand-100",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
            </div>
        )
    }
)
Input.displayName = "Input"

export { Input }
