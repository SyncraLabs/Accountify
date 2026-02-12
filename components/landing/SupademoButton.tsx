"use client";

import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

declare global {
    interface Window {
        Supademo?: {
            open: (id: string) => void;
        };
    }
}

export function SupademoButton() {
    const t = useTranslations('landing');

    const handleClick = () => {
        if (window.Supademo) {
            window.Supademo.open('cmli8s2ww28ns53517x4zm7ro');
        } else {
            console.warn("Supademo script not loaded yet");
        }
    };

    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
        >
            <Button
                variant="outline"
                onClick={handleClick}
                className="h-12 px-8 rounded-full border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary transition-all text-base backdrop-blur-sm"
            >
                <PlayCircle className="mr-2 h-5 w-5" />
                {t('watchDemo')}
            </Button>
        </motion.div>
    );
}
