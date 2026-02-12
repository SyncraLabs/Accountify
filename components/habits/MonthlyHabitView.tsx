"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, X, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getHabitStatusForDay } from "@/lib/habit-utils";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";

interface Habit {
    id: string;
    title: string;
    category: string;
    frequency: string;
    streak: number;
    logs: { completed_date: string }[];
}

interface MonthlyHabitViewProps {
    initialHabits: Habit[];
}

export function MonthlyHabitView({ initialHabits }: MonthlyHabitViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedHabit, setSelectedHabit] = useState<string | null>(
        initialHabits.length > 0 ? initialHabits[0].id : null
    );
    const router = useRouter();
    const t = useTranslations("calendarPage");
    const locale = useLocale();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of month and number of days
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();

    // Generate calendar days
    const calendarDays: (Date | null)[] = [];

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarDays.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(new Date(year, month, day));
    }

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(newDate.getMonth() - 1);
            } else {
                newDate.setMonth(newDate.getMonth() + 1);
            }
            return newDate;
        });
    };

    const handleDayClick = (day: Date) => {
        const dateStr = [
            day.getFullYear(),
            String(day.getMonth() + 1).padStart(2, '0'),
            String(day.getDate()).padStart(2, '0')
        ].join('-');
        router.push(`/calendar/day/${dateStr}`);
    };

    const getEmoji = (category: string) => {
        const emojiMap: Record<string, string> = {
            health: "💪",
            mindset: "🧘‍♂️",
            productivity: "📚",
            finance: "💰",
            creativity: "🎨",
            social: "👥"
        };
        return emojiMap[category] || "⭐";
    };

    const selectedHabitData = initialHabits.find(h => h.id === selectedHabit);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthName = currentDate.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
        month: "long",
        year: "numeric"
    });

    const weekDays = locale === "es"
        ? ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Calculate monthly stats for selected habit
    const getMonthlyStats = () => {
        if (!selectedHabitData) return { completed: 0, total: 0 };

        let completed = 0;
        let total = 0;

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            if (date > today) continue;

            const status = getHabitStatusForDay(selectedHabitData, date);
            if (status !== 'not_required') {
                total++;
                if (status === 'completed') {
                    completed++;
                }
            }
        }

        return { completed, total };
    };

    const monthlyStats = getMonthlyStats();

    return (
        <div className="space-y-6 w-full min-w-0 overflow-hidden">
            {/* Habit Selector */}
            {initialHabits.length > 1 && (
                <div className="flex gap-2 justify-start sm:justify-center overflow-x-auto pb-2 scrollbar-none">
                    {initialHabits.map((habit) => (
                        <motion.button
                            key={habit.id}
                            onClick={() => setSelectedHabit(habit.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl border whitespace-nowrap transition-all",
                                selectedHabit === habit.id
                                    ? "bg-primary/20 border-primary/50 text-white"
                                    : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white"
                            )}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span>{getEmoji(habit.category)}</span>
                            <span className="text-sm font-medium">{habit.title}</span>
                        </motion.button>
                    ))}
                </div>
            )}

            {/* Calendar Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl bg-white/5 border border-white/10 overflow-hidden w-full min-w-0"
            >
                {/* Calendar Header */}
                <div className="p-3 sm:p-6 border-b border-white/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg sm:text-2xl font-bold text-white capitalize">{monthName}</h2>
                            {selectedHabitData && (
                                <p className="text-[11px] sm:text-sm text-zinc-400 mt-1">
                                    {getEmoji(selectedHabitData.category)} {selectedHabitData.title} - {monthlyStats.completed}/{monthlyStats.total} días completados
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigateMonth('prev')}
                                className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigateMonth('next')}
                                className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="p-2 md:p-6 overflow-x-auto">
                    {/* Week day headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekDays.map((day) => (
                            <div
                                key={day}
                                className="text-center text-[10px] md:text-xs font-medium text-zinc-500 py-2"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar days */}
                    <div className="grid grid-cols-7 gap-1 w-full md:gap-1">
                        {calendarDays.map((day, index) => {
                            if (!day) {
                                return <div key={`empty-${index}`} className="aspect-square" />;
                            }

                            const isToday = day.toDateString() === today.toDateString();
                            const isFuture = day > today;
                            const status = selectedHabitData && !isFuture
                                ? getHabitStatusForDay(selectedHabitData, day)
                                : null;

                            return (
                                <motion.button
                                    key={day.toISOString()}
                                    onClick={() => handleDayClick(day)}
                                    className={cn(
                                        "aspect-square rounded-lg md:rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all border",
                                        isToday && "ring-1 md:ring-2 ring-primary ring-offset-1 md:ring-offset-2 ring-offset-black",
                                        isFuture && "opacity-30 cursor-default",
                                        status === 'completed' && "bg-primary/20 border-primary/30",
                                        status === 'failed' && "bg-red-500/10 border-red-500/20",
                                        status === 'pending' && "bg-white/5 border-white/10 hover:bg-white/10",
                                        status === 'not_required' && "bg-transparent border-white/5",
                                        !status && !isFuture && "bg-white/5 border-white/10 hover:bg-white/10"
                                    )}
                                    whileHover={!isFuture ? { scale: 1.05 } : {}}
                                    whileTap={!isFuture ? { scale: 0.95 } : {}}
                                    disabled={isFuture}
                                >
                                    <span className={cn(
                                        "text-xs md:text-sm font-medium",
                                        isToday && "text-primary",
                                        status === 'completed' && "text-primary",
                                        status === 'failed' && "text-red-400",
                                        !status && "text-zinc-400"
                                    )}>
                                        {day.getDate()}
                                    </span>
                                    {status === 'completed' && (
                                        <Check className="h-2.5 w-2.5 md:h-3 md:w-3 text-primary" />
                                    )}
                                    {status === 'failed' && (
                                        <X className="h-2.5 w-2.5 md:h-3 md:w-3 text-red-400" />
                                    )}
                                    {status === 'not_required' && (
                                        <Minus className="h-2.5 w-2.5 md:h-3 md:w-3 text-zinc-600" />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Legend */}
                <div className="px-3 sm:px-6 pb-4 sm:pb-6">
                    <div className="flex flex-wrap gap-2 sm:gap-4 text-[10px] sm:text-xs text-zinc-400">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded bg-primary/30 border border-primary/50" />
                            <span>{t("status.completed")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded bg-red-500/20 border border-red-500/30" />
                            <span>{t("status.failed")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded bg-white/10 border border-white/20" />
                            <span>{t("status.pending")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded border border-white/10" />
                            <span>{t("status.notRequired")}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
