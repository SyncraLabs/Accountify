"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { useState } from "react";

interface UpgradePromptProps {
    reason: "habits" | "groups" | "aiCoach";
    currentLimit: number;
    onClose?: () => void;
}

const reasonMessages: Record<string, { title: string; description: string }> = {
    habits: {
        title: "¡Has alcanzado el límite de hábitos!",
        description: "Actualiza a Pro para crear hábitos ilimitados y desbloquear analíticas avanzadas.",
    },
    groups: {
        title: "¡Has alcanzado el límite de grupos!",
        description: "Actualiza a Pro para unirte a grupos ilimitados y hacer crecer tu comunidad.",
    },
    aiCoach: {
        title: "¡Has usado todos tus créditos del AI Coach!",
        description: "Actualiza a Pro para obtener 10 usos mensuales, o a Leader para uso ilimitado.",
    },
};

export function UpgradePrompt({ reason, onClose }: UpgradePromptProps) {
    const [isVisible, setIsVisible] = useState(true);
    const message = reasonMessages[reason];

    const handleClose = () => {
        setIsVisible(false);
        onClose?.();
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="relative p-6 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 to-transparent backdrop-blur-sm"
                >
                    {/* Close button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>

                    {/* Icon */}
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-xl bg-primary/15">
                            <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-base font-semibold text-white">
                            {message.title}
                        </h3>
                    </div>

                    <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
                        {message.description}
                    </p>

                    <Link href="/#pricing">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button className="w-full bg-primary text-black hover:bg-primary/90 font-semibold rounded-xl shadow-[0_0_15px_rgba(191,245,73,0.15)] hover:shadow-[0_0_25px_rgba(191,245,73,0.3)] transition-all">
                                Ver Planes
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </motion.div>
                    </Link>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
