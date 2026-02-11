"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";

interface RippleEffectProps {
    color?: string;
    duration?: number;
    disabled?: boolean;
    className?: string;
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent) => void;
}

interface Ripple {
    id: number;
    x: number;
    y: number;
    size: number;
}

export function RippleEffect({
    color = 'rgba(191, 245, 73, 0.3)',
    duration = 0.6,
    disabled = false,
    className,
    children,
    onClick,
}: RippleEffectProps) {
    const [ripples, setRipples] = useState<Ripple[]>([]);

    const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (disabled) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const size = Math.max(rect.width, rect.height) * 2;

        const ripple: Ripple = {
            id: Date.now(),
            x,
            y,
            size,
        };

        setRipples(prev => [...prev, ripple]);

        // Clean up ripple after animation
        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== ripple.id));
        }, duration * 1000);

        onClick?.(e);
    }, [disabled, duration, onClick]);

    return (
        <div
            className={`relative overflow-hidden ${className || ''}`}
            onClick={handleClick}
        >
            <AnimatePresence>
                {ripples.map((ripple) => (
                    <motion.div
                        key={ripple.id}
                        className="absolute rounded-full pointer-events-none"
                        style={{
                            left: ripple.x,
                            top: ripple.y,
                            width: ripple.size,
                            height: ripple.size,
                            backgroundColor: color,
                            transform: 'translate(-50%, -50%)',
                            willChange: 'transform, opacity',
                        }}
                        initial={{ scale: 0, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration, ease: "easeOut" }}
                    />
                ))}
            </AnimatePresence>
            {children}
        </div>
    );
}

// Button wrapper with ripple
export function RippleButton({
    children,
    className,
    rippleColor,
    onClick,
    disabled,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    rippleColor?: string;
}) {
    return (
        <RippleEffect
            color={rippleColor}
            disabled={disabled}
            className="inline-block"
        >
            <button
                className={className}
                onClick={onClick}
                disabled={disabled}
                {...props}
            >
                {children}
            </button>
        </RippleEffect>
    );
}
