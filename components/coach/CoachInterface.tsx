"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Check, Trophy, Sparkles, RefreshCw, Bot, User } from "lucide-react";
import { sendCoachMessage, createRoutineWithHabits, ChatMessage } from "@/app/actions";
import { toast } from "sonner";
import { AnimatedAIChat } from "@/components/ui/animated-ai-chat";
import { HabitManagementPanel } from "./HabitManagementPanel";
import { CompactHabitCard } from "./CompactHabitCard";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface Habit {
    id: string;
    title: string;
    category: string;
    frequency: string;
    description?: string;
    streak?: number;
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

interface LocalChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    suggestion?: RoutineSuggestion;
}

interface CoachInterfaceProps {
    currentHabits: Habit[];
}

export function CoachInterface({ currentHabits }: CoachInterfaceProps) {
    const router = useRouter();
    const [messages, setMessages] = useState<LocalChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [currentSuggestion, setCurrentSuggestion] = useState<RoutineSuggestion | null>(null);
    const [habits, setHabits] = useState<Habit[]>(currentHabits);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (content: string) => {
        if (!content.trim() || loading) return;

        // Add user message
        const userMessage: LocalChatMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            content,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setLoading(true);

        try {
            // Convert to ChatMessage format for server action
            const historyForServer: ChatMessage[] = messages.map(m => ({
                id: m.id,
                role: m.role,
                content: m.content,
                timestamp: m.timestamp,
                suggestion: m.suggestion
            }));

            const result = await sendCoachMessage(content, historyForServer, habits);

            if (result.error) {
                toast.error(result.error);
                return;
            }

            // Add assistant message
            const assistantMessage: LocalChatMessage = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: result.message || '',
                timestamp: new Date(),
                suggestion: result.suggestion || undefined
            };
            setMessages(prev => [...prev, assistantMessage]);

            if (result.suggestion) {
                setCurrentSuggestion(result.suggestion);
            }

        } catch (error) {
            toast.error("Error al comunicarse con el coach");
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRoutine = async () => {
        if (!currentSuggestion) return;

        setCreating(true);
        try {
            const result = await createRoutineWithHabits(currentSuggestion);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(`Rutina "${currentSuggestion.title}" creada!`);

                // Add confirmation message
                const confirmMessage: LocalChatMessage = {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: `He creado la rutina "${currentSuggestion.title}" con ${currentSuggestion.habits.length} hábitos. Puedes verlos en tu calendario y dashboard.`,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, confirmMessage]);
                setCurrentSuggestion(null);

                // Redirect after a brief delay
                setTimeout(() => {
                    router.push("/dashboard");
                }, 1500);
            }
        } catch (error) {
            toast.error("Error al crear la rutina");
        } finally {
            setCreating(false);
        }
    };

    const handleModifyRequest = () => {
        // The user can just type their modification request
        toast.info("Escribe qué te gustaría cambiar de la rutina");
    };

    const handleHabitChange = () => {
        // Refresh the page to get updated habits
        router.refresh();
    };

    const hasConversation = messages.length > 0;

    return (
        <div className="h-full flex flex-col">
            {/* Header with Habit Management */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-white font-semibold">AI Coach</h2>
                        <p className="text-xs text-zinc-500">Tu entrenador de alto rendimiento</p>
                    </div>
                </div>
                <HabitManagementPanel habits={habits} onHabitChange={handleHabitChange} />
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-hidden flex flex-col">
                {!hasConversation ? (
                    /* Initial State - AnimatedAIChat */
                    <div className="flex-1 relative rounded-xl overflow-hidden">
                        <AnimatedAIChat
                            title="¿Qué quieres lograr?"
                            subtitle="Cuéntame tus objetivos y diseñaré una Rutina de Alto Rendimiento personalizada para ti."
                            onSubmit={handleSendMessage}
                            isThinking={loading}
                        />
                    </div>
                ) : (
                    /* Conversation View */
                    <>
                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
                            <AnimatePresence mode="popLayout">
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {message.role === 'assistant' && (
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                                <Bot className="h-4 w-4 text-primary" />
                                            </div>
                                        )}

                                        <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                                            {/* Message Bubble */}
                                            <div
                                                className={`rounded-2xl px-4 py-3 ${message.role === 'user'
                                                        ? 'bg-primary text-primary-foreground ml-auto'
                                                        : 'bg-zinc-800/80 text-zinc-100'
                                                    }`}
                                            >
                                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                            </div>

                                            {/* Routine Suggestion Card */}
                                            {message.suggestion && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.2 }}
                                                    className="mt-4 bg-zinc-900/80 border border-zinc-700 rounded-xl overflow-hidden"
                                                >
                                                    {/* Routine Header */}
                                                    <div className="p-4 border-b border-zinc-800">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="p-2 rounded-lg bg-primary/20">
                                                                <Trophy className="h-5 w-5 text-primary" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-white font-bold">{message.suggestion.title}</h3>
                                                                <Badge variant="outline" className="text-xs mt-1">
                                                                    {message.suggestion.category}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-zinc-400">{message.suggestion.description}</p>
                                                    </div>

                                                    {/* Habits List */}
                                                    <div className="p-4 space-y-2">
                                                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">
                                                            {message.suggestion.habits.length} Hábitos incluidos
                                                        </p>
                                                        {message.suggestion.habits.map((habit, idx) => (
                                                            <CompactHabitCard
                                                                key={idx}
                                                                habit={{
                                                                    id: `suggestion-${idx}`,
                                                                    ...habit
                                                                }}
                                                                showActions={false}
                                                            />
                                                        ))}
                                                    </div>

                                                    {/* Action Buttons */}
                                                    {currentSuggestion && message.suggestion.title === currentSuggestion.title && (
                                                        <div className="p-4 border-t border-zinc-800 flex gap-3">
                                                            <Button
                                                                variant="outline"
                                                                onClick={handleModifyRequest}
                                                                className="flex-1 border-zinc-700"
                                                            >
                                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                                Modificar
                                                            </Button>
                                                            <Button
                                                                onClick={handleAcceptRoutine}
                                                                disabled={creating}
                                                                className="flex-1"
                                                            >
                                                                {creating ? (
                                                                    <>
                                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                        Creando...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Check className="h-4 w-4 mr-2" />
                                                                        Aceptar Rutina
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </div>

                                        {message.role === 'user' && (
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                                                <User className="h-4 w-4 text-zinc-300" />
                                            </div>
                                        )}
                                    </motion.div>
                                ))}

                                {/* Typing Indicator */}
                                {loading && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex gap-3"
                                    >
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                            <Bot className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="bg-zinc-800/80 rounded-2xl px-4 py-3">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="border-t border-zinc-800 p-4">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const input = e.currentTarget.elements.namedItem('message') as HTMLInputElement;
                                    if (input.value.trim()) {
                                        handleSendMessage(input.value);
                                        input.value = '';
                                    }
                                }}
                                className="flex gap-3"
                            >
                                <input
                                    name="message"
                                    type="text"
                                    placeholder="Escribe tu mensaje..."
                                    disabled={loading}
                                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                />
                                <Button type="submit" disabled={loading} className="px-6">
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar"}
                                </Button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
