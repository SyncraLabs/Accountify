"use client";

import { motion } from "framer-motion";

interface GlowPulseProps {
    active?: boolean;
    color?: string;
    size?: number;
    intensity?: 'subtle' | 'medium' | 'strong';
    speed?: 'slow' | 'medium' | 'fast';
    className?: string;
    children?: React.ReactNode;
}

const intensityMap = {
    subtle: { blur: 20, opacity: 0.3 },
    medium: { blur: 40, opacity: 0.5 },
    strong: { blur: 60, opacity: 0.7 },
};

const speedMap = {
    slow: 3,
    medium: 2,
    fast: 1,
};

export function GlowPulse({
    active = true,
    color = '#BFF549',
    size = 100,
    intensity = 'medium',
    speed = 'medium',
    className,
    children,
}: GlowPulseProps) {
    const config = intensityMap[intensity];
    const duration = speedMap[speed];

    return (
        <div className={`relative ${className || ''}`}>
            {active && (
                <motion.div
                    className="absolute inset-0 rounded-full -z-10"
                    style={{
                        background: color,
                        filter: `blur(${config.blur}px)`,
                        willChange: 'transform, opacity',
                    }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                        scale: [0.8, 1.2, 0.8],
                        opacity: [config.opacity * 0.5, config.opacity, config.opacity * 0.5],
                    }}
                    transition={{
                        duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            )}
            {children}
        </div>
    );
}

// Wrapper for elements that should glow on hover or when active
export function GlowWrapper({
    children,
    glowOnHover = true,
    glowOnActive = false,
    isActive = false,
    color = '#BFF549',
    className,
}: {
    children: React.ReactNode;
    glowOnHover?: boolean;
    glowOnActive?: boolean;
    isActive?: boolean;
    color?: string;
    className?: string;
}) {
    return (
        <motion.div
            className={`relative ${className || ''}`}
            whileHover={glowOnHover ? { scale: 1.02 } : undefined}
            style={{ willChange: 'transform' }}
        >
            <motion.div
                className="absolute inset-0 rounded-2xl -z-10"
                style={{
                    background: color,
                    filter: 'blur(20px)',
                    willChange: 'opacity',
                }}
                initial={{ opacity: 0 }}
                animate={{
                    opacity: (glowOnActive && isActive) ? 0.3 : 0
                }}
                whileHover={glowOnHover ? { opacity: 0.2 } : undefined}
                transition={{ duration: 0.3 }}
            />
            {children}
        </motion.div>
    );
}
