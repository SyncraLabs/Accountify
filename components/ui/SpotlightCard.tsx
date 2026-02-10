"use client";

import React, { useRef } from "react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLElement> {
    as?: React.ElementType;
}

export function SpotlightCard({
    children,
    className = "",
    as: Component = "div",
    ...props
}: SpotlightCardProps) {
    const elementRef = useRef<HTMLElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!elementRef.current) return;
        const rect = elementRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        elementRef.current.style.setProperty("--x", `${x}px`);
        elementRef.current.style.setProperty("--y", `${y}px`);
    };

    return (
        <Component
            ref={elementRef}
            onMouseMove={handleMouseMove}
            className={cn("spotlight-card", className)}
            {...props}
        >
            {children}
        </Component>
    );
}
