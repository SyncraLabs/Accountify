'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { AppOnboarding } from '@/components/onboarding/AppOnboarding'
import { completeAppOnboarding } from '@/app/[locale]/onboarding/actions'

interface DashboardClientProps {
    showOnboarding: boolean
    children: React.ReactNode
}

export function DashboardClient({ showOnboarding, children }: DashboardClientProps) {
    const [isOnboardingVisible, setIsOnboardingVisible] = useState(showOnboarding)

    const handleOnboardingComplete = async () => {
        setIsOnboardingVisible(false)
        await completeAppOnboarding()
    }

    return (
        <>
            {children}
            <AnimatePresence>
                {isOnboardingVisible && (
                    <AppOnboarding onComplete={handleOnboardingComplete} />
                )}
            </AnimatePresence>
        </>
    )
}
