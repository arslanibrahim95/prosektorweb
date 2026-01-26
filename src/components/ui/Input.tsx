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
            <div className="relative w-full group">
                {leadingIcon && (
                    <div className={cn(
                        "absolute left-4 top-1/2 -translate-y-1/2 transition-colors",
                        error
                            ? "text-red-400 group-focus-within:text-red-500"
                            : "text-neutral-400 group-focus-within:text-brand-500"
                    )}>
                        {leadingIcon}
                    </div>
                )}
                <input
                    type={type}
                    aria-invalid={!!error}
                    className={cn(
                        "flex h-12 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 px-4 py-3.5 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 outline-none transition-all duration-smooth ease-smooth disabled:cursor-not-allowed disabled:opacity-50",
                        leadingIcon && "pl-12",
                        error ? "border-red-300 focus:ring-red-500/10 focus:border-red-500" : "focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:focus:ring-brand-500/5",
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
