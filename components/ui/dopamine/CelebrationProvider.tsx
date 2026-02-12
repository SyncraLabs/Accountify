"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Confetti } from "./Confetti";
import { Fireworks } from "./Fireworks";
import { SuccessFlash } from "./SuccessFlash";
import { CelebrationBurst } from "./CelebrationBurst";

type CelebrationType = 'habitComplete' | 'dayComplete' | 'streakMilestone' | 'weekComplete' | 'challengeComplete' | 'achievement';
type Intensity = 'small' | 'medium' | 'large' | 'epic';

interface CelebrationOptions {
    origin?: { x: number; y: number };
    intensity?: Intensity;
    streak?: number;
}

interface CelebrationContextValue {
    celebrate: (type: CelebrationType, options?: CelebrationOptions) => void;
    isAnimating: boolean;
}

const CelebrationContext = createContext<CelebrationContextValue | null>(null);

export function useCelebration() {
    const context = useContext(CelebrationContext);
    if (!context) {
        throw new Error("useCelebration must be used within a CelebrationProvider");
    }
    return context;
}

interface CelebrationState {
    showConfetti: boolean;
    showFireworks: boolean;
    showFlash: boolean;
    showBurst: boolean;
    confettiCount: number;
    origin: { x: number; y: number };
    flashIntensity: 'subtle' | 'medium' | 'strong';
}

const defaultState: CelebrationState = {
    showConfetti: false,
    showFireworks: false,
    showFlash: false,
    showBurst: false,
    confettiCount: 30,
    origin: { x: 0.5, y: 0.5 },
    flashIntensity: 'subtle',
};

export function CelebrationProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<CelebrationState>(defaultState);
    const [isAnimating, setIsAnimating] = useState(false);

    const celebrate = useCallback((type: CelebrationType, options?: CelebrationOptions) => {
        const origin = options?.origin || { x: 0.5, y: 0.5 };
        const intensity = options?.intensity || 'medium';

        setIsAnimating(true);

        // Configure based on celebration type
        switch (type) {
            case 'habitComplete':
                setState({
                    ...defaultState,
                    showConfetti: true,
                    showFlash: true,
                    showBurst: true,
                    confettiCount: intensity === 'small' ? 25 : intensity === 'medium' ? 40 : 60,
                    origin,
                    flashIntensity: 'subtle',
                });
                setTimeout(() => {
                    setState(defaultState);
                    setIsAnimating(false);
                }, 1500);
                break;

            case 'dayComplete':
                setState({
                    ...defaultState,
                    showConfetti: true,
                    showFireworks: true,
                    showFlash: true,
                    confettiCount: 80,
                    origin: { x: 0.5, y: 0.3 },
                    flashIntensity: 'medium',
                });
                setTimeout(() => {
                    setState(defaultState);
                    setIsAnimating(false);
                }, 3500);
                break;

            case 'streakMilestone':
                const streakIntensity = options?.streak && options.streak >= 30 ? 'epic' :
                                        options?.streak && options.streak >= 14 ? 'large' : 'medium';
                setState({
                    ...defaultState,
                    showConfetti: true,
                    showFireworks: streakIntensity !== 'medium',
                    showFlash: true,
                    confettiCount: streakIntensity === 'epic' ? 100 : streakIntensity === 'large' ? 70 : 50,
                    origin: { x: 0.5, y: 0.4 },
                    flashIntensity: streakIntensity === 'epic' ? 'strong' : 'medium',
                });
                setTimeout(() => {
                    setState(defaultState);
                    setIsAnimating(false);
                }, 2500);
                break;

            case 'weekComplete':
                setState({
                    ...defaultState,
                    showConfetti: true,
                    showFireworks: true,
                    showFlash: true,
                    confettiCount: 90,
                    origin: { x: 0.5, y: 0.3 },
                    flashIntensity: 'medium',
                });
                setTimeout(() => {
                    setState(defaultState);
                    setIsAnimating(false);
                }, 3000);
                break;

            case 'challengeComplete':
                setState({
                    ...defaultState,
                    showConfetti: true,
                    showFireworks: true,
                    showFlash: true,
                    confettiCount: 120,
                    origin: { x: 0.5, y: 0.3 },
                    flashIntensity: 'strong',
                });
                setTimeout(() => {
                    setState(defaultState);
                    setIsAnimating(false);
                }, 4000);
                break;

            case 'achievement':
                setState({
                    ...defaultState,
                    showConfetti: true,
                    showFlash: true,
                    showBurst: true,
                    confettiCount: 60,
                    origin,
                    flashIntensity: 'medium',
                });
                setTimeout(() => {
                    setState(defaultState);
                    setIsAnimating(false);
                }, 2000);
                break;
        }
    }, []);

    return (
        <CelebrationContext.Provider value={{ celebrate, isAnimating }}>
            {children}

            {/* Celebration effects layer */}
            {state.showFlash && (
                <SuccessFlash
                    trigger={state.showFlash}
                    intensity={state.flashIntensity}
                    origin={state.origin}
                />
            )}

            {state.showConfetti && (
                <Confetti
                    count={state.confettiCount}
                    origin={state.origin}
                    duration={1.8}
                />
            )}

            {state.showFireworks && (
                <Fireworks
                    trigger={state.showFireworks}
                    count={5}
                    duration={2.5}
                />
            )}

            {state.showBurst && (
                <CelebrationBurst
                    trigger={state.showBurst}
                    size="md"
                    origin={state.origin}
                />
            )}
        </CelebrationContext.Provider>
    );
}
