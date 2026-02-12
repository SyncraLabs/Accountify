"use client";

import { Link } from '@/i18n/routing';
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function Navbar() {
    const t = useTranslations('landing.navbar');

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md border-b border-white/5 -z-10" />

            {/* Logo */}
            <Link href="/" className="flex items-center">
                <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                >
                    <Image src="/logo.svg" alt="Accountify" width={36} height={36} className="rounded" />
                </motion.div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
                <Link
                    href="#features"
                    className="text-sm text-zinc-400 hover:text-primary transition-colors relative group"
                >
                    {t('features')}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                </Link>
                <Link
                    href="#pricing"
                    className="text-sm text-zinc-400 hover:text-primary transition-colors relative group"
                >
                    {t('pricing')}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                </Link>
                <Link
                    href="#how-it-works"
                    className="text-sm text-zinc-400 hover:text-primary transition-colors relative group"
                >
                    {t('howItWorks')}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
                <LanguageSwitcher />
                <div className="hidden sm:block h-5 w-px bg-white/10" />
                <Link
                    href="/login"
                    className="hidden sm:block text-sm text-zinc-400 hover:text-white transition-colors"
                >
                    {t('login')}
                </Link>
                <Link href="/login?view=signup">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                        <Button size="sm" className="bg-primary text-black hover:bg-primary/90 text-sm font-medium h-9 px-5 rounded-full shadow-[0_0_15px_rgba(74,222,128,0.2)] hover:shadow-[0_0_25px_rgba(74,222,128,0.4)] transition-shadow">
                            {t('getStarted')}
                        </Button>
                    </motion.div>
                </Link>
            </div>
        </motion.header>
    );
}

