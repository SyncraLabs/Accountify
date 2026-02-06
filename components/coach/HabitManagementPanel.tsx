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

const categories = [
    "Salud & Fitness",
    "Mindset & Aprendizaje",
    "Productividad",
    "Creatividad",
    "Social"
];

const frequencies = ["Diario", "Semanal", "Mensual"];

export function HabitManagementPanel({ habits, onHabitChange }: HabitManagementPanelProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Edit form state
    const [editTitle, setEditTitle] = useState("");
    const [editCategory, setEditCategory] = useState("");
    const [editFrequency, setEditFrequency] = useState("");
    const [editDescription, setEditDescription] = useState("");

    const openEditForm = (habit: Habit) => {
        setEditingHabit(habit);
        setEditTitle(habit.title);
        setEditCategory(habit.category);
        setEditFrequency(habit.frequency);
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
        const result = await updateHabit(editingHabit.id, {
            title: editTitle,
            category: editCategory,
            frequency: editFrequency,
            description: editDescription || undefined
        });

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Hábito actualizado");
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
                    Mis Hábitos
                    {habits.length > 0 && (
                        <span className="ml-2 bg-primary/20 text-primary text-xs px-1.5 py-0.5 rounded-full">
                            {habits.length}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="bg-zinc-950 border-zinc-800 w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-white">Mis Hábitos Actuales</SheetTitle>
                    <SheetDescription>
                        Administra tus hábitos existentes
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-3">
                    {editingHabit ? (
                        /* Edit Form */
                        <div className="space-y-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-white font-medium">Editar Hábito</h3>
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
                                    <Label className="text-zinc-400">Título</Label>
                                    <Input
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="bg-zinc-900 border-zinc-700 text-white mt-1"
                                    />
                                </div>

                                <div>
                                    <Label className="text-zinc-400">Categoría</Label>
                                    <Select value={editCategory} onValueChange={setEditCategory}>
                                        <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-700">
                                            {categories.map(cat => (
                                                <SelectItem key={cat} value={cat} className="text-white">
                                                    {cat}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-zinc-400">Frecuencia</Label>
                                    <Select value={editFrequency} onValueChange={setEditFrequency}>
                                        <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-700">
                                            {frequencies.map(freq => (
                                                <SelectItem key={freq} value={freq} className="text-white">
                                                    {freq}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-zinc-400">Descripción (opcional)</Label>
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
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handleSaveEdit}
                                        disabled={isSaving || !editTitle.trim()}
                                        className="flex-1"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Guardando
                                            </>
                                        ) : (
                                            "Guardar Cambios"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : habits.length === 0 ? (
                        /* Empty State */
                        <div className="text-center py-12 text-zinc-500">
                            <ListChecks className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No tienes hábitos creados aún.</p>
                            <p className="text-sm mt-1">Chatea con el coach para crear tu primera rutina.</p>
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
