"use client";

import { motion } from "framer-motion";
import { Users, Globe, Calendar, Trophy, Sparkles } from "lucide-react";

interface ComingSoonBannerProps {
    isPaidUser?: boolean;
}

const upcomingFeatures = [
    { icon: Globe, label: "Directorio público de Squads" },
    { icon: Trophy, label: "Marketplace de desafíos" },
    { icon: Calendar, label: "Eventos comunitarios" },
];

export function ComingSoonBanner({ isPaidUser = false }: ComingSoonBannerProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-sm p-6"
        >
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-yellow-500/3 pointer-events-none" />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                        <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-white">
                                Comunidades Abiertas
                            </h3>
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-yellow-400 bg-yellow-500/15 border border-yellow-500/20 rounded-full">
                                Próximamente
                            </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            Conecta con personas de todo el mundo que comparten tus metas.
                        </p>
                    </div>
                </div>

                {/* Features Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    {upcomingFeatures.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className="flex items-center gap-2 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60"
                        >
                            <feature.icon className="h-4 w-4 text-zinc-500" />
                            <span className="text-xs text-zinc-400">{feature.label}</span>
                        </motion.div>
                    ))}
                </div>

                {/* Beta Access Badge */}
                {isPaidUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20"
                    >
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-xs text-primary font-medium">
                            Tienes acceso beta — serás el primero en probar estas funciones.
                        </span>
                    </motion.div>
                )}

                {!isPaidUser && (
                    <div className="text-center pt-1">
                        <p className="text-xs text-zinc-600">
                            Los usuarios Pro y Leader tendrán acceso anticipado.
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
