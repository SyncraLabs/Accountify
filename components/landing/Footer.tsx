"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const footerLinks = {
    product: [
        { label: "Features", href: "/#features" },
        { label: "Pricing", href: "#" },
        { label: "Roadmap", href: "#" },
    ],
    company: [
        { label: "About", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Careers", href: "#" },
    ],
    legal: [
        { label: "Privacy", href: "#" },
        { label: "Terms", href: "#" },
    ],
};

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
                            Construyendo mejores hábitos, un día a la vez.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-4">Producto</h4>
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
                        <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-4">Compañía</h4>
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
                        <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-4">Legal</h4>
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
                    © {new Date().getFullYear()} Accountify. Todos los derechos reservados.
                </motion.div>
            </motion.div>
        </footer>
    );
}

