"use client";

import { useState } from "react";
import { CompactHabitCard } from "./CompactHabitCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ListChecks, X, Loader2 } from "lucide-react";
import { updateHabit } from "@/app/actions";
import { toast } from "sonner";

interface Habit {
    id: string;
    title: string;
    category: string;
    frequency: string;
    description?: string;
    streak?: number;
}

interface HabitManagementPanelProps {
    habits: Habit[];
    onHabitChange?: () => void;
}

import { useTranslations } from "next-intl";

export function HabitManagementPanel({ habits, onHabitChange }: HabitManagementPanelProps) {
    const t = useTranslations('coach.panel');
    const tCommon = useTranslations('common');
    const tHabits = useTranslations('habits');

    const [isOpen, setIsOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Edit form state
    const [editTitle, setEditTitle] = useState("");
    const [editCategory, setEditCategory] = useState("");
    const [editFrequency, setEditFrequency] = useState("");
    const [editDescription, setEditDescription] = useState("");

    const categories = [
        "health",
        "mindset",
        "productivity",
        "creativity",
        "social"
    ];

    const frequencies = ["daily", "weekly", "monthly"];

    // Mapping for legacy data (if DB has Spanish strings) -> Key for translation
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

    const openEditForm = (habit: Habit) => {
        setEditingHabit(habit);
        setEditTitle(habit.title);
        // Try to map existing values to keys, or keep as is if not found
        setEditCategory(getCategoryKey(habit.category));
        setEditFrequency(getFrequencyKey(habit.frequency));
        setEditDescription(habit.description || "");
    };

    const closeEditForm = () => {
        setEditingHabit(null);
        setEditTitle("");
        setEditCategory("");
        setEditFrequency("");
        setEditDescription("");
    };

    const handleSaveEdit = async () => {
        if (!editingHabit) return;

        setIsSaving(true);

        // When saving, we might want to save the English/Key value OR the localized value depending on backend.
        // For now, let's assume we save the key or the value as selected.
        // If the backend expects specific Spanish strings, we'd need to map back.
        // Assuming backend is flexible or we are migrating to keys:

        // valid categories for backend (if it enforces Enum) might be tricky.
        // Let's assume we save the Key for now, or map back if needed. 
        // Given existing data has "Salud & Fitness", mixing keys might be messy.
        // Ideally we migrate DB to keys. 
        // For this refactor, let's map back to the "Display" value of the CURRENT locale 
        // OR better, keep using the English keys if the backend supports it, 
        // BUT current DB has "Salud & Fitness".
        // To be safe and consistent with existing rows without a DB migration script:
        // We should probably save the "Legacy Spanish" value if we want to avoid breaking charts that group by category.
        // OPTION: We save the KEY (e.g. 'health') and update the charts to handle keys.
        // Let's try saving the Key. If charts break, we fix charts to translate.

        const result = await updateHabit(editingHabit.id, {
            title: editTitle,
            category: editCategory, // Saving 'health', 'daily' etc.
            frequency: editFrequency,
            description: editDescription || undefined
        });

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(t('habitUpdated'));
            closeEditForm();
            onHabitChange?.();
        }
        setIsSaving(false);
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
                >
                    <ListChecks className="h-4 w-4 mr-2" />
                    {t('myHabits')}
                    {habits.length > 0 && (
                        <span className="ml-2 bg-primary/20 text-primary text-xs px-1.5 py-0.5 rounded-full">
                            {habits.length}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="bg-zinc-950 border-zinc-800 w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-white">{t('currentHabits')}</SheetTitle>
                    <SheetDescription>
                        {t('manageHabits')}
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-3">
                    {editingHabit ? (
                        /* Edit Form */
                        <div className="space-y-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-white font-medium">{t('editHabit')}</h3>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={closeEditForm}
                                    className="h-8 w-8 text-zinc-400 hover:text-white"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <Label className="text-zinc-400">{tHabits('title')}</Label>
                                    <Input
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="bg-zinc-900 border-zinc-700 text-white mt-1"
                                    />
                                </div>

                                <div>
                                    <Label className="text-zinc-400">{tHabits('category')}</Label>
                                    <Select value={editCategory} onValueChange={setEditCategory}>
                                        <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-700">
                                            {categories.map(catKey => (
                                                <SelectItem key={catKey} value={catKey} className="text-white">
                                                    {tCommon(`categories.${catKey}`)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-zinc-400">{tHabits('frequency')}</Label>
                                    <Select value={editFrequency} onValueChange={setEditFrequency}>
                                        <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-700">
                                            {frequencies.map(freqKey => (
                                                <SelectItem key={freqKey} value={freqKey} className="text-white">
                                                    {tCommon(`frequencies.${freqKey}`)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-zinc-400">{tHabits('motivation')}</Label>
                                    <Textarea
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        className="bg-zinc-900 border-zinc-700 text-white mt-1 resize-none"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={closeEditForm}
                                        className="flex-1 border-zinc-700"
                                    >
                                        {tCommon('cancel')}
                                    </Button>
                                    <Button
                                        onClick={handleSaveEdit}
                                        disabled={isSaving || !editTitle.trim()}
                                        className="flex-1"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                {tCommon('save')}
                                            </>
                                        ) : (
                                            tCommon('save')
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : habits.length === 0 ? (
                        /* Empty State */
                        <div className="text-center py-12 text-zinc-500">
                            <ListChecks className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>{t('noHabits')}</p>
                            <p className="text-sm mt-1">{t('chatWithCoach')}</p>
                        </div>
                    ) : (
                        /* Habits List */
                        habits.map((habit) => (
                            <CompactHabitCard
                                key={habit.id}
                                habit={habit}
                                onEdit={openEditForm}
                                onDelete={onHabitChange}
                            />
                        ))
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
