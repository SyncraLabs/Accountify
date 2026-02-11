"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Trash2, Calendar as CalendarIcon, X, Minus } from "lucide-react";
import {
    getHabitStatusForDay,
    getWeekProgress,
    isFlexibleFrequency,
    formatDateStr
} from "@/lib/habit-utils";
import { CreateHabitModal } from "./CreateHabitModal";
import { ShareHabitDialog } from "./ShareHabitDialog";
import { QuickShareToggle } from "./QuickShareToggle";
import { toggleHabitLog, deleteHabit } from "@/app/actions";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
import {
    useCelebration,
    StreakFire,
    SparkleBurst,
} from "@/components/ui/dopamine";

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
    frequency: string;
    streak: number;
    logs: { completed_date: string }[];
}

interface HabitCalendarProps {
    initialHabits: Habit[];
}

const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            delay: i * 0.1,
            duration: 0.5,
            type: "spring" as const,
            stiffness: 100,
        },
    }),
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

const dayVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
        opacity: 1,
        scale: 1,
        transition: {
            delay: i * 0.05,
            type: "spring" as const,
            stiffness: 300,
        },
    }),
};

export function HabitCalendar({ initialHabits }: HabitCalendarProps) {
    const t = useTranslations('habitCalendar');
    const [habits, setHabits] = useState<Habit[]>(initialHabits);
    const [loading, setLoading] = useState<string | null>(null);
    const [sparkleKey, setSparkleKey] = useState<string | null>(null);
    const router = useRouter();
    const { celebrate } = useCelebration();

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
        const loadingKey = `${habitId}-${dateStr}`;
        setLoading(loadingKey);

        // Check if completing
        const habit = habits.find(h => h.id === habitId);
        const isCompleting = !habit?.logs.some(l => l.completed_date === dateStr);

        try {
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
                // Trigger celebration effects
                setSparkleKey(loadingKey);
                setTimeout(() => setSparkleKey(null), 800);
                celebrate('habitComplete', { intensity: 'small' });
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
            } else {
                toast.success(t('progressUpdated'));
            }
        } catch (error) {
            toast.error(t('updateError'));
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
                toast.success(t('habitDeleted') || "Hábito eliminado");
                setHabits(prev => prev.filter(h => h.id !== habitToDelete.id));
            }
        } catch (error) {
            toast.error(t('deleteError'));
        } finally {
            setHabitToDelete(null);
        }
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
            finance: "💰",
            creativity: "🎨",
            social: "👥"
        };
        return emojiMap[category] || "⭐";
    };

    const tCommon = useTranslations('common');

    if (habits.length === 0) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="text-muted-foreground font-medium uppercase tracking-widest text-sm">{t('activeHabits')}</span>
                        <span className="bg-white/10 px-2 py-0.5 rounded text-xs text-white">0</span>
                    </div>
                    <CreateHabitModal onSuccess={() => window.location.reload()} />
                </div>

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
                            🎯
                        </motion.div>
                        <h3 className="text-2xl font-bold text-white">{t('noHabitsTitle')}</h3>
                        <p className="text-muted-foreground">{t('noHabitsDesc')}</p>
                        <CreateHabitModal
                            trigger={
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="mt-4 px-6 py-3 bg-primary text-black rounded-full font-semibold"
                                >
                                    {t('createFirst')}
                                </motion.button>
                            }
                            onSuccess={() => window.location.reload()}
                        />
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header / Actions */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <span className="text-muted-foreground font-medium uppercase tracking-widest text-sm">{t('activeHabits')}</span>
                    <motion.span
                        key={habits.length}
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        className="bg-white/10 px-2 py-0.5 rounded text-xs text-white"
                    >
                        {habits.length}
                    </motion.span>
                </div>
                <CreateHabitModal onSuccess={() => window.location.reload()} />
            </motion.div>

            {/* Big Grid Layout */}
            <div className="grid gap-6">
                <AnimatePresence mode="popLayout">
                    {habits.map((habit, idx) => {
                        const currentStreak = calculateStreak(habit);

                        // Convert logs to Dates for Calendar
                        const completedDates = habit.logs.map(log => {
                            const [year, month, day] = log.completed_date.split('-').map(Number);
                            return new Date(year, month - 1, day);
                        });

                        return (
                            <motion.div
                                key={habit.id}
                                custom={idx}
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                layout
                                className="group relative rounded-[2rem] bg-white/5 border border-white/5 p-4 md:p-8 hover:bg-white/[0.08] hover:border-white/10 transition-colors duration-300 overflow-hidden"
                                whileHover={{ y: -4 }}
                                style={{ willChange: 'transform' }}
                            >
                                {/* Subtle glow on hover */}
                                <motion.div
                                    className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                    style={{
                                        background: 'radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(191, 245, 73, 0.06), transparent 40%)',
                                    }}
                                />

                                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 md:gap-6 relative z-10">

                                    {/* Habit Info */}
                                    <div className="relative flex flex-col gap-3 w-full xl:w-auto xl:min-w-[300px]">
                                        <div className="flex items-center gap-3 md:gap-4 w-full min-w-0">
                                            <motion.div
                                                className="h-10 w-10 md:h-16 md:w-16 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 flex items-center justify-center text-lg md:text-2xl shadow-inner shrink-0"
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                                transition={{ type: "spring", stiffness: 400 }}
                                            >
                                                {getEmoji(habit.category)}
                                            </motion.div>
                                            <div className="space-y-0.5 min-w-0 flex-1">
                                                <h3 className="text-base md:text-2xl font-bold text-white truncate pr-2" title={habit.title}>{habit.title}</h3>
                                                <div className="flex items-center gap-2 text-primary font-medium text-xs md:text-base">
                                                    <StreakFire
                                                        streak={currentStreak}
                                                        animated={currentStreak >= 3}
                                                        size="sm"
                                                    />
                                                    <span className="truncate">{t('dayStreak')}</span>
                                                    {isFlexibleFrequency(habit.frequency) && (
                                                        <span className="ml-1 px-2 py-0.5 bg-white/10 rounded-full text-[10px] md:text-xs text-white/70">
                                                            {getWeekProgress(habit).completed}/{getWeekProgress(habit).target} {t('thisWeek')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mb-1 scrollbar-none md:absolute md:top-0 md:right-0 lg:-top-2 lg:-right-4 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 md:bg-black/50 md:backdrop-blur-sm md:p-1 md:rounded-xl md:border md:border-white/10 z-20">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 md:h-9 md:w-9 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white rounded-xl border border-white/5 shrink-0"
                                                        title={t('viewHistory')}
                                                    >
                                                        <CalendarIcon className="h-3 w-3 md:h-4 md:w-4" />
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

                                            <div className="shrink-0">
                                                <ShareHabitDialog
                                                    habitId={habit.id}
                                                    habitTitle={habit.title}
                                                    streak={currentStreak}
                                                    category={habit.category}
                                                />
                                            </div>

                                            <div className="shrink-0">
                                                <QuickShareToggle habitId={habit.id} />
                                            </div>

                                            <motion.button
                                                onClick={() => handleDeleteClick(habit.id, habit.title)}
                                                className="h-8 w-8 md:h-9 md:w-9 flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 transition-all duration-300 shrink-0"
                                                title={t('deleteHabit')}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                                            </motion.button>
                                        </div>
                                    </div>

                                    {/* Days Grid */}
                                    <div className="w-full xl:flex-1 grid grid-cols-7 gap-1 md:gap-4">
                                        {DAYS.map((date, i) => {
                                            const isToday = date.toDateString() === new Date().toDateString();
                                            const status = getHabitStatusForDay(habit, date);
                                            const loadingKey = `${habit.id}-${formatDateStr(date)}`;
                                            const isLoading = loading === loadingKey;
                                            const showSparkle = sparkleKey === loadingKey;

                                            return (
                                                <motion.div
                                                    key={i}
                                                    custom={i}
                                                    variants={dayVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    className="flex flex-col items-center gap-1 md:gap-3 group/day"
                                                >
                                                    <motion.button
                                                        onClick={() => handleDayClick(date)}
                                                        className={`text-[10px] md:text-xs font-bold uppercase tracking-wider hover:text-white transition-colors cursor-pointer ${isToday ? "text-primary" : "text-muted-foreground"}`}
                                                        whileHover={{ scale: 1.1 }}
                                                    >
                                                        <span className="md:hidden">{date.toLocaleDateString("es-ES", { weekday: "narrow" }).charAt(0)}</span>
                                                        <span className="hidden md:inline">{date.toLocaleDateString("es-ES", { weekday: "short" })}</span>
                                                    </motion.button>

                                                    <motion.button
                                                        onClick={() => handleToggle(habit.id, date)}
                                                        disabled={isLoading || status === 'not_required'}
                                                        className={cn(
                                                            "relative w-full aspect-square rounded-lg md:rounded-2xl border flex items-center justify-center overflow-hidden",
                                                            status === 'completed' && "bg-primary border-primary text-black shadow-[0_0_20px_rgba(191,245,73,0.3)]",
                                                            status === 'pending' && "bg-transparent border-white/10 text-muted-foreground hover:border-primary/50 hover:bg-white/5",
                                                            status === 'not_required' && "bg-transparent border-white/5 text-white/20 cursor-default",
                                                            status === 'failed' && "bg-red-500/10 border-red-500/30 text-red-400",
                                                            isToday && status === 'pending' && "border-primary/50",
                                                            isLoading && "opacity-50 cursor-not-allowed"
                                                        )}
                                                        whileHover={status !== 'not_required' ? { scale: 1.08 } : {}}
                                                        whileTap={status !== 'not_required' ? { scale: 0.92 } : {}}
                                                        style={{ willChange: 'transform' }}
                                                    >
                                                        <AnimatePresence mode="wait">
                                                            {status === 'completed' && (
                                                                <motion.div
                                                                    key="check"
                                                                    initial={{ scale: 0, rotate: -180 }}
                                                                    animate={{ scale: 1, rotate: 0 }}
                                                                    exit={{ scale: 0, rotate: 180 }}
                                                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                                >
                                                                    <Check className="h-3 w-3 md:h-6 md:w-6 stroke-[3px]" />
                                                                </motion.div>
                                                            )}
                                                            {status === 'failed' && (
                                                                <motion.div
                                                                    key="failed"
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                >
                                                                    <X className="h-3 w-3 md:h-5 md:w-5 stroke-[2px]" />
                                                                </motion.div>
                                                            )}
                                                            {status === 'not_required' && (
                                                                <Minus className="h-3 w-3 md:h-4 md:w-4 stroke-[2px]" />
                                                            )}
                                                            {status === 'pending' && (
                                                                <motion.span
                                                                    key="pending"
                                                                    className={cn("text-xs md:text-lg font-medium", isToday && "text-primary")}
                                                                    animate={isToday ? { scale: [1, 1.1, 1] } : {}}
                                                                    transition={{ duration: 2, repeat: Infinity }}
                                                                >
                                                                    {date.getDate()}
                                                                </motion.span>
                                                            )}
                                                        </AnimatePresence>

                                                        {/* Sparkle burst on completion */}
                                                        <SparkleBurst trigger={showSparkle} count={8} />

                                                        {/* Glow effect for completed */}
                                                        {status === 'completed' && (
                                                            <motion.div
                                                                className="absolute inset-0 rounded-lg md:rounded-2xl"
                                                                animate={{
                                                                    boxShadow: [
                                                                        '0 0 10px rgba(191, 245, 73, 0.3)',
                                                                        '0 0 20px rgba(191, 245, 73, 0.4)',
                                                                        '0 0 10px rgba(191, 245, 73, 0.3)',
                                                                    ],
                                                                }}
                                                                transition={{ duration: 2, repeat: Infinity }}
                                                            />
                                                        )}
                                                    </motion.button>
                                                </motion.div>
                                            )
                                        })}
                                    </div>

                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            <AlertDialog open={!!habitToDelete} onOpenChange={(open) => !open && setHabitToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('confirmDeleteTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('confirmDeleteDesc', { title: habitToDelete?.title || '' })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-500 hover:bg-red-600 text-white border-red-600"
                        >
                            {tCommon('delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
