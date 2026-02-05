"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FramerWrapper } from "@/components/ui/FramerWrapper";
import { ArrowRight, Star } from "lucide-react";
import { HeroInterface } from "@/components/landing/HeroInterface";

export function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-24">
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent -z-10 pointer-events-none" />

            <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-12 items-center">

                    {/* Left Column: Content */}
                    <div className="flex flex-col text-left space-y-10 max-w-xl">
                        <FramerWrapper variant="slideUp" delay={0.1}>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary w-fit">
                                <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
                                Tu Accountability Partner
                            </div>
                        </FramerWrapper>

                        <FramerWrapper variant="slideUp" delay={0.2}>
                            <h1 className="text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[1.15]">
                                Construye <span className="text-primary">Hábitos</span><br />
                                Que Sí Duran
                            </h1>
                        </FramerWrapper>

                        <FramerWrapper variant="slideUp" delay={0.3}>
                            <p className="text-base text-zinc-400 font-normal leading-relaxed max-w-md">
                                Transforma tu vida un hábito a la vez. Seguimiento inteligente, rachas y recomendaciones personalizadas para mantenerte motivado.
                            </p>
                        </FramerWrapper>

                        <FramerWrapper variant="slideUp" delay={0.4} className="flex flex-wrap gap-4 pt-4">
                            <Link href="/login?view=signup">
                                <Button className="h-11 px-6 rounded-full bg-primary text-black font-medium hover:bg-primary/90 transition-colors text-sm">
                                    Comenzar Gratis <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </FramerWrapper>

                        <FramerWrapper variant="slideUp" delay={0.5} className="pt-10 border-t border-white/5 flex items-center gap-10">
                            <div className="flex flex-col">
                                <span className="text-xl font-medium text-white">Acceso</span>
                                <span className="text-xs text-zinc-500">Anticipado</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-medium text-white">IA</span>
                                <span className="text-xs text-zinc-500">Coach Personal</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-medium text-white flex items-center gap-1">4.9 <Star className="h-3 w-3 fill-primary text-primary" /></span>
                                <span className="text-xs text-zinc-500">Valoración</span>
                            </div>
                        </FramerWrapper>
                    </div>

                    {/* Right Column: Interface Mockup */}
                    <FramerWrapper variant="scale" delay={0.4} className="relative z-10 flex justify-center lg:justify-end">
                        <HeroInterface />
                    </FramerWrapper>
                </div>
            </div>
        </section>
    );
}

