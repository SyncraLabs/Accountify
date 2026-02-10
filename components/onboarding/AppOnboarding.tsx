'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
    Sparkles,
    LayoutDashboard,
    Bot,
    Calendar,
    Users,
    ChevronRight,
    X,
    Check,
    Flame,
    Target,
    TrendingUp,
    MessageCircle
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

interface AppOnboardingProps {
    onComplete: () => void
}

export function AppOnboarding({ onComplete }: AppOnboardingProps) {
    const t = useTranslations('onboarding')
    const [currentStep, setCurrentStep] = useState(0)

    const steps = [
        {
            icon: Sparkles,
            title: t('steps.welcome.title'),
            subtitle: t('steps.welcome.subtitle'),
            description: t('steps.welcome.description'),
            visual: "welcome"
        },
        {
            icon: LayoutDashboard,
            title: t('steps.dashboard.title'),
            subtitle: t('steps.dashboard.subtitle'),
            description: t('steps.dashboard.description'),
            visual: "dashboard"
        },
        {
            icon: Bot,
            title: t('steps.coach.title'),
            subtitle: t('steps.coach.subtitle'),
            description: t('steps.coach.description'),
            visual: "coach"
        },
        {
            icon: Calendar,
            title: t('steps.calendar.title'),
            subtitle: t('steps.calendar.subtitle'),
            description: t('steps.calendar.description'),
            visual: "calendar"
        },
        {
            icon: Users,
            title: t('steps.community.title'),
            subtitle: t('steps.community.subtitle'),
            description: t('steps.community.description'),
            visual: "community"
        }
    ]

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            onComplete()
        }
    }

    const handleSkip = () => {
        onComplete()
    }

    const step = steps[currentStep]
    const Icon = step.icon

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl"
        >
            {/* Ambient glow effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.05, 0.15, 0.05]
                    }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.05, 0.1, 0.05]
                    }}
                    transition={{ duration: 6, repeat: Infinity, delay: 1 }}
                    className="absolute top-1/2 right-1/3 w-64 h-64 bg-primary/15 rounded-full blur-3xl"
                />
            </div>

            {/* Language Switcher */}
            <div className="absolute top-6 left-6 z-10">
                <LanguageSwitcher />
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
                            {step.visual === "welcome" && <WelcomeVisual />}
                            {step.visual === "dashboard" && <DashboardVisual />}
                            {step.visual === "coach" && <CoachVisual />}
                            {step.visual === "calendar" && <CalendarVisual />}
                            {step.visual === "community" && <CommunityVisual />}
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
                            {step.title}
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 }}
                            className="text-sm font-medium text-primary mb-4"
                        >
                            {step.subtitle}
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-zinc-400 max-w-sm leading-relaxed"
                        >
                            {step.description}
                        </motion.p>
                    </motion.div>
                </AnimatePresence>

                {/* Progress dots */}
                <div className="flex justify-center gap-2 mt-10 mb-8">
                    {steps.map((_, index) => (
                        <motion.button
                            key={index}
                            onClick={() => setCurrentStep(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${index === currentStep
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
                        {currentStep === steps.length - 1 ? (
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

function WelcomeVisual() {
    return (
        <div className="relative w-64 h-40 flex items-center justify-center">
            {/* Central logo/icon */}
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
                className="relative"
            >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary flex items-center justify-center shadow-[0_0_60px_rgba(191,245,73,0.4)]">
                    <Sparkles className="h-10 w-10 text-primary" />
                </div>

                {/* Orbiting particles */}
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: [0, 1, 0],
                            scale: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3,
                        }}
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: `rotate(${i * 60}deg) translateX(50px)`,
                        }}
                        className="w-2 h-2 -ml-1 -mt-1 rounded-full bg-primary"
                    />
                ))}
            </motion.div>
        </div>
    )
}

function DashboardVisual() {
    const t = useTranslations('onboarding.steps.dashboard.visual');
    return (
        <div className="w-72 space-y-2">
            {/* Stats row */}
            <div className="flex gap-2">
                {[
                    { icon: Check, label: "4/5", color: "text-primary" },
                    { icon: TrendingUp, label: "85%", color: "text-primary" },
                    { icon: Users, label: "3", color: "text-primary" },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        className="flex-1 p-3 rounded-xl bg-zinc-800/80 border border-zinc-700"
                    >
                        <stat.icon className={`h-4 w-4 ${stat.color} mb-1`} />
                        <p className="text-lg font-bold text-white">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Habit rows */}
            {[t('meditate'), t('exercise'), t('read')].map((habit, i) => (
                <motion.div
                    key={habit}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.6 + i * 0.1, type: "spring" }}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center ${i < 2 ? 'bg-primary/20' : 'bg-zinc-700'
                            }`}
                    >
                        {i < 2 && <Check className="h-4 w-4 text-primary" />}
                    </motion.div>
                    <span className="text-sm text-white">{habit}</span>
                    {i < 2 && (
                        <div className="ml-auto flex items-center gap-1 text-xs text-orange-400">
                            <Flame className="h-3 w-3" />
                            <span>{5 - i}</span>
                        </div>
                    )}
                </motion.div>
            ))}
        </div>
    )
}

function CoachVisual() {
    const t = useTranslations('onboarding.steps.coach.visual');
    return (
        <div className="w-72 space-y-3">
            {/* User message */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex justify-end"
            >
                <div className="max-w-[80%] p-3 rounded-2xl rounded-br-sm bg-primary/20 border border-primary/30">
                    <p className="text-sm text-white">{t('user')}</p>
                </div>
            </motion.div>

            {/* AI response */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex gap-2"
            >
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="max-w-[80%] p-3 rounded-2xl rounded-bl-sm bg-zinc-800 border border-zinc-700">
                    <p className="text-sm text-zinc-300">{t('ai')}</p>
                </div>
            </motion.div>

            {/* Routine suggestion preview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="ml-10 p-3 rounded-xl bg-primary/10 border border-primary/20"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-primary">{t('routine')}</span>
                </div>
                <div className="flex gap-1">
                    {["🧘", "📚", "💪"].map((emoji, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1 + i * 0.1, type: "spring" }}
                            className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-sm"
                        >
                            {emoji}
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}

function CalendarVisual() {
    const t = useTranslations('onboarding.steps.calendar.visual');
    const days = [
        [1, 1, 1, 0, 1, 1, 1],
        [1, 0, 1, 1, 1, 0, 1],
        [1, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 0, 1, 0],
    ]

    return (
        <div className="w-64">
            {/* Calendar grid */}
            <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-white">{t('date')}</span>
                    <div className="flex items-center gap-1 text-orange-400">
                        <Flame className="h-4 w-4" />
                        <span className="text-sm font-bold">12</span>
                    </div>
                </div>

                <div className="space-y-1">
                    {days.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex gap-1 justify-center">
                            {row.map((filled, colIndex) => (
                                <motion.div
                                    key={colIndex}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{
                                        delay: 0.2 + (rowIndex * 7 + colIndex) * 0.02,
                                        type: "spring",
                                        stiffness: 200
                                    }}
                                    className={`w-6 h-6 rounded-md ${filled
                                        ? 'bg-primary/60 shadow-[0_0_10px_rgba(191,245,73,0.3)]'
                                        : 'bg-zinc-700/50'
                                        }`}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Streak indicator */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-3 flex items-center justify-center gap-2 text-sm"
            >
                <span className="text-zinc-400">{t('streak')}:</span>
                <span className="text-primary font-bold">{t('days')}</span>
            </motion.div>
        </div>
    )
}

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
