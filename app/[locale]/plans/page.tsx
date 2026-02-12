import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { CreditCard, Crown, Sparkles, Zap, ArrowRight, Globe, Trophy, Calendar } from "lucide-react";

export default async function PlansPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="flex min-h-screen bg-black">
            {/* Sidebar */}
            <div className="hidden md:block w-64 fixed inset-y-0 z-50">
                <AppSidebar user={user} />
            </div>
            <MobileNav />

            <main className="md:pl-64 flex-1 relative">
                <div className="h-full px-6 py-10 pb-24 md:pb-10 lg:px-10 space-y-8 max-w-[800px] mx-auto">
                    {/* Header */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-primary">
                            <CreditCard className="h-4 w-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">Suscripción</span>
                        </div>
                        <h1 className="text-2xl font-semibold text-white">Planes</h1>
                        <p className="text-sm text-zinc-500 max-w-md">
                            Administra tu plan y accede a funciones premium.
                        </p>
                    </div>

                    {/* Current Plan */}
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-white">Plan Actual</h2>
                                    <p className="text-xs text-zinc-500">Tu plan de suscripción</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
                            <div className="p-2 rounded-lg bg-emerald-500/10">
                                <Zap className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div className="flex-1">
                                <span className="text-sm font-semibold text-white">Gratis</span>
                                <p className="text-xs text-zinc-500">10 hábitos · 1 grupo · 3 AI Coach / mes</p>
                            </div>
                            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 rounded-full">
                                Activo
                            </span>
                        </div>
                    </div>

                    {/* Upgrade Section — Coming Soon */}
                    <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6">
                        {/* Subtle gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-yellow-500/3 pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                                        <Crown className="h-5 w-5 text-yellow-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-base font-semibold text-white">Planes Premium</h2>
                                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-yellow-400 bg-yellow-500/15 border border-yellow-500/20 rounded-full">
                                                Próximamente
                                            </span>
                                        </div>
                                        <p className="text-xs text-zinc-500 mt-0.5">
                                            Estamos preparando planes increíbles para ti.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Premium Tiers Preview */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                {/* Pro */}
                                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/60 hover:border-primary/20 transition-colors">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Zap className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-semibold text-white">Pro</span>
                                        <span className="text-xs text-zinc-500">€4.99/mes</span>
                                    </div>
                                    <ul className="space-y-1.5 text-xs text-zinc-400">
                                        <li className="flex items-center gap-1.5">
                                            <span className="text-primary">✓</span> Hábitos ilimitados
                                        </li>
                                        <li className="flex items-center gap-1.5">
                                            <span className="text-primary">✓</span> Grupos ilimitados
                                        </li>
                                        <li className="flex items-center gap-1.5">
                                            <span className="text-primary">✓</span> 10 AI Coach / mes
                                        </li>
                                        <li className="flex items-center gap-1.5">
                                            <span className="text-primary">✓</span> Analíticas avanzadas
                                        </li>
                                    </ul>
                                </div>

                                {/* Squad Leader */}
                                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/60 hover:border-yellow-500/20 transition-colors">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Crown className="h-4 w-4 text-yellow-400" />
                                        <span className="text-sm font-semibold text-white">Squad Leader</span>
                                        <span className="text-xs text-zinc-500">€9.99/mes</span>
                                    </div>
                                    <ul className="space-y-1.5 text-xs text-zinc-400">
                                        <li className="flex items-center gap-1.5">
                                            <span className="text-yellow-400">✓</span> Todo lo de Pro
                                        </li>
                                        <li className="flex items-center gap-1.5">
                                            <span className="text-yellow-400">✓</span> AI Coach ilimitado
                                        </li>
                                        <li className="flex items-center gap-1.5">
                                            <span className="text-yellow-400">✓</span> Dashboard admin
                                        </li>
                                        <li className="flex items-center gap-1.5">
                                            <span className="text-yellow-400">✓</span> Soporte prioritario
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
                                <p className="text-xs text-zinc-400 mb-1">
                                    Te notificaremos cuando los planes premium estén disponibles.
                                </p>
                                <p className="text-[10px] text-zinc-600">
                                    Los early adopters tendrán descuentos exclusivos. 🎉
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Community Open Groups — Coming Soon */}
                    <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-transparent to-purple-500/3 pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                    <Globe className="h-5 w-5 text-blue-400" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-base font-semibold text-white">Comunidades Abiertas</h2>
                                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/15 border border-blue-500/20 rounded-full">
                                            Próximamente
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-0.5">
                                        Conecta con personas de todo el mundo que comparten tus metas.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
                                    <Globe className="h-4 w-4 text-zinc-500" />
                                    <span className="text-[10px] text-zinc-400 text-center">Directorio público</span>
                                </div>
                                <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
                                    <Trophy className="h-4 w-4 text-zinc-500" />
                                    <span className="text-[10px] text-zinc-400 text-center">Desafíos globales</span>
                                </div>
                                <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
                                    <Calendar className="h-4 w-4 text-zinc-500" />
                                    <span className="text-[10px] text-zinc-400 text-center">Eventos</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
