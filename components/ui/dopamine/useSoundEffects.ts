"use client";

import { useCallback, useRef, useEffect, useState } from "react";

type SoundEffect = 'success' | 'complete' | 'click' | 'celebrate' | 'streak' | 'error';

// Base64 encoded minimal sound effects (very small, no external dependencies)
const sounds: Record<SoundEffect, string> = {
    // Short success beep
    success: "data:audio/wav;base64,UklGRl4AAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YToAAAAAgICAgICAgICAgP////+AgICAgICAgICAgP////+AgICAgICA",
    // Completion chime
    complete: "data:audio/wav;base64,UklGRn4AAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YVoAAAAAgICAgP///4CA//+AgP//gID//4CA//+AgP///4CAgICAgICAgICA//+AgP//gID//4CA//+AgP//gID//w==",
    // Soft click
    click: "data:audio/wav;base64,UklGRjYAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YRIAAACA////gAAAAICAgICA",
    // Celebration fanfare
    celebrate: "data:audio/wav;base64,UklGRqoAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YYYAAAAAgP//gP//gP//gP///4D//4D//4D///+A//+A//+A////gP//gP//gP///4D//4D//4D///+A//+A//+A////gP//gP//gP///4D//4D//4D//w==",
    // Streak fire sound
    streak: "data:audio/wav;base64,UklGRoYAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YWIAAAAAgP//gP//gP///4D//4D//4D///+A//+A//+A////gP//gP//gP///4D//4D//4D///+A//+A//+A////gID//w==",
    // Error buzz
    error: "data:audio/wav;base64,UklGRl4AAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YToAAAAA////AAAA////AAAA////AAAA////AAAA////AAAA////AAAA////AAAA",
};

interface UseSoundEffectsOptions {
    enabled?: boolean;
    volume?: number;
}

export function useSoundEffects(options: UseSoundEffectsOptions = {}) {
    const { enabled = false, volume = 0.3 } = options;
    const audioRefs = useRef<Map<SoundEffect, HTMLAudioElement>>(new Map());
    const [isSupported, setIsSupported] = useState(false);

    // Check if audio is supported
    useEffect(() => {
        if (typeof window !== 'undefined' && window.AudioContext) {
            setIsSupported(true);
        }
    }, []);

    // Preload sounds
    useEffect(() => {
        if (!enabled || !isSupported) return;

        const currentAudioRefs = audioRefs.current;

        Object.entries(sounds).forEach(([key, src]) => {
            const audio = new Audio(src);
            audio.volume = volume;
            audio.preload = 'auto';
            currentAudioRefs.set(key as SoundEffect, audio);
        });

        return () => {
            currentAudioRefs.forEach(audio => {
                audio.pause();
                audio.src = '';
            });
            currentAudioRefs.clear();
        };
    }, [enabled, volume, isSupported]);

    const play = useCallback((effect: SoundEffect) => {
        if (!enabled || !isSupported) return;

        const audio = audioRefs.current.get(effect);
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {
                // Ignore autoplay restrictions silently
            });
        }
    }, [enabled, isSupported]);

    const success = useCallback(() => play('success'), [play]);
    const complete = useCallback(() => play('complete'), [play]);
    const click = useCallback(() => play('click'), [play]);
    const celebrate = useCallback(() => play('celebrate'), [play]);
    const streak = useCallback(() => play('streak'), [play]);
    const error = useCallback(() => play('error'), [play]);

    return {
        play,
        success,
        complete,
        click,
        celebrate,
        streak,
        error,
        isSupported,
        enabled,
    };
}

// Hook that combines celebration effects with optional sound
export function useCelebrationWithSound(soundEnabled = false) {
    const sound = useSoundEffects({ enabled: soundEnabled });

    const celebrateHabit = useCallback(() => {
        sound.success();
    }, [sound]);

    const celebrateDay = useCallback(() => {
        sound.celebrate();
    }, [sound]);

    const celebrateStreak = useCallback(() => {
        sound.streak();
    }, [sound]);

    return {
        ...sound,
        celebrateHabit,
        celebrateDay,
        celebrateStreak,
    };
}
