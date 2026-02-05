"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    LayoutDashboard,
    Calendar,
    Users,
    Bot,
    Settings,
    LogOut,
    CreditCard,
    UserCircle
} from "lucide-react";
import { signOut } from "@/app/auth/actions";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    user?: any;
    className?: string; // Add className prop to definition
}

export function AppSidebar({ className, user }: SidebarProps) {
    const pathname = usePathname();

    const routes = [
        {
            section: "APLICACIÓN",
            items: [
                {
                    label: "Dashboard",
                    icon: LayoutDashboard,
                    href: "/dashboard",
                    active: pathname === "/dashboard",
                },
                {
                    label: "Calendario",
                    icon: Calendar,
                    href: "/calendar",
                    active: pathname === "/calendar",
                }
            ]
        },
        {
            section: "COMUNIDAD",
            items: [
                {
                    label: "Grupos",
                    icon: Users,
                    href: "/groups",
                    active: pathname === "/groups",
                },
                {
                    label: "AI Coach",
                    icon: Bot,
                    href: "/coach",
                    active: pathname === "/coach",
                }
            ]
        },
        {
            section: "AJUSTES",
            items: [
                {
                    label: "Configuración",
                    icon: Settings,
                    href: "/settings",
                    active: pathname === "/settings",
                }

            ]
        }
    ];

    return (
        <div className={cn("hidden md:flex flex-col h-screen fixed left-0 top-0 bottom-0 z-50 w-64 bg-black border-r border-white/5", className)}>
            {/* Header / Logo */}
            <div className="h-16 flex items-center px-6 border-b border-white/5">
                <div className="flex items-center gap-2 font-bold text-white tracking-tight">
                    <div className="h-6 w-6 relative">
                        <Image
                            src="/logo.svg"
                            alt="Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    Accountify
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
                {routes.map((group, i) => (
                    <div key={i}>
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 px-2">
                            {group.section}
                        </h4>
                        <div className="space-y-1">
                            {group.items.map((route) => (
                                <Link key={route.href} href={route.href} className="block">
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            "w-full justify-start h-9 px-3 text-sm font-medium transition-all duration-200",
                                            route.active
                                                ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary border-l-2 border-primary rounded-none rounded-r-md"
                                                : "text-zinc-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                                        )}
                                    >
                                        <route.icon className={cn("h-4 w-4 mr-3", route.active ? "text-primary" : "text-zinc-500 group-hover:text-white")} />
                                        {route.label}
                                    </Button>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-white/5 bg-zinc-950/30">

                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-medium text-white border border-white/10">
                            {user?.user_metadata?.full_name?.[0] || <UserCircle className="h-5 w-5 text-zinc-400" />}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-xs font-medium text-white truncate max-w-[100px]">{user?.user_metadata?.full_name || "User"}</span>
                            <span className="text-[10px] text-zinc-500 truncate max-w-[100px]">{user?.email}</span>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-destructive hover:bg-destructive/10" onClick={() => signOut()}>
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
