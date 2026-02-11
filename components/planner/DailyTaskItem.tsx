"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleTaskComplete, deleteDailyTask } from "@/app/actions";
import { toast } from "sonner";
import { SparkleBurst } from "@/components/ui/dopamine";

interface DailyTask {
    id: string;
    title: string;
    priority: 'low' | 'medium' | 'high';
    completed: boolean;
    completed_at: string | null;
}

interface DailyTaskItemProps {
    task: DailyTask;
    onUpdate: () => void;
    onCelebrate: () => void;
    onToggle?: (taskId: string) => void;
}

const priorityStyles = {
    high: "bg-red-500/20 text-red-400 border-red-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    low: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

const priorityLabels = {
    high: "Alta",
    medium: "Media",
    low: "Baja",
};

export function DailyTaskItem({ task, onUpdate, onCelebrate, onToggle }: DailyTaskItemProps) {
    const [loading, setLoading] = useState(false);
    const [showSparkles, setShowSparkles] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleToggle = async () => {
        // If parent provides onToggle with optimistic updates, use that
        if (onToggle) {
            if (!task.completed) {
                setShowSparkles(true);
                setTimeout(() => setShowSparkles(false), 800);
            }
            onToggle(task.id);
            return;
        }

        // Fallback: handle toggle internally (for backward compatibility)
        if (loading) return;
        setLoading(true);

        try {
            const result = await toggleTaskComplete(task.id);

            if (result.error) {
                toast.error(result.error);
            } else if (result.completed) {
                setShowSparkles(true);
                setTimeout(() => setShowSparkles(false), 800);
                onCelebrate();
                toast.success("Tarea completada!");
            } else {
                toast.info("Tarea desmarcada");
            }

            onUpdate();
        } catch (error) {
            toast.error("Error al actualizar la tarea");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (isDeleting) return;
        setIsDeleting(true);

        try {
            const result = await deleteDailyTask(task.id);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Tarea eliminada");
                onUpdate();
            }
        } catch (error) {
            toast.error("Error al eliminar la tarea");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={cn(
                "group relative flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300",
                task.completed
                    ? "bg-primary/10 border-primary/30"
                    : "bg-white/5 border-white/10 hover:bg-white/[0.08] hover:border-white/20"
            )}
        >
            {/* Drag handle (visual only for now) */}
            <div className="text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                <GripVertical className="h-4 w-4" />
            </div>

            {/* Checkbox */}
            <motion.button
                onClick={handleToggle}
                disabled={loading}
                className={cn(
                    "relative flex-shrink-0 h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all",
                    task.completed
                        ? "bg-primary border-primary"
                        : "border-zinc-600 hover:border-zinc-400"
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                {task.completed && (
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 500 }}
                    >
                        <Check className="h-4 w-4 text-black stroke-[3px]" />
                    </motion.div>
                )}
                <SparkleBurst trigger={showSparkles} count={8} />
            </motion.button>

            {/* Task content */}
            <div className="flex-1 min-w-0">
                <p className={cn(
                    "text-sm font-medium transition-all duration-300",
                    task.completed
                        ? "text-zinc-400 line-through"
                        : "text-white"
                )}>
                    {task.title}
                </p>
            </div>

            {/* Priority badge */}
            <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-medium border",
                priorityStyles[task.priority]
            )}>
                {priorityLabels[task.priority]}
            </span>

            {/* Delete button */}
            <motion.button
                onClick={handleDelete}
                disabled={isDeleting}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <Trash2 className="h-4 w-4" />
            </motion.button>

            {/* Completed glow effect */}
            {task.completed && (
                <motion.div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        background: 'linear-gradient(90deg, rgba(191, 245, 73, 0.1) 0%, transparent 50%)',
                    }}
                />
            )}
        </motion.div>
    );
}
