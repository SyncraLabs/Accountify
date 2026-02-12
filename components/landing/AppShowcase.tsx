"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Check, Flame, Trophy, Bell, Plus, Sparkles, TrendingUp, Calendar, Users } from "lucide-react";
import { useTranslations } from "next-intl";

export function AppShowcase() {
    const t = useTranslations('landing.showcase');
    const [activeStep, setActiveStep] = useState(0);
    const [completedHabits, setCompletedHabits] = useState<number[]>([1, 2]);

    const mockHabits = [
        { id: 1, name: t('habits.meditate'), completed: true, streak: 12, icon: "🧘" },
        { id: 2, name: t('habits.read'), completed: true, streak: 8, icon: "📚" },
        { id: 3, name: t('habits.exercise'), completed: false, streak: 15, icon: "💪" },
        { id: 4, name: t('habits.journal'), completed: false, streak: 5, icon: "✍️" },
    ];

    const showcaseSteps = [
        {
            id: 1,
            title: t('steps.1.title'),
            subtitle: t('steps.1.subtitle'),
            icon: Plus,
            color: "primary",
        },
        {
            id: 2,
            title: t('steps.2.title'),
            subtitle: t('steps.2.subtitle'),
            icon: Flame,
            color: "orange",
        },
        {
            id: 3,
            title: t('steps.3.title'),
            subtitle: t('steps.3.subtitle'),
            icon: Bell,
            color: "blue",
        },
        {
            id: 4,
            title: t('steps.4.title'),
            subtitle: t('steps.4.subtitle'),
            icon: Trophy,
            color: "purple",
        },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % showcaseSteps.length);
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    // Simulate habit completion animation
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (!completedHabits.includes(3)) {
                setCompletedHabits([...completedHabits, 3]);
            } else if (!completedHabits.includes(4)) {
                setCompletedHabits([...completedHabits, 4]);
            } else {
                setCompletedHabits([1, 2]);
            }
        }, 4000);
        return () => clearTimeout(timeout);
    }, [completedHabits]);

    return (
        <section className="py-24 px-6 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-4">
                        {t('title')} <span className="text-primary">{t('titleHighlight')}</span> {t('titleEnd')}
                    </h2>
                    <p className="text-zinc-400 max-w-xl mx-auto">
                        {t('subtitle')}
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Phone Mockup */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="relative flex justify-center"
                    >
                        {/* Glow effect behind phone */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/20 blur-[120px] rounded-full" />

                        {/* Phone Frame */}
                        <div className="relative w-[280px] md:w-[320px] h-[580px] md:h-[640px] bg-zinc-900 rounded-[3rem] border-4 border-zinc-800 shadow-2xl overflow-hidden">
                            {/* Notch */}
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20" />

                            {/* Screen Content */}
                            <div className="absolute inset-4 top-8 bg-black rounded-[2rem] overflow-hidden">
                                {/* Status Bar */}
                                <div className="h-6 bg-black flex items-center justify-between px-6 pt-2">
                                    <span className="text-[10px] text-white/70">9:41</span>
                                    <div className="flex items-center gap-1">
                                        <div className="w-4 h-2 border border-white/70 rounded-sm">
                                            <div className="w-3/4 h-full bg-primary rounded-sm" />
                                        </div>
                                    </div>
                                </div>

                                {/* App Header */}
                                <div className="px-5 py-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-zinc-500">{t('phone.date')}</p>
                                            <h3 className="text-lg font-semibold text-white">{t('phone.myHabits')}</h3>
                                        </div>
                                        <motion.div
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"
                                        >
                                            <Sparkles className="w-4 h-4 text-primary" />
                                        </motion.div>
                                    </div>

                                    {/* Stats Row */}
                                    <div className="flex gap-3 mt-4">
                                        <div className="flex-1 bg-zinc-900/80 rounded-xl p-3 border border-zinc-800">
                                            <div className="flex items-center gap-2">
                                                <Flame className="w-4 h-4 text-orange-400" />
                                                <span className="text-xs text-zinc-400">{t('phone.streak')}</span>
                                            </div>
                                            <motion.p
                                                key={completedHabits.length}
                                                initial={{ scale: 1.2 }}
                                                animate={{ scale: 1 }}
                                                className="text-xl font-bold text-white mt-1"
                                            >
                                                {12 + completedHabits.length}
                                            </motion.p>
                                        </div>
                                        <div className="flex-1 bg-zinc-900/80 rounded-xl p-3 border border-zinc-800">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4 text-primary" />
                                                <span className="text-xs text-zinc-400">{t('phone.today')}</span>
                                            </div>
                                            <p className="text-xl font-bold text-white mt-1">
                                                {completedHabits.length}/4
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Habits List */}
                                <div className="px-5 space-y-3">
                                    {mockHabits.map((habit, idx) => (
                                        <motion.div
                                            key={habit.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="relative"
                                        >
                                            <motion.div
                                                layout
                                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${completedHabits.includes(habit.id)
                                                    ? "bg-primary/10 border-primary/30"
                                                    : "bg-zinc-900/50 border-zinc-800"
                                                    }`}
                                            >
                                                <motion.div
                                                    animate={completedHabits.includes(habit.id) ? { scale: [1, 1.2, 1] } : {}}
                                                    transition={{ duration: 0.3 }}
                                                    className={`w-6 h-6 rounded-full flex items-center justify-center ${completedHabits.includes(habit.id)
                                                        ? "bg-primary text-black"
                                                        : "border-2 border-zinc-600"
                                                        }`}
                                                >
                                                    <AnimatePresence>
                                                        {completedHabits.includes(habit.id) && (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                exit={{ scale: 0 }}
                                                            >
                                                                <Check className="w-3.5 h-3.5" />
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>
                                                <div className="flex-1">
                                                    <p className={`text-sm font-medium ${completedHabits.includes(habit.id) ? "text-white" : "text-zinc-300"
                                                        }`}>
                                                        {habit.icon} {habit.name}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1 text-orange-400">
                                                    <Flame className="w-3 h-3" />
                                                    <span className="text-xs">{habit.streak}</span>
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Bottom Nav Mock */}
                                <div className="absolute bottom-0 inset-x-0 h-16 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-around px-6">
                                    <Calendar className="w-5 h-5 text-zinc-500" />
                                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                                        <Plus className="w-5 h-5 text-black" />
                                    </div>
                                    <Users className="w-5 h-5 text-zinc-500" />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Steps */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                        className="space-y-4"
                    >
                        {showcaseSteps.map((step, idx) => {
                            const Icon = step.icon;
                            const isActive = idx === activeStep;
                            const colorClasses = {
                                primary: "bg-primary/20 text-primary border-primary/40",
                                orange: "bg-orange-500/20 text-orange-400 border-orange-500/40",
                                blue: "bg-blue-500/20 text-blue-400 border-blue-500/40",
                                purple: "bg-purple-500/20 text-purple-400 border-purple-500/40",
                            };

                            return (
                                <motion.div
                                    key={step.id}
                                    animate={{
                                        scale: isActive ? 1.02 : 1,
                                        opacity: isActive ? 1 : 0.6,
                                    }}
                                    transition={{ duration: 0.3 }}
                                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${isActive
                                        ? "bg-zinc-900/80 border-zinc-700"
                                        : "bg-zinc-900/30 border-zinc-800/50"
                                        }`}
                                    onClick={() => setActiveStep(idx)}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl border ${colorClasses[step.color as keyof typeof colorClasses]}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-medium text-zinc-500">
                                                    0{step.id}
                                                </span>
                                                <h4 className="text-base font-medium text-white">
                                                    {step.title}
                                                </h4>
                                            </div>
                                            <p className="text-sm text-zinc-400 mt-1">
                                                {step.subtitle}
                                            </p>
                                        </div>
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeIndicator"
                                                className="w-2 h-2 rounded-full bg-primary"
                                            />
                                        )}
                                    </div>

                                    {/* Progress bar for active step */}
                                    {isActive && (
                                        <motion.div
                                            className="mt-4 h-1 bg-zinc-800 rounded-full overflow-hidden"
                                        >
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: "100%" }}
                                                transition={{ duration: 3.5, ease: "linear" }}
                                                className="h-full bg-primary rounded-full"
                                            />
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
