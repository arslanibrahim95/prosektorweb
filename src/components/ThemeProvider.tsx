'use client'

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes'
import * as React from 'react'

interface ThemeProviderWrapperProps extends ThemeProviderProps {
    children: React.ReactNode
}

export function ThemeProvider({
    children,
    ...props
}: ThemeProviderWrapperProps) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
