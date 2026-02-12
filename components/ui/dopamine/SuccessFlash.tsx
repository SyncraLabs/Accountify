"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface SuccessFlashProps {
    trigger: boolean;
    color?: string;
    duration?: number;
    intensity?: 'subtle' | 'medium' | 'strong';
    origin?: { x: number; y: number }; // 0-1 percentages of viewport
    className?: string;
    onComplete?: () => void;
}

const intensityMap = {
    subtle: 0.08,
    medium: 0.15,
    strong: 0.25,
};

export function SuccessFlash({
    trigger,
    color = '#BFF549',
    duration = 0.4,
    intensity = 'medium',
    origin,
    className,
    onComplete,
}: SuccessFlashProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (trigger) {
            setIsVisible(true);
            const timeout = setTimeout(() => {
                setIsVisible(false);
                onComplete?.();
            }, duration * 1000);
            return () => clearTimeout(timeout);
        }
    }, [trigger, duration, onComplete]);

    // Calculate gradient position - center on origin if provided
    const gradientPosition = origin
        ? `${origin.x * 100}% ${origin.y * 100}%`
        : 'center';

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: intensityMap[intensity] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: duration / 2, ease: "easeOut" }}
                    className={`pointer-events-none fixed inset-0 z-[99] ${className || ''}`}
                    style={{
                        background: `radial-gradient(circle at ${gradientPosition}, ${color} 0%, transparent 60%)`,
                        willChange: 'opacity',
                    }}
                />
            )}
        </AnimatePresence>
    );
}
