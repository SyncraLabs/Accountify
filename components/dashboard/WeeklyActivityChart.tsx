"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

interface WeeklyActivityChartProps {
    data: {
        date: string;
        count: number;
        label: string; // e.g. "Mon", "Tue"
    }[];
}

export function WeeklyActivityChart({ data }: WeeklyActivityChartProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // Calculate dimensions and scales
    const height = 180;
    const width = 100; // Percent
    const padding = 20;

    const maxCount = useMemo(() => {
        const max = Math.max(...data.map(d => d.count));
        return max === 0 ? 5 : max + 1; // Ensure some height if all 0
    }, [data]);

    // Generate points for the SVG path
    const points = useMemo(() => {
        return data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - (d.count / maxCount) * 100;
            return { x, y, ...d };
        });
    }, [data, maxCount]);

    // Helper to generate smooth path command
    const getSmoothPath = (points: { x: number; y: number }[]) => {
        if (points.length === 0) return "";
        if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

        let d = `M ${points[0].x} ${points[0].y}`;

        for (let i = 0; i < points.length - 1; i++) {
            const current = points[i];
            const next = points[i + 1];

            // Simple smoothing: control points at 1/3 and 2/3 of the way
            // For a more advanced "catmull-rom" style, we'd need p-1 and p+2
            // But for a simple smooth chart, cubic bezier with CP's parallel to the axis 
            // often looks odd. Let's use a "tension" based approach or simple midpoint smoothing.

            // Let's use a standard "catmull-rom" to cubic conversion substitute for simplicity
            // or just simple cubic bezier interpolation.
            // Using a simple technique: Control Point 1 is (current + (next-prev)*smoothing)
            // But we don't have prev for first.

            const p0 = points[i === 0 ? 0 : i - 1];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = points[i + 2] || p2;

            const cp1x = p1.x + (p2.x - p0.x) * 0.15; // 0.15 is tension
            const cp1y = p1.y + (p2.y - p0.y) * 0.15;

            const cp2x = p2.x - (p3.x - p1.x) * 0.15;
            const cp2y = p2.y - (p3.y - p1.y) * 0.15;

            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
        }
        return d;
    };

    // Create the path string (smooth curve)
    const pathString = useMemo(() => {
        return getSmoothPath(points);
    }, [points]);

    // Create area path logic for gradient
    const areaPathString = useMemo(() => {
        if (!pathString) return "";
        return `${pathString} L 100 100 L 0 100 Z`;
    }, [pathString]);

    return (
        <div className="w-full relative select-none">

            <div className="h-[200px] w-full flex flex-col justify-end relative">
                {/* Grid lines (optional) */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                    {[0, 0.5, 1].map((tick) => (
                        <div key={tick} className="border-t border-dashed border-zinc-600 w-full h-0" style={{ top: `${tick * 100}%` }} />
                    ))}
                </div>

                <div className="relative h-full w-full">
                    <svg
                        viewBox="-10 -20 120 140" // Increased padding to prevent clipping of thick strokes and glow
                        preserveAspectRatio="none"
                        className="w-full h-full overflow-visible"
                    >
                        {/* Gradient definition */}
                        <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#a3e635" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#a3e635" stopOpacity="0" />
                            </linearGradient>
                            {/* Glow Filter */}
                            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                                <feColorMatrix in="blur" type="matrix" values="
                                    0 0 0 0 0.639
                                    0 0 0 0 0.902
                                    0 0 0 0 0.208
                                    0 0 0 0.5 0" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Area Fill */}
                        <motion.path
                            d={areaPathString}
                            fill="url(#chartGradient)"
                            stroke="none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        />

                        {/* Line Path */}
                        <motion.path
                            d={pathString}
                            fill="none"
                            stroke="#a3e635"
                            strokeWidth="4" // Bold line
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            filter="url(#glow)" // Apply glow
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 1.2, ease: "easeOut" }} // Smooth easing
                            vectorEffect="non-scaling-stroke"
                        />

                        {/* Hover Points & Tooltip Trigger Areas */}
                        {points.map((point, i) => (
                            <g key={i}>
                                {/* Invisible touch targets for full height */}
                                <rect
                                    x={point.x - 5}
                                    y="0"
                                    width="10"
                                    height="100"
                                    fill="transparent"
                                    onMouseEnter={() => setHoveredIndex(i)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    className="cursor-pointer"
                                />

                                {/* Visible Point on Hover */}
                                {hoveredIndex === i && (
                                    <circle
                                        cx={point.x}
                                        cy={point.y}
                                        r="4" // Slightly larger for interaction
                                        fill="#a3e635"
                                        stroke="#000"
                                        strokeWidth="2"
                                        className="drop-shadow-lg"
                                    />
                                )}
                            </g>
                        ))}
                    </svg>

                    {/* Tooltip */}
                    {hoveredIndex !== null && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className="absolute pointer-events-none bg-zinc-900/90 backdrop-blur-md border border-zinc-700/50 rounded-xl p-2.5 shadow-xl z-20 flex flex-col items-center min-w-[100px]"
                            style={{
                                left: `${points[hoveredIndex].x}%`,
                                top: `${points[hoveredIndex].y}%`,
                                transform: 'translate(-50%, -130%)' // Move up above the point
                            }}
                        >
                            <span className="text-[10px] text-zinc-400 font-medium mb-1 uppercase tracking-wider">{data[hoveredIndex].label}</span>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#a3e635] shadow-[0_0_8px_rgba(163,230,53,0.8)]" />
                                <span className="text-sm font-bold text-white whitespace-nowrap">
                                    {data[hoveredIndex].count} Hábitos
                                </span>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* X Axis Labels */}
                <div className="flex justify-between w-full mt-2 px-2">
                    {data.map((d, i) => (
                        <span
                            key={i}
                            className={`text-[10px] uppercase font-medium transition-all duration-300 ${hoveredIndex === i ? 'text-[#a3e635] scale-110' : 'text-zinc-600'}`}
                        >
                            {d.label}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
