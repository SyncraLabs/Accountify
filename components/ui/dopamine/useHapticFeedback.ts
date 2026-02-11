"use client";

import { useCallback } from "react";

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

const patterns: Record<HapticPattern, number[]> = {
    light: [10],
    medium: [20],
    heavy: [30],
    success: [10, 50, 20],
    warning: [20, 30, 20],
    error: [50, 50, 50],
    selection: [5],
};

export function useHapticFeedback() {
    const vibrate = useCallback((pattern: HapticPattern | number[]) => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            const vibrationPattern = Array.isArray(pattern) ? pattern : patterns[pattern];
            navigator.vibrate(vibrationPattern);
        }
    }, []);

    const light = useCallback(() => vibrate('light'), [vibrate]);
    const medium = useCallback(() => vibrate('medium'), [vibrate]);
    const heavy = useCallback(() => vibrate('heavy'), [vibrate]);
    const success = useCallback(() => vibrate('success'), [vibrate]);
    const warning = useCallback(() => vibrate('warning'), [vibrate]);
    const error = useCallback(() => vibrate('error'), [vibrate]);
    const selection = useCallback(() => vibrate('selection'), [vibrate]);

    return {
        vibrate,
        light,
        medium,
        heavy,
        success,
        warning,
        error,
        selection,
        isSupported: typeof navigator !== 'undefined' && !!navigator.vibrate,
    };
}

// Screen shake effect using CSS transform
export function useScreenShake() {
    const shake = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
        const intensityMap = {
            light: 2,
            medium: 5,
            heavy: 10,
        };

        const amount = intensityMap[intensity];
        const duration = 300;
        const steps = 6;
        const stepDuration = duration / steps;

        const body = document.body;
        let step = 0;

        const animate = () => {
            if (step >= steps) {
                body.style.transform = '';
                return;
            }

            const x = (Math.random() - 0.5) * amount * (1 - step / steps);
            const y = (Math.random() - 0.5) * amount * (1 - step / steps);
            body.style.transform = `translate(${x}px, ${y}px)`;
            step++;

            setTimeout(animate, stepDuration);
        };

        animate();
    }, []);

    return { shake };
}
