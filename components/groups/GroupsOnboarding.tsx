'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Users, Share2, Target, ChevronRight, X, Flame, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface GroupsOnboardingProps {
    onComplete: () => void
}

const stepKeys = ['community', 'share', 'progress'] as const
const stepIcons = [Users, Share2, Target] as const

export function GroupsOnboarding({ onComplete }: GroupsOnboardingProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const t = useTranslations('groups.groupsOnboarding')

    const handleNext = () => {
        if (currentStep < stepKeys.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            onComplete()
        }
    }

    const handleSkip = () => {
        onComplete()
    }

    const stepKey = stepKeys[currentStep]
    const Icon = stepIcons[currentStep]

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl"
        >
            {/* Ambient glow effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.15, 0.1]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.05, 0.1, 0.05]
                    }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
                />
            </div>

            {/* Skip button */}
            <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white z-10"
            >
                {t('actions.skip')}
                <X className="ml-1 h-4 w-4" />
            </Button>

            {/* Main content */}
            <div className="relative w-full max-w-lg mx-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -30, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="flex flex-col items-center text-center"
                    >
                        {/* Visual illustration */}
                        <div className="mb-8">
                            {stepKey === "community" && <CommunityVisual />}
                            {stepKey === "share" && <ShareVisual t={t} />}
                            {stepKey === "progress" && <ProgressVisual />}
                        </div>

                        {/* Icon badge */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="mb-6 p-4 rounded-2xl bg-primary/10 border border-primary/20 shadow-[0_0_40px_rgba(191,245,73,0.15)]"
                        >
                            <Icon className="h-8 w-8 text-primary" />
                        </motion.div>

                        {/* Text content */}
                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-2xl font-bold text-white mb-2"
                        >
                            {t(`steps.${stepKey}.title`)}
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 }}
                            className="text-sm font-medium text-primary mb-4"
                        >
                            {t(`steps.${stepKey}.subtitle`)}
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-zinc-400 max-w-sm leading-relaxed"
                        >
                            {t(`steps.${stepKey}.description`)}
                        </motion.p>
                    </motion.div>
                </AnimatePresence>

                {/* Progress dots */}
                <div className="flex justify-center gap-2 mt-10 mb-8">
                    {stepKeys.map((_, index) => (
                        <motion.button
                            key={index}
                            onClick={() => setCurrentStep(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                index === currentStep
                                    ? 'w-8 bg-primary'
                                    : index < currentStep
                                    ? 'w-2 bg-primary/50'
                                    : 'w-2 bg-zinc-700'
                            }`}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                        />
                    ))}
                </div>

                {/* Action button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-center"
                >
                    <Button
                        onClick={handleNext}
                        className="px-8 py-6 bg-primary text-black font-semibold rounded-xl hover:bg-primary/90 shadow-[0_0_30px_rgba(191,245,73,0.3)] transition-all duration-300 hover:shadow-[0_0_40px_rgba(191,245,73,0.4)]"
                    >
                        {currentStep === stepKeys.length - 1 ? (
                            <>
                                {t('actions.start')}
                                <Check className="ml-2 h-5 w-5" />
                            </>
                        ) : (
                            <>
                                {t('actions.next')}
                                <ChevronRight className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </Button>
                </motion.div>
            </div>
        </motion.div>
    )
}

// Visual components for each step
function CommunityVisual() {
    return (
        <div className="relative w-64 h-40">
            {/* Central user */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            >
                <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center shadow-[0_0_30px_rgba(191,245,73,0.3)]">
                    <span className="text-2xl">👤</span>
                </div>
            </motion.div>

            {/* Orbiting members */}
            {[0, 1, 2, 3].map((i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        rotate: [0, 360],
                    }}
                    transition={{
                        opacity: { delay: 0.2 + i * 0.1 },
                        scale: { delay: 0.2 + i * 0.1, type: "spring" },
                        rotate: { duration: 20, repeat: Infinity, ease: "linear" }
                    }}
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transformOrigin: '0 0',
                    }}
                >
                    <motion.div
                        style={{
                            transform: `rotate(${i * 90}deg) translateX(60px) rotate(-${i * 90}deg)`,
                        }}
                        className="w-10 h-10 -ml-5 -mt-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center"
                    >
                        <span className="text-sm">{['🧑', '👩', '🧔', '👱'][i]}</span>
                    </motion.div>
                </motion.div>
            ))}

            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                <motion.circle
                    cx="50%"
                    cy="50%"
                    r="50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    className="text-primary"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                />
            </svg>
        </div>
    )
}

function ShareVisual({ t }: { t: (key: string) => string }) {
    return (
        <div className="relative w-64 h-40 flex items-center justify-center">
            {/* Habit card */}
            <motion.div
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute left-4 p-3 rounded-xl bg-zinc-800/80 border border-zinc-700"
            >
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <Check className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-white">{t('visual.meditate')}</p>
                        <div className="flex items-center gap-1 text-xs text-orange-400">
                            <Flame className="h-3 w-3" />
                            <span>5 {t('visual.days')}</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Arrow animation */}
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="absolute left-1/2 -translate-x-1/2"
            >
                <motion.div
                    animate={{ x: [0, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <Share2 className="h-6 w-6 text-primary" />
                </motion.div>
            </motion.div>

            {/* Group indicator */}
            <motion.div
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute right-4 p-3 rounded-xl bg-primary/10 border border-primary/30"
            >
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                        {['🧑', '👩', '🧔'].map((emoji, i) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-zinc-700 border border-zinc-600 flex items-center justify-center text-xs">
                                {emoji}
                            </div>
                        ))}
                    </div>
                    <span className="text-xs text-primary font-medium">{t('visual.group')}</span>
                </div>
            </motion.div>
        </div>
    )
}

function ProgressVisual() {
    const members = [
        { name: "Ana", progress: 85, habits: 3, completed: 3 },
        { name: "Carlos", progress: 66, habits: 3, completed: 2 },
        { name: "María", progress: 100, habits: 2, completed: 2 },
    ]

    return (
        <div className="w-64 space-y-3">
            {members.map((member, i) => (
                <motion.div
                    key={member.name}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-xs">
                                {member.name[0]}
                            </div>
                            <span className="text-sm font-medium text-white">{member.name}</span>
                        </div>
                        <span className="text-xs text-zinc-400">
                            {member.completed}/{member.habits}
                        </span>
                    </div>
                    <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${member.progress}%` }}
                            transition={{ delay: 0.4 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                            className={`h-full rounded-full ${
                                member.progress === 100 ? 'bg-primary' : 'bg-primary/60'
                            }`}
                        />
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
