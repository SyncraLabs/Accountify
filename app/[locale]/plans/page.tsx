import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { CreditCard, Crown, Sparkles, Zap, Globe, Trophy, Calendar } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function PlansPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const t = await getTranslations("plans");

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
                            <span className="text-xs font-medium uppercase tracking-wider">{t("badge")}</span>
                        </div>
                        <h1 className="text-2xl font-semibold text-white">{t("title")}</h1>
                        <p className="text-sm text-zinc-500 max-w-md">
                            {t("subtitle")}
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
                                    <h2 className="text-base font-semibold text-white">{t("currentPlan.title")}</h2>
                                    <p className="text-xs text-zinc-500">{t("currentPlan.subtitle")}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
                            <div className="p-2 rounded-lg bg-emerald-500/10">
                                <Zap className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div className="flex-1">
                                <span className="text-sm font-semibold text-white">{t("free.name")}</span>
                                <p className="text-xs text-zinc-500">{t("free.features")}</p>
                            </div>
                            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 rounded-full">
                                {t("active")}
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
                                            <h2 className="text-base font-semibold text-white">{t("premium.title")}</h2>
                                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-yellow-400 bg-yellow-500/15 border border-yellow-500/20 rounded-full">
                                                {t("premium.comingSoon")}
                                            </span>
                                        </div>
                                        <p className="text-xs text-zinc-500 mt-0.5">
                                            {t("premium.subtitle")}
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
                                        <span className="text-sm font-semibold text-white">{t("premium.pro.name")}</span>
                                        <span className="text-xs text-zinc-500">{t("premium.pro.price")}</span>
                                    </div>
                                    <ul className="space-y-1.5 text-xs text-zinc-400">
                                        <li className="flex items-center gap-1.5">
                                            <span className="text-primary">✓</span> {t("premium.pro.features.habits")}
                                        </li>
                                        <li className="flex items-center gap-1.5">
                                            <span className="text-primary">✓</span> {t("premium.pro.features.groups")}
                                        </li>
                                        <li className="flex items-center gap-1.5">
                                            <span className="text-primary">✓</span> {t("premium.pro.features.aiCoach")}
                                        </li>
                                        <li className="flex items-center gap-1.5">
                                            <span className="text-primary">✓</span> {t("premium.pro.features.analytics")}
                                        </li>
                                    </ul>
                                </div>

                                {/* Squad Leader */}
                                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/60 hover:border-yellow-500/20 transition-colors">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Crown className="h-4 w-4 text-yellow-400" />
                                        <span className="text-sm font-semibold text-white">{t("premium.squadLeader.name")}</span>
                                        <span className="text-xs text-zinc-500">{t("premium.squadLeader.price")}</span>
                                    </div>
                                    <ul className="space-y-1.5 text-xs text-zinc-400">
                                        <li className="flex items-center gap-1.5">
                                            <span className="text-yellow-400">✓</span> {t("premium.squadLeader.features.everything")}
                                        </li>
                                        <li className="flex items-center gap-1.5">
                                            <span className="text-yellow-400">✓</span> {t("premium.squadLeader.features.aiCoach")}
                                        </li>
                                        <li className="flex items-center gap-1.5">
                                            <span className="text-yellow-400">✓</span> {t("premium.squadLeader.features.dashboard")}
                                        </li>
                                        <li className="flex items-center gap-1.5">
                                            <span className="text-yellow-400">✓</span> {t("premium.squadLeader.features.support")}
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
                                <p className="text-xs text-zinc-400 mb-1">
                                    {t("notify.message")}
                                </p>
                                <p className="text-[10px] text-zinc-600">
                                    {t("notify.earlyAdopters")} 🎉
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
                                        <h2 className="text-base font-semibold text-white">{t("openCommunities.title")}</h2>
                                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/15 border border-blue-500/20 rounded-full">
                                            {t("openCommunities.comingSoon")}
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-0.5">
                                        {t("openCommunities.subtitle")}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
                                    <Globe className="h-4 w-4 text-zinc-500" />
                                    <span className="text-[10px] text-zinc-400 text-center">{t("openCommunities.features.directory")}</span>
                                </div>
                                <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
                                    <Trophy className="h-4 w-4 text-zinc-500" />
                                    <span className="text-[10px] text-zinc-400 text-center">{t("openCommunities.features.challenges")}</span>
                                </div>
                                <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
                                    <Calendar className="h-4 w-4 text-zinc-500" />
                                    <span className="text-[10px] text-zinc-400 text-center">{t("openCommunities.features.events")}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
