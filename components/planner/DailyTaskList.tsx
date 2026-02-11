"use client";

import { AnimatePresence, motion } from "framer-motion";
import { DailyTaskItem } from "./DailyTaskItem";
import { useCelebration } from "@/components/ui/dopamine";
import { useEffect, useRef } from "react";
import { ListTodo } from "lucide-react";

interface DailyTask {
    id: string;
    title: string;
    priority: 'low' | 'medium' | 'high';
    completed: boolean;
    completed_at: string | null;
    order_index: number;
}

interface DailyTaskListProps {
    tasks: DailyTask[];
    onUpdate: () => void;
    onToggle?: (taskId: string) => void;
}

export function DailyTaskList({ tasks, onUpdate, onToggle }: DailyTaskListProps) {
    const { celebrate } = useCelebration();
    const prevCompletedRef = useRef(0);

    // Sort tasks: incomplete first, then by order_index
    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        return a.order_index - b.order_index;
    });

    const completedCount = tasks.filter(t => t.completed).length;
    const totalCount = tasks.length;
    const allCompleted = totalCount > 0 && completedCount === totalCount;

    // Celebrate when all tasks are completed
    useEffect(() => {
        if (allCompleted && prevCompletedRef.current < totalCount) {
            celebrate('dayComplete', { intensity: 'medium' });
        }
        prevCompletedRef.current = completedCount;
    }, [completedCount, totalCount, allCompleted, celebrate]);

    const handleCelebrate = () => {
        celebrate('habitComplete', { intensity: 'small' });
    };

    if (tasks.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl bg-white/5 border border-white/5 p-12 text-center"
            >
                <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="text-5xl mb-4"
                >
                    <ListTodo className="h-12 w-12 mx-auto text-zinc-600" />
                </motion.div>
                <h3 className="text-lg font-semibold text-white mb-2">Sin tareas para hoy</h3>
                <p className="text-sm text-zinc-500">
                    Agrega tareas manualmente o usa el planificador con IA
                </p>
            </motion.div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Progress indicator */}
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-zinc-400">
                    {completedCount} de {totalCount} completadas
                </span>
                <div className="flex-1 mx-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(completedCount / totalCount) * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        style={{
                            boxShadow: allCompleted ? '0 0 10px rgba(191, 245, 73, 0.5)' : 'none'
                        }}
                    />
                </div>
                <motion.span
                    className={`text-sm font-medium ${allCompleted ? 'text-primary' : 'text-white'}`}
                    animate={allCompleted ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.3 }}
                >
                    {Math.round((completedCount / totalCount) * 100)}%
                </motion.span>
            </div>

            {/* Task list */}
            <AnimatePresence mode="popLayout">
                {sortedTasks.map((task) => (
                    <DailyTaskItem
                        key={task.id}
                        task={task}
                        onUpdate={onUpdate}
                        onCelebrate={handleCelebrate}
                        onToggle={onToggle}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}
