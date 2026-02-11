"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

interface ParticleExplosionProps {
    trigger: boolean;
    particleCount?: number;
    colors?: string[];
    duration?: number;
    spread?: number;
    velocity?: number;
    gravity?: number;
    className?: string;
    origin?: { x: number; y: number };
    onComplete?: () => void;
}

const defaultColors = ['#BFF549', '#FFD700', '#ffffff', '#4ECDC4', '#A855F7'];

interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    delay: number;
    duration: number;
    rotation: number;
}

export function ParticleExplosion({
    trigger,
    particleCount = 30,
    colors = defaultColors,
    duration = 1,
    spread = 360,
    velocity = 200,
    gravity = 0.5,
    className,
    origin = { x: 50, y: 50 },
    onComplete,
}: ParticleExplosionProps) {
    const [isVisible, setIsVisible] = useState(false);

    const particles = useMemo<Particle[]>(() => {
        return Array.from({ length: particleCount }).map((_, i) => {
            const angle = (Math.random() * spread - spread / 2) * (Math.PI / 180);
            const v = velocity * (0.5 + Math.random() * 0.5);

            return {
                id: i,
                x: Math.cos(angle) * v,
                y: Math.sin(angle) * v + gravity * 300,
                size: 4 + Math.random() * 6,
                color: colors[Math.floor(Math.random() * colors.length)],
                delay: Math.random() * 0.1,
                duration: duration * (0.7 + Math.random() * 0.3),
                rotation: Math.random() * 720 - 360,
            };
        });
    }, [particleCount, colors, duration, spread, velocity, gravity]);

    useEffect(() => {
        if (trigger) {
            setIsVisible(true);
            const timeout = setTimeout(() => {
                setIsVisible(false);
                onComplete?.();
            }, duration * 1000 + 200);
            return () => clearTimeout(timeout);
        }
    }, [trigger, duration, onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <div
                    className={`pointer-events-none absolute inset-0 z-50 overflow-visible ${className || ''}`}
                    style={{
                        left: `${origin.x}%`,
                        top: `${origin.y}%`,
                    }}
                >
                    {particles.map((p) => (
                        <motion.div
                            key={p.id}
                            className="absolute rounded-full"
                            style={{
                                width: p.size,
                                height: p.size,
                                backgroundColor: p.color,
                                boxShadow: `0 0 ${p.size}px ${p.color}`,
                                willChange: 'transform, opacity',
                            }}
                            initial={{
                                x: 0,
                                y: 0,
                                opacity: 1,
                                scale: 0,
                                rotate: 0,
                            }}
                            animate={{
                                x: p.x,
                                y: p.y,
                                opacity: [1, 1, 0],
                                scale: [0, 1, 0.5],
                                rotate: p.rotation,
                            }}
                            transition={{
                                duration: p.duration,
                                delay: p.delay,
                                ease: [0.23, 1, 0.32, 1],
                            }}
                        />
                    ))}
                </div>
            )}
        </AnimatePresence>
    );
}

// Directional burst for specific elements
export function DirectionalBurst({
    trigger,
    direction = 'up',
    particleCount = 15,
    color = '#BFF549',
    className,
    onComplete,
}: {
    trigger: boolean;
    direction?: 'up' | 'down' | 'left' | 'right';
    particleCount?: number;
    color?: string;
    className?: string;
    onComplete?: () => void;
}) {
    const spreadConfig = {
        up: { minAngle: -150, maxAngle: -30 },
        down: { minAngle: 30, maxAngle: 150 },
        left: { minAngle: 120, maxAngle: 240 },
        right: { minAngle: -60, maxAngle: 60 },
    };

    const config = spreadConfig[direction];
    const spread = config.maxAngle - config.minAngle;

    return (
        <ParticleExplosion
            trigger={trigger}
            particleCount={particleCount}
            colors={[color, '#ffffff', color]}
            spread={spread}
            velocity={150}
            gravity={direction === 'up' ? -0.3 : 0.3}
            className={className}
            onComplete={onComplete}
        />
    );
}
