"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Check, Flame, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { CreateHabitModal } from "./CreateHabitModal";
import { ShareHabitDialog } from "./ShareHabitDialog";
import { FramerWrapper } from "@/components/ui/FramerWrapper";
import { toggleHabitLog, deleteHabit } from "@/app/actions";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { useRouter } from "next/navigation";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Generate last 7 days
const DAYS = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
});

interface Habit {
    id: string;
    title: string;
    category: string;
    streak: number;
    logs: { completed_date: string }[];
}

interface HabitCalendarProps {
    initialHabits: Habit[];
}

export function HabitCalendar({ initialHabits }: HabitCalendarProps) {
    const [habits, setHabits] = useState<Habit[]>(initialHabits);
    const [loading, setLoading] = useState<string | null>(null);
    const router = useRouter();

    const handleDayClick = (day: Date) => {
        const dateStr = [
            day.getFullYear(),
            String(day.getMonth() + 1).padStart(2, '0'),
            String(day.getDate()).padStart(2, '0')
        ].join('-');
        router.push(`/calendar/day/${dateStr}`);
    };
    const [habitToDelete, setHabitToDelete] = useState<{ id: string, title: string } | null>(null);

    const handleToggle = async (habitId: string, date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        setLoading(`${habitId}-${dateStr}`);

        try {
            const result = await toggleHabitLog(habitId, dateStr);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Progreso actualizado");
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

    const handleDeleteClick = (habitId: string, habitTitle: string) => {
        setHabitToDelete({ id: habitId, title: habitTitle });
    };

    const confirmDelete = async () => {
        if (!habitToDelete) return;

        try {
            const result = await deleteHabit(habitToDelete.id);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Hábito eliminado");
                // Optimistically remove from UI
                setHabits(prev => prev.filter(h => h.id !== habitToDelete.id));
            }
        } catch (error) {
            toast.error("Error al eliminar el hábito");
        } finally {
            setHabitToDelete(null);
        }
    };

    const isCompleted = (habit: Habit, date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return habit.logs.some(log => log.completed_date === dateStr);
    };

    const calculateStreak = (habit: Habit) => {
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = checkDate.toISOString().split('T')[0];

            if (habit.logs.some(log => log.completed_date === dateStr)) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
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

    if (habits.length === 0) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="text-muted-foreground font-medium uppercase tracking-widest text-sm">Active Habits</span>
                        <span className="bg-white/10 px-2 py-0.5 rounded text-xs text-white">0</span>
                    </div>
                    <CreateHabitModal onSuccess={() => window.location.reload()} />
                </div>

                <div className="rounded-[2.5rem] bg-white/5 border border-white/5 p-16 text-center">
                    <div className="max-w-md mx-auto space-y-4">
                        <div className="text-6xl">🎯</div>
                        <h3 className="text-2xl font-bold text-white">No tienes hábitos aún</h3>
                        <p className="text-muted-foreground">Crea tu primer hábito y comienza tu viaje hacia la consistencia.</p>
                        <CreateHabitModal
                            trigger={
                                <button className="mt-4 px-6 py-3 bg-primary text-black rounded-full font-semibold hover:scale-105 transition-transform">
                                    Crear Mi Primer Hábito
                                </button>
                            }
                            onSuccess={() => window.location.reload()}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header / Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="text-muted-foreground font-medium uppercase tracking-widest text-sm">Active Habits</span>
                    <span className="bg-white/10 px-2 py-0.5 rounded text-xs text-white">{habits.length}</span>
                </div>
                <CreateHabitModal onSuccess={() => window.location.reload()} />
            </div>

            {/* Big Grid Layout */}
            <div className="grid gap-6">
                {habits.map((habit, idx) => {
                    const currentStreak = calculateStreak(habit);

                    // Convert logs to Dates for Calendar
                    const completedDates = habit.logs.map(log => {
                        // Create date from string "YYYY-MM-DD" and fix timezone offset
                        const [year, month, day] = log.completed_date.split('-').map(Number);
                        return new Date(year, month - 1, day);
                    });


                    return (
                        <FramerWrapper key={habit.id} delay={idx * 0.1} className="group relative rounded-[2.5rem] bg-white/5 border border-white/5 p-8 hover:bg-white/10 transition-all duration-500">
                            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">

                                {/* Habit Info */}
                                <div className="relative flex items-start gap-6 min-w-[300px]">
                                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 flex items-center justify-center text-2xl shadow-inner">
                                        {getEmoji(habit.category)}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-bold text-white max-w-[200px] truncate" title={habit.title}>{habit.title}</h3>
                                        <div className="flex items-center gap-2 text-primary font-medium">
                                            <Flame className="h-4 w-4 fill-primary" />
                                            <span>{currentStreak} day streak</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="absolute -top-2 -right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/50 backdrop-blur-sm p-1 rounded-xl border border-white/10">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white rounded-xl border border-white/5"
                                                    title="Ver historial completo"
                                                >
                                                    <CalendarIcon className="h-4 w-4" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 border-white/10 bg-black/90 backdrop-blur-xl" align="end">
                                                <Calendar
                                                    mode="multiple"
                                                    selected={completedDates}
                                                    onDayClick={handleDayClick}
                                                    className="rounded-md border-0"
                                                    classNames={{
                                                        day_selected: "bg-primary text-black hover:bg-primary/90 hover:text-black focus:bg-primary focus:text-black font-bold",
                                                        day_today: "bg-white/10 text-white",
                                                        day: "hover:bg-white/10 hover:text-white rounded-md transition-colors cursor-pointer"
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>


                                        <ShareHabitDialog
                                            habitId={habit.id}
                                            habitTitle={habit.title}
                                            streak={currentStreak}
                                            category={habit.category}
                                        />

                                        <button
                                            onClick={() => handleDeleteClick(habit.id, habit.title)}
                                            className="h-9 w-9 flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 transition-all duration-300"
                                            title="Eliminar hábito"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Days Grid */}
                                <div className="flex-1 grid grid-cols-7 gap-4">
                                    {DAYS.map((date, i) => {
                                        const isToday = date.toDateString() === new Date().toDateString();
                                        const completed = isCompleted(habit, date);
                                        const loadingKey = `${habit.id}-${date.toISOString().split('T')[0]}`;
                                        const isLoading = loading === loadingKey;

                                        return (
                                            <div key={i} className="flex flex-col items-center gap-3 group/day">

                                                <button
                                                    onClick={() => handleDayClick(date)}
                                                    className={`text-xs font-bold uppercase tracking-wider hover:text-white transition-colors cursor-pointer ${isToday ? "text-primary" : "text-muted-foreground"}`}
                                                >
                                                    {date.toLocaleDateString("es-ES", { weekday: "short" })}
                                                </button>

                                                <button
                                                    onClick={() => handleToggle(habit.id, date)}
                                                    disabled={isLoading}
                                                    className={cn(
                                                        "h-14 w-full rounded-2xl border flex items-center justify-center transition-all duration-300 relative overflow-hidden",
                                                        completed
                                                            ? "bg-primary border-primary text-black shadow-[0_0_20px_rgba(191,245,73,0.3)] hover:scale-105"
                                                            : "bg-transparent border-white/10 text-muted-foreground hover:border-white/30 hover:bg-white/5",
                                                        isToday && !completed && "border-primary/50 animate-pulse",
                                                        isLoading && "opacity-50 cursor-not-allowed"
                                                    )}
                                                >
                                                    {completed ? (
                                                        <Check className="h-6 w-6 stroke-[3px]" />
                                                    ) : (
                                                        <span className={cn("text-lg font-medium", isToday && "text-primary")}>{date.getDate()}</span>
                                                    )}
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>

                            </div>
                        </FramerWrapper>
                    );
                })}
            </div >

            <AlertDialog open={!!habitToDelete} onOpenChange={(open) => !open && setHabitToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar este hábito?</AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Estás seguro de que quieres eliminar "{habitToDelete?.title}"? Esta acción no se puede deshacer y perderás todo tu progreso.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-500 hover:bg-red-600 text-white border-red-600"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    );
}
