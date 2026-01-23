import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon?: React.ReactNode;
}

export const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
    ({ className, children, variant = 'primary', size = 'md', isLoading, icon, disabled, ...props }, ref) => {

        const baseStyles = "relative inline-flex items-center justify-center rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group";

        const variants = {
            primary: "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-600/30 hover:shadow-brand-600/50 hover:scale-[1.02] active:scale-[0.98]",
            secondary: "bg-white text-brand-600 border border-neutral-200 hover:border-brand-200 hover:bg-neutral-50 shadow-sm hover:shadow-md",
            outline: "bg-transparent border-2 border-brand-600 text-brand-600 hover:bg-brand-50"
        };

        const sizes = {
            sm: "px-4 py-2 text-sm",
            md: "px-6 py-3 text-base",
            lg: "px-8 py-4 text-lg"
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || isLoading}
                {...props}
            >
                {/* Shine effect for primary variant */}
                {variant === 'primary' && (
                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />
                )}

                <span className="relative z-20 flex items-center gap-2">
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {!isLoading && icon && <span className="w-5 h-5">{icon}</span>}
                    {children}
                </span>
            </button>
        );
    }
);

GradientButton.displayName = 'GradientButton';
