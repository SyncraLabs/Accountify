"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Plus, Check, Trophy } from "lucide-react";
import { generateRoutine, createRoutineWithHabits } from "@/app/actions";
import { toast } from "sonner";
import { AnimatedAIChat } from "@/components/ui/animated-ai-chat";

interface Habit {
    id: string;
    title: string;
    category: string;
    frequency: string;
}

interface RoutineSuggestion {
    title: string;
    description: string;
    category: string;
    habits: {
        title: string;
        category: string;
        frequency: string;
        description: string;
        reasoning: string;
    }[];
}

interface CoachInterfaceProps {
    currentHabits: Habit[];
}

export function CoachInterface({ currentHabits }: CoachInterfaceProps) {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [suggestion, setSuggestion] = useState<RoutineSuggestion | null>(null);
    const [creating, setCreating] = useState(false);

    const handleGenerate = async (activePrompt?: string) => {
        const promptToUse = typeof activePrompt === 'string' ? activePrompt : prompt;

        if (!promptToUse.trim()) {
            toast.error("Por favor escribe qué quieres lograr");
            return;
        }

        setLoading(true);
        try {
            const result = await generateRoutine(promptToUse, currentHabits);

            if (result.error) {
                toast.error(result.error);
            } else if (result.suggestion) {
                setSuggestion(result.suggestion);
                toast.success("¡Rutina generada!");
            }
        } catch (error) {
            toast.error("Error al generar rutina");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAll = async () => {
        if (!suggestion) return;

        setCreating(true);
        try {
            const result = await createRoutineWithHabits(suggestion);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(`Rutina "${suggestion.title}" creada!`);
                setSuggestion(null);
                setPrompt("");
                // Redirect to calendar
                window.location.href = "/calendar";
            }
        } catch (error) {
            toast.error("Error al crear la rutina");
        } finally {
            setCreating(false);
        }
    };

    const examplePrompts = [
        "Quiero mejorar mi salud física y mental (Huberman Style)",
        "Necesito ser más productivo en mi trabajo (Deep Work)",
        "Quiero aprender programación y desarrollo web (Ultralearning)",
        "Busco mejorar mis relaciones personales"
    ];

    return (
        <div className="h-full flex flex-col">
            {/* Input Section */}
            {!suggestion && (
                <div className="flex-1 relative rounded-xl overflow-hidden">
                    <AnimatedAIChat
                        title="¿Qué quieres lograr?"
                        subtitle="Describe tus objetivos y diseñaré una Rutina de Alto Rendimiento."
                        onSubmit={(value: string) => {
                            setPrompt(value);
                            handleGenerate(value);
                        }}
                        isThinking={loading}
                    />
                </div>
            )}

            {/* Suggestion Result */}
            {suggestion && (
                <div className="flex-1 overflow-auto p-6">
                    <div className="space-y-8 max-w-[1200px] mx-auto">
                        {/* Routine Header */}
                        <div className="text-center space-y-4">
                            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary mb-4">
                                <Trophy className="h-8 w-8" />
                            </div>
                            <h2 className="text-4xl font-bold text-white tracking-tight">{suggestion.title}</h2>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                {suggestion.description}
                            </p>
                            <Badge className="bg-white/10 hover:bg-white/20 text-white px-4 py-1">
                                {suggestion.category}
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-bold text-white">Hábitos del Protocolo</h3>
                            <Button
                                onClick={handleCreateAll}
                                disabled={creating}
                                size="lg"
                                className="rounded-full font-semibold"
                            >
                                {creating ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Implementando...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-2 h-5 w-5" />
                                        Aceptar Protocolo Completo
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="grid gap-4">
                            {suggestion.habits.map((habit, idx) => (
                                <Card
                                    key={idx}
                                    className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
                                >
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="text-xl text-white">{habit.title}</CardTitle>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {habit.category}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        {habit.frequency}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <Check className="h-5 w-5 text-primary" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <p className="text-muted-foreground">{habit.description}</p>
                                        <div className="pt-2 border-t border-white/10">
                                            <p className="text-sm text-primary/80">
                                                <strong>La Ciencia:</strong> {habit.reasoning}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
