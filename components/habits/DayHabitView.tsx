"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Flame, Calendar as CalendarIcon, ArrowLeft, X, Minus } from "lucide-react";
import { getHabitStatusForDay, isFlexibleFrequency, getWeekProgress, getFrequencyLabel } from "@/lib/habit-utils";
import { toggleHabitLog } from "@/app/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FramerWrapper } from "@/components/ui/FramerWrapper";

interface Habit {
    id: string;
    title: string;
    category: string;
    frequency: string;
    streak: number;
    logs: { completed_date: string }[];
}

interface DayHabitViewProps {
    initialHabits: Habit[];
    dateStr: string; // YYYY-MM-DD
}

export function DayHabitView({ initialHabits, dateStr }: DayHabitViewProps) {
    const [habits, setHabits] = useState<Habit[]>(initialHabits);
    const [loading, setLoading] = useState<string | null>(null);
    const router = useRouter();

    const date = new Date(dateStr);

    // Format date for display (e.g., "Martes, 4 de Febrero")
    const formattedDate = date.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    const handleToggle = async (habitId: string) => {
        setLoading(habitId);

        try {
            const result = await toggleHabitLog(habitId, dateStr);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Estado actualizado");
                // Optimistically update UI
                setHabits(prev => prev.map(h => {
                    if (h.id === habitId) {
                        const hasLog = h.logs.some(l => l.completed_date === dateStr);
                        return {
                            ...h,
                            logs: hasLog
                                ? h.logs.filter(l => l.completed_date !== dateStr)
                                : [...h.logs, { completed_date: dateStr }]
                        };
                    }
                    return h;
                }));
            }
        } catch (error) {
            toast.error("Error al actualizar");
        } finally {
            setLoading(null);
        }
    };

    const getEmoji = (category: string) => {
        const emojiMap: Record<string, string> = {
            health: "💪",
            mindset: "🧘‍♂️",
            productivity: "📚",
            finance: "💰"
        };
        return emojiMap[category] || "⭐";
    };

    // Calculate progress for the day (only count required habits)
    const requiredHabits = habits.filter(h => {
        const status = getHabitStatusForDay(h, date);
        return status !== 'not_required';
    });
    const completedCount = requiredHabits.filter(h => getHabitStatusForDay(h, date) === 'completed').length;
    const totalRequired = requiredHabits.length;
    const progressPercentage = totalRequired > 0 ? Math.round((completedCount / totalRequired) * 100) : 0;

    return (
        <div className="space-y-8">
            {/* Header with Navigation and Date */}
            <div className="flex flex-col gap-6">
                <Button
                    variant="ghost"
                    className="w-fit pl-0 hover:bg-transparent text-muted-foreground hover:text-white transition-colors"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Calendario
                </Button>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary">
                            <CalendarIcon className="h-4 w-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">Vista Diaria</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-white capitalize">
                            {formattedDate}
                        </h1>
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Progreso Diario</p>
                            <p className="text-2xl font-bold text-white">{progressPercentage}%</p>
                        </div>
                        <div className="h-12 w-12 relative flex items-center justify-center">
                            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                                <path
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#333"
                                    strokeWidth="4"
                                />
                                <path
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    strokeDasharray={`${progressPercentage}, 100`}
                                    className="text-primary transition-all duration-1000 ease-out"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Habits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {habits.map((habit, idx) => {
                    const status = getHabitStatusForDay(habit, date);
                    const isLoading = loading === habit.id;
                    const isNotRequired = status === 'not_required';
                    const isFailed = status === 'failed';
                    const isCompleted = status === 'completed';
                    const weekProgress = isFlexibleFrequency(habit.frequency) ? getWeekProgress(habit, date) : null;

                    return (
                        <FramerWrapper
                            key={habit.id}
                            delay={idx * 0.05}
                            className={cn(
                                "group relative overflow-hidden rounded-[2rem] p-6 transition-all duration-300 border h-full flex flex-col justify-between",
                                isCompleted && "bg-primary/10 border-primary/20",
                                isFailed && "bg-red-500/5 border-red-500/20",
                                isNotRequired && "bg-white/[0.02] border-white/5 opacity-50",
                                !isCompleted && !isFailed && !isNotRequired && "bg-white/5 border-white/5 hover:bg-white/10"
                            )}
                        >
                            {/* Background completion effect */}
                            <div className={cn(
                                "absolute inset-0 transition-transform duration-500 ease-out origin-bottom",
                                isCompleted ? "bg-primary/5 scale-y-100" : "scale-y-0"
                            )} />

                            <div className="relative z-10 flex items-start justify-between gap-4 mb-6">
                                <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl md:text-2xl shadow-inner">
                                    {getEmoji(habit.category)}
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <div className={cn(
                                        "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                                        isCompleted && "bg-primary text-black border-primary",
                                        isFailed && "bg-red-500/20 text-red-400 border-red-500/30",
                                        isNotRequired && "bg-white/5 text-white/40 border-white/10",
                                        !isCompleted && !isFailed && !isNotRequired && "bg-white/5 text-muted-foreground border-white/10"
                                    )}>
                                        {isCompleted && "Completado"}
                                        {isFailed && "No cumplido"}
                                        {isNotRequired && "No requerido"}
                                        {!isCompleted && !isFailed && !isNotRequired && "Pendiente"}
                                    </div>
                                    <span className="text-[10px] text-white/40">{getFrequencyLabel(habit.frequency)}</span>
                                </div>
                            </div>

                            <div className="relative z-10 space-y-4">
                                <div>
                                    <h3 className="text-lg md:text-xl font-bold text-white mb-1">{habit.title}</h3>
                                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                                        <Flame className={cn("h-4 w-4", isCompleted ? "fill-primary text-primary" : "text-zinc-600")} />
                                        <span className={isCompleted ? "text-primary" : ""}>{habit.streak} racha actual</span>
                                        {weekProgress && (
                                            <span className="ml-1 px-2 py-0.5 bg-white/10 rounded-full text-[10px] text-white/70">
                                                {weekProgress.completed}/{weekProgress.target}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleToggle(habit.id)}
                                    disabled={isLoading || isNotRequired}
                                    className={cn(
                                        "w-full py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2",
                                        isCompleted && "bg-primary text-black shadow-[0_0_20px_rgba(191,245,73,0.3)] hover:bg-primary/90",
                                        isFailed && "bg-red-500/20 text-red-400 hover:bg-red-500/30",
                                        isNotRequired && "bg-white/5 text-white/30 cursor-not-allowed",
                                        !isCompleted && !isFailed && !isNotRequired && "bg-white/10 text-white hover:bg-white/20",
                                        isLoading && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    {isCompleted && (
                                        <>
                                            <Check className="h-5 w-5 stroke-[3px]" />
                                            <span>¡Hecho!</span>
                                        </>
                                    )}
                                    {isFailed && (
                                        <>
                                            <X className="h-5 w-5 stroke-[2px]" />
                                            <span>No cumplido</span>
                                        </>
                                    )}
                                    {isNotRequired && (
                                        <>
                                            <Minus className="h-5 w-5 stroke-[2px]" />
                                            <span>No aplica hoy</span>
                                        </>
                                    )}
                                    {!isCompleted && !isFailed && !isNotRequired && (
                                        <span>Marcar como hecho</span>
                                    )}
                                </button>
                            </div>
                        </FramerWrapper>
                    );
                })}
            </div>

            {habits.length === 0 && (
                <div className="rounded-[2.5rem] bg-white/5 border border-white/5 p-16 text-center">
                    <div className="max-w-md mx-auto space-y-4">
                        <div className="text-6xl">📅</div>
                        <h3 className="text-2xl font-bold text-white">No hay hábitos para este día</h3>
                        <p className="text-muted-foreground">Parece que no tenías hábitos activos en esta fecha.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
