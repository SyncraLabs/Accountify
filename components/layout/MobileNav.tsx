"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Calendar, Users, Bot, Settings } from "lucide-react";

export function MobileNav() {
    const pathname = usePathname();

    const routes = [
        {
            label: "Inicio",
            icon: LayoutDashboard,
            href: "/dashboard",
            active: pathname === "/dashboard",
        },
        {
            label: "Calendario",
            icon: Calendar,
            href: "/calendar",
            active: pathname === "/calendar",
        },
        {
            label: "Grupos",
            icon: Users,
            href: "/groups",
            active: pathname.startsWith("/groups"),
        },
        {
            label: "Coach",
            icon: Bot,
            href: "/coach",
            active: pathname === "/coach",
        },
        {
            label: "Ajustes",
            icon: Settings,
            href: "/settings",
            active: pathname === "/settings",
        },
    ];

    return (
        <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
            <div className="flex items-center justify-between bg-zinc-900/90 backdrop-blur-lg border border-white/10 rounded-2xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                {routes.map((route) => (
                    <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                            "flex flex-col items-center gap-1 transition-all duration-300",
                            route.active ? "text-primary transform scale-105" : "text-zinc-500 hover:text-white"
                        )}
                    >
                        <route.icon className={cn("h-5 w-5", route.active && "fill-primary/20")} />
                        {/* Label hidden on very small screens if needed, but usually fine */}
                        <span className="text-[10px] font-medium">{route.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
