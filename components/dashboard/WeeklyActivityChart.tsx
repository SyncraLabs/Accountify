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

    // Create the path string (smooth curve)
    // Simple line for now, can implement bezier if needed, but linear is often cleaner for daily data
    const pathString = useMemo(() => {
        if (points.length === 0) return "";
        let d = `M ${points[0].x} ${points[0].y}`;

        // Simple straight lines between points
        points.slice(1).forEach(point => {
            d += ` L ${point.x} ${point.y}`;
        });

        return d;
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
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        className="w-full h-full overflow-visible"
                    >
                        {/* Gradient definition */}
                        <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#a3e635" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#a3e635" stopOpacity="0" />
                            </linearGradient>
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
                            strokeWidth="0.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
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
                                        r="2"
                                        fill="#a3e635"
                                        stroke="#000"
                                        strokeWidth="0.5"
                                    />
                                )}
                            </g>
                        ))}
                    </svg>

                    {/* Tooltip */}
                    {hoveredIndex !== null && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute pointer-events-none bg-zinc-900 border border-zinc-800 rounded-lg p-2 shadow-xl z-20 flex flex-col items-center min-w-[100px]"
                            style={{
                                left: `${points[hoveredIndex].x}%`,
                                top: `${points[hoveredIndex].y}%`,
                                transform: 'translate(-50%, -120%)' // Move up above the point
                            }}
                        >
                            <span className="text-xs text-zinc-400 font-medium mb-1">{data[hoveredIndex].label}</span>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#a3e635]" />
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
                            className={`text-[10px] uppercase font-medium transition-colors ${hoveredIndex === i ? 'text-[#a3e635]' : 'text-zinc-600'}`}
                        >
                            {d.label}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
