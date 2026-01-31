'use client'

import React from 'react'
import { ModalSystem } from './ModalSystem'
import { useLanding } from './LandingContext'

export function GlobalModal() {
    const { isModalOpen, closeModal, modalInitialState } = useLanding()
    return (
        <ModalSystem
            isOpen={isModalOpen}
            onClose={closeModal}
            initialState={modalInitialState}
        />
    )
}
