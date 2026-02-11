"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";
import { toggleHabitLog } from "@/app/actions";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useCelebration, SparkleBurst } from "@/components/ui/dopamine";

interface DashboardHabitRowProps {
    habit: {
        id: string;
        title: string;
        category: string;
        completedToday: boolean;
    };
}

// Map database category keys to translation keys
const categoryKeyMap: Record<string, string> = {
    'health': 'health',
    'Health': 'health',
    'mindset': 'mindset',
    'Mindset': 'mindset',
    'productivity': 'productivity',
    'Productivity': 'productivity',
    'creativity': 'creativity',
    'Creativity': 'creativity',
    'social': 'social',
    'Social': 'social',
    'finance': 'finance',
    'Finance': 'finance',
};

export function DashboardHabitRow({ habit: initialHabit }: DashboardHabitRowProps) {
    const t = useTranslations('dashboard.habits');
    const tCategories = useTranslations('common.categories');
    const [isCompleted, setIsCompleted] = useState(initialHabit.completedToday);
    const [isLoading, setIsLoading] = useState(false);
    const [showSparkles, setShowSparkles] = useState(false);
    const { celebrate } = useCelebration();
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleToggle = async () => {
        setIsLoading(true);
        const today = new Date().toISOString().split('T')[0];

        try {
            // Optimistic update
            const newState = !isCompleted;
            setIsCompleted(newState);

            if (newState) {
                // Trigger sparkles on the button
                setShowSparkles(true);
                setTimeout(() => setShowSparkles(false), 800);

                // Get button position for celebration origin
                if (buttonRef.current) {
                    const rect = buttonRef.current.getBoundingClientRect();
                    celebrate('habitComplete', {
                        origin: {
                            x: rect.left / window.innerWidth + (rect.width / window.innerWidth / 2),
                            y: rect.top / window.innerHeight,
                        },
                        intensity: 'small',
                    });
                }
            }

            const result = await toggleHabitLog(initialHabit.id, today);

            if (result.error) {
                toast.error(result.error);
                // Revert if error
                setIsCompleted(!newState);
            } else {
                toast.success(newState ? t('completed') : t('unchecked'));
            }
        } catch (_error) {
            toast.error(t('updateFailed'));
            setIsCompleted(!isCompleted);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            className={cn(
                "group relative flex items-center justify-between p-4 rounded-xl border overflow-hidden",
                isCompleted
                    ? "bg-primary/5 border-primary/20"
                    : "bg-[#0f0f10] border-zinc-800 hover:border-zinc-700"
            )}
            initial={false}
            animate={{
                scale: isCompleted ? [1, 1.02, 1] : 1,
            }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            style={{ willChange: 'transform' }}
        >
            {/* Background glow effect when completed */}
            <AnimatePresence>
                {isCompleted && (
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent"
                        initial={{ opacity: 0, x: -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    />
                )}
            </AnimatePresence>

            <div className="relative z-10 flex items-center gap-4">
                <motion.button
                    ref={buttonRef}
                    onClick={handleToggle}
                    disabled={isLoading}
                    className={cn(
                        "relative h-7 w-7 rounded-full border-2 flex items-center justify-center transition-colors duration-200",
                        isCompleted
                            ? "bg-primary border-primary text-black shadow-[0_0_12px_rgba(191,245,73,0.4)]"
                            : "border-zinc-600 hover:border-primary hover:shadow-[0_0_8px_rgba(191,245,73,0.2)]",
                        isLoading && "opacity-50 cursor-not-allowed"
                    )}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{ willChange: 'transform' }}
                >
                    <AnimatePresence mode="wait">
                        {isCompleted && (
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            >
                                <Check className="h-4 w-4 stroke-[3px]" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Sparkle burst effect */}
                    <SparkleBurst trigger={showSparkles} count={6} />
                </motion.button>

                <div className="flex flex-col">
                    <motion.span
                        className={cn(
                            "text-sm font-medium transition-colors duration-200",
                            isCompleted ? "text-zinc-400" : "text-zinc-200"
                        )}
                        animate={{
                            textDecoration: isCompleted ? "line-through" : "none",
                        }}
                    >
                        {initialHabit.title}
                    </motion.span>
                    <span className="text-xs text-zinc-600 capitalize">
                        {categoryKeyMap[initialHabit.category]
                            ? tCategories(categoryKeyMap[initialHabit.category])
                            : initialHabit.category}
                    </span>
                </div>
            </div>

            {/* Completion indicator */}
            <AnimatePresence>
                {isCompleted && (
                    <motion.div
                        className="absolute right-4 text-xs font-medium text-primary"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                    >
                        ✓
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
