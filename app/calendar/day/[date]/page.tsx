import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DayHabitView } from "@/components/habits/DayHabitView";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Vista Diaria | Accountify',
    description: 'Gestiona tus hábitos del día',
};

// Define the params interface for Next.js app directory
interface PageProps {
    params: Promise<{ date: string }>;
}

export default async function DayPage({ params }: PageProps) {
    const { date } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Validate simple date format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date) || isNaN(Date.parse(date))) {
        redirect("/calendar"); // Redirect to main calendar if invalid
    }

    // Fetch habits with their logs
    // We fetch all logs for simplicity in checking completion on Client, 
    // though in production with massive data we might want to filter this more efficiently.
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

    // Rehydrate the serialized data if needed, but here simple passing works.

    return (
        <div className="flex min-h-screen bg-black">
            {/* Sidebar */}
            <div className="hidden md:block w-64 fixed inset-y-0 z-50">
                <AppSidebar user={user} />
            </div>

            <main className="md:pl-64 flex-1 relative">
                <div className="h-full px-6 py-10 lg:px-10 space-y-8 max-w-[1400px] mx-auto min-h-screen">
                    <DayHabitView initialHabits={transformedHabits} dateStr={date} />
                </div>
            </main>
        </div>
    );
}
