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
import { TodayPlannerCard } from "@/components/planner";
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

    // Check today's completion and calculate streaks
    const today = new Date().toISOString().split('T')[0];

    // Fetch today's tasks
    const { data: todayTasks } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('scheduled_date', today)
        .order('order_index', { ascending: true });

    // Helper function to calculate streak for a habit
    const calculateStreak = (logs: { completed_date: string }[] | null) => {
        if (!logs || logs.length === 0) return 0;

        // Sort logs by date descending
        const sortedDates = logs
            .map(log => log.completed_date)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        // Check if completed today or yesterday (streak is still active)
        const yesterdayDate = new Date(today);
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

        const mostRecentDate = sortedDates[0];
        if (mostRecentDate !== today && mostRecentDate !== yesterdayStr) {
            return 0; // Streak broken
        }

        // Count consecutive days
        let streak = 0;
        const currentDate = new Date(mostRecentDate);

        for (const dateStr of sortedDates) {
            const logDate = new Date(dateStr);
            const diffDays = Math.round((currentDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else if (diffDays === 1) {
                // Skip if we already counted this day
                continue;
            } else {
                break; // Gap in streak
            }
        }

        return streak;
    };

    const habitsWithCompletion = (habits || []).map(habit => ({
        ...habit,
        completedToday: habit.habit_logs?.some((log: any) => log.completed_date === today) || false,
        streak: calculateStreak(habit.habit_logs),
        logs: habit.habit_logs, // Alias for DashboardStats compatibility
    }));

    // Group habits by routine
    const routineGroups = (routines || []).map(routine => ({
        routine,
        habits: habitsWithCompletion.filter(h => h.routine_id === routine.id)
    })).filter(group => group.habits.length > 0);

    // Get standalone habits (no routine)
    const standaloneHabits = habitsWithCompletion.filter(h => !h.routine_id);

    const _completedToday = habitsWithCompletion.filter(h => h.completedToday).length;
    const _totalHabits = habitsWithCompletion.length;
    const _totalCompleted = habitsWithCompletion.reduce((acc, h) => acc + (h.habit_logs?.length || 0), 0);

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

    // Transform tasks for TodayPlannerCard
    const transformedTasks = (todayTasks || []).map(task => ({
        id: task.id,
        title: task.title,
        priority: task.priority || 'medium',
        completed: task.completed || false
    }));

    // Transform habits for TodayPlannerCard (simplified)
    const habitsForPlanner = habitsWithCompletion.map(h => ({
        id: h.id,
        title: h.title
    }));

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
                        {/* Stats Row */}
                        <DashboardStats habits={habitsWithCompletion} />

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

                            {/* Right Column: Today's Planner, Groups & Progress Graph */}
                            <div className="space-y-8">
                                {/* Today's Planner */}
                                <TodayPlannerCard
                                    tasks={transformedTasks}
                                    habits={habitsForPlanner}
                                    dateStr={today}
                                />

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

