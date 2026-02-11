import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { CoachInterface } from "@/components/coach/CoachInterface";

export default async function CoachPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch user's current habits for context
    const { data: habits } = await supabase
        .from('habits')
        .select('id, title, category, frequency')
        .eq('user_id', user.id);

    return (
        <div className="flex min-h-screen bg-black">
            {/* Sidebar */}
            <AppSidebar user={user} className="hidden md:flex" />
            <MobileNav />

            <main className="md:pl-64 flex-1 relative flex flex-col h-[100dvh]">
                {/* Full-height Chat Area */}
                <div className="flex-1 overflow-hidden">
                    <CoachInterface currentHabits={habits || []} />
                </div>
            </main>
        </div>
    );
}

