"use client";

import { useState, useCallback } from "react";

export type CelebrationType =
    | 'habitComplete'
    | 'dayComplete'
    | 'streakMilestone'
    | 'challengeComplete'
    | 'weekComplete'
    | 'achievement';

interface CelebrationState {
    isActive: boolean;
    type: CelebrationType | null;
    intensity: 'small' | 'medium' | 'large' | 'epic';
    data?: Record<string, any>;
}

const celebrationConfig: Record<CelebrationType, {
    duration: number;
    defaultIntensity: CelebrationState['intensity'];
    confettiCount: number;
    hasFireworks: boolean;
    hasFlash: boolean;
    hasSound: boolean;
}> = {
    habitComplete: {
        duration: 1500,
        defaultIntensity: 'small',
        confettiCount: 30,
        hasFireworks: false,
        hasFlash: true,
        hasSound: true,
    },
    dayComplete: {
        duration: 3000,
        defaultIntensity: 'large',
        confettiCount: 80,
        hasFireworks: true,
        hasFlash: true,
        hasSound: true,
    },
    streakMilestone: {
        duration: 2500,
        defaultIntensity: 'medium',
        confettiCount: 50,
        hasFireworks: true,
        hasFlash: true,
        hasSound: true,
    },
    challengeComplete: {
        duration: 3500,
        defaultIntensity: 'epic',
        confettiCount: 100,
        hasFireworks: true,
        hasFlash: true,
        hasSound: true,
    },
    weekComplete: {
        duration: 3000,
        defaultIntensity: 'large',
        confettiCount: 70,
        hasFireworks: true,
        hasFlash: true,
        hasSound: true,
    },
    achievement: {
        duration: 2500,
        defaultIntensity: 'medium',
        confettiCount: 60,
        hasFireworks: false,
        hasFlash: true,
        hasSound: true,
    },
};

export function useCelebration() {
    const [state, setState] = useState<CelebrationState>({
        isActive: false,
        type: null,
        intensity: 'medium',
    });

    const celebrate = useCallback((
        type: CelebrationType,
        options?: {
            intensity?: CelebrationState['intensity'];
            data?: Record<string, any>;
        }
    ) => {
        const config = celebrationConfig[type];

        setState({
            isActive: true,
            type,
            intensity: options?.intensity || config.defaultIntensity,
            data: options?.data,
        });

        // Auto-reset after duration
        setTimeout(() => {
            setState(prev => ({
                ...prev,
                isActive: false,
            }));
        }, config.duration);
    }, []);

    const reset = useCallback(() => {
        setState({
            isActive: false,
            type: null,
            intensity: 'medium',
        });
    }, []);

    const getConfig = useCallback((type: CelebrationType) => {
        return celebrationConfig[type];
    }, []);

    return {
        ...state,
        celebrate,
        reset,
        getConfig,
        config: state.type ? celebrationConfig[state.type] : null,
    };
}

// Preset celebration triggers
export function useHabitCelebration() {
    const celebration = useCelebration();

    const onComplete = useCallback((options?: { streak?: number }) => {
        // Bigger celebration for streak milestones
        if (options?.streak && options.streak > 0 && options.streak % 7 === 0) {
            celebration.celebrate('streakMilestone', {
                intensity: options.streak >= 30 ? 'epic' : 'large',
                data: { streak: options.streak },
            });
        } else {
            celebration.celebrate('habitComplete', {
                intensity: 'small',
            });
        }
    }, [celebration]);

    const onDayComplete = useCallback(() => {
        celebration.celebrate('dayComplete', { intensity: 'large' });
    }, [celebration]);

    return {
        ...celebration,
        onComplete,
        onDayComplete,
    };
}
