import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { HabitCalendar } from "@/components/habits/HabitCalendar";
import { Calendar } from "lucide-react";

export default async function CalendarPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch habits with their logs
    const { data: habits } = await supabase
        .from('habits')
        .select(`
            id,
            title,
            category,
            streak,
            habit_logs (
                completed_date
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    // Transform the data for the component
    const transformedHabits = (habits || []).map(habit => ({
        id: habit.id,
        title: habit.title,
        category: habit.category,
        streak: habit.streak || 0,
        logs: habit.habit_logs || []
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
                            <span className="text-xs font-medium uppercase tracking-wider">Calendario</span>
                        </div>
                        <h1 className="text-2xl font-semibold text-white">Tu Legado</h1>
                        <p className="text-sm text-zinc-500 max-w-md">
                            Visualiza tu progreso. Cada día cuenta. No rompas la cadena.
                        </p>
                    </div>

                    <HabitCalendar initialHabits={transformedHabits} />
                </div>
            </main>
        </div>
    );
}

