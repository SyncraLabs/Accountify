"use client"

import { motion } from "framer-motion"
import { Flame, Trophy } from "lucide-react"

interface HabitShareMessageProps {
    habitTitle: string
    streak: number
    category: string
    isMe: boolean
}

export function HabitShareMessage({ habitTitle, streak, category, isMe }: HabitShareMessageProps) {
    const getEmoji = (category: string) => {
        const emojiMap: Record<string, string> = {
            health: "💪",
            mindset: "🧘‍♂️",
            productivity: "📚",
            finance: "💰"
        };
        return emojiMap[category] || "⭐";
    };

    return (
        <div className={`
            relative overflow-hidden rounded-xl p-4 min-w-[240px]
            ${isMe
                ? "bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20"
                : "bg-gradient-to-br from-white/10 to-white/5 border border-white/10"
            }
        `}>
            {/* Background decorative glow */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 blur-3xl opacity-20 rounded-full ${isMe ? 'bg-primary' : 'bg-white'}`} />

            <div className="relative z-10 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-black/20 backdrop-blur-sm flex items-center justify-center text-xl border border-white/5">
                        {getEmoji(category)}
                    </div>
                    <div>
                        <div className={`text-xs font-medium uppercase tracking-wider mb-0.5 ${isMe ? 'text-primary/80' : 'text-zinc-400'}`}>
                            Hábito Completado
                        </div>
                        <h4 className={`font-bold ${isMe ? 'text-primary-foreground/90' : 'text-white'}`}>
                            {habitTitle}
                        </h4>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2 border border-white/5">
                    <Flame className={`h-4 w-4 ${isMe ? 'fill-primary text-primary' : 'fill-orange-500 text-orange-500'}`} />
                    <span className="text-sm font-medium text-white/90">
                        Racha de {streak} días
                    </span>
                </div>
            </div>
        </div>
    )
}
