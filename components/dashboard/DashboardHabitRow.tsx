"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toggleHabitLog } from "@/app/actions";
import { toast } from "sonner";

interface DashboardHabitRowProps {
    habit: {
        id: string;
        title: string;
        category: string;
        completedToday: boolean;
    };
}

export function DashboardHabitRow({ habit: initialHabit }: DashboardHabitRowProps) {
    const [isCompleted, setIsCompleted] = useState(initialHabit.completedToday);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async () => {
        setIsLoading(true);
        const today = new Date().toISOString().split('T')[0];

        try {
            // Optimistic update
            const newState = !isCompleted;
            setIsCompleted(newState);

            const result = await toggleHabitLog(initialHabit.id, today);

            if (result.error) {
                toast.error(result.error);
                // Revert if error
                setIsCompleted(!newState);
            } else {
                toast.success(newState ? "Habit completed!" : "Habit unchecked");
            }
        } catch (error) {
            toast.error("Failed to update habit");
            setIsCompleted(!isCompleted);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className={cn(
                "group flex items-center justify-between p-4 rounded-xl border transition-all duration-300",
                isCompleted
                    ? "bg-[#0f0f10]/50 border-zinc-800/50"
                    : "bg-[#0f0f10] border-zinc-800 hover:border-zinc-700"
            )}
        >
            <div className="flex items-center gap-4">
                <button
                    onClick={handleToggle}
                    disabled={isLoading}
                    className={cn(
                        "h-6 w-6 rounded-full border flex items-center justify-center transition-all duration-300",
                        isCompleted
                            ? "bg-primary border-primary text-black"
                            : "border-zinc-600 hover:border-primary group-hover:border-primary",
                        isLoading && "opacity-50 cursor-not-allowed"
                    )}
                >
                    {isCompleted && <CheckCircle2 className="h-4 w-4" />}
                </button>
                <div className="flex flex-col">
                    <span className={cn(
                        "text-sm font-medium transition-colors duration-300",
                        isCompleted ? "text-zinc-500 line-through" : "text-zinc-200"
                    )}>
                        {initialHabit.title}
                    </span>
                    <span className="text-xs text-zinc-600 capitalize">
                        {initialHabit.category}
                    </span>
                </div>
            </div>
        </div>
    );
}
