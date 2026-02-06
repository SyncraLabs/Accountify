"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface FramerWrapperProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    variant?: 'fade' | 'scale' | 'slideUp' | 'slideLeft' | 'slideRight' | 'blur';
    triggerOnScroll?: boolean;
    once?: boolean;
    duration?: number;
}

export function FramerWrapper({
    children,
    className,
    delay = 0,
    variant = 'fade',
    triggerOnScroll = false,
    once = true,
    duration = 0.5
}: FramerWrapperProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once, margin: "-50px" });

    const variants = {
        fade: {
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
        },
        scale: {
            hidden: { opacity: 0, scale: 0.9 },
            visible: { opacity: 1, scale: 1 },
        },
        slideUp: {
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0 },
        },
        slideLeft: {
            hidden: { opacity: 0, x: 30 },
            visible: { opacity: 1, x: 0 },
        },
        slideRight: {
            hidden: { opacity: 0, x: -30 },
            visible: { opacity: 1, x: 0 },
        },
        blur: {
            hidden: { opacity: 0, filter: "blur(10px)" },
            visible: { opacity: 1, filter: "blur(0px)" },
        }
    }

    const animationProps = triggerOnScroll
        ? {
            initial: "hidden",
            animate: isInView ? "visible" : "hidden",
        }
        : {
            initial: "hidden",
            animate: "visible",
        };

    return (
        <motion.div
            ref={ref}
            {...animationProps}
            exit="hidden"
            variants={variants[variant]}
            transition={{
                duration,
                delay: delay,
                ease: [0.25, 0.4, 0.25, 1]
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
