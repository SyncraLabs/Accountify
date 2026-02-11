"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

type ShapeType = 'square' | 'circle' | 'triangle' | 'star';

interface ConfettiProps {
    count?: number;
    duration?: number;
    spread?: number;
    gravity?: number;
    colors?: string[];
    shapes?: ShapeType[];
    origin?: { x: number; y: number };
    className?: string;
    onComplete?: () => void;
}

interface Particle {
    id: number;
    x: number;
    y: number;
    rotate: number;
    rotateX: number;
    rotateY: number;
    scale: number;
    color: string;
    shape: ShapeType;
    size: number;
    delay: number;
    duration: number;
}

const defaultColors = [
    "#BFF549", // Primary lime
    "#ffffff",
    "#FFD700", // Gold
    "#FF6B6B", // Coral
    "#4ECDC4", // Teal
    "#A855F7", // Purple
    "#F97316", // Orange
    "#3B82F6", // Blue
];

const shapes = {
    square: (color: string, size: number) => (
        <div style={{ width: size, height: size, backgroundColor: color, borderRadius: 2 }} />
    ),
    circle: (color: string, size: number) => (
        <div style={{ width: size, height: size, backgroundColor: color, borderRadius: '50%' }} />
    ),
    triangle: (color: string, size: number) => (
        <div style={{
            width: 0,
            height: 0,
            borderLeft: `${size / 2}px solid transparent`,
            borderRight: `${size / 2}px solid transparent`,
            borderBottom: `${size}px solid ${color}`,
        }} />
    ),
    star: (color: string, size: number) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
    ),
};

export function Confetti({
    count = 50,
    duration = 1.5,
    spread = 180,
    gravity = 0.8,
    colors = defaultColors,
    shapes: shapeTypes = ['square', 'circle', 'triangle'],
    origin = { x: 0.5, y: 0.5 },
    className,
    onComplete,
}: ConfettiProps) {
    const [particles, setParticles] = useState<Particle[]>([]);

    const generatedParticles = useMemo((): Particle[] => {
        return Array.from({ length: count }).map((_, i) => {
            const angle = (Math.random() * spread - spread / 2) * (Math.PI / 180) - Math.PI / 2;
            const velocity = 300 + Math.random() * 400;
            const size = 6 + Math.random() * 8;

            return {
                id: i,
                x: Math.cos(angle) * velocity,
                y: Math.sin(angle) * velocity + gravity * 800,
                rotate: Math.random() * 720 - 360,
                rotateX: Math.random() * 720,
                rotateY: Math.random() * 720,
                scale: 0.5 + Math.random() * 0.5,
                color: colors[Math.floor(Math.random() * colors.length)],
                shape: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
                size,
                delay: Math.random() * 0.15,
                duration: duration * (0.8 + Math.random() * 0.4),
            };
        });
    }, [count, spread, gravity, colors, shapeTypes, duration]);

    useEffect(() => {
        setParticles(generatedParticles);

        const timeout = setTimeout(() => {
            onComplete?.();
        }, duration * 1000 + 200);

        return () => clearTimeout(timeout);
    }, [generatedParticles, duration, onComplete]);

    return (
        <div
            className={`pointer-events-none fixed inset-0 z-[100] overflow-hidden ${className || ""}`}
            style={{ perspective: '1000px' }}
        >
            <div
                className="absolute"
                style={{
                    left: `${origin.x * 100}%`,
                    top: `${origin.y * 100}%`,
                }}
            >
                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        initial={{
                            x: 0,
                            y: 0,
                            opacity: 1,
                            scale: 0,
                            rotateX: 0,
                            rotateY: 0,
                            rotateZ: 0,
                        }}
                        animate={{
                            x: p.x,
                            y: p.y,
                            opacity: [1, 1, 0],
                            scale: [0, p.scale, p.scale * 0.5],
                            rotateX: p.rotateX,
                            rotateY: p.rotateY,
                            rotateZ: p.rotate,
                        }}
                        transition={{
                            duration: p.duration,
                            ease: [0.23, 1, 0.32, 1],
                            delay: p.delay,
                        }}
                        style={{
                            position: "absolute",
                            transformStyle: 'preserve-3d',
                            willChange: 'transform, opacity',
                        }}
                    >
                        {shapes[p.shape](p.color, p.size)}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
