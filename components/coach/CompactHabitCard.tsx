"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Pencil, Trash2, Flame } from "lucide-react";
import { deleteHabit } from "@/app/actions";
import { toast } from "sonner";

interface CompactHabitCardProps {
    habit: {
        id: string;
        title: string;
        category: string;
        frequency: string;
        description?: string;
        streak?: number;
        reasoning?: string;
    };
    onEdit?: (habit: any) => void;
    onDelete?: () => void;
    showActions?: boolean;
}

import { useTranslations } from "next-intl";

export function CompactHabitCard({
    habit,
    onEdit,
    onDelete,
    showActions = true
}: CompactHabitCardProps) {
    const t = useTranslations('coach.card');
    const tCommon = useTranslations('common');
    const tHabits = useTranslations('habits');

    const [isExpanded, setIsExpanded] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Helper to get category key from potential Spanish DB value
    const getCategoryKey = (cat: string) => {
        const map: Record<string, string> = {
            "Salud & Fitness": "health",
            "Mindset & Aprendizaje": "mindset",
            "Productividad": "productivity",
            "Creatividad": "creativity",
            "Social": "social"
        };
        return map[cat] || cat.toLowerCase();
    };

    const getFrequencyKey = (freq: string) => {
        const map: Record<string, string> = {
            "Diario": "daily",
            "Semanal": "weekly",
            "Mensual": "monthly"
        };
        return map[freq] || freq.toLowerCase();
    };

    const categoryKey = getCategoryKey(habit.category);
    // Enhanced emoji map based on keys
    const categoryEmojis: Record<string, string> = {
        "health": "💪",
        "mindset": "🧠",
        "productivity": "⚡",
        "creativity": "🎨",
        "social": "👥",
        // Fallback for direct DB values just in case
        "Salud & Fitness": "💪",
        "Mindset & Aprendizaje": "🧠",
        "Productividad": "⚡",
        "Creatividad": "🎨",
        "Social": "👥",
    };

    const emoji = categoryEmojis[categoryKey] || categoryEmojis[habit.category] || "✨";
    const categoryLabel = tCommon(`categories.${categoryKey}`) || habit.category;
    const frequencyLabel = tCommon(`frequencies.${getFrequencyKey(habit.frequency)}`) || habit.frequency;

    const handleDelete = async () => {
        if (!confirm(t('confirmDelete'))) return;

        setIsDeleting(true);
        const result = await deleteHabit(habit.id);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(t('habitDeleted'));
            onDelete?.();
        }
        setIsDeleting(false);
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/[0.07] transition-colors">
            {/* Collapsed Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between text-left"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg flex-shrink-0">{emoji}</span>
                    <span className="text-white font-medium truncate">{habit.title}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                        {categoryLabel}
                    </Badge>
                    {habit.streak && habit.streak > 0 && (
                        <div className="flex items-center gap-1 text-orange-400 text-sm">
                            <Flame className="h-3.5 w-3.5" />
                            <span>{habit.streak}</span>
                        </div>
                    )}
                    {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-zinc-400" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-zinc-400" />
                    )}
                </div>
            </button>

            {/* Expanded Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 pt-1 border-t border-white/10 space-y-3">
                            {/* Details */}
                            <div className="flex flex-wrap gap-2 text-sm text-zinc-400">
                                <span>{t('frequency')}: <span className="text-zinc-300">{frequencyLabel}</span></span>
                                {habit.streak !== undefined && (
                                    <span>{t('streak')}: <span className="text-zinc-300">{habit.streak} {tCommon('days')}</span></span>
                                )}
                            </div>

                            {habit.description && (
                                <p className="text-sm text-zinc-400">{habit.description}</p>
                            )}

                            {habit.reasoning && (
                                <div className="bg-primary/10 rounded-lg p-3">
                                    <p className="text-xs text-primary">
                                        <strong>{t('theScience')}:</strong> {habit.reasoning}
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            {showActions && (
                                <div className="flex gap-2 pt-2">
                                    {onEdit && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEdit(habit);
                                            }}
                                            className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
                                        >
                                            <Pencil className="h-3.5 w-3.5 mr-1.5" />
                                            {tCommon('edit')}
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete();
                                        }}
                                        disabled={isDeleting}
                                        className="border-red-900/50 text-red-400 hover:text-red-300 hover:bg-red-950/50"
                                    >
                                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                        {isDeleting ? "..." : tCommon('delete')}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
