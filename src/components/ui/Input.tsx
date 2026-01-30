import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from '@/shared/lib/utils'

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean
    leadingIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, error, leadingIcon, ...props }, ref) => {
        const [showPassword, setShowPassword] = React.useState(false)
        const isPassword = type === 'password'

        return (
            <div className="relative w-full group/input">
                {leadingIcon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within/input:text-brand-500 transition-colors">
                        {leadingIcon}
                    </div>
                )}
                <input
                    type={isPassword ? (showPassword ? 'text' : 'password') : type}
                    className={cn(
                        "flex h-12 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 px-4 py-3.5 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 outline-none transition-all duration-smooth ease-smooth disabled:cursor-not-allowed disabled:opacity-50",
                        leadingIcon && "pl-12",
                        isPassword && "pr-12",
                        error ? "border-red-300 focus:ring-red-500/10 focus:border-red-500" : "focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:focus:ring-brand-500/5",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors p-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        aria-pressed={showPassword}
                    >
                        {showPassword ? (
                            <EyeOff className="size-5" aria-hidden="true" />
                        ) : (
                            <Eye className="size-5" aria-hidden="true" />
                        )}
                    </button>
                )}
            </div>
        )
    }
)
Input.displayName = "Input"

export { Input }
