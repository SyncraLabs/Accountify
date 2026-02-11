"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Flame } from "lucide-react";

interface StreakFireProps {
    streak: number;
    showFlame?: boolean;
    animated?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizeMap = {
    sm: { icon: 16, text: 'text-sm', flames: 3 },
    md: { icon: 20, text: 'text-base', flames: 5 },
    lg: { icon: 28, text: 'text-lg', flames: 7 },
};

// Get intensity based on streak
function getIntensity(streak: number): 'cold' | 'warm' | 'hot' | 'blazing' | 'inferno' {
    if (streak < 3) return 'cold';
    if (streak < 7) return 'warm';
    if (streak < 14) return 'hot';
    if (streak < 30) return 'blazing';
    return 'inferno';
}

const intensityConfig = {
    cold: {
        color: '#9CA3AF',
        glow: 'none',
        particles: 0,
    },
    warm: {
        color: '#F97316',
        glow: '0 0 10px rgba(249, 115, 22, 0.3)',
        particles: 2,
    },
    hot: {
        color: '#EF4444',
        glow: '0 0 15px rgba(239, 68, 68, 0.4)',
        particles: 3,
    },
    blazing: {
        color: '#BFF549',
        glow: '0 0 20px rgba(191, 245, 73, 0.5)',
        particles: 5,
    },
    inferno: {
        color: '#FFD700',
        glow: '0 0 30px rgba(255, 215, 0, 0.6)',
        particles: 7,
    },
};

export function StreakFire({
    streak,
    showFlame = true,
    animated = true,
    size = 'md',
    className,
}: StreakFireProps) {
    const sizeConfig = sizeMap[size];
    const intensity = getIntensity(streak);
    const config = intensityConfig[intensity];

    const particles = Array.from({ length: config.particles }).map((_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 20,
        delay: Math.random() * 0.5,
        duration: 0.8 + Math.random() * 0.4,
        size: 2 + Math.random() * 3,
    }));

    return (
        <div className={`relative inline-flex items-center gap-1 ${className || ''}`}>
            {showFlame && (
                <div className="relative">
                    <motion.div
                        animate={animated && streak >= 3 ? {
                            scale: [1, 1.1, 1],
                            rotate: [-3, 3, -3],
                        } : {}}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <Flame
                            size={sizeConfig.icon}
                            className="transition-colors duration-300"
                            style={{
                                color: config.color,
                                filter: config.glow !== 'none' ? `drop-shadow(${config.glow})` : 'none',
                                fill: streak >= 7 ? config.color : 'none',
                            }}
                        />
                    </motion.div>

                    {/* Rising particles for higher streaks */}
                    <AnimatePresence>
                        {animated && streak >= 7 && particles.map((p) => (
                            <motion.div
                                key={p.id}
                                className="absolute bottom-full left-1/2 rounded-full"
                                style={{
                                    width: p.size,
                                    height: p.size,
                                    backgroundColor: config.color,
                                    willChange: 'transform, opacity',
                                }}
                                initial={{ y: 0, x: p.x, opacity: 0, scale: 1 }}
                                animate={{
                                    y: -30,
                                    x: p.x + (Math.random() - 0.5) * 10,
                                    opacity: [0, 1, 0],
                                    scale: [1, 0.5, 0],
                                }}
                                transition={{
                                    duration: p.duration,
                                    delay: p.delay,
                                    repeat: Infinity,
                                    ease: "easeOut",
                                }}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <motion.span
                className={`font-bold ${sizeConfig.text} transition-colors duration-300`}
                style={{ color: config.color }}
                animate={animated && streak >= 14 ? {
                    textShadow: [
                        `0 0 0px ${config.color}`,
                        `0 0 10px ${config.color}`,
                        `0 0 0px ${config.color}`,
                    ],
                } : {}}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                {streak}
            </motion.span>
        </div>
    );
}

// Mini streak badge for compact displays
export function StreakBadge({
    streak,
    className,
}: {
    streak: number;
    className?: string;
}) {
    const intensity = getIntensity(streak);
    const config = intensityConfig[intensity];

    return (
        <motion.div
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${className || ''}`}
            style={{
                backgroundColor: `${config.color}20`,
                color: config.color,
                boxShadow: config.glow,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <Flame size={12} style={{ fill: streak >= 7 ? config.color : 'none' }} />
            <span>{streak}</span>
        </motion.div>
    );
}
