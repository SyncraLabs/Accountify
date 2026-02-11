"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Check, Calendar as CalendarIcon, ArrowLeft, X, Minus } from "lucide-react";
import { getHabitStatusForDay, isFlexibleFrequency, getWeekProgress, getFrequencyLabel } from "@/lib/habit-utils";
import { toggleHabitLog } from "@/app/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    useCelebration,
    StreakFire,
    SparkleBurst,
    GlowWrapper
} from "@/components/ui/dopamine";

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
    const [showSparkles, setShowSparkles] = useState<string | null>(null);
    const [dayCompleted, setDayCompleted] = useState(false);
    const router = useRouter();
    const { celebrate } = useCelebration();
    const prevProgressRef = useRef(0);

    const date = new Date(dateStr);

    // Format date for display (e.g., "Martes, 4 de Febrero")
    const formattedDate = date.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    // Calculate progress for the day (only count required habits)
    const requiredHabits = habits.filter(h => {
        const status = getHabitStatusForDay(h, date);
        return status !== 'not_required';
    });
    const completedCount = requiredHabits.filter(h => getHabitStatusForDay(h, date) === 'completed').length;
    const totalRequired = requiredHabits.length;
    const progressPercentage = totalRequired > 0 ? Math.round((completedCount / totalRequired) * 100) : 0;

    // Check for day completion
    useEffect(() => {
        if (progressPercentage === 100 && prevProgressRef.current < 100 && totalRequired > 0 && !dayCompleted) {
            setDayCompleted(true);
            celebrate('dayComplete', { intensity: 'large' });
            toast.success("🎉 ¡Día completado! ¡Excelente trabajo!");
        }
        prevProgressRef.current = progressPercentage;
    }, [progressPercentage, totalRequired, celebrate, dayCompleted]);

    const handleToggle = async (habitId: string) => {
        setLoading(habitId);

        try {
            const habit = habits.find(h => h.id === habitId);
            const isCompleting = !habit?.logs.some(l => l.completed_date === dateStr);

            // Optimistic update first
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

            if (isCompleting) {
                // Trigger sparkles
                setShowSparkles(habitId);
                setTimeout(() => setShowSparkles(null), 800);

                // Trigger habit complete celebration
                celebrate('habitComplete', { intensity: 'small' });
                toast.success("¡Hábito completado! 🎉");
            } else {
                toast.info("Estado actualizado");
            }

            const result = await toggleHabitLog(habitId, dateStr);

            if (result.error) {
                toast.error(result.error);
                // Revert on error
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
            finance: "💰",
            creativity: "🎨",
            social: "👥"
        };
        return emojiMap[category] || "⭐";
    };

    return (
        <div className="space-y-8 animate-fade-up">
            {/* Header with Navigation and Date */}
            <div className="flex flex-col gap-6">
                <motion.div
                    whileHover={{ x: -4 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Button
                        variant="ghost"
                        className="w-fit pl-0 hover:bg-transparent text-muted-foreground hover:text-white transition-colors"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver al Calendario
                    </Button>
                </motion.div>

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

                    {/* Animated Progress Indicator */}
                    <GlowWrapper
                        glowOnActive={progressPercentage === 100}
                        isActive={progressPercentage === 100}
                        glowOnHover={true}
                    >
                        <motion.div
                            className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/5"
                            animate={{
                                borderColor: progressPercentage === 100 ? 'rgba(191, 245, 73, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                                boxShadow: progressPercentage === 100 ? '0 0 30px rgba(191, 245, 73, 0.2)' : 'none',
                            }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Progreso Diario</p>
                                <motion.p
                                    className="text-2xl font-bold"
                                    animate={{
                                        color: progressPercentage === 100 ? '#BFF549' : '#ffffff',
                                    }}
                                    key={progressPercentage}
                                    initial={{ scale: 1.2, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 500 }}
                                >
                                    {progressPercentage}%
                                </motion.p>
                            </div>
                            <div className="h-14 w-14 relative flex items-center justify-center">
                                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                                    <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="#333"
                                        strokeWidth="3"
                                    />
                                    <motion.path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        className="text-primary"
                                        initial={{ strokeDasharray: "0, 100" }}
                                        animate={{ strokeDasharray: `${progressPercentage}, 100` }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        style={{
                                            filter: progressPercentage === 100 ? 'drop-shadow(0 0 6px rgba(191, 245, 73, 0.6))' : 'none'
                                        }}
                                    />
                                </svg>
                                {progressPercentage === 100 && (
                                    <motion.div
                                        className="absolute inset-0 flex items-center justify-center"
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.3, type: "spring" }}
                                    >
                                        <Check className="h-5 w-5 text-primary stroke-[3px]" />
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </GlowWrapper>
                </div>
            </div>

            {/* Habits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {habits.map((habit, idx) => {
                        const status = getHabitStatusForDay(habit, date);
                        const isLoading = loading === habit.id;
                        const isNotRequired = status === 'not_required';
                        const isFailed = status === 'failed';
                        const isCompleted = status === 'completed';
                        const weekProgress = isFlexibleFrequency(habit.frequency) ? getWeekProgress(habit, date) : null;

                        return (
                            <motion.div
                                key={habit.id}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05, duration: 0.4, type: "spring" }}
                                layout
                                className={cn(
                                    "group relative overflow-hidden rounded-[2rem] p-6 border h-full flex flex-col justify-between",
                                    isCompleted && "bg-primary/10 border-primary/30",
                                    isFailed && "bg-red-500/5 border-red-500/20",
                                    isNotRequired && "bg-white/[0.02] border-white/5 opacity-50",
                                    !isCompleted && !isFailed && !isNotRequired && "bg-white/5 border-white/10 hover:bg-white/[0.08] hover:border-white/20"
                                )}
                                whileHover={{ scale: isNotRequired ? 1 : 1.02, y: isNotRequired ? 0 : -4 }}
                                whileTap={{ scale: isNotRequired ? 1 : 0.98 }}
                                style={{ willChange: 'transform' }}
                            >
                                {/* Background completion effect */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: isCompleted ? 1 : 0 }}
                                    transition={{ duration: 0.5 }}
                                />

                                {/* Glow effect for completed */}
                                {isCompleted && (
                                    <motion.div
                                        className="absolute -inset-px rounded-[2rem] opacity-50"
                                        style={{
                                            background: 'linear-gradient(180deg, rgba(191, 245, 73, 0.2) 0%, transparent 50%)',
                                        }}
                                        animate={{
                                            opacity: [0.3, 0.6, 0.3],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                    />
                                )}

                                <div className="relative z-10 flex items-start justify-between gap-4 mb-6">
                                    <motion.div
                                        className={cn(
                                            "h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl md:text-2xl shadow-inner"
                                        )}
                                        animate={{
                                            scale: isCompleted ? 1.1 : 1,
                                            rotate: isCompleted ? 3 : 0,
                                        }}
                                        transition={{ type: "spring", stiffness: 400 }}
                                    >
                                        {getEmoji(habit.category)}
                                    </motion.div>
                                    <div className="flex flex-col items-end gap-1">
                                        <motion.div
                                            className={cn(
                                                "px-3 py-1 rounded-full text-xs font-medium border",
                                                isCompleted && "bg-primary text-black border-primary",
                                                isFailed && "bg-red-500/20 text-red-400 border-red-500/30",
                                                isNotRequired && "bg-white/5 text-white/40 border-white/10",
                                                !isCompleted && !isFailed && !isNotRequired && "bg-white/5 text-muted-foreground border-white/10"
                                            )}
                                            animate={isCompleted ? {
                                                scale: [1, 1.15, 1],
                                            } : {}}
                                            transition={{ duration: 0.4 }}
                                        >
                                            {isCompleted && "Completado"}
                                            {isFailed && "No cumplido"}
                                            {isNotRequired && "No requerido"}
                                            {!isCompleted && !isFailed && !isNotRequired && "Pendiente"}
                                        </motion.div>
                                        <span className="text-[10px] text-white/40">{getFrequencyLabel(habit.frequency)}</span>
                                    </div>
                                </div>

                                <div className="relative z-10 space-y-4">
                                    <div>
                                        <h3 className="text-lg md:text-xl font-bold text-white mb-1">{habit.title}</h3>
                                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                                            <StreakFire
                                                streak={habit.streak}
                                                animated={isCompleted}
                                                size="sm"
                                            />
                                            <span className={cn("transition-colors duration-300", isCompleted ? "text-primary font-medium" : "")}>
                                                racha actual
                                            </span>
                                            {weekProgress && (
                                                <span className="ml-1 px-2 py-0.5 bg-white/10 rounded-full text-[10px] text-white/70">
                                                    {weekProgress.completed}/{weekProgress.target}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <motion.button
                                        onClick={() => handleToggle(habit.id)}
                                        disabled={isLoading || isNotRequired}
                                        className={cn(
                                            "relative w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 overflow-hidden",
                                            isCompleted && "bg-primary text-black shadow-[0_0_20px_rgba(191,245,73,0.3)]",
                                            isFailed && "bg-red-500/20 text-red-400",
                                            isNotRequired && "bg-white/5 text-white/30 cursor-not-allowed",
                                            !isCompleted && !isFailed && !isNotRequired && "bg-white/10 text-white hover:bg-white/20",
                                            isLoading && "opacity-50 cursor-not-allowed"
                                        )}
                                        whileHover={!isNotRequired && !isLoading ? { scale: 1.02 } : {}}
                                        whileTap={!isNotRequired && !isLoading ? { scale: 0.98 } : {}}
                                        style={{ willChange: 'transform' }}
                                    >
                                        <AnimatePresence mode="wait">
                                            {isCompleted && (
                                                <motion.div
                                                    key="completed"
                                                    className="flex items-center gap-2"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                >
                                                    <motion.div
                                                        initial={{ rotate: -180, scale: 0 }}
                                                        animate={{ rotate: 0, scale: 1 }}
                                                        transition={{ type: "spring", stiffness: 500 }}
                                                    >
                                                        <Check className="h-5 w-5 stroke-[3px]" />
                                                    </motion.div>
                                                    <span>¡Hecho!</span>
                                                </motion.div>
                                            )}
                                            {isFailed && (
                                                <motion.div
                                                    key="failed"
                                                    className="flex items-center gap-2"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                >
                                                    <X className="h-5 w-5 stroke-[2px]" />
                                                    <span>No cumplido</span>
                                                </motion.div>
                                            )}
                                            {isNotRequired && (
                                                <motion.div
                                                    key="not-required"
                                                    className="flex items-center gap-2"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                >
                                                    <Minus className="h-5 w-5 stroke-[2px]" />
                                                    <span>No aplica hoy</span>
                                                </motion.div>
                                            )}
                                            {!isCompleted && !isFailed && !isNotRequired && (
                                                <motion.span
                                                    key="pending"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                >
                                                    Marcar como hecho
                                                </motion.span>
                                            )}
                                        </AnimatePresence>

                                        {/* Sparkle burst on completion */}
                                        <SparkleBurst trigger={showSparkles === habit.id} count={10} />
                                    </motion.button>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {habits.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-[2.5rem] bg-white/5 border border-white/5 p-16 text-center"
                >
                    <div className="max-w-md mx-auto space-y-4">
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="text-6xl"
                        >
                            📅
                        </motion.div>
                        <h3 className="text-2xl font-bold text-white">No hay hábitos para este día</h3>
                        <p className="text-muted-foreground">Parece que no tenías hábitos activos en esta fecha.</p>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
