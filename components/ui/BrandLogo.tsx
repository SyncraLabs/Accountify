import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
    className?: string;
    showText?: boolean;
    size?: "sm" | "md" | "lg";
}

export function BrandLogo({ className, showText = true, size = "md" }: BrandLogoProps) {
    const sizeClasses = {
        sm: "h-6 w-6",
        md: "h-8 w-8",
        lg: "h-10 w-10"
    };

    const textSizeClasses = {
        sm: "text-lg",
        md: "text-xl",
        lg: "text-2xl"
    };

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className={cn("relative shrink-0", sizeClasses[size])}>
                <Image
                    src="/icon.svg"
                    alt="Accountify Logo"
                    fill
                    className="object-contain"
                />
            </div>
            {showText && (
                <span className={cn("font-bold tracking-tight text-white", textSizeClasses[size])}>
                    Accountify
                </span>
            )}
        </div>
    );
}
