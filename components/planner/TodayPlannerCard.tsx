"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Plus, Check, ChevronRight, ListTodo, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { createDailyTask, planDayWithAI, createMultipleDailyTasks, toggleTaskComplete } from "@/app/actions";
import { toast } from "sonner";
import { useCelebration, SparkleBurst } from "@/components/ui/dopamine";
import { useTranslations } from "next-intl";

interface DailyTask {
    id: string;
    title: string;
    priority: 'low' | 'medium' | 'high';
    completed: boolean;
}

interface Habit {
    id: string;
    title: string;
}

interface TodayPlannerCardProps {
    tasks: DailyTask[];
    habits: Habit[];
    dateStr: string;
}

export function TodayPlannerCard({ tasks: initialTasks, habits, dateStr }: TodayPlannerCardProps) {
    const t = useTranslations('planner');
    const [tasks, setTasks] = useState(initialTasks);
    const [isExpanded, setIsExpanded] = useState(true);
    const [quickInput, setQuickInput] = useState("");
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [aiInput, setAiInput] = useState("");
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [showSparkles, setShowSparkles] = useState<string | null>(null);
    const { celebrate } = useCelebration();

    const completedCount = tasks.filter(t => t.completed).length;
    const totalCount = tasks.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    const handleQuickAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quickInput.trim() || isAddingTask) return;

        setIsAddingTask(true);
        try {
            const result = await createDailyTask({
                title: quickInput.trim(),
                scheduled_date: dateStr,
                priority: 'medium'
            });

            if (result.error) {
                toast.error(result.error);
            } else if (result.task) {
                setTasks(prev => [...prev, {
                    id: result.task.id,
                    title: result.task.title,
                    priority: result.task.priority,
                    completed: false
                }]);
                setQuickInput("");
                toast.success(t('taskAdded'));
            }
        } catch (error) {
            toast.error("Error al agregar tarea");
        } finally {
            setIsAddingTask(false);
        }
    };

    const handleAIPlan = async () => {
        if (!aiInput.trim() || isAiLoading) return;

        setIsAiLoading(true);
        try {
            const result = await planDayWithAI(aiInput.trim(), dateStr, habits);

            if (result.error) {
                toast.error(result.error);
            } else if (result.tasks) {
                // Create the tasks
                const tasksData = result.tasks.map((t: any) => ({
                    title: t.title,
                    scheduled_date: dateStr,
                    priority: t.priority,
                }));

                const createResult = await createMultipleDailyTasks(tasksData);

                if (createResult.error) {
                    toast.error(createResult.error);
                } else if (createResult.tasks) {
                    // Add to local state with real IDs from server
                    const newTasks = createResult.tasks.map((t: any) => ({
                        id: t.id,
                        title: t.title,
                        priority: t.priority,
                        completed: false
                    }));
                    setTasks(prev => [...prev, ...newTasks]);
                    setAiInput("");
                    celebrate('achievement', { intensity: 'medium' });
                    toast.success(t('tasksPlanned', { count: newTasks.length }));
                }
            }
        } catch (error) {
            toast.error("Error al planificar");
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleToggleTask = async (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        // Optimistic update
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
        ));

        if (!task.completed) {
            setShowSparkles(taskId);
            setTimeout(() => setShowSparkles(null), 800);
            celebrate('habitComplete', { intensity: 'small' });
        }

        try {
            const result = await toggleTaskComplete(taskId);
            if (result.error) {
                // Revert on error
                setTasks(prev => prev.map(t =>
                    t.id === taskId ? { ...t, completed: task.completed } : t
                ));
                toast.error(result.error);
            }
        } catch (error) {
            setTasks(prev => prev.map(t =>
                t.id === taskId ? { ...t, completed: task.completed } : t
            ));
        }
    };

    const formattedDate = new Date(dateStr).toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long"
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent overflow-hidden"
        >
            {/* Header */}
            <div className="p-5 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                            <ListTodo className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">{t('todayPlan')}</h2>
                            <p className="text-xs text-zinc-400 capitalize">{formattedDate}</p>
                        </div>
                    </div>

                    {/* Progress circle */}
                    {totalCount > 0 && (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-zinc-400">
                                {completedCount}/{totalCount}
                            </span>
                            <div className="h-10 w-10 relative">
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
                                        stroke="#BFF549"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        initial={{ strokeDasharray: "0, 100" }}
                                        animate={{ strokeDasharray: `${progress}, 100` }}
                                        transition={{ duration: 0.5 }}
                                        style={{
                                            filter: progress === 100 ? 'drop-shadow(0 0 4px rgba(191, 245, 73, 0.6))' : 'none'
                                        }}
                                    />
                                </svg>
                                {progress === 100 && (
                                    <motion.div
                                        className="absolute inset-0 flex items-center justify-center"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                    >
                                        <Check className="h-4 w-4 text-primary" />
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Add Form */}
                <form onSubmit={handleQuickAdd} className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={quickInput}
                        onChange={(e) => setQuickInput(e.target.value)}
                        placeholder={t('quickAddPlaceholder')}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                    <Button
                        type="submit"
                        size="sm"
                        disabled={!quickInput.trim() || isAddingTask}
                        className="px-3"
                    >
                        {isAddingTask ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Plus className="h-4 w-4" />
                        )}
                    </Button>
                </form>

                {/* AI Planner Mini */}
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <input
                            type="text"
                            value={aiInput}
                            onChange={(e) => setAiInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAIPlan()}
                            placeholder={t('aiPlanPlaceholder')}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                    <Button
                        onClick={handleAIPlan}
                        size="sm"
                        variant="outline"
                        disabled={!aiInput.trim() || isAiLoading}
                        className="px-3 border-primary/30 hover:bg-primary/10"
                    >
                        {isAiLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Task List Preview */}
            <AnimatePresence>
                {tasks.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/5"
                    >
                        <div className="p-4 space-y-2 max-h-[200px] overflow-y-auto">
                            {tasks.slice(0, 5).map((task) => (
                                <motion.div
                                    key={task.id}
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={cn(
                                        "flex items-center gap-3 p-2.5 rounded-xl transition-colors",
                                        task.completed ? "bg-primary/10" : "bg-white/5 hover:bg-white/[0.08]"
                                    )}
                                >
                                    <button
                                        onClick={() => handleToggleTask(task.id)}
                                        className={cn(
                                            "relative flex-shrink-0 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all",
                                            task.completed
                                                ? "bg-primary border-primary"
                                                : "border-zinc-600 hover:border-zinc-400"
                                        )}
                                    >
                                        {task.completed && (
                                            <Check className="h-3 w-3 text-black" />
                                        )}
                                        <SparkleBurst trigger={showSparkles === task.id} count={6} />
                                    </button>
                                    <span className={cn(
                                        "flex-1 text-sm truncate",
                                        task.completed ? "text-zinc-400 line-through" : "text-white"
                                    )}>
                                        {task.title}
                                    </span>
                                </motion.div>
                            ))}

                            {tasks.length > 5 && (
                                <p className="text-xs text-zinc-500 text-center py-1">
                                    {t('moreTasks', { count: tasks.length - 5 })}
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer - View Full Planner */}
            <Link href={`/calendar/day/${dateStr}`}>
                <motion.div
                    className="flex items-center justify-between px-5 py-3 border-t border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors cursor-pointer group"
                    whileHover={{ x: 4 }}
                >
                    <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">
                        {t('viewFullPlanner')}
                    </span>
                    <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-primary transition-colors" />
                </motion.div>
            </Link>
        </motion.div>
    );
}
