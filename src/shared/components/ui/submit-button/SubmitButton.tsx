'use client'

import { useFormStatus } from 'react-dom'
import { LucideIcon } from 'lucide-react'
import { Button, ButtonProps } from '@/shared/components/ui'
import { cn } from '@/shared/lib'

interface SubmitButtonProps extends Omit<ButtonProps, 'loading'> {
    label: string
    icon?: LucideIcon
}

export function SubmitButton({ label, icon: Icon, className, variant = "default", ...props }: SubmitButtonProps) {
    const { pending } = useFormStatus()

    return (
        <Button
            type="submit"
            disabled={pending}
            loading={pending}
            variant={variant}
            className={cn("w-full sm:w-auto", className)}
            {...props}
        >
            {Icon && !pending && <Icon className="w-4 h-4 mr-2" />}
            {label}
        </Button>
    )
}
