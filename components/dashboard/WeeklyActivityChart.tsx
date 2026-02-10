"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

interface WeeklyActivityChartProps {
    data: {
        date: string;
        count: number;
        label: string;
    }[];
}

export function WeeklyActivityChart({ data }: WeeklyActivityChartProps) {
    const t = useTranslations('dashboard.habits');
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const maxCount = useMemo(() => {
        const max = Math.max(...data.map(d => d.count));
        return max === 0 ? 5 : max + 2;
    }, [data]);

    // Generate points with padding for better visuals
    const points = useMemo(() => {
        const padding = 8; // percentage padding on sides
        const usableWidth = 100 - padding * 2;

        return data.map((d, i) => {
            const x = padding + (i / (data.length - 1)) * usableWidth;
            const y = 85 - (d.count / maxCount) * 70; // Keep within 15-85 range
            return { x, y, ...d };
        });
    }, [data, maxCount]);

    // Smooth catmull-rom spline
    const getSmoothPath = (pts: { x: number; y: number }[]) => {
        if (pts.length < 2) return "";

        const tension = 0.3;
        let d = `M ${pts[0].x} ${pts[0].y}`;

        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[Math.max(0, i - 1)];
            const p1 = pts[i];
            const p2 = pts[i + 1];
            const p3 = pts[Math.min(pts.length - 1, i + 2)];

            const cp1x = p1.x + (p2.x - p0.x) * tension;
            const cp1y = p1.y + (p2.y - p0.y) * tension;
            const cp2x = p2.x - (p3.x - p1.x) * tension;
            const cp2y = p2.y - (p3.y - p1.y) * tension;

            d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
        }
        return d;
    };

    const pathString = useMemo(() => getSmoothPath(points), [points]);

    const areaPathString = useMemo(() => {
        if (!pathString || points.length === 0) return "";
        return `${pathString} L ${points[points.length - 1].x} 100 L ${points[0].x} 100 Z`;
    }, [pathString, points]);

    return (
        <div className="w-full relative select-none">
            <div className="h-[140px] w-full relative">
                <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="w-full h-full"
                >
                    <defs>
                        {/* Subtle gradient fill */}
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#a3e635" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#a3e635" stopOpacity="0" />
                        </linearGradient>

                        {/* Soft glow for the line */}
                        <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />
                            <feColorMatrix in="blur" type="matrix" values="
                                0 0 0 0 0.639
                                0 0 0 0 0.902
                                0 0 0 0 0.208
                                0 0 0 0.4 0" />
                        </filter>
                    </defs>

                    {/* Area fill with animation */}
                    <motion.path
                        d={areaPathString}
                        fill="url(#areaGradient)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    />

                    {/* Glow layer */}
                    <motion.path
                        d={pathString}
                        fill="none"
                        stroke="#a3e635"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#lineGlow)"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        vectorEffect="non-scaling-stroke"
                    />

                    {/* Main line */}
                    <motion.path
                        d={pathString}
                        fill="none"
                        stroke="#a3e635"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        vectorEffect="non-scaling-stroke"
                    />
                </svg>

                {/* Interactive layer with points */}
                <div className="absolute inset-0">
                    {points.map((point, i) => (
                        <div
                            key={i}
                            className="absolute cursor-pointer"
                            style={{
                                left: `${point.x}%`,
                                top: 0,
                                bottom: 0,
                                width: `${100 / data.length}%`,
                                transform: 'translateX(-50%)',
                            }}
                            onMouseEnter={() => setHoveredIndex(i)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            {/* Data point */}
                            <motion.div
                                className="absolute"
                                style={{
                                    left: '50%',
                                    top: `${point.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                }}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{
                                    scale: hoveredIndex === i ? 1 : 0.6,
                                    opacity: hoveredIndex === i ? 1 : 0
                                }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                                <div className="w-3 h-3 rounded-full bg-[#a3e635] shadow-[0_0_12px_rgba(163,230,53,0.6)]" />
                            </motion.div>
                        </div>
                    ))}
                </div>

                {/* Tooltip */}
                <AnimatePresence>
                    {hoveredIndex !== null && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="absolute pointer-events-none z-10"
                            style={{
                                left: `${points[hoveredIndex].x}%`,
                                top: `${Math.max(points[hoveredIndex].y - 12, 8)}%`,
                                transform: 'translate(-50%, -100%)',
                            }}
                        >
                            <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-800 rounded-lg px-3 py-2 shadow-xl">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#a3e635]" />
                                    <span className="text-sm font-semibold text-white">
                                        {data[hoveredIndex].count}
                                    </span>
                                    <span className="text-xs text-zinc-500">
                                        {t('tooltipLabel')}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* X Axis Labels */}
            <div className="flex justify-between w-full mt-3 px-1">
                {data.map((d, i) => (
                    <motion.span
                        key={i}
                        className="text-[11px] font-medium text-zinc-600 w-6 text-center"
                        animate={{
                            color: hoveredIndex === i ? '#a3e635' : '#52525b',
                        }}
                        transition={{ duration: 0.15 }}
                    >
                        {d.label}
                    </motion.span>
                ))}
            </div>
        </div>
    );
}
