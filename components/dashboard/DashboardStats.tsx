"use client";

import { useMemo, useState, useEffect } from "react";
// import { WeeklyActivityChart } from "./WeeklyActivityChart"; // unused in this version for now
import { Flame, Calendar, CheckCircle, Target, Trophy } from "lucide-react";

interface DashboardStatsProps {
    habits: any[]; // We can refine this type if we have a shared type definition
}

function AnimatedCounter({ target }: { target: number }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        // Faster animation
        const duration = 1000;
        const increment = Math.max(1, Math.floor(target / (duration / 16)));

        if (target === 0) {
            setCount(0);
            return;
        }

        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, 16);

        return () => clearInterval(timer);
    }, [target]);

    return <span>{count}</span>;
}

import { SpotlightCard } from "@/components/ui/SpotlightCard";

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

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <SpotlightCard className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-between hover:border-zinc-700 transition-colors group hover-lift animate-fade-up" style={{ animationDelay: "0s" }}>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-zinc-400 text-xs uppercase font-medium">Racha Actual</span>
                    <Flame className="h-4 w-4 text-orange-500 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                    <span className="text-2xl font-bold text-white"><AnimatedCounter target={stats.currentStreak} /></span>
                    <span className="text-xs text-zinc-500 ml-1">días</span>
                </div>
            </SpotlightCard>

            <SpotlightCard className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-between hover:border-zinc-700 transition-colors group hover-lift animate-fade-up" style={{ animationDelay: "0.1s" }}>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-zinc-400 text-xs uppercase font-medium">Tasa Éxito</span>
                    <Target className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <div>
                    <span className="text-2xl font-bold text-white"><AnimatedCounter target={stats.completionRate} />%</span>
                    <span className="text-xs text-zinc-500 ml-1">semanal</span>
                </div>
            </SpotlightCard>

            <SpotlightCard className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-between hover:border-zinc-700 transition-colors group hover-lift animate-fade-up" style={{ animationDelay: "0.2s" }}>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-zinc-400 text-xs uppercase font-medium">Completados</span>
                    <CheckCircle className="h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                    <span className="text-2xl font-bold text-white"><AnimatedCounter target={stats.allTimeCompleted} /></span>
                    <span className="text-xs text-zinc-500 ml-1">total</span>
                </div>
            </SpotlightCard>

            <SpotlightCard className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-between hover:border-zinc-700 transition-colors group hover-lift animate-fade-up" style={{ animationDelay: "0.3s" }}>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-zinc-400 text-xs uppercase font-medium">Activos</span>
                    <Calendar className="h-4 w-4 text-purple-500 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                    <span className="text-2xl font-bold text-white"><AnimatedCounter target={stats.activeHabits} /></span>
                    <span className="text-xs text-zinc-500 ml-1">hábitos</span>
                </div>
            </SpotlightCard>
        </div>
    );
}
