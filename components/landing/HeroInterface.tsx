"use client";

import { AnimatedAIChat } from "@/components/ui/animated-ai-chat";

export function HeroInterface() {
    return (
        <div className="w-full max-w-[420px] h-[600px] mx-auto rounded-3xl border border-white/10 bg-[#0A0A0A] shadow-2xl overflow-hidden font-sans relative z-20">
            <AnimatedAIChat />
        </div>
    );
}
