import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { HabitsHub } from "@/components/habits/HabitsHub";

export default async function CalendarPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Fetch habits with their logs
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

    // Transform tasks
    const transformedTasks = (todayTasks || []).map(task => ({
        id: task.id,
        title: task.title,
        priority: task.priority || 'medium',
        completed: task.completed || false,
        completed_at: task.completed_at || null,
        order_index: task.order_index || 0
    }));

    return (
        <div className="flex min-h-screen bg-black overflow-x-hidden w-full">
            {/* Sidebar */}
            <div className="hidden md:block w-64 fixed inset-y-0 z-50">
                <AppSidebar user={user} />
            </div>
            <MobileNav />

            <main className="md:pl-64 flex-1 relative">
                <div className="h-full px-6 py-10 pb-24 md:pb-10 lg:px-10 max-w-[1400px] mx-auto">
                    <HabitsHub
                        initialHabits={transformedHabits}
                        initialTasks={transformedTasks}
                        dateStr={today}
                    />
                </div>
            </main>
        </div>
    );
}

