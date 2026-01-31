'use client'

import { useEffect, useState } from 'react'
import { Particles } from '@/shared/components/ui'

export function ResponsiveParticles() {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    return (
        <Particles
            particleColors={['#dc2626', '#ef4444', '#ffffff']}
            particleCount={isMobile ? 50 : 150}
            particleSpread={10}
            speed={0.08}
            particleBaseSize={80}
            moveParticlesOnHover={true}
            alphaParticles={false}
            disableRotation={false}
        />
    )
}
