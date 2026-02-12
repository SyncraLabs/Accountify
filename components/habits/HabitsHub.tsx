"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Check, X, Minus, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";
import { getHabitStatusForDay, isFlexibleFrequency, getWeekProgress, getFrequencyLabel } from "@/lib/habit-utils";
import { toggleHabitLog, planDayWithAI, toggleTaskComplete } from "@/app/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
    useCelebration,
    StreakFire,
    SparkleBurst,
    GlowWrapper
} from "@/components/ui/dopamine";
import { HabitsViewToggle, type HabitsView } from "./HabitsViewToggle";
import { HabitCalendar } from "./HabitCalendar";
import { MonthlyHabitView } from "./MonthlyHabitView";
import { CreateHabitModal } from "./CreateHabitModal";
import {
    DailyTaskList,
    CreateTaskDialog,
    AIPlannerInput,
    AITaskSuggestions
} from "@/components/planner";

interface Habit {
    id: string;
    title: string;
    category: string;
    frequency: string;
    streak: number;
    logs: { completed_date: string }[];
}

interface DailyTask {
    id: string;
    title: string;
    priority: 'low' | 'medium' | 'high';
    completed: boolean;
    completed_at: string | null;
    order_index: number;
}

interface HabitsHubProps {
    initialHabits: Habit[];
    initialTasks: DailyTask[];
    dateStr: string;
}

export function HabitsHub({ initialHabits, initialTasks, dateStr }: HabitsHubProps) {
    const [view, setView] = useState<HabitsView>('daily');
    const [habits, setHabits] = useState<Habit[]>(initialHabits);
    const [tasks, setTasks] = useState<DailyTask[]>(initialTasks);
    const [loading, setLoading] = useState<string | null>(null);
    const [showSparkles, setShowSparkles] = useState<string | null>(null);
    const [dayCompleted, setDayCompleted] = useState(false);
    const [activeTab, setActiveTab] = useState<'habits' | 'tasks'>('habits');
    const [aiSuggestions, setAiSuggestions] = useState<{ tasks: any[]; message: string } | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const router = useRouter();
    const { celebrate } = useCelebration();
    const t = useTranslations("calendarPage");
    const tPlanner = useTranslations("planner");
    const locale = useLocale();

    // Sync state when props change
    useEffect(() => {
        setHabits(initialHabits);
    }, [initialHabits]);

    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    const date = new Date(dateStr);

    // Format date for display based on locale
    const formattedDate = date.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    // Calculate progress for the day
    const requiredHabits = habits.filter(h => {
        const status = getHabitStatusForDay(h, date);
        return status !== 'not_required';
    });
    const completedCount = requiredHabits.filter(h => getHabitStatusForDay(h, date) === 'completed').length;
    const totalRequired = requiredHabits.length;
    const progressPercentage = totalRequired > 0 ? Math.round((completedCount / totalRequired) * 100) : 0;

    // Check for day completion
    useEffect(() => {
        if (progressPercentage === 100 && totalRequired > 0 && !dayCompleted) {
            setDayCompleted(true);
            celebrate('dayComplete', { intensity: 'large' });
            toast.success(`🎉 ${t("toast.dayCompleted")}`);
        }
    }, [progressPercentage, totalRequired, celebrate, dayCompleted, t]);

    const handleToggle = async (habitId: string) => {
        setLoading(habitId);

        try {
            const habit = habits.find(h => h.id === habitId);
            const isCompleting = !habit?.logs.some(l => l.completed_date === dateStr);

            // Optimistic update
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
                setShowSparkles(habitId);
                setTimeout(() => setShowSparkles(null), 800);
                celebrate('habitComplete', { intensity: 'small' });
                toast.success(`${t("toast.habitCompleted")} 🎉`);
            } else {
                toast.info(t("toast.statusUpdated"));
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
        } catch {
            toast.error(t("toast.updateError"));
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

    const refreshTasks = () => {
        router.refresh();
    };

    const handleTaskToggle = async (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const wasCompleted = task.completed;

        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
        ));

        if (!wasCompleted) {
            celebrate('habitComplete', { intensity: 'small' });
            toast.success(t("toast.taskCompleted"));
        } else {
            toast.info(t("toast.taskUnchecked"));
        }

        try {
            const result = await toggleTaskComplete(taskId);
            if (result.error) {
                setTasks(prev => prev.map(t =>
                    t.id === taskId ? { ...t, completed: wasCompleted } : t
                ));
                toast.error(result.error);
            }
        } catch {
            setTasks(prev => prev.map(t =>
                t.id === taskId ? { ...t, completed: wasCompleted } : t
            ));
            toast.error(t("toast.taskUpdateError"));
        }
    };

    const handleAIPlan = async (input: string) => {
        setIsAiLoading(true);
        try {
            const result = await planDayWithAI(input, dateStr, habits);

            if (result.error) {
                toast.error(result.error);
            } else if (result.tasks) {
                setAiSuggestions({
                    tasks: result.tasks,
                    message: result.message || ""
                });
            }
        } catch {
            toast.error(t("toast.aiPlanError"));
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleAcceptSuggestions = () => {
        setAiSuggestions(null);
        refreshTasks();
    };

    const handleDismissSuggestions = () => {
        setAiSuggestions(null);
    };

    return (
        <div className="space-y-8 animate-fade-up">
            {/* Header */}
            <div className="flex flex-col gap-6 items-center text-center md:items-start md:text-left">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 w-full">
                    <div className="flex flex-col items-center md:items-start space-y-4">
                        <div className="flex items-center gap-2 text-primary">
                            <Target className="h-4 w-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">{t("myHabits")}</span>
                        </div>

                        {/* View Toggle */}
                        <HabitsViewToggle currentView={view} onViewChange={setView} />
                    </div>

                    {/* Progress (only show on daily view) */}
                    {view === 'daily' && totalRequired > 0 && (
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
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t("dailyProgress")}</p>
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
                    )}
                </div>

                {/* Date Display (only on daily view) */}
                {view === 'daily' && (
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white capitalize px-4 md:px-0">
                        {formattedDate}
                    </h1>
                )}
            </div>

            {/* View Content */}
            <AnimatePresence mode="wait">
                {view === 'daily' && (
                    <motion.div
                        key="daily"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        {/* Tabs for Habits/Tasks */}
                        <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
                            <motion.button
                                onClick={() => setActiveTab('habits')}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                    activeTab === 'habits'
                                        ? "bg-primary text-black"
                                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                                )}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Target className="h-4 w-4" />
                                {tPlanner("habits")}
                                {requiredHabits.length > 0 && (
                                    <span className={cn(
                                        "px-1.5 py-0.5 rounded-full text-xs",
                                        activeTab === 'habits' ? "bg-black/20" : "bg-white/10"
                                    )}>
                                        {completedCount}/{totalRequired}
                                    </span>
                                )}
                            </motion.button>
                            <motion.button
                                onClick={() => setActiveTab('tasks')}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                    activeTab === 'tasks'
                                        ? "bg-primary text-black"
                                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                                )}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <ListTodo className="h-4 w-4" />
                                {tPlanner("tasks")}
                                {tasks.length > 0 && (
                                    <span className={cn(
                                        "px-1.5 py-0.5 rounded-full text-xs",
                                        activeTab === 'tasks' ? "bg-black/20" : "bg-white/10"
                                    )}>
                                        {tasks.filter(t => t.completed).length}/{tasks.length}
                                    </span>
                                )}
                            </motion.button>
                        </div>

                        {/* Tab Content */}
                        <AnimatePresence mode="wait">
                            {activeTab === 'habits' ? (
                                <motion.div
                                    key="habits-tab"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {/* Add Habit Button */}
                                    <div className="flex justify-end mb-4">
                                        <CreateHabitModal onSuccess={() => router.refresh()} />
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
                                                                    {isCompleted && t("status.completed")}
                                                                    {isFailed && t("status.failed")}
                                                                    {isNotRequired && t("status.notRequired")}
                                                                    {!isCompleted && !isFailed && !isNotRequired && t("status.pending")}
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
                                                                        {t("currentStreak")}
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
                                                                            <span>{t("buttons.done")}</span>
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
                                                                            <span>{t("buttons.notCompleted")}</span>
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
                                                                            <span>{t("buttons.notApplicable")}</span>
                                                                        </motion.div>
                                                                    )}
                                                                    {!isCompleted && !isFailed && !isNotRequired && (
                                                                        <motion.span
                                                                            key="pending"
                                                                            initial={{ opacity: 0 }}
                                                                            animate={{ opacity: 1 }}
                                                                        >
                                                                            {t("buttons.markAsDone")}
                                                                        </motion.span>
                                                                    )}
                                                                </AnimatePresence>

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
                                                    🎯
                                                </motion.div>
                                                <h3 className="text-2xl font-bold text-white">{t("noHabitsYet.title")}</h3>
                                                <p className="text-muted-foreground">{t("noHabitsYet.subtitle")}</p>
                                                <CreateHabitModal
                                                    trigger={
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            className="mt-4 px-6 py-3 bg-primary text-black rounded-full font-semibold"
                                                        >
                                                            {t("noHabitsYet.cta")}
                                                        </motion.button>
                                                    }
                                                    onSuccess={() => router.refresh()}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="tasks-tab"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6"
                                >
                                    {/* Task Actions */}
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-semibold text-white">{tPlanner("tasks")}</h2>
                                        <CreateTaskDialog dateStr={dateStr} onSuccess={refreshTasks} />
                                    </div>

                                    {/* AI Planning Section */}
                                    <AnimatePresence mode="wait">
                                        {aiSuggestions ? (
                                            <AITaskSuggestions
                                                key="suggestions"
                                                tasks={aiSuggestions.tasks}
                                                message={aiSuggestions.message}
                                                dateStr={dateStr}
                                                onAccept={handleAcceptSuggestions}
                                                onDismiss={handleDismissSuggestions}
                                            />
                                        ) : (
                                            <AIPlannerInput
                                                key="input"
                                                onSubmit={handleAIPlan}
                                                isLoading={isAiLoading}
                                            />
                                        )}
                                    </AnimatePresence>

                                    {/* Task List */}
                                    <DailyTaskList tasks={tasks} onUpdate={refreshTasks} onToggle={handleTaskToggle} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {view === 'weekly' && (
                    <motion.div
                        key="weekly"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <HabitCalendar initialHabits={habits} />
                    </motion.div>
                )}

                {view === 'monthly' && (
                    <motion.div
                        key="monthly"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <MonthlyHabitView initialHabits={habits} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
