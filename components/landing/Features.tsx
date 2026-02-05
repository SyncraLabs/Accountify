"use client";

import { FramerWrapper } from "@/components/ui/FramerWrapper";
import { Zap, Shield, BarChart3, Users, Smartphone, Clock } from "lucide-react";

const features = [
    {
        icon: Zap,
        title: "Ultrarrápido",
        description: "Construido para velocidad. Registra hábitos en segundos y vuelve a tus objetivos."
    },
    {
        icon: BarChart3,
        title: "Analíticas Profundas",
        description: "Visualiza tu progreso con gráficos y métricas que te mantienen motivado."
    },
    {
        icon: Users,
        title: "Responsabilidad Grupal",
        description: "Únete a tribus de ganadores. Compite, comparte y crece en comunidad."
    },
    {
        icon: Shield,
        title: "Privado y Seguro",
        description: "Tus datos son tuyos. Encriptación de nivel empresarial para tu privacidad."
    },
    {
        icon: Smartphone,
        title: "Mobile First",
        description: "Diseñado para tu teléfono. Lleva tu compañero de responsabilidad a todas partes."
    },
    {
        icon: Clock,
        title: "Recordatorios Inteligentes",
        description: "Notificaciones inteligentes que te avisan exactamente cuando lo necesitas."
    }
];

export function Features() {
    return (
        <section id="features" className="py-32 px-6 relative bg-black">
            <div className="max-w-6xl mx-auto">
                <FramerWrapper variant="slideUp" className="text-center mb-20 space-y-4">
                    <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
                        Todo lo que necesitas para <span className="text-primary">Ganar</span>
                    </h2>
                    <p className="text-zinc-400 max-w-xl mx-auto text-base">
                        Potentes funciones en una interfaz impresionante. La simplicidad se encuentra con el poder.
                    </p>
                </FramerWrapper>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <FramerWrapper
                            key={index}
                            delay={index * 0.08}
                            variant="scale"
                            className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors"
                        >
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                                <feature.icon className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="text-base font-medium text-white mb-2">{feature.title}</h3>
                            <p className="text-sm text-zinc-500 leading-relaxed">
                                {feature.description}
                            </p>
                        </FramerWrapper>
                    ))}
                </div>
            </div>
        </section>
    );
}

