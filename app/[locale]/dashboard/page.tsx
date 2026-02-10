import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardHabitRow } from "@/components/dashboard/DashboardHabitRow";
import { DashboardRoutineGroup } from "@/components/dashboard/DashboardRoutineGroup";
import { DashboardGroupCard } from "@/components/dashboard/DashboardGroupCard";
import { WeeklyActivityChart } from "@/components/dashboard/WeeklyActivityChart";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { getUserGroups } from "@/app/[locale]/groups/actions";
import { hasCompletedAppOnboarding } from "@/app/[locale]/onboarding/actions";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

export default async function Dashboard() {
    const t = await getTranslations('dashboard');
    const locale = await getLocale();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch user's habits with routine info
    const { data: habits } = await supabase
        .from('habits')
        .select(`
            id,
            title,
            category,
            frequency,
            routine_id,
            habit_logs (
                completed_date
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    // Fetch user's routines
    const { data: routines } = await supabase
        .from('routines')
        .select('id, title, description, category')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    // Check today's completion
    const today = new Date().toISOString().split('T')[0];
    const habitsWithCompletion = (habits || []).map(habit => ({
        ...habit,
        completedToday: habit.habit_logs?.some((log: any) => log.completed_date === today) || false
    }));

    // Group habits by routine
    const routineGroups = (routines || []).map(routine => ({
        routine,
        habits: habitsWithCompletion.filter(h => h.routine_id === routine.id)
    })).filter(group => group.habits.length > 0);

    // Get standalone habits (no routine)
    const standaloneHabits = habitsWithCompletion.filter(h => !h.routine_id);

    const completedToday = habitsWithCompletion.filter(h => h.completedToday).length;
    const totalHabits = habitsWithCompletion.length;
    const totalCompleted = habitsWithCompletion.reduce((acc, h) => acc + (h.habit_logs?.length || 0), 0);

    // Calculate weekly data
    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d;
    });

    const weeklyData = last7Days.map(date => {
        const dateString = date.toISOString().split('T')[0];

        let count = 0;
        habitsWithCompletion.forEach(habit => {
            if (habit.habit_logs?.some((log: any) => log.completed_date === dateString)) {
                count++;
            }
        });

        return {
            date: dateString,
            count,
            label: date.toLocaleDateString(locale, { weekday: 'short' }).slice(0, 1).toUpperCase()
        };
    });

    // Fetch user's groups
    const userGroups = await getUserGroups();

    // Limit groups to show on dashboard (e.g. 3)
    const displayedGroups = userGroups.slice(0, 3);

    // Check if user has completed app onboarding
    const hasCompletedOnboarding = await hasCompletedAppOnboarding();

    return (
        <DashboardClient showOnboarding={!hasCompletedOnboarding}>
            <div className="flex min-h-screen bg-black">
                {/* Sidebar - Desktop Only for now (Mobile TBD) */}
                <AppSidebar user={user} className="hidden md:flex" />
                <MobileNav />

                {/* Main Content */}
                <main className="md:pl-64 flex-1 relative bg-black min-h-screen">
                    <div className="h-full px-8 py-8 pb-24 md:pb-8 space-y-8 max-w-[1600px] mx-auto">
                        {/* Header */}
                        <div className="flex flex-col gap-2 mb-8">
                            <div className="flex items-center gap-3">
                                <BrandLogo size="lg" showText={false} />
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
                                        {t('welcome')}
                                    </h1>
                                    <p className="text-zinc-500 text-sm">
                                        {t('subtitle')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <DashboardStats
                            completedToday={completedToday}
                            totalHabits={totalHabits}
                            activeGroups={userGroups.length}
                            totalCompleted={totalCompleted}
                        />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Column: Habits */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-semibold text-white">{t('todaysHabits')}</h3>
                                    <Link href="/calendar">
                                        <Button variant="ghost" className="text-zinc-400 hover:text-white">
                                            {t('viewCalendar')} <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>

                                <div className="space-y-3">
                                    {habitsWithCompletion.length === 0 ? (
                                        <div className="p-8 border border-dashed border-zinc-800 rounded-xl text-center bg-zinc-950/50">
                                            <p className="text-zinc-500 text-sm mb-4">{t('noHabits')}</p>
                                            <Link href="/coach">
                                                <Button size="sm" className="bg-primary text-black hover:bg-primary/90">{t('createWithAI')}</Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Routine Groups */}
                                            {routineGroups.map((group) => (
                                                <DashboardRoutineGroup
                                                    key={group.routine.id}
                                                    routine={group.routine}
                                                    habits={group.habits}
                                                />
                                            ))}

                                            {/* Standalone Habits */}
                                            {standaloneHabits.map((habit) => (
                                                <DashboardHabitRow key={habit.id} habit={habit} />
                                            ))}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Right Column: Groups & Progress Graph (Placeholder/Future) */}
                            <div className="space-y-8">
                                {/* Groups Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-white">{t('yourGroups')}</h3>
                                        <Link href="/groups">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>

                                    <div className="space-y-3">
                                        {displayedGroups.length === 0 ? (
                                            <div className="p-6 border border-dashed border-zinc-800 rounded-xl text-center bg-zinc-950/50">
                                                <p className="text-zinc-500 text-xs mb-3">{t('noGroups')}</p>
                                                <Link href="/groups">
                                                    <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">{t('searchGroups')}</Button>
                                                </Link>
                                            </div>
                                        ) : (
                                            displayedGroups.map((group) => (
                                                <DashboardGroupCard key={group.id} group={group} />
                                            ))
                                        )}
                                    </div>
                                    {userGroups.length > 3 && (
                                        <Link href="/groups" className="block text-center text-xs text-zinc-500 hover:text-primary transition-colors">
                                            {t('viewAllGroups', { count: userGroups.length })}
                                        </Link>
                                    )}
                                </div>

                                {/* Weekly Progress Graph */}
                                <div className="bg-[#0f0f10] border border-zinc-800 rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-base font-semibold text-white">{t('weeklyActivity')}</h3>
                                            <p className="text-xs text-zinc-500">{t('last7Days')}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-white">
                                                {habitsWithCompletion.reduce((acc, h) => acc + (h.habit_logs?.length || 0), 0)}
                                            </div>
                                            <p className="text-xs text-zinc-500">{t('totalCompleted')}</p>
                                        </div>
                                    </div>
                                    <WeeklyActivityChart data={weeklyData} />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </DashboardClient>
    );
}

