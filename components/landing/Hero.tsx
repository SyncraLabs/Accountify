"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FramerWrapper } from "@/components/ui/FramerWrapper";
import { ArrowRight, Star } from "lucide-react";
import { DashboardPreview } from "@/components/landing/DashboardPreview";

export function Hero() {
    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-32 pb-24">
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent -z-10 pointer-events-none" />

            <div className="container mx-auto px-6 flex flex-col items-center text-center z-20">

                {/* Badge */}
                <FramerWrapper variant="slideUp" delay={0.1}>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary w-fit mb-8">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
                        Tu Accountability Partner
                    </div>
                </FramerWrapper>

                {/* Headline */}
                <FramerWrapper variant="slideUp" delay={0.2}>
                    <h1 className="text-5xl lg:text-7xl font-semibold tracking-tight text-white leading-[1.1] max-w-4xl mx-auto mb-6">
                        Construye <span className="text-primary">Hábitos</span><br className="hidden md:block" /> Que Sí Duran
                    </h1>
                </FramerWrapper>

                {/* Subheadline */}
                <FramerWrapper variant="slideUp" delay={0.3}>
                    <p className="text-lg text-zinc-400 font-normal leading-relaxed max-w-2xl mx-auto mb-10">
                        Transforma tu vida un hábito a la vez. Seguimiento inteligente, rachas y recomendaciones personalizadas para mantenerte motivado.
                    </p>
                </FramerWrapper>

                {/* CTA Buttons */}
                <FramerWrapper variant="slideUp" delay={0.4} className="flex flex-col sm:flex-row items-center gap-4 mb-16">
                    <Link href="/login?view=signup">
                        <Button className="h-12 px-8 rounded-full bg-primary text-black font-semibold hover:bg-primary/90 transition-all text-base shadow-[0_0_20px_rgba(74,222,128,0.2)] hover:shadow-[0_0_30px_rgba(74,222,128,0.4)]">
                            Comenzar Gratis <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                    <Link href="/#features">
                        <Button variant="outline" className="h-12 px-8 rounded-full border-white/10 text-white hover:bg-white/5 hover:text-white transition-colors text-base">
                            Cómo Funciona
                        </Button>
                    </Link>
                </FramerWrapper>

                {/* Social Proof / Stats */}
                <FramerWrapper variant="slideUp" delay={0.5} className="flex items-center gap-8 md:gap-12 mb-20 border-t border-white/5 pt-8 px-8">
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-white">Acceso</span>
                        <span className="text-xs text-zinc-500 uppercase tracking-wider">Anticipado</span>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-white">IA</span>
                        <span className="text-xs text-zinc-500 uppercase tracking-wider">Coach Personal</span>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-white flex items-center gap-1">4.9 <Star className="h-4 w-4 fill-primary text-primary" /></span>
                        <span className="text-xs text-zinc-500 uppercase tracking-wider">Valoración</span>
                    </div>
                </FramerWrapper>

            </div>

            {/* Dashboard Preview */}
            <DashboardPreview />

        </section>
    );
}
