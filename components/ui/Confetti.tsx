"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ConfettiProps {
    count?: number;
    x?: number;
    y?: number;
    className?: string; // Optional custom class
}

const colors = ["#BFF549", "#ffffff", "#EF4444", "#3B82F6", "#A855F7", "#F97316"];

export function Confetti({ count = 20, x = 0, y = 0, className }: ConfettiProps) {
    const [particles, setParticles] = useState<any[]>([]);

    useEffect(() => {
        const newParticles = Array.from({ length: count }).map((_, i) => ({
            id: i,
            x: Math.random() * 200 - 100, // Spread range -100 to 100
            y: Math.random() * 200 - 100,
            rotate: Math.random() * 360,
            scale: Math.random() * 0.5 + 0.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            delay: Math.random() * 0.1,
        }));
        setParticles(newParticles);
    }, [count]);

    return (
        <div
            className={`pointer-events-none fixed z-50 ${className || ""}`}
            style={{ left: x, top: y }}
        >
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    initial={{ x: 0, y: 0, opacity: 1, scale: p.scale }}
                    animate={{ x: p.x, y: p.y, opacity: 0, scale: 0, rotate: p.rotate + 180 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: p.delay }}
                    style={{
                        position: "absolute",
                        width: "8px",
                        height: "8px",
                        backgroundColor: p.color,
                        borderRadius: "2px",
                    }}
                />
            ))}
        </div>
    );
}
