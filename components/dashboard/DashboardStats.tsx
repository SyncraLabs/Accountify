"use client";

import { useMemo } from "react";
import { Flame, Calendar, CheckCircle, Target } from "lucide-react";
import { motion } from "framer-motion";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { AnimatedCounter, StreakFire } from "@/components/ui/dopamine";

interface DashboardStatsProps {
    habits: any[]; // We can refine this type if we have a shared type definition
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
    const stats = useMemo(() => {
        // Current Streak (highest active streak)
        const currentStreak = Math.max(0, ...habits.map(h => h.streak || 0));

        // Completion Rate (last 7 days)
        let totalDue = 0;
        let totalCompleted = 0;

        // Total Completed Habits (all time)
        let allTimeCompleted = 0;

        habits.forEach(habit => {
            allTimeCompleted += (habit.logs?.length || 0);

            // Simple approximation for last 7 days for demo purposes
            // In a real app, you'd filter logs by date
            const recentLogs = habit.logs?.length || 0;
            // Assuming daily frequency for simplicity in this summary
            totalDue += 7;
            totalCompleted += Math.min(recentLogs, 7);
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
            label: "Racha Actual",
            value: stats.currentStreak,
            suffix: "días",
            icon: Flame,
            iconColor: "text-orange-500",
            isStreak: true,
            glowColor: stats.currentStreak >= 7 ? "rgba(249, 115, 22, 0.3)" : undefined,
        },
        {
            label: "Tasa Éxito",
            value: stats.completionRate,
            suffix: "% semanal",
            icon: Target,
            iconColor: "text-primary",
            isPercentage: true,
            glowColor: stats.completionRate >= 80 ? "rgba(191, 245, 73, 0.3)" : undefined,
        },
        {
            label: "Completados",
            value: stats.allTimeCompleted,
            suffix: "total",
            icon: CheckCircle,
            iconColor: "text-blue-500",
        },
        {
            label: "Activos",
            value: stats.activeHabits,
            suffix: "hábitos",
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
                                {stat.isStreak ? 'días' : stat.isPercentage ? 'semanal' : stat.suffix}
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
                                {stat.value >= 30 ? "En llamas!" : stat.value >= 14 ? "Increíble!" : "Sigue así!"}
                            </motion.div>
                        )}
                    </SpotlightCard>
                </motion.div>
            ))}
        </div>
    );
}
