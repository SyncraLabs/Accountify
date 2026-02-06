"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Zap, Shield, BarChart3, Users, Smartphone, Clock } from "lucide-react";

const features = [
    {
        icon: Zap,
        title: "Ultrarrápido",
        description: "Construido para velocidad. Registra hábitos en segundos y vuelve a tus objetivos.",
        color: "yellow"
    },
    {
        icon: BarChart3,
        title: "Analíticas Profundas",
        description: "Visualiza tu progreso con gráficos y métricas que te mantienen motivado.",
        color: "blue"
    },
    {
        icon: Users,
        title: "Responsabilidad Grupal",
        description: "Únete a tribus de ganadores. Compite, comparte y crece en comunidad.",
        color: "purple"
    },
    {
        icon: Shield,
        title: "Privado y Seguro",
        description: "Tus datos son tuyos. Encriptación de nivel empresarial para tu privacidad.",
        color: "green"
    },
    {
        icon: Smartphone,
        title: "Mobile First",
        description: "Diseñado para tu teléfono. Lleva tu compañero de responsabilidad a todas partes.",
        color: "cyan"
    },
    {
        icon: Clock,
        title: "Recordatorios Inteligentes",
        description: "Notificaciones inteligentes que te avisan exactamente cuando lo necesitas.",
        color: "orange"
    }
];

const colorVariants: Record<string, string> = {
    yellow: "bg-yellow-500/10 text-yellow-400 group-hover:bg-yellow-500/20",
    blue: "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20",
    purple: "bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20",
    green: "bg-primary/10 text-primary group-hover:bg-primary/20",
    cyan: "bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20",
    orange: "bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20",
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.25, 0.4, 0.25, 1],
        },
    },
};

export function Features() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section id="features" className="py-32 px-6 relative bg-black overflow-hidden">
            {/* Subtle background grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

            <div className="max-w-6xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20 space-y-4"
                >
                    <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
                        Todo lo que necesitas para <span className="text-primary">Ganar</span>
                    </h2>
                    <p className="text-zinc-400 max-w-xl mx-auto text-base">
                        Potentes funciones en una interfaz impresionante. La simplicidad se encuentra con el poder.
                    </p>
                </motion.div>

                <motion.div
                    ref={ref}
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            className="group p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all cursor-default"
                        >
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: "spring", stiffness: 400 }}
                                className={`h-10 w-10 rounded-lg flex items-center justify-center mb-5 transition-colors ${colorVariants[feature.color]}`}
                            >
                                <feature.icon className="h-5 w-5" />
                            </motion.div>
                            <h3 className="text-base font-medium text-white mb-2 group-hover:text-primary transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

