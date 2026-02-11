"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

interface FireworksProps {
    trigger: boolean;
    count?: number;
    duration?: number;
    colors?: string[];
    className?: string;
    onComplete?: () => void;
}

const defaultColors = [
    "#BFF549",
    "#FFD700",
    "#FF6B6B",
    "#4ECDC4",
    "#A855F7",
    "#F97316",
    "#3B82F6",
    "#EC4899",
];

interface Firework {
    id: number;
    x: number;
    y: number;
    color: string;
    delay: number;
    particles: {
        angle: number;
        distance: number;
        size: number;
    }[];
}

export function Fireworks({
    trigger,
    count = 5,
    duration = 2,
    colors = defaultColors,
    className,
    onComplete,
}: FireworksProps) {
    const [isVisible, setIsVisible] = useState(false);

    const fireworks = useMemo<Firework[]>(() => {
        return Array.from({ length: count }).map((_, i) => ({
            id: i,
            x: 10 + Math.random() * 80, // % from left
            y: 20 + Math.random() * 40, // % from top
            color: colors[Math.floor(Math.random() * colors.length)],
            delay: i * 0.3 + Math.random() * 0.2,
            particles: Array.from({ length: 12 + Math.floor(Math.random() * 8) }).map((_, j) => ({
                angle: (j / 20) * 360 + Math.random() * 20,
                distance: 50 + Math.random() * 100,
                size: 3 + Math.random() * 4,
            })),
        }));
    }, [count, colors]);

    useEffect(() => {
        if (trigger) {
            setIsVisible(true);
            const timeout = setTimeout(() => {
                setIsVisible(false);
                onComplete?.();
            }, duration * 1000 + 500);
            return () => clearTimeout(timeout);
        }
    }, [trigger, duration, onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <div className={`pointer-events-none fixed inset-0 z-[100] overflow-hidden ${className || ''}`}>
                    {fireworks.map((fw) => (
                        <div
                            key={fw.id}
                            className="absolute"
                            style={{
                                left: `${fw.x}%`,
                                top: `${fw.y}%`,
                            }}
                        >
                            {/* Rising trail */}
                            <motion.div
                                initial={{ y: 200, opacity: 1, scale: 1 }}
                                animate={{ y: 0, opacity: [1, 1, 0], scale: [1, 0.5, 0] }}
                                transition={{
                                    duration: 0.5,
                                    delay: fw.delay,
                                    ease: "easeOut",
                                }}
                                className="absolute w-1 h-8 rounded-full"
                                style={{
                                    background: `linear-gradient(to top, ${fw.color}, transparent)`,
                                    willChange: 'transform, opacity',
                                }}
                            />

                            {/* Explosion particles */}
                            {fw.particles.map((p, i) => {
                                const radians = p.angle * (Math.PI / 180);
                                const x = Math.cos(radians) * p.distance;
                                const y = Math.sin(radians) * p.distance;

                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                                        animate={{
                                            x: [0, x * 0.3, x],
                                            y: [0, y * 0.3, y + 50],
                                            opacity: [0, 1, 1, 0],
                                            scale: [0, 1, 0.5],
                                        }}
                                        transition={{
                                            duration: 1,
                                            delay: fw.delay + 0.5,
                                            ease: "easeOut",
                                        }}
                                        className="absolute rounded-full"
                                        style={{
                                            width: p.size,
                                            height: p.size,
                                            backgroundColor: fw.color,
                                            boxShadow: `0 0 ${p.size * 3}px ${fw.color}`,
                                            willChange: 'transform, opacity',
                                        }}
                                    />
                                );
                            })}

                            {/* Central burst */}
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: [0, 2, 0], opacity: [0, 1, 0] }}
                                transition={{
                                    duration: 0.4,
                                    delay: fw.delay + 0.5,
                                    ease: "easeOut",
                                }}
                                className="absolute w-6 h-6 rounded-full -translate-x-3 -translate-y-3"
                                style={{
                                    background: `radial-gradient(circle, white 0%, ${fw.color} 50%, transparent 100%)`,
                                    willChange: 'transform, opacity',
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}
        </AnimatePresence>
    );
}
