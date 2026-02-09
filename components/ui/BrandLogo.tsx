import { cn } from "@/lib/utils";

interface BrandLogoProps {
    className?: string;
    showText?: boolean;
    size?: "sm" | "md" | "lg";
}

export function BrandLogo({ className, showText = true, size = "md" }: BrandLogoProps) {
    const sizeClasses = {
        sm: { icon: "h-6 w-6", text: "text-lg" },
        md: { icon: "h-8 w-8", text: "text-xl" },
        lg: { icon: "h-10 w-10", text: "text-2xl" }
    };

    const iconSize = {
        sm: 24,
        md: 32,
        lg: 40
    };

    return (
        <div className={cn("flex items-center gap-2.5", className)}>
            {/* Custom SVG Logo - Rising chart with checkmark */}
            <div className={cn("relative shrink-0", sizeClasses[size].icon)}>
                <svg
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                >
                    {/* Background circle with gradient */}
                    <defs>
                        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#bff549" />
                            <stop offset="100%" stopColor="#9ed936" />
                        </linearGradient>
                    </defs>
                    <circle cx="20" cy="20" r="18" fill="url(#logoGradient)" />

                    {/* Rising bars representing growth/progress */}
                    <rect x="10" y="22" width="4" height="8" rx="1" fill="#0a0a0a" />
                    <rect x="16" y="17" width="4" height="13" rx="1" fill="#0a0a0a" />
                    <rect x="22" y="12" width="4" height="18" rx="1" fill="#0a0a0a" />

                    {/* Checkmark */}
                    <path
                        d="M27 14L29.5 16.5L33 11"
                        stroke="#0a0a0a"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
            {showText && (
                <span className={cn("font-bold tracking-tight text-white", sizeClasses[size].text)}>
                    Accountify
                </span>
            )}
        </div>
    );
}
