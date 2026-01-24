'use client'

import { useLanding } from './LandingContext'
import { ModalStep } from './ModalSystem'
import { ReactNode } from 'react'

interface OpenModalButtonProps {
    className?: string
    children: ReactNode
    step?: ModalStep
}

export function OpenModalButton({ className, children, step }: OpenModalButtonProps) {
    const { openModal } = useLanding()

    return (
        <button
            onClick={() => openModal(step)}
            className={className}
        >
            {children}
        </button>
    )
}
