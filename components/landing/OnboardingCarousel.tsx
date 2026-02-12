"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    LayoutDashboard,
    Bot,
    Calendar,
    Users,
    ChevronRight,
    ChevronLeft,
    Check,
    Flame,
    Target,
    TrendingUp,
    MessageCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";

export function OnboardingCarousel() {
    const t = useTranslations("landing.onboardingCarousel");
    const [currentStep, setCurrentStep] = useState(0);
    const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const steps = [
        {
            icon: Sparkles,
            title: t("steps.welcome.title"),
            subtitle: t("steps.welcome.subtitle"),
            description: t("steps.welcome.description"),
            visual: "welcome",
        },
        {
            icon: LayoutDashboard,
            title: t("steps.dashboard.title"),
            subtitle: t("steps.dashboard.subtitle"),
            description: t("steps.dashboard.description"),
            visual: "dashboard",
        },
        {
            icon: Bot,
            title: t("steps.coach.title"),
            subtitle: t("steps.coach.subtitle"),
            description: t("steps.coach.description"),
            visual: "coach",
        },
        {
            icon: Calendar,
            title: t("steps.calendar.title"),
            subtitle: t("steps.calendar.subtitle"),
            description: t("steps.calendar.description"),
            visual: "calendar",
        },
        {
            icon: Users,
            title: t("steps.community.title"),
            subtitle: t("steps.community.subtitle"),
            description: t("steps.community.description"),
            visual: "community",
        },
    ];

    const resetAutoplay = useCallback(() => {
        if (autoplayRef.current) clearInterval(autoplayRef.current);
        autoplayRef.current = setInterval(() => {
            setCurrentStep((prev) => (prev + 1) % steps.length);
        }, 5000);
    }, [steps.length]);

    useEffect(() => {
        resetAutoplay();
        return () => {
            if (autoplayRef.current) clearInterval(autoplayRef.current);
        };
    }, [resetAutoplay]);

    const goTo = (index: number) => {
        setCurrentStep(index);
        resetAutoplay();
    };

    const goNext = () => goTo((currentStep + 1) % steps.length);
    const goPrev = () => goTo((currentStep - 1 + steps.length) % steps.length);

    // Swipe support
    const touchStart = useRef<number | null>(null);
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStart.current = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStart.current === null) return;
        const diff = touchStart.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) goNext();
            else goPrev();
        }
        touchStart.current = null;
    };

    const step = steps[currentStep];
    const Icon = step.icon;

    return (
        <section className="py-20 md:py-24 px-4 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />

            <div className="max-w-2xl mx-auto relative z-10">
                {/* Section header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-4">
                        {t("title")}{" "}
                        <span className="text-primary">{t("titleHighlight")}</span>
                    </h2>
                    <p className="text-zinc-400 max-w-md mx-auto">
                        {t("subtitle")}
                    </p>
                </motion.div>

                {/* Carousel card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="relative bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Ambient glow */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.08, 0.15, 0.08],
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl"
                        />
                        <motion.div
                            animate={{
                                scale: [1.2, 1, 1.2],
                                opacity: [0.04, 0.12, 0.04],
                            }}
                            transition={{ duration: 5, repeat: Infinity }}
                            className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-primary/10 rounded-full blur-3xl"
                        />
                    </div>

                    {/* Slide content */}
                    <div className="relative px-6 pt-10 pb-6 md:px-10 md:pt-14 md:pb-8 min-h-[420px] md:min-h-[480px] flex flex-col items-center text-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.97 }}
                                transition={{ duration: 0.35, ease: "easeOut" }}
                                className="flex flex-col items-center flex-1"
                            >
                                {/* Visual */}
                                <div className="mb-6">
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
                                    transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                                    className="mb-4 p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-[0_0_30px_rgba(191,245,73,0.12)]"
                                >
                                    <Icon className="h-6 w-6 text-primary" />
                                </motion.div>

                                {/* Title */}
                                <motion.h3
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-xl md:text-2xl font-bold text-white mb-1"
                                >
                                    {step.title}
                                </motion.h3>

                                {/* Subtitle */}
                                <motion.p
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
                                    className="text-sm font-medium text-primary mb-3"
                                >
                                    {step.subtitle}
                                </motion.p>

                                {/* Description */}
                                <motion.p
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-zinc-400 text-sm leading-relaxed max-w-sm"
                                >
                                    {step.description}
                                </motion.p>
                            </motion.div>
                        </AnimatePresence>

                        {/* Dot indicators */}
                        <div className="flex items-center justify-center gap-2 mt-8 mb-2">
                            {steps.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goTo(index)}
                                    aria-label={`Go to slide ${index + 1}`}
                                    className={`h-2 rounded-full transition-all duration-300 ${index === currentStep
                                            ? "w-8 bg-primary"
                                            : index < currentStep
                                                ? "w-2 bg-primary/50"
                                                : "w-2 bg-zinc-700"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Next/Prev arrows (desktop only) */}
                    <button
                        onClick={goPrev}
                        aria-label="Previous slide"
                        className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-zinc-800/80 border border-zinc-700 items-center justify-center text-zinc-400 hover:text-white hover:border-primary/40 transition-colors z-10"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={goNext}
                        aria-label="Next slide"
                        className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-zinc-800/80 border border-zinc-700 items-center justify-center text-zinc-400 hover:text-white hover:border-primary/40 transition-colors z-10"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </motion.div>
            </div>
        </section>
    );
}

// ——————————————————————————————————
// Visual illustrations (adapted from AppOnboarding)
// ——————————————————————————————————

function WelcomeVisual() {
    return (
        <div className="relative w-48 h-28 flex items-center justify-center">
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
                className="relative"
            >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary flex items-center justify-center shadow-[0_0_50px_rgba(191,245,73,0.35)]">
                    <Sparkles className="h-8 w-8 text-primary" />
                </div>
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
                            position: "absolute",
                            left: "50%",
                            top: "50%",
                            transform: `rotate(${i * 60}deg) translateX(40px)`,
                        }}
                        className="w-1.5 h-1.5 -ml-0.75 -mt-0.75 rounded-full bg-primary"
                    />
                ))}
            </motion.div>
        </div>
    );
}

function DashboardVisual() {
    const t = useTranslations("landing.onboardingCarousel.steps.dashboard.visual");
    return (
        <div className="w-56 space-y-1.5">
            {/* Stats row */}
            <div className="flex gap-1.5">
                {[
                    { icon: Check, label: "4/5", color: "text-primary" },
                    { icon: TrendingUp, label: "85%", color: "text-primary" },
                    { icon: Users, label: "3", color: "text-primary" },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.08 }}
                        className="flex-1 p-2 rounded-lg bg-zinc-800/80 border border-zinc-700"
                    >
                        <stat.icon className={`h-3 w-3 ${stat.color} mb-0.5`} />
                        <p className="text-sm font-bold text-white">{stat.label}</p>
                    </motion.div>
                ))}
            </div>
            {/* Habits */}
            {[t("meditate"), t("exercise"), t("read")].map((habit, i) => (
                <motion.div
                    key={habit}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.45 + i * 0.08, type: "spring" }}
                        className={`w-5 h-5 rounded-md flex items-center justify-center ${i < 2 ? "bg-primary/20" : "bg-zinc-700"
                            }`}
                    >
                        {i < 2 && <Check className="h-3 w-3 text-primary" />}
                    </motion.div>
                    <span className="text-xs text-white">{habit}</span>
                    {i < 2 && (
                        <div className="ml-auto flex items-center gap-0.5 text-[10px] text-orange-400">
                            <Flame className="h-2.5 w-2.5" />
                            <span>{5 - i}</span>
                        </div>
                    )}
                </motion.div>
            ))}
        </div>
    );
}

function CoachVisual() {
    const t = useTranslations("landing.onboardingCarousel.steps.coach.visual");
    return (
        <div className="w-56 space-y-2">
            {/* User message */}
            <motion.div
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="flex justify-end"
            >
                <div className="max-w-[80%] p-2.5 rounded-2xl rounded-br-sm bg-primary/20 border border-primary/30">
                    <p className="text-xs text-white">{t("user")}</p>
                </div>
            </motion.div>
            {/* AI response */}
            <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex gap-1.5"
            >
                <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-3 w-3 text-primary" />
                </div>
                <div className="max-w-[80%] p-2.5 rounded-2xl rounded-bl-sm bg-zinc-800 border border-zinc-700">
                    <p className="text-xs text-zinc-300">{t("ai")}</p>
                </div>
            </motion.div>
            {/* Routine suggestion */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="ml-8 p-2.5 rounded-xl bg-primary/10 border border-primary/20"
            >
                <div className="flex items-center gap-1.5 mb-1.5">
                    <Target className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-medium text-primary">
                        {t("routine")}
                    </span>
                </div>
                <div className="flex gap-1">
                    {["🧘", "📚", "💪"].map((emoji, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.8 + i * 0.08, type: "spring" }}
                            className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center text-xs"
                        >
                            {emoji}
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

function CalendarVisual() {
    const t = useTranslations("landing.onboardingCarousel.steps.calendar.visual");
    const days = [
        [1, 1, 1, 0, 1, 1, 1],
        [1, 0, 1, 1, 1, 0, 1],
        [1, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 0, 1, 0],
    ];

    return (
        <div className="w-52">
            <div className="p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-medium text-white">{t("date")}</span>
                    <div className="flex items-center gap-0.5 text-orange-400">
                        <Flame className="h-3 w-3" />
                        <span className="text-xs font-bold">12</span>
                    </div>
                </div>
                <div className="space-y-0.5">
                    {days.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex gap-0.5 justify-center">
                            {row.map((filled, colIndex) => (
                                <motion.div
                                    key={colIndex}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{
                                        delay: 0.15 + (rowIndex * 7 + colIndex) * 0.015,
                                        type: "spring",
                                        stiffness: 200,
                                    }}
                                    className={`w-5 h-5 rounded ${filled
                                            ? "bg-primary/60 shadow-[0_0_8px_rgba(191,245,73,0.25)]"
                                            : "bg-zinc-700/50"
                                        }`}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-2 flex items-center justify-center gap-1.5 text-xs"
            >
                <span className="text-zinc-400">{t("streak")}:</span>
                <span className="text-primary font-bold">{t("days")}</span>
            </motion.div>
        </div>
    );
}

function CommunityVisual() {
    return (
        <div className="relative w-48 h-28">
            {/* Central user */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            >
                <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center shadow-[0_0_25px_rgba(191,245,73,0.25)]">
                    <span className="text-lg">👤</span>
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
                    }}
                    transition={{
                        opacity: { delay: 0.2 + i * 0.1 },
                        scale: { delay: 0.2 + i * 0.1, type: "spring" },
                    }}
                    style={{
                        position: "absolute",
                        left: `calc(50% + ${Math.cos((i * Math.PI) / 2) * 48}px - 16px)`,
                        top: `calc(50% + ${Math.sin((i * Math.PI) / 2) * 40}px - 16px)`,
                    }}
                    className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center"
                >
                    <span className="text-xs">
                        {["🧑", "👩", "🧔", "👱"][i]}
                    </span>
                </motion.div>
            ))}
            {/* Connection circle */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25">
                <motion.circle
                    cx="50%"
                    cy="50%"
                    r="42"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    className="text-primary"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.4 }}
                />
            </svg>
        </div>
    );
}
