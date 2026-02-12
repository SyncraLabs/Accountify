"use client";

import { useState } from "react";
import { Trophy, Loader2, Plus, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SuggestedHabitCard, SuggestedHabit } from "./SuggestedHabitCard";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export interface RoutineSuggestion {
    title: string;
    description: string;
    category: string;
    habits: SuggestedHabit[];
}

interface RoutineSuggestionCardProps {
    routine: RoutineSuggestion;
    onAccept: (routine: RoutineSuggestion) => void;
    onModifyRequest: () => void;
    isCreating?: boolean;
}

export function RoutineSuggestionCard({
    routine,
    onAccept,
    onModifyRequest,
    isCreating = false,
}: RoutineSuggestionCardProps) {
    const t = useTranslations('coach.routine');
    const tCommon = useTranslations('coach');
    const [habits, setHabits] = useState<SuggestedHabit[]>(routine.habits);

    const handleEditHabit = (index: number, updates: Partial<SuggestedHabit>) => {
        setHabits((prev) =>
            prev.map((h, i) => (i === index ? { ...h, ...updates } : h))
        );
    };

    const handleDeleteHabit = (index: number) => {
        setHabits((prev) => prev.filter((_, i) => i !== index));
    };

    const handleAccept = () => {
        onAccept({
            ...routine,
            habits,
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full bg-gradient-to-b from-white/[0.03] to-transparent border border-white/10 rounded-2xl overflow-hidden"
        >
            {/* Header */}
            <div className="p-6 pb-4 text-center border-b border-white/5">
                <div className="inline-flex items-center justify-center p-2.5 rounded-xl bg-primary/10 text-primary mb-3">
                    <Trophy className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{routine.title}</h3>
                <p className="text-sm text-white/60 mb-3">{routine.description}</p>
                <Badge className="bg-white/10 hover:bg-white/20 text-white text-xs">
                    {routine.category}
                </Badge>
            </div>

            {/* Habits List */}
            <div className="p-4 space-y-2">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
                        {t('habitsCount', { count: habits.length })}
                    </span>
                </div>

                {habits.length === 0 ? (
                    <div className="text-center py-6 text-white/40 text-sm">
                        {t('noHabits')}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {habits.map((habit, idx) => (
                            <SuggestedHabitCard
                                key={idx}
                                habit={habit}
                                index={idx}
                                onEdit={handleEditHabit}
                                onDelete={handleDeleteHabit}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="p-4 pt-2 flex gap-2">
                <Button
                    variant="outline"
                    className="flex-1 border-white/20 hover:bg-white/10 text-white"
                    onClick={onModifyRequest}
                    disabled={isCreating}
                >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {t('modifyWithAI')}
                </Button>
                <Button
                    className="flex-1"
                    onClick={handleAccept}
                    disabled={isCreating || habits.length === 0}
                >
                    {isCreating ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {tCommon('creating')}
                        </>
                    ) : (
                        <>
                            <Plus className="w-4 h-4 mr-2" />
                            {t('acceptProtocol')}
                        </>
                    )}
                </Button>
            </div>
        </motion.div>
    );
}
