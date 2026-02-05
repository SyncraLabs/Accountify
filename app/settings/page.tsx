import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { Settings } from "lucide-react";

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch user's current context
    const { data: profile } = await supabase
        .from('profiles')
        .select('context, username, full_name, avatar_url')
        .eq('id', user.id)
        .single();

    return (
        <div className="flex min-h-screen bg-black">
            {/* Sidebar */}
            <div className="hidden md:block w-64 fixed inset-y-0 z-50">
                <AppSidebar user={user} />
            </div>
            <MobileNav />

            <main className="md:pl-64 flex-1 relative">
                <div className="h-full px-6 py-10 lg:px-10 space-y-8 max-w-[1000px] mx-auto">
                    {/* Simple Header */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-primary">
                            <Settings className="h-4 w-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">Configuración</span>
                        </div>
                        <h1 className="text-2xl font-semibold text-white">Tu Configuración</h1>
                        <p className="text-sm text-zinc-500 max-w-md">
                            Administra tu perfil y preferencias para sacar el máximo provecho de tu AI Coach.
                        </p>
                    </div>

                    <SettingsForm initialProfile={profile} />
                </div>
            </main>
        </div>
    );
}

