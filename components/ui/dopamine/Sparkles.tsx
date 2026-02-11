"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface SparklesProps {
    active?: boolean;
    count?: number;
    color?: string;
    minSize?: number;
    maxSize?: number;
    className?: string;
    children?: React.ReactNode;
}

interface Sparkle {
    id: number;
    x: number;
    y: number;
    size: number;
    delay: number;
    duration: number;
}

function generateSparkle(id: number, minSize: number, maxSize: number): Sparkle {
    return {
        id,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: minSize + Math.random() * (maxSize - minSize),
        delay: Math.random() * 2,
        duration: 1 + Math.random() * 1.5,
    };
}

export function Sparkles({
    active = true,
    count = 10,
    color = '#BFF549',
    minSize = 4,
    maxSize = 8,
    className,
    children,
}: SparklesProps) {
    const [sparkles, setSparkles] = useState<Sparkle[]>([]);

    useEffect(() => {
        if (active) {
            setSparkles(
                Array.from({ length: count }).map((_, i) =>
                    generateSparkle(i, minSize, maxSize)
                )
            );

            // Regenerate sparkles periodically
            const interval = setInterval(() => {
                setSparkles(prev =>
                    prev.map((s, i) =>
                        Math.random() > 0.7 ? generateSparkle(i, minSize, maxSize) : s
                    )
                );
            }, 2000);

            return () => clearInterval(interval);
        } else {
            setSparkles([]);
        }
    }, [active, count, minSize, maxSize]);

    return (
        <div className={`relative ${className || ''}`}>
            <AnimatePresence>
                {active && sparkles.map((sparkle) => (
                    <motion.div
                        key={`${sparkle.id}-${sparkle.x}-${sparkle.y}`}
                        className="absolute pointer-events-none z-10"
                        style={{
                            left: `${sparkle.x}%`,
                            top: `${sparkle.y}%`,
                            willChange: 'transform, opacity',
                        }}
                        initial={{ scale: 0, opacity: 0, rotate: 0 }}
                        animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0],
                            rotate: [0, 180],
                        }}
                        transition={{
                            duration: sparkle.duration,
                            delay: sparkle.delay,
                            repeat: Infinity,
                            repeatDelay: Math.random() * 2,
                        }}
                    >
                        <SparkleIcon size={sparkle.size} color={color} />
                    </motion.div>
                ))}
            </AnimatePresence>
            {children}
        </div>
    );
}

function SparkleIcon({ size, color }: { size: number; color: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={color}
            style={{
                filter: `drop-shadow(0 0 ${size / 2}px ${color})`,
            }}
        >
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
    );
}

// Inline sparkle burst effect
export function SparkleBurst({
    trigger,
    count = 8,
    color = '#BFF549',
    className,
    onComplete,
}: {
    trigger: boolean;
    count?: number;
    color?: string;
    className?: string;
    onComplete?: () => void;
}) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (trigger) {
            setIsVisible(true);
            const timeout = setTimeout(() => {
                setIsVisible(false);
                onComplete?.();
            }, 800);
            return () => clearTimeout(timeout);
        }
    }, [trigger, onComplete]);

    const sparkles = Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 360;
        const radians = angle * (Math.PI / 180);
        const distance = 30 + Math.random() * 20;
        return {
            x: Math.cos(radians) * distance,
            y: Math.sin(radians) * distance,
            size: 6 + Math.random() * 4,
            delay: Math.random() * 0.1,
        };
    });

    return (
        <AnimatePresence>
            {isVisible && (
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${className || ''}`}>
                    {sparkles.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                            animate={{
                                x: s.x,
                                y: s.y,
                                scale: [0, 1.5, 0],
                                opacity: [0, 1, 0],
                                rotate: [0, 180],
                            }}
                            transition={{
                                duration: 0.6,
                                delay: s.delay,
                                ease: "easeOut",
                            }}
                            style={{ willChange: 'transform, opacity' }}
                        >
                            <SparkleIcon size={s.size} color={color} />
                        </motion.div>
                    ))}
                </div>
            )}
        </AnimatePresence>
    );
}
