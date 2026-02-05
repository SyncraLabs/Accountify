"use client";

import { motion } from "framer-motion";

interface FramerWrapperProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}

export function FramerWrapper({ children, className, delay = 0, variant = 'fade' }: FramerWrapperProps & { variant?: 'fade' | 'scale' | 'slideUp' | 'slideLeft' | 'slideRight' }) {
    const variants = {
        fade: {
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
        },
        scale: {
            hidden: { opacity: 0, scale: 0.95 },
            visible: { opacity: 1, scale: 1 },
        },
        slideUp: {
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
        },
        slideLeft: {
            hidden: { opacity: 0, x: 20 },
            visible: { opacity: 1, x: 0 },
        },
        slideRight: {
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 },
        }
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants[variant]}
            transition={{ duration: 0.4, delay: delay, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
