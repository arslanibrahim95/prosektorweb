import clsx from 'clsx'
import { ReactNode } from 'react'

interface ContainerProps {
    children: ReactNode
    className?: string
    size?: 'default' | 'narrow' | 'wide'
}

export function Container({ children, className, size = 'default' }: ContainerProps) {
    return (
        <div
            className={clsx(
                "mx-auto px-6 w-full",
                {
                    "max-w-7xl": size === 'default',
                    "max-w-4xl": size === 'narrow',
                    "max-w-[1400px]": size === 'wide'
                },
                className
            )}
        >
            {children}
        </div>
    )
}
