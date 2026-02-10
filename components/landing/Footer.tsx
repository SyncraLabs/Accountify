"use client";

import { Link } from "@/i18n/routing";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" as const },
    },
};

export function Footer() {
    const t = useTranslations('landing.footer');

    const footerLinks = {
        product: [
            { label: t('product.features'), href: "/#features" },
            { label: t('product.pricing'), href: "#" },
            { label: t('product.roadmap'), href: "#" },
        ],
        company: [
            { label: t('company.about'), href: "#" },
            { label: t('company.blog'), href: "#" },
            { label: t('company.careers'), href: "#" },
        ],
        legal: [
            { label: t('legal.privacy'), href: "#" },
            { label: t('legal.terms'), href: "#" },
        ],
    };

    return (
        <footer className="border-t border-zinc-800 bg-black relative overflow-hidden">
            {/* Subtle gradient overlay */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-32 bg-primary/5 blur-[100px] pointer-events-none" />

            <motion.div
                className="max-w-6xl mx-auto px-6 py-16 relative z-10"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
            >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    <motion.div variants={itemVariants} className="space-y-4">
                        <motion.div
                            className="flex items-center gap-2"
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <Image src="/logo.svg" alt="Accountify" width={24} height={24} className="rounded" />
                            <span className="text-sm font-semibold text-white">Accountify</span>
                        </motion.div>
                        <p className="text-xs text-zinc-500">
                            {t('tagline')}
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-4">{t('product.title')}</h4>
                        <ul className="space-y-2 text-sm text-zinc-500">
                            {footerLinks.product.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="hover:text-primary transition-colors inline-block"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-4">{t('company.title')}</h4>
                        <ul className="space-y-2 text-sm text-zinc-500">
                            {footerLinks.company.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="hover:text-primary transition-colors inline-block"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-4">{t('legal.title')}</h4>
                        <ul className="space-y-2 text-sm text-zinc-500">
                            {footerLinks.legal.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="hover:text-primary transition-colors inline-block"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                <motion.div
                    variants={itemVariants}
                    className="mt-16 pt-8 border-t border-zinc-800 text-center text-xs text-zinc-600"
                >
                    © {new Date().getFullYear()} Accountify. {t('rights')}
                </motion.div>
            </motion.div>
        </footer>
    );
}

