import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { CoachInterface } from "@/components/coach/CoachInterface";
import { Sparkles } from "lucide-react";

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
                {/* Simple Header */}
                <div className="px-6 py-4 lg:px-8 border-b border-zinc-800">
                    <div className="flex items-center gap-3 max-w-[1400px] mx-auto">
                        <div className="flex items-center gap-2 text-primary">
                            <Sparkles className="h-4 w-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">AI Coach</span>
                        </div>
                        <span className="text-sm text-zinc-500">
                            Describe tus objetivos y crearé una rutina personalizada
                        </span>
                    </div>
                </div>

                {/* Full-height Chat Area */}
                <div className="flex-1 overflow-hidden">
                    <CoachInterface currentHabits={habits || []} />
                </div>
            </main>
        </div>
    );
}

