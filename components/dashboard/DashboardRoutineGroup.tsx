"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderOpen, FolderClosed, ChevronDown, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toggleHabitLog } from "@/app/actions";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface HabitWithCompletion {
    id: string;
    title: string;
    category: string;
    frequency: string;
    description?: string;
    completedToday: boolean;
}

interface Routine {
    id: string;
    title: string;
    description?: string;
    category: string;
}

interface DashboardRoutineGroupProps {
    routine: Routine;
    habits: HabitWithCompletion[];
}

const categoryColors: Record<string, string> = {
    "Salud & Fitness": "bg-green-500/10 text-green-400 border-green-500/20",
    "Mindset & Aprendizaje": "bg-purple-500/10 text-purple-400 border-purple-500/20",
    "Productividad": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "Creatividad": "bg-orange-500/10 text-orange-400 border-orange-500/20",
    "Social": "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

function RoutineHabitRow({ habit }: { habit: HabitWithCompletion }) {
    const t = useTranslations('dashboard.habits');
    const [isCompleted, setIsCompleted] = useState(habit.completedToday);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async () => {
        setIsLoading(true);
        const today = new Date().toISOString().split('T')[0];

        try {
            const newState = !isCompleted;
            setIsCompleted(newState);

            const result = await toggleHabitLog(habit.id, today);

            if (result.error) {
                toast.error(result.error);
                setIsCompleted(!newState);
            }
        } catch (error) {
            toast.error(t('updateFailed'));
            setIsCompleted(!isCompleted);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className={cn(
                "flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all duration-200",
                isCompleted ? "bg-zinc-800/30" : "hover:bg-zinc-800/50"
            )}
        >
            <button
                onClick={handleToggle}
                disabled={isLoading}
                className={cn(
                    "h-5 w-5 rounded-full border flex items-center justify-center transition-all duration-200 flex-shrink-0",
                    isCompleted
                        ? "bg-primary border-primary text-black"
                        : "border-zinc-600 hover:border-primary",
                    isLoading && "opacity-50"
                )}
            >
                {isCompleted && <CheckCircle2 className="h-3 w-3" />}
            </button>
            <span className={cn(
                "text-sm transition-colors duration-200",
                isCompleted ? "text-zinc-500 line-through" : "text-zinc-300"
            )}>
                {habit.title}
            </span>
        </div>
    );
}

export function DashboardRoutineGroup({ routine, habits }: DashboardRoutineGroupProps) {
    const [isOpen, setIsOpen] = useState(true);

    const completedCount = habits.filter(h => h.completedToday).length;
    const totalCount = habits.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    const isAllCompleted = completedCount === totalCount && totalCount > 0;

    const categoryClass = categoryColors[routine.category] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";

    return (
        <div className={cn(
            "rounded-xl border overflow-hidden transition-all duration-300",
            isAllCompleted
                ? "bg-[#0f0f10]/50 border-zinc-800/50"
                : "bg-[#0f0f10] border-zinc-800"
        )}>
            {/* Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-800/30 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-2 rounded-lg transition-colors",
                        isAllCompleted ? "bg-primary/20" : "bg-zinc-800"
                    )}>
                        {isOpen ? (
                            <FolderOpen className={cn(
                                "h-4 w-4",
                                isAllCompleted ? "text-primary" : "text-zinc-400"
                            )} />
                        ) : (
                            <FolderClosed className={cn(
                                "h-4 w-4",
                                isAllCompleted ? "text-primary" : "text-zinc-400"
                            )} />
                        )}
                    </div>
                    <div>
                        <h4 className={cn(
                            "font-medium text-sm",
                            isAllCompleted ? "text-zinc-500" : "text-white"
                        )}>
                            {routine.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", categoryClass)}>
                                {routine.category}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Progress Indicator */}
                    <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-primary rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                        <span className={cn(
                            "text-xs font-medium tabular-nums",
                            isAllCompleted ? "text-primary" : "text-zinc-500"
                        )}>
                            {completedCount}/{totalCount}
                        </span>
                    </div>

                    {/* Chevron */}
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDown className="h-4 w-4 text-zinc-500" />
                    </motion.div>
                </div>
            </button>

            {/* Collapsible Content */}
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 pt-1 space-y-1 border-t border-zinc-800/50">
                            {habits.map((habit) => (
                                <RoutineHabitRow key={habit.id} habit={habit} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
