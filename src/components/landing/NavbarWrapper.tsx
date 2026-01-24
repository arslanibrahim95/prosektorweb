'use client'

import { Navbar } from '@/components/layout/Navbar'
import { useLanding } from './LandingContext'
import { ModalStep } from './ModalSystem'

export function NavbarWrapper() {
    const { openModal } = useLanding()

    return (
        <Navbar
            variant="landing"
            onOpenLogin={() => openModal(ModalStep.LOGIN)}
        />
    )
}
