'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { GroupsOnboarding } from './GroupsOnboarding'
import { completeGroupsOnboarding } from '@/app/groups/actions'

interface GroupsPageClientProps {
    children: React.ReactNode
    showOnboarding: boolean
}

export function GroupsPageClient({ children, showOnboarding }: GroupsPageClientProps) {
    const [isOnboardingVisible, setIsOnboardingVisible] = useState(showOnboarding)

    const handleOnboardingComplete = async () => {
        await completeGroupsOnboarding()
        setIsOnboardingVisible(false)
    }

    return (
        <>
            {children}
            <AnimatePresence>
                {isOnboardingVisible && (
                    <GroupsOnboarding onComplete={handleOnboardingComplete} />
                )}
            </AnimatePresence>
        </>
    )
}
