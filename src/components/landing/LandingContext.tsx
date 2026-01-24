'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { ModalStep } from './ModalSystem'

interface LandingContextType {
    isModalOpen: boolean
    modalInitialState: ModalStep
    openModal: (step?: ModalStep) => void
    closeModal: () => void
}

const LandingContext = createContext<LandingContextType | undefined>(undefined)

export function LandingProvider({ children }: { children: ReactNode }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalInitialState, setModalInitialState] = useState<ModalStep>(ModalStep.INITIAL_CHOICE)

    const openModal = (step: ModalStep = ModalStep.INITIAL_CHOICE) => {
        setModalInitialState(step)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
    }

    return (
        <LandingContext.Provider value={{ isModalOpen, modalInitialState, openModal, closeModal }}>
            {children}
        </LandingContext.Provider>
    )
}

export function useLanding() {
    const context = useContext(LandingContext)
    if (context === undefined) {
        throw new Error('useLanding must be used within a LandingProvider')
    }
    return context
}
