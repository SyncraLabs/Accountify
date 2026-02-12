"use client";

import * as React from "react";
import { useState, useRef, useCallback } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive overflow-hidden",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/90",
                destructive:
                    "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
                outline:
                    "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                ghost:
                    "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-9 px-4 py-2 has-[>svg]:px-3",
                xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
                sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
                lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
                icon: "size-9",
                "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
                "icon-sm": "size-8",
                "icon-lg": "size-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

interface RippleProps {
    x: number;
    y: number;
    size: number;
}

interface LoadingButtonProps
    extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    loading?: boolean;
    loadingText?: string;
    ripple?: boolean;
    pulse?: boolean;
}

function LoadingButton({
    className,
    variant = "default",
    size = "default",
    asChild = false,
    loading = false,
    loadingText,
    ripple = true,
    pulse = false,
    children,
    onClick,
    disabled,
    ...props
}: LoadingButtonProps) {
    const Comp = asChild ? Slot.Root : "button";
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [ripples, setRipples] = useState<RippleProps[]>([]);

    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            if (ripple && buttonRef.current && !loading && !disabled) {
                const button = buttonRef.current;
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height) * 2;
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                const newRipple = { x, y, size };
                setRipples((prev) => [...prev, newRipple]);

                // Clean up ripple after animation
                setTimeout(() => {
                    setRipples((prev) => prev.slice(1));
                }, 600);
            }

            onClick?.(e);
        },
        [onClick, ripple, loading, disabled]
    );

    const isDisabled = disabled || loading;

    // Determine ripple color based on variant
    const getRippleColor = () => {
        switch (variant) {
            case "default":
                return "rgba(0, 0, 0, 0.2)";
            case "destructive":
                return "rgba(255, 255, 255, 0.3)";
            case "outline":
            case "secondary":
            case "ghost":
                return "rgba(191, 245, 73, 0.3)";
            default:
                return "rgba(255, 255, 255, 0.3)";
        }
    };

    return (
        <motion.button
            ref={buttonRef}
            data-slot="button"
            data-variant={variant}
            data-size={size}
            data-loading={loading}
            className={cn(buttonVariants({ variant, size, className }))}
            onClick={handleClick}
            disabled={isDisabled}
            whileHover={!isDisabled ? { scale: 1.02 } : undefined}
            whileTap={!isDisabled ? { scale: 0.97 } : undefined}
            animate={pulse && !loading ? {
                boxShadow: [
                    "0 0 0 0 rgba(191, 245, 73, 0)",
                    "0 0 0 8px rgba(191, 245, 73, 0.3)",
                    "0 0 0 0 rgba(191, 245, 73, 0)",
                ],
            } : undefined}
            transition={{
                duration: 0.2,
                boxShadow: pulse ? {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                } : undefined,
            }}
            style={{ willChange: 'transform' }}
            {...(props as any)}
        >
            {/* Ripple effects */}
            {ripples.map((rippleProps, index) => (
                <motion.span
                    key={index}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        left: rippleProps.x,
                        top: rippleProps.y,
                        width: rippleProps.size,
                        height: rippleProps.size,
                        backgroundColor: getRippleColor(),
                    }}
                    initial={{ scale: 0, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                />
            ))}

            {/* Content with loading state */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.span
                        key="loading"
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                    >
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {loadingText && <span>{loadingText}</span>}
                    </motion.span>
                ) : (
                    <motion.span
                        key="content"
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                    >
                        {children}
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.button>
    );
}

export { LoadingButton, buttonVariants };
