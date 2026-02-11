"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface SuccessFlashProps {
    trigger: boolean;
    color?: string;
    duration?: number;
    intensity?: 'subtle' | 'medium' | 'strong';
    className?: string;
    onComplete?: () => void;
}

const intensityMap = {
    subtle: 0.05,
    medium: 0.12,
    strong: 0.2,
};

export function SuccessFlash({
    trigger,
    color = '#BFF549',
    duration = 0.4,
    intensity = 'medium',
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

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: intensityMap[intensity] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: duration / 2, ease: "easeOut" }}
                    className={`pointer-events-none fixed inset-0 z-[200] ${className || ''}`}
                    style={{
                        background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`,
                        willChange: 'opacity',
                    }}
                />
            )}
        </AnimatePresence>
    );
}
