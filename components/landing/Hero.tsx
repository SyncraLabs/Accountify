"use client";

import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Sparkles } from "lucide-react";
import { DashboardPreview } from "@/components/landing/DashboardPreview";
import { useTranslations } from "next-intl";
import { SupademoButton } from "@/components/landing/SupademoButton";

// Floating particles component
function FloatingParticles() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-primary/30"
                    style={{
                        left: `${15 + i * 15}%`,
                        top: `${20 + (i % 3) * 25}%`,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 4 + i * 0.5,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}

// Text reveal animation variants
const textRevealVariants = {
    hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
    visible: (delay: number) => ({
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.7,
            delay,
            ease: "easeOut" as const,
        },
    }),
};

export function Hero() {
    const t = useTranslations('landing.hero');

    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-32 pb-24">
            {/* Animated gradient background */}
            <motion.div
                className="absolute inset-0 -z-10 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
                <motion.div
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[150px]"
                    animate={{
                        x: [0, 50, 0],
                        y: [0, 30, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute top-1/3 right-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-[120px]"
                    animate={{
                        x: [0, -30, 0],
                        y: [0, 50, 0],
                        scale: [1, 1.15, 1],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />
            </motion.div>

            {/* Floating particles */}
            <FloatingParticles />

            <div className="container mx-auto px-6 flex flex-col items-center text-center z-20">

                {/* Badge */}
                <motion.div
                    variants={textRevealVariants}
                    initial="hidden"
                    animate="visible"
                    custom={0.1}
                >
                    <motion.div
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary w-fit mb-8"
                        whileHover={{ scale: 1.05, borderColor: "rgba(74, 222, 128, 0.4)" }}
                        transition={{ type: "spring", stiffness: 400 }}
                    >
                        <motion.span
                            className="flex h-1.5 w-1.5 rounded-full bg-primary"
                            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        {t('badge')}
                        <Sparkles className="h-3 w-3 ml-1" />
                    </motion.div>
                </motion.div>

                {/* Headline with word-by-word animation */}
                <motion.h1
                    className="text-5xl lg:text-7xl font-semibold tracking-tight text-white leading-[1.1] max-w-4xl mx-auto mb-6"
                    variants={textRevealVariants}
                    initial="hidden"
                    animate="visible"
                    custom={0.2}
                >
                    {t('title')}{" "}
                    <motion.span
                        className="text-primary inline-block"
                        animate={{
                            textShadow: [
                                "0 0 20px rgba(74, 222, 128, 0.3)",
                                "0 0 40px rgba(74, 222, 128, 0.5)",
                                "0 0 20px rgba(74, 222, 128, 0.3)",
                            ]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        {t('titleHighlight')}
                    </motion.span>
                    <br className="hidden md:block" /> {t('titleEnd')}
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    className="text-lg text-zinc-400 font-normal leading-relaxed max-w-2xl mx-auto mb-10"
                    variants={textRevealVariants}
                    initial="hidden"
                    animate="visible"
                    custom={0.35}
                >
                    {t('subtitle')}
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    className="flex flex-col sm:flex-row items-center gap-4 mb-16"
                    variants={textRevealVariants}
                    initial="hidden"
                    animate="visible"
                    custom={0.5}
                >
                    <Link href="/login?view=signup">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button className="h-12 px-8 rounded-full bg-primary text-black font-semibold hover:bg-primary/90 transition-all text-base shadow-[0_0_20px_rgba(74,222,128,0.2)] hover:shadow-[0_0_30px_rgba(74,222,128,0.4)]">
                                {t('cta')} <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </motion.div>
                    </Link>
                    <Link href="/#features">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button variant="outline" className="h-12 px-8 rounded-full border-white/10 text-white hover:bg-white/5 hover:text-white transition-colors text-base">
                                {t('howItWorks')}
                            </Button>
                        </motion.div>
                    </Link>
                    <SupademoButton />
                </motion.div>

                {/* Social Proof / Stats */}
                <motion.div
                    className="flex items-center gap-8 md:gap-12 mb-20 border-t border-white/5 pt-8 px-8"
                    variants={textRevealVariants}
                    initial="hidden"
                    animate="visible"
                    custom={0.65}
                >
                    <motion.div
                        className="flex flex-col items-center"
                        whileHover={{ scale: 1.05 }}
                    >
                        <span className="text-2xl font-bold text-white">{t('earlyAccess')}</span>
                        <span className="text-xs text-zinc-500 uppercase tracking-wider">{t('earlyAccessSub')}</span>
                    </motion.div>
                    <div className="w-px h-10 bg-white/10" />
                    <motion.div
                        className="flex flex-col items-center"
                        whileHover={{ scale: 1.05 }}
                    >
                        <span className="text-2xl font-bold text-white">{t('personalCoach')}</span>
                        <span className="text-xs text-zinc-500 uppercase tracking-wider">{t('personalCoachSub')}</span>
                    </motion.div>
                    <div className="w-px h-10 bg-white/10" />
                    <motion.div
                        className="flex flex-col items-center"
                        whileHover={{ scale: 1.05 }}
                    >
                        <span className="text-2xl font-bold text-white flex items-center gap-1">
                            {t('rating')}{" "}
                            <motion.span
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                            >
                                <Star className="h-4 w-4 fill-primary text-primary" />
                            </motion.span>
                        </span>
                        <span className="text-xs text-zinc-500 uppercase tracking-wider">{t('ratingSub')}</span>
                    </motion.div>
                </motion.div>

            </div>

            {/* Dashboard Preview — hidden on mobile */}
            <div className="hidden md:block w-full">
                <DashboardPreview />
            </div>

        </section>
    );
}
