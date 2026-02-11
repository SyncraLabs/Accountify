"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createMultipleDailyTasks } from "@/app/actions";
import { toast } from "sonner";
import { useCelebration } from "@/components/ui/dopamine";

interface SuggestedTask {
    title: string;
    priority: 'low' | 'medium' | 'high';
}

interface AITaskSuggestionsProps {
    tasks: SuggestedTask[];
    message: string;
    dateStr: string;
    onAccept: () => void;
    onDismiss: () => void;
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

export function AITaskSuggestions({
    tasks,
    message,
    dateStr,
    onAccept,
    onDismiss
}: AITaskSuggestionsProps) {
    const [isAccepting, setIsAccepting] = useState(false);
    const { celebrate } = useCelebration();

    const handleAccept = async () => {
        setIsAccepting(true);

        try {
            const tasksData = tasks.map(t => ({
                title: t.title,
                scheduled_date: dateStr,
                priority: t.priority,
            }));

            const result = await createMultipleDailyTasks(tasksData);

            if (result.error) {
                toast.error(result.error);
            } else {
                celebrate('achievement', { intensity: 'medium' });
                toast.success(`${tasks.length} tareas agregadas`);
                onAccept();
            }
        } catch (error) {
            toast.error("Error al crear las tareas");
        } finally {
            setIsAccepting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="rounded-2xl border border-primary/30 bg-primary/5 overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center gap-2 px-5 py-4 border-b border-primary/20 bg-primary/10">
                <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Sparkles className="h-5 w-5 text-primary" />
                </motion.div>
                <span className="text-sm font-semibold text-primary">
                    Plan sugerido por IA
                </span>
            </div>

            {/* AI Message */}
            <div className="px-5 py-4 border-b border-white/5">
                <p className="text-sm text-zinc-300 italic">
                    &ldquo;{message}&rdquo;
                </p>
            </div>

            {/* Task list */}
            <div className="p-4 space-y-2">
                <AnimatePresence>
                    {tasks.map((task, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                        >
                            <div className="flex-shrink-0 h-5 w-5 rounded-md border-2 border-zinc-600" />

                            <span className="flex-1 text-sm text-white">
                                {task.title}
                            </span>

                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-medium border",
                                priorityStyles[task.priority]
                            )}>
                                {priorityLabels[task.priority]}
                            </span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-4 pt-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onDismiss}
                    disabled={isAccepting}
                    className="flex-1 border-white/10 hover:bg-white/5"
                >
                    <X className="h-4 w-4 mr-2" />
                    Descartar
                </Button>

                <Button
                    size="sm"
                    onClick={handleAccept}
                    disabled={isAccepting}
                    className="flex-1"
                >
                    {isAccepting ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Agregando...
                        </>
                    ) : (
                        <>
                            <Check className="h-4 w-4 mr-2" />
                            Aceptar Plan
                        </>
                    )}
                </Button>
            </div>
        </motion.div>
    );
}
