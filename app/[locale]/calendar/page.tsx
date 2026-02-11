import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { HabitCalendar } from "@/components/habits/HabitCalendar";
import { TodayPlannerCard } from "@/components/planner";
import { Calendar } from "lucide-react";

export default async function CalendarPage() {
    const t = await getTranslations('calendar');
    const tNav = await getTranslations('navigation');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Fetch habits with their logs (unchanged logic)
    const { data: habits } = await supabase
        .from('habits')
        .select(`
            id,
            title,
            category,
            frequency,
            streak,
            habit_logs (
                completed_date
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    // Fetch today's tasks
    const { data: todayTasks } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('scheduled_date', today)
        .order('order_index', { ascending: true });

    // Transform the data for the component
    const transformedHabits = (habits || []).map(habit => ({
        id: habit.id,
        title: habit.title,
        category: habit.category,
        frequency: habit.frequency || 'daily',
        streak: habit.streak || 0,
        logs: habit.habit_logs || []
    }));

    // Transform tasks for TodayPlannerCard
    const transformedTasks = (todayTasks || []).map(task => ({
        id: task.id,
        title: task.title,
        priority: task.priority || 'medium',
        completed: task.completed || false
    }));

    return (
        <div className="flex min-h-screen bg-black overflow-x-hidden w-full">
            {/* Sidebar */}
            <div className="hidden md:block w-64 fixed inset-y-0 z-50">
                <AppSidebar user={user} />
            </div>
            <MobileNav />

            <main className="md:pl-64 flex-1 relative">
                <div className="h-full px-6 py-10 pb-24 md:pb-10 lg:px-10 space-y-8 max-w-[1400px] mx-auto">
                    {/* Simple Header */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-primary">
                            <Calendar className="h-4 w-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">{tNav('calendar')}</span>
                        </div>
                        <h1 className="text-2xl font-semibold text-white">{t('pageTitle')}</h1>
                        <p className="text-sm text-zinc-500 max-w-md">
                            {t('pageSubtitle')}
                        </p>
                    </div>

                    {/* Today's Planner - Prominent Card */}
                    <TodayPlannerCard
                        tasks={transformedTasks}
                        habits={transformedHabits}
                        dateStr={today}
                    />

                    <HabitCalendar initialHabits={transformedHabits} />
                </div>
            </main>
        </div>
    );
}

