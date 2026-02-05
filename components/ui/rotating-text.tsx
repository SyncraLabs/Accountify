"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface RotatingTextProps {
    texts: string[];
    interval?: number;
    className?: string;
    staggerDuration?: number;
}

export function RotatingText({ texts, interval = 3000, className = "", staggerDuration = 0 }: RotatingTextProps) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % texts.length);
        }, interval);
        return () => clearInterval(timer);
    }, [texts, interval]);

    return (
        <span className={`inline-flex flex-col h-[1.1em] overflow-hidden align-top relative ${className}`}>
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                    key={texts[index]}
                    initial={{ y: "100%", opacity: 0, filter: "blur(4px)" }}
                    animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
                    exit={{ y: "-100%", opacity: 0, filter: "blur(4px)" }}
                    transition={{
                        type: "spring",
                        damping: 20,
                        stiffness: 100
                    }}
                    className="flex-shrink-0 text-left whitespace-nowrap"
                >
                    {texts[index]}
                </motion.div>
            </AnimatePresence>
        </span>
    );
}
