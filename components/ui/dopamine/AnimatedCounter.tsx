"use client";

import { motion, useSpring, useTransform, useMotionValue, animate } from "framer-motion";
import { useEffect, useRef } from "react";

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    className?: string;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    onComplete?: () => void;
}

export function AnimatedCounter({
    value,
    duration = 1,
    className,
    prefix = "",
    suffix = "",
    decimals = 0,
    onComplete,
}: AnimatedCounterProps) {
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        stiffness: 100,
        damping: 30,
        duration: duration * 1000,
    });
    const displayValue = useTransform(springValue, (v) =>
        v.toFixed(decimals)
    );
    const prevValue = useRef(0);

    useEffect(() => {
        const controls = animate(motionValue, value, {
            duration,
            ease: [0.32, 0.72, 0, 1],
            onComplete,
        });

        prevValue.current = value;

        return () => controls.stop();
    }, [value, duration, motionValue, onComplete]);

    return (
        <motion.span
            className={className}
            initial={{ scale: 1 }}
            animate={value !== prevValue.current ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3 }}
        >
            {prefix}
            <motion.span>{displayValue}</motion.span>
            {suffix}
        </motion.span>
    );
}

// Simpler version for integers with flip animation
export function FlipCounter({
    value,
    className,
    prefix = "",
    suffix = "",
}: {
    value: number;
    className?: string;
    prefix?: string;
    suffix?: string;
}) {
    const digits = String(value).split('');

    return (
        <span className={`inline-flex ${className || ''}`}>
            {prefix}
            {digits.map((digit, i) => (
                <motion.span
                    key={`${i}-${digit}`}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                        delay: i * 0.05,
                    }}
                    className="inline-block tabular-nums"
                >
                    {digit}
                </motion.span>
            ))}
            {suffix}
        </span>
    );
}

// Percentage counter with visual indicator
export function PercentageCounter({
    value,
    size = 'md',
    showRing = true,
    className,
}: {
    value: number;
    size?: 'sm' | 'md' | 'lg';
    showRing?: boolean;
    className?: string;
}) {
    const sizeConfig = {
        sm: { ring: 32, stroke: 3, text: 'text-sm' },
        md: { ring: 48, stroke: 4, text: 'text-lg' },
        lg: { ring: 64, stroke: 5, text: 'text-2xl' },
    };

    const config = sizeConfig[size];
    const radius = (config.ring - config.stroke) / 2;
    const circumference = radius * 2 * Math.PI;

    return (
        <div className={`relative inline-flex items-center justify-center ${className || ''}`}>
            {showRing && (
                <svg
                    width={config.ring}
                    height={config.ring}
                    className="absolute -rotate-90"
                >
                    <circle
                        cx={config.ring / 2}
                        cy={config.ring / 2}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={config.stroke}
                        className="text-white/10"
                    />
                    <motion.circle
                        cx={config.ring / 2}
                        cy={config.ring / 2}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={config.stroke}
                        strokeLinecap="round"
                        className="text-primary"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{
                            strokeDashoffset: circumference - (value / 100) * circumference,
                        }}
                        style={{
                            strokeDasharray: circumference,
                            filter: value === 100 ? 'drop-shadow(0 0 6px rgba(191, 245, 73, 0.6))' : 'none',
                        }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                </svg>
            )}
            <motion.span
                className={`font-bold ${config.text} tabular-nums`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                key={value}
                transition={{ type: "spring", stiffness: 500 }}
                style={{
                    color: value === 100 ? '#BFF549' : 'white',
                }}
            >
                {value}%
            </motion.span>
        </div>
    );
}
