"use client";

import { useMemo } from "react";
import { Flame, Calendar, CheckCircle, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { AnimatedCounter, StreakFire } from "@/components/ui/dopamine";

interface DashboardStatsProps {
    habits: any[];
}

const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            delay: i * 0.1,
            duration: 0.4,
            type: "spring" as const,
            stiffness: 100,
        },
    }),
};

export function DashboardStats({ habits }: DashboardStatsProps) {
    const t = useTranslations('dashboard.stats');

    const stats = useMemo(() => {
        // Current Streak (highest active streak among all habits)
        const currentStreak = Math.max(0, ...habits.map(h => h.streak || 0));

        // Calculate completion rate for last 7 days
        const today = new Date();
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        });

        let totalDue = 0;
        let totalCompleted = 0;
        let allTimeCompleted = 0;

        habits.forEach(habit => {
            const logs = habit.logs || habit.habit_logs || [];
            allTimeCompleted += logs.length;

            // Count completions in last 7 days
            const logDates = new Set(logs.map((l: any) => l.completed_date));
            const completedInWeek = last7Days.filter(date => logDates.has(date)).length;

            // Each habit is due 7 times in the week (assuming daily)
            totalDue += 7;
            totalCompleted += completedInWeek;
        });

        const completionRate = totalDue > 0 ? Math.round((totalCompleted / totalDue) * 100) : 0;
        const boundedRate = Math.min(100, Math.max(0, completionRate));

        // Active Habits
        const activeHabits = habits.length;

        return {
            currentStreak,
            completionRate: boundedRate,
            allTimeCompleted,
            activeHabits
        };
    }, [habits]);

    const statCards = [
        {
            label: t('currentStreak'),
            value: stats.currentStreak,
            suffix: t('days'),
            icon: Flame,
            iconColor: "text-orange-500",
            isStreak: true,
            glowColor: stats.currentStreak >= 7 ? "rgba(249, 115, 22, 0.3)" : undefined,
        },
        {
            label: t('successRate'),
            value: stats.completionRate,
            suffix: t('weekly'),
            icon: Target,
            iconColor: "text-primary",
            isPercentage: true,
            glowColor: stats.completionRate >= 80 ? "rgba(191, 245, 73, 0.3)" : undefined,
        },
        {
            label: t('completed'),
            value: stats.allTimeCompleted,
            suffix: t('total'),
            icon: CheckCircle,
            iconColor: "text-blue-500",
        },
        {
            label: t('active'),
            value: stats.activeHabits,
            suffix: t('habits'),
            icon: Calendar,
            iconColor: "text-purple-500",
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, i) => (
                <motion.div
                    key={stat.label}
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ willChange: 'transform' }}
                >
                    <SpotlightCard
                        className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-between hover:border-zinc-700 transition-all duration-300 group h-full"
                        style={stat.glowColor ? {
                            boxShadow: `0 0 20px ${stat.glowColor}`,
                        } : undefined}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-zinc-400 text-xs uppercase font-medium tracking-wide">
                                {stat.label}
                            </span>
                            <motion.div
                                whileHover={{ scale: 1.2, rotate: 10 }}
                                transition={{ type: "spring", stiffness: 400 }}
                            >
                                <stat.icon className={`h-4 w-4 ${stat.iconColor} transition-all duration-300`} />
                            </motion.div>
                        </div>
                        <div className="flex items-baseline gap-1">
                            {stat.isStreak ? (
                                <StreakFire
                                    streak={stat.value}
                                    animated={stat.value >= 3}
                                    size="lg"
                                    className="text-2xl font-bold"
                                />
                            ) : (
                                <motion.span
                                    key={stat.value}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-2xl font-bold text-white tabular-nums"
                                    style={{
                                        color: stat.isPercentage && stat.value >= 80 ? '#BFF549' : undefined,
                                    }}
                                >
                                    <AnimatedCounter value={stat.value} duration={1.2} />
                                    {stat.isPercentage && '%'}
                                </motion.span>
                            )}
                            <span className="text-xs text-zinc-500">
                                {stat.suffix}
                            </span>
                        </div>

                        {/* Progress bar for percentage stats */}
                        {stat.isPercentage && (
                            <div className="mt-3 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-primary rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stat.value}%` }}
                                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                                    style={{
                                        boxShadow: stat.value >= 80 ? '0 0 8px rgba(191, 245, 73, 0.5)' : undefined,
                                    }}
                                />
                            </div>
                        )}

                        {/* Streak indicator */}
                        {stat.isStreak && stat.value >= 7 && (
                            <motion.div
                                className="mt-2 text-[10px] text-orange-400/80 font-medium"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                {stat.value >= 30 ? t('onFire') : stat.value >= 14 ? t('amazing') : t('keepItUp')}
                            </motion.div>
                        )}
                    </SpotlightCard>
                </motion.div>
            ))}
        </div>
    );
}
