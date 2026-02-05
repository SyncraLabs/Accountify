"use client";

import { motion } from "framer-motion";
import { Check, Flame, Trophy, Activity, Calendar as CalendarIcon, MoreHorizontal } from "lucide-react";

export function DashboardPreview() {
    return (
        <div className="w-full max-w-5xl mx-auto mt-16 px-4 sm:px-6 relative z-10">
            {/* Glow Effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-3/4 bg-primary/20 blur-[100px] rounded-full -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                className="relative bg-[#09090b] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
            >
                {/* Window Header */}
                <div className="h-8 md:h-10 bg-white/5 border-b border-white/5 flex items-center px-4 space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                </div>

                {/* Dashboard Mockup Layout */}
                <div className="flex h-[400px] md:h-[500px]">
                    {/* Sidebar Mockup */}
                    <div className="w-16 md:w-64 border-r border-white/5 bg-white/[0.02] flex flex-col p-4 gap-6 hidden sm:flex">
                        <div className="h-8 w-8 rounded-lg bg-primary/20 shrink-0" />
                        <div className="space-y-4">
                            <div className="h-2 w-20 bg-white/10 rounded" />
                            <div className="h-2 w-16 bg-white/10 rounded" />
                            <div className="h-2 w-24 bg-white/10 rounded" />
                        </div>
                        <div className="mt-auto space-y-4">
                            <div className="h-8 w-full bg-white/5 rounded-lg border border-white/5" />
                        </div>
                    </div>

                    {/* Main Content Mockup */}
                    <div className="flex-1 p-6 md:p-8 overflow-hidden bg-black/40">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-8">
                            <div className="space-y-2">
                                <div className="h-6 w-48 bg-white/10 rounded" />
                                <div className="h-3 w-32 bg-white/5 rounded" />
                            </div>
                            <div className="h-8 w-24 bg-primary/20 rounded-full border border-primary/20" />
                        </div>

                        {/* Grid Content */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Stat 1 */}
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                        <Activity className="h-5 w-5" />
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-white">85%</div>
                                <div className="text-xs text-zinc-500">Completado esta semana</div>
                            </div>
                            {/* Stat 2 */}
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400">
                                        <Flame className="h-5 w-5" />
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-white">12 Días</div>
                                <div className="text-xs text-zinc-500">Racha actual</div>
                            </div>
                            {/* Stat 3 */}
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                        <Trophy className="h-5 w-5" />
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-white">Top 5%</div>
                                <div className="text-xs text-zinc-500">Entre usuarios activos</div>
                            </div>

                            {/* Big Chart Area / Habit List */}
                            <div className="col-span-1 md:col-span-3 bg-white/5 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                                {/* Decorative lines mimicking a chart */}
                                <div className="absolute inset-0 opacity-20 pointer-events-none">
                                    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                        <path d="M0 100 C 20 80 50 90 100 0" stroke="url(#gradient)" strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" />
                                        <defs>
                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#4ade80" stopOpacity="0" />
                                                <stop offset="100%" stopColor="#4ade80" stopOpacity="1" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>

                                <div className="relative z-10 flex flex-col gap-3">
                                    <div className="h-4 w-32 bg-white/10 rounded mb-2" />
                                    {/* Mock Habit Item 1 */}
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-5 w-5 rounded-full border border-primary text-primary flex items-center justify-center">
                                                <Check className="h-3 w-3" />
                                            </div>
                                            <span className="text-sm text-zinc-300">Leer 30 minutos</span>
                                        </div>
                                        <MoreHorizontal className="h-4 w-4 text-zinc-600" />
                                    </div>
                                    {/* Mock Habit Item 2 */}
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-5 w-5 rounded-full border border-zinc-700 hover:border-primary transition-colors cursor-pointer" />
                                            <span className="text-sm text-zinc-300">Hacer ejercicio</span>
                                        </div>
                                        <MoreHorizontal className="h-4 w-4 text-zinc-600" />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
