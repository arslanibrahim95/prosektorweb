import * as React from "react"
import { cn } from '@/shared/lib'

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
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none transition-colors"
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                        )}
                    </button>
                )}
            </div>
        )
    }
)
Input.displayName = "Input"

export { Input }
