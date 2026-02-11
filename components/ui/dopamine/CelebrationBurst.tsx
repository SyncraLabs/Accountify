"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface CelebrationBurstProps {
    trigger: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: string;
    className?: string;
    onComplete?: () => void;
}

const sizeMap = {
    sm: { rings: 2, particles: 8, maxRadius: 60 },
    md: { rings: 3, particles: 12, maxRadius: 100 },
    lg: { rings: 4, particles: 16, maxRadius: 150 },
    xl: { rings: 5, particles: 24, maxRadius: 200 },
};

export function CelebrationBurst({
    trigger,
    size = 'md',
    color = '#BFF549',
    className,
    onComplete,
}: CelebrationBurstProps) {
    const [isVisible, setIsVisible] = useState(false);
    const config = sizeMap[size];

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

    const rings = Array.from({ length: config.rings }).map((_, i) => ({
        delay: i * 0.08,
        scale: 0.3 + (i * 0.25),
        opacity: 1 - (i * 0.15),
    }));

    const particles = Array.from({ length: config.particles }).map((_, i) => {
        const angle = (i / config.particles) * 360;
        const radians = angle * (Math.PI / 180);
        const distance = config.maxRadius * (0.7 + Math.random() * 0.3);
        return {
            x: Math.cos(radians) * distance,
            y: Math.sin(radians) * distance,
            delay: Math.random() * 0.1,
            size: 4 + Math.random() * 4,
        };
    });

    return (
        <AnimatePresence>
            {isVisible && (
                <div className={`pointer-events-none absolute inset-0 flex items-center justify-center z-50 ${className || ''}`}>
                    {/* Expanding rings */}
                    {rings.map((ring, i) => (
                        <motion.div
                            key={`ring-${i}`}
                            initial={{ scale: 0, opacity: ring.opacity }}
                            animate={{ scale: ring.scale * 3, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6, delay: ring.delay, ease: "easeOut" }}
                            className="absolute rounded-full"
                            style={{
                                width: config.maxRadius * 2,
                                height: config.maxRadius * 2,
                                border: `2px solid ${color}`,
                                willChange: 'transform, opacity',
                            }}
                        />
                    ))}

                    {/* Burst particles */}
                    {particles.map((p, i) => (
                        <motion.div
                            key={`particle-${i}`}
                            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                            animate={{ x: p.x, y: p.y, scale: 0, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, delay: p.delay, ease: "easeOut" }}
                            className="absolute rounded-full"
                            style={{
                                width: p.size,
                                height: p.size,
                                backgroundColor: color,
                                boxShadow: `0 0 ${p.size * 2}px ${color}`,
                                willChange: 'transform, opacity',
                            }}
                        />
                    ))}

                    {/* Central flash */}
                    <motion.div
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="absolute rounded-full"
                        style={{
                            width: 40,
                            height: 40,
                            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                            willChange: 'transform, opacity',
                        }}
                    />
                </div>
            )}
        </AnimatePresence>
    );
}
