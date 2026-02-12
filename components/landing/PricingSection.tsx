"use client";

import { motion } from "framer-motion";
import { Check, X, Sparkles, Crown, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useState } from "react";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.6,
            ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
        },
    },
};

interface PricingFeature {
    text: string;
    included: boolean;
    highlight?: boolean;
}

function PricingCard({
    name,
    price,
    annualPrice,
    period,
    description,
    features,
    cta,
    ctaHref,
    popular,
    icon: Icon,
    iconColor,
    borderColor,
    glowColor,
    isAnnual,
}: {
    name: string;
    price: string;
    annualPrice: string;
    period: string;
    description: string;
    features: PricingFeature[];
    cta: string;
    ctaHref: string;
    popular?: boolean;
    icon: React.ElementType;
    iconColor: string;
    borderColor: string;
    glowColor: string;
    isAnnual: boolean;
}) {
    const displayPrice = isAnnual ? annualPrice : price;

    return (
        <motion.div
            variants={cardVariants}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className={`relative flex flex-col p-8 rounded-2xl border transition-all duration-300 ${popular
                ? `${borderColor} bg-zinc-900/80 shadow-[0_0_60px_${glowColor}]`
                : "border-zinc-800 bg-zinc-950/50 hover:border-zinc-700"
                }`}
        >
            {/* Popular Badge */}
            {popular && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-primary text-black text-xs font-bold tracking-wide uppercase shadow-[0_0_20px_rgba(191,245,73,0.3)]"
                >
                    Más Popular
                </motion.div>
            )}

            {/* Header */}
            <div className="mb-6">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium mb-4 ${iconColor}`}>
                    <Icon className="h-4 w-4" />
                    {name}
                </div>
                <div className="flex items-end gap-1 mb-2">
                    <span className="text-4xl font-bold text-white">
                        {displayPrice}
                    </span>
                    {displayPrice !== "€0" && (
                        <span className="text-zinc-500 text-sm mb-1">/{period}</span>
                    )}
                </div>
                <p className="text-sm text-zinc-500">{description}</p>
            </div>

            {/* Features */}
            <div className="flex-1 space-y-3 mb-8">
                {features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                        {feature.included ? (
                            <div className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 ${feature.highlight
                                ? "bg-primary/20 text-primary"
                                : "bg-zinc-800 text-zinc-400"
                                }`}>
                                <Check className="h-3 w-3" />
                            </div>
                        ) : (
                            <div className="mt-0.5 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 bg-zinc-900 text-zinc-700">
                                <X className="h-3 w-3" />
                            </div>
                        )}
                        <span className={`text-sm ${feature.included ? "text-zinc-300" : "text-zinc-600"
                            }`}>
                            {feature.text}
                        </span>
                    </div>
                ))}
            </div>

            {/* CTA */}
            <Link href={ctaHref}>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                        className={`w-full h-12 rounded-xl font-semibold transition-all ${popular
                            ? "bg-primary text-black hover:bg-primary/90 shadow-[0_0_20px_rgba(191,245,73,0.2)] hover:shadow-[0_0_30px_rgba(191,245,73,0.4)]"
                            : "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700"
                            }`}
                    >
                        {cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </motion.div>
            </Link>
        </motion.div>
    );
}

export function PricingSection() {
    const t = useTranslations("landing.pricing");
    const [isAnnual, setIsAnnual] = useState(false);

    const plans = [
        {
            name: t("free.name"),
            price: "€0",
            annualPrice: "€0",
            period: "",
            description: t("free.description"),
            icon: Zap,
            iconColor: "bg-zinc-800 text-zinc-300",
            borderColor: "border-zinc-800",
            glowColor: "transparent",
            ctaHref: "/login?view=signup",
            cta: t("free.cta"),
            features: [
                { text: t("free.features.habits"), included: true, highlight: true },
                { text: t("free.features.group"), included: true, highlight: true },
                { text: t("free.features.chat"), included: true },
                { text: t("free.features.aiCoach"), included: true, highlight: true },
                { text: t("free.features.streaks"), included: true },
                { text: t("free.features.dashboard"), included: true },
                { text: t("free.features.analytics"), included: false },
                { text: t("free.features.streakFreeze"), included: false },
                { text: t("free.features.beta"), included: false },
            ],
        },
        {
            name: t("pro.name"),
            price: "€4.99",
            annualPrice: "€3.33",
            period: t("period"),
            description: t("pro.description"),
            icon: Sparkles,
            iconColor: "bg-primary/15 text-primary",
            borderColor: "border-primary/40",
            glowColor: "rgba(191,245,73,0.08)",
            popular: true,
            ctaHref: "/login?view=signup&plan=pro",
            cta: t("pro.cta"),
            features: [
                { text: t("pro.features.habits"), included: true, highlight: true },
                { text: t("pro.features.groups"), included: true, highlight: true },
                { text: t("pro.features.aiCoach"), included: true, highlight: true },
                { text: t("pro.features.analytics"), included: true },
                { text: t("pro.features.streakFreeze"), included: true },
                { text: t("pro.features.squadSize"), included: true },
                { text: t("pro.features.export"), included: true },
                { text: t("pro.features.beta"), included: true, highlight: true },
                { text: t("pro.features.badges"), included: true },
            ],
        },
        {
            name: t("leader.name"),
            price: "€9.99",
            annualPrice: "€6.67",
            period: t("period"),
            description: t("leader.description"),
            icon: Crown,
            iconColor: "bg-yellow-500/15 text-yellow-400",
            borderColor: "border-yellow-500/30",
            glowColor: "rgba(234,179,8,0.06)",
            ctaHref: "/login?view=signup&plan=leader",
            cta: t("leader.cta"),
            features: [
                { text: t("leader.features.everything"), included: true, highlight: true },
                { text: t("leader.features.aiCoach"), included: true, highlight: true },
                { text: t("leader.features.adminDashboard"), included: true, highlight: true },
                { text: t("leader.features.challenges"), included: true },
                { text: t("leader.features.aiInsights"), included: true },
                { text: t("leader.features.unlimitedSquad"), included: true },
                { text: t("leader.features.streakFreeze"), included: true },
                { text: t("leader.features.prioritySupport"), included: true },
                { text: t("leader.features.earlyAccess"), included: true, highlight: true },
            ],
        },
    ];

    return (
        <section id="pricing" className="py-32 px-6 relative bg-black overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:6rem_6rem]" />
            <motion.div
                className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px]"
                animate={{
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-6 space-y-4"
                >
                    <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
                        {t("title")}{" "}
                        <span className="text-primary">{t("titleHighlight")}</span>
                    </h2>
                    <p className="text-zinc-400 max-w-xl mx-auto text-base">
                        {t("subtitle")}
                    </p>
                </motion.div>

                {/* Billing Toggle */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-center gap-4 mb-16"
                >
                    <span className={`text-sm transition-colors ${!isAnnual ? "text-white" : "text-zinc-500"}`}>
                        {t("monthly")}
                    </span>
                    <button
                        onClick={() => setIsAnnual(!isAnnual)}
                        className={`relative w-14 h-7 rounded-full transition-colors ${isAnnual ? "bg-primary" : "bg-zinc-700"
                            }`}
                    >
                        <motion.div
                            className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
                            animate={{ left: isAnnual ? "calc(100% - 24px)" : "4px" }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    </button>
                    <span className={`text-sm transition-colors ${isAnnual ? "text-white" : "text-zinc-500"}`}>
                        {t("annual")}
                    </span>
                    {isAnnual && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded-full"
                        >
                            {t("savePercent")}
                        </motion.span>
                    )}
                </motion.div>

                {/* Pricing Cards */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
                >
                    {plans.map((plan, i) => (
                        <PricingCard key={i} {...plan} isAnnual={isAnnual} />
                    ))}
                </motion.div>

                {/* Coming Soon Teaser */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="mt-16 text-center"
                >
                    <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
                        <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                        <span className="text-sm text-zinc-400">
                            {t("comingSoon")}
                        </span>
                        <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                            {t("comingSoonBadge")}
                        </span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
