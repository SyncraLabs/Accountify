"use client";

import { motion } from "framer-motion";
import { CalendarDays, CalendarRange, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export type HabitsView = 'daily' | 'weekly' | 'monthly';

interface HabitsViewToggleProps {
    currentView: HabitsView;
    onViewChange: (view: HabitsView) => void;
}

const views = [
    { id: 'daily' as const, label: 'Hoy', icon: CalendarDays },
    { id: 'weekly' as const, label: 'Semana', icon: CalendarRange },
    { id: 'monthly' as const, label: 'Mes', icon: Calendar },
];

export function HabitsViewToggle({ currentView, onViewChange }: HabitsViewToggleProps) {
    return (
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/5">
            {views.map((view) => {
                const Icon = view.icon;
                const isActive = currentView === view.id;

                return (
                    <motion.button
                        key={view.id}
                        onClick={() => onViewChange(view.id)}
                        className={cn(
                            "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                            isActive
                                ? "text-black"
                                : "text-zinc-400 hover:text-white hover:bg-white/5"
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-primary rounded-lg"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{view.label}</span>
                        </span>
                    </motion.button>
                );
            })}
        </div>
    );
}
