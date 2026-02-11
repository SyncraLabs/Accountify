"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AIPlannerInputProps {
    onSubmit: (input: string) => Promise<void>;
    isLoading: boolean;
    placeholder?: string;
}

export function AIPlannerInput({ onSubmit, isLoading, placeholder }: AIPlannerInputProps) {
    const [input, setInput] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [input]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        await onSubmit(input.trim());
        setInput("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
        >
            <div
                className={cn(
                    "relative rounded-2xl border transition-all duration-300 overflow-hidden",
                    isFocused
                        ? "border-primary/50 bg-white/[0.03] shadow-[0_0_20px_rgba(191,245,73,0.1)]"
                        : "border-white/10 bg-white/5"
                )}
            >
                {/* Header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                    <motion.div
                        animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
                        transition={isLoading ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
                    >
                        <Sparkles className={cn(
                            "h-4 w-4 transition-colors",
                            isFocused ? "text-primary" : "text-zinc-500"
                        )} />
                    </motion.div>
                    <span className="text-sm font-medium text-zinc-400">
                        Planifica con IA
                    </span>
                </div>

                {/* Input area */}
                <form onSubmit={handleSubmit} className="p-4">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder || "Describe lo que necesitas hacer hoy..."}
                        disabled={isLoading}
                        rows={1}
                        className="w-full bg-transparent text-white placeholder-zinc-500 resize-none outline-none text-sm leading-relaxed"
                        style={{ minHeight: "40px", maxHeight: "120px" }}
                    />

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                        <p className="text-xs text-zinc-600">
                            Ej: &ldquo;Terminar informe, llamar al dentista, hacer ejercicio&rdquo;
                        </p>

                        <Button
                            type="submit"
                            size="sm"
                            disabled={!input.trim() || isLoading}
                            className="gap-2"
                        >
                            <AnimatePresence mode="wait">
                                {isLoading ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                    >
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="send"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                    >
                                        <Send className="h-4 w-4" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            {isLoading ? "Planificando..." : "Planificar"}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Glow effect when focused */}
            <AnimatePresence>
                {isFocused && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute -inset-px rounded-2xl pointer-events-none"
                        style={{
                            background: 'linear-gradient(180deg, rgba(191, 245, 73, 0.05) 0%, transparent 50%)',
                        }}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}
