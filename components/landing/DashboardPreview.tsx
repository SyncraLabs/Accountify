"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Check, Flame, Trophy, Activity, MoreHorizontal, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

export function DashboardPreview() {
    const t = useTranslations('landing.preview');
    const [completedHabits, setCompletedHabits] = useState<number[]>([1]);

    const habits = [
        { id: 1, name: t('habits.read'), completed: true },
        { id: 2, name: t('habits.exercise'), completed: false },
        { id: 3, name: t('habits.meditate'), completed: false },
    ];
    const [streak, setStreak] = useState(12);
    const [percentage, setPercentage] = useState(85);
    const [showCelebration, setShowCelebration] = useState(false);

    // Simulate habit completion animation loop
    useEffect(() => {
        const habitCycle = [
            { habits: [1], streak: 12, percentage: 85 },
            { habits: [1, 2], streak: 12, percentage: 90 },
            { habits: [1, 2, 3], streak: 13, percentage: 100 },
        ];
        let step = 0;

        const interval = setInterval(() => {
            step = (step + 1) % habitCycle.length;
            setCompletedHabits(habitCycle[step].habits);
            setStreak(habitCycle[step].streak);
            setPercentage(habitCycle[step].percentage);

            if (step === 2) {
                setShowCelebration(true);
                setTimeout(() => setShowCelebration(false), 2000);
            }
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full max-w-5xl mx-auto mt-16 px-4 sm:px-6 relative z-10">
            {/* Glow Effect */}
            <motion.div
                animate={{
                    opacity: [0.2, 0.3, 0.2],
                    scale: [1, 1.05, 1],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-3/4 bg-primary/20 blur-[100px] rounded-full -z-10"
            />

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                className="relative bg-[#09090b] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
            >
                {/* Celebration overlay */}
                <AnimatePresence>
                    {showCelebration && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        >
                            <motion.div
                                initial={{ scale: 0, rotate: -10 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 10 }}
                                transition={{ type: "spring", damping: 15 }}
                                className="flex flex-col items-center gap-3"
                            >
                                <div className="p-4 rounded-full bg-primary/20">
                                    <Sparkles className="w-8 h-8 text-primary" />
                                </div>
                                <p className="text-xl font-semibold text-white">{t('dayComplete')}</p>
                                <p className="text-sm text-zinc-400">{t('streakDays', { count: 13 })}</p>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Window Header */}
                <div className="h-8 md:h-10 bg-white/5 border-b border-white/5 flex items-center px-4 space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                </div>

                {/* Dashboard Mockup Layout */}
                <div className="flex h-[400px] md:h-[500px]">
                    {/* Sidebar Mockup */}
                    <div className="w-16 md:w-64 border-r border-white/5 bg-white/[0.02] flex flex-col p-4 gap-6 hidden sm:flex">
                        <motion.div
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                            className="h-8 w-8 rounded-lg bg-primary/20 shrink-0 flex items-center justify-center"
                        >
                            <span className="text-primary text-xs font-bold">A</span>
                        </motion.div>
                        <div className="space-y-4">
                            <div className="h-2 w-20 bg-white/10 rounded" />
                            <div className="h-2 w-16 bg-white/10 rounded" />
                            <div className="h-2 w-24 bg-white/10 rounded" />
                        </div>
                        <div className="mt-auto space-y-4">
                            <div className="h-8 w-full bg-white/5 rounded-lg border border-white/5" />
                        </div>
                    </div>

                    {/* Main Content Mockup */}
                    <div className="flex-1 p-6 md:p-8 overflow-hidden bg-black/40">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-8">
                            <div className="space-y-2">
                                <div className="h-6 w-48 bg-white/10 rounded" />
                                <div className="h-3 w-32 bg-white/5 rounded" />
                            </div>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="h-8 w-24 bg-primary/20 rounded-full border border-primary/20 flex items-center justify-center"
                            >
                                <span className="text-xs text-primary font-medium">{t('newHabit')}</span>
                            </motion.div>
                        </div>

                        {/* Grid Content */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Stat 1 - Animated percentage */}
                            <motion.div
                                layout
                                className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-3"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                        <Activity className="h-5 w-5" />
                                    </div>
                                </div>
                                <motion.div
                                    key={percentage}
                                    initial={{ scale: 1.2, color: "#4ade80" }}
                                    animate={{ scale: 1, color: "#ffffff" }}
                                    className="text-2xl font-bold text-white"
                                >
                                    {percentage}%
                                </motion.div>
                                <div className="text-xs text-zinc-500">{t('completedThisWeek')}</div>
                            </motion.div>

                            {/* Stat 2 - Animated streak */}
                            <motion.div
                                layout
                                className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-3"
                            >
                                <div className="flex justify-between items-start">
                                    <motion.div
                                        animate={streak === 13 ? { scale: [1, 1.2, 1] } : {}}
                                        transition={{ duration: 0.5 }}
                                        className="p-2 bg-orange-500/10 rounded-lg text-orange-400"
                                    >
                                        <Flame className="h-5 w-5" />
                                    </motion.div>
                                </div>
                                <motion.div
                                    key={streak}
                                    initial={{ scale: 1.2 }}
                                    animate={{ scale: 1 }}
                                    className="text-2xl font-bold text-white"
                                >
                                    {streak} {t('days')}
                                </motion.div>
                                <div className="text-xs text-zinc-500">{t('currentStreak')}</div>
                            </motion.div>

                            {/* Stat 3 */}
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                        <Trophy className="h-5 w-5" />
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-white">{t('topPercent')}</div>
                                <div className="text-xs text-zinc-500">{t('amongActive')}</div>
                            </div>

                            {/* Habit List with animations */}
                            <div className="col-span-1 md:col-span-3 bg-white/5 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                                {/* Animated chart line */}
                                <div className="absolute inset-0 opacity-20 pointer-events-none">
                                    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                        <motion.path
                                            d="M0 100 C 20 80 50 90 100 0"
                                            stroke="url(#gradient)"
                                            strokeWidth="2"
                                            fill="none"
                                            vectorEffect="non-scaling-stroke"
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{ duration: 2, delay: 0.8 }}
                                        />
                                        <defs>
                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#4ade80" stopOpacity="0" />
                                                <stop offset="100%" stopColor="#4ade80" stopOpacity="1" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>

                                <div className="relative z-10 flex flex-col gap-3">
                                    <div className="h-4 w-32 bg-white/10 rounded mb-2" />

                                    {habits.map((habit) => (
                                        <motion.div
                                            key={habit.id}
                                            layout
                                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                                                completedHabits.includes(habit.id)
                                                    ? "bg-primary/10 border-primary/20"
                                                    : "bg-white/5 border-white/5"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <motion.div
                                                    animate={completedHabits.includes(habit.id)
                                                        ? { scale: [1, 1.2, 1], backgroundColor: "#4ade80" }
                                                        : { backgroundColor: "transparent" }
                                                    }
                                                    transition={{ duration: 0.3 }}
                                                    className={`h-5 w-5 rounded-full flex items-center justify-center ${
                                                        completedHabits.includes(habit.id)
                                                            ? "bg-primary text-black"
                                                            : "border border-zinc-700"
                                                    }`}
                                                >
                                                    <AnimatePresence>
                                                        {completedHabits.includes(habit.id) && (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                exit={{ scale: 0 }}
                                                            >
                                                                <Check className="h-3 w-3" />
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>
                                                <span className={`text-sm ${
                                                    completedHabits.includes(habit.id)
                                                        ? "text-white"
                                                        : "text-zinc-300"
                                                }`}>
                                                    {habit.name}
                                                </span>
                                            </div>
                                            <MoreHorizontal className="h-4 w-4 text-zinc-600" />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
