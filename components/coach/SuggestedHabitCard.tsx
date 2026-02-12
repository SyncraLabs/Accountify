"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Pencil, Trash2, Check, X } from "lucide-react";
import { useTranslations } from "next-intl";

export interface SuggestedHabit {
    title: string;
    category: string;
    frequency: string;
    description?: string;
    reasoning?: string;
}

interface SuggestedHabitCardProps {
    habit: SuggestedHabit;
    index: number;
    onEdit: (index: number, updates: Partial<SuggestedHabit>) => void;
    onDelete: (index: number) => void;
}

export function SuggestedHabitCard({
    habit,
    index,
    onEdit,
    onDelete,
}: SuggestedHabitCardProps) {
    const t = useTranslations('coach.card');
    const tc = useTranslations('common');
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(habit.title);
    const [editFrequency, setEditFrequency] = useState(habit.frequency);

    // Map category keys to emojis
    const categoryEmojis: Record<string, string> = {
        "health": "💪",
        "mindset": "🧠",
        "productivity": "⚡",
        "creativity": "🎨",
        "social": "👥",
        // Also support translated category names for backwards compatibility
        [tc('categories.health')]: "💪",
        [tc('categories.mindset')]: "🧠",
        [tc('categories.productivity')]: "⚡",
        [tc('categories.creativity')]: "🎨",
        [tc('categories.social')]: "👥",
    };

    const emoji = categoryEmojis[habit.category] || "✨";

    const handleSaveEdit = () => {
        onEdit(index, {
            title: editTitle,
            frequency: editFrequency,
        });
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditTitle(habit.title);
        setEditFrequency(habit.frequency);
        setIsEditing(false);
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/[0.07] transition-colors">
            {/* Collapsed Header */}
            <button
                onClick={() => !isEditing && setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between text-left"
                disabled={isEditing}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg flex-shrink-0">{emoji}</span>
                    {isEditing ? (
                        <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-7 bg-white/10 border-white/20 text-white text-sm"
                        />
                    ) : (
                        <span className="text-white font-medium truncate">{habit.title}</span>
                    )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                        {habit.category}
                    </Badge>
                    {!isEditing && (
                        isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-zinc-400" />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-zinc-400" />
                        )
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
                                <span>
                                    {t('frequency')}:{" "}
                                    {isEditing ? (
                                        <Input
                                            value={editFrequency}
                                            onChange={(e) => setEditFrequency(e.target.value)}
                                            className="h-6 w-32 inline-flex bg-white/10 border-white/20 text-white text-xs"
                                        />
                                    ) : (
                                        <span className="text-zinc-300">{habit.frequency}</span>
                                    )}
                                </span>
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
                            <div className="flex gap-2 pt-2">
                                {isEditing ? (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleSaveEdit}
                                            className="border-green-700/50 text-green-400 hover:text-green-300 hover:bg-green-950/50"
                                        >
                                            <Check className="h-3.5 w-3.5 mr-1.5" />
                                            {t('save')}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCancelEdit}
                                            className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
                                        >
                                            <X className="h-3.5 w-3.5 mr-1.5" />
                                            {t('cancel')}
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsEditing(true);
                                            }}
                                            className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
                                        >
                                            <Pencil className="h-3.5 w-3.5 mr-1.5" />
                                            {t('edit')}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(index);
                                            }}
                                            className="border-red-900/50 text-red-400 hover:text-red-300 hover:bg-red-950/50"
                                        >
                                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                            {t('delete')}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
