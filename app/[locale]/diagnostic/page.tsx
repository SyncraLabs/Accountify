import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DiagnosticPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Check habits table structure
    const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id);

    // Try to create a profile if it doesn't exist
    let profileCreationResult = null;
    if (!profile) {
        const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                full_name: user.user_metadata?.full_name || 'User',
                avatar_url: user.user_metadata?.avatar_url
            })
            .select()
            .single();

        profileCreationResult = { data: newProfile, error: createError };
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-4xl font-bold text-white">🔍 Diagnostic Page</h1>

                {/* User Info */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                    <h2 className="text-2xl font-semibold text-white mb-4">User Info</h2>
                    <pre className="text-sm text-muted-foreground overflow-auto">
                        {JSON.stringify(user, null, 2)}
                    </pre>
                </div>

                {/* Profile Check */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                    <h2 className="text-2xl font-semibold text-white mb-4">Profile Status</h2>
                    {profile ? (
                        <div>
                            <p className="text-green-500 font-semibold mb-2">✅ Profile exists!</p>
                            <pre className="text-sm text-muted-foreground overflow-auto">
                                {JSON.stringify(profile, null, 2)}
                            </pre>
                        </div>
                    ) : (
                        <div>
                            <p className="text-red-500 font-semibold mb-2">❌ Profile NOT found</p>
                            {profileError && (
                                <pre className="text-sm text-red-400 overflow-auto mb-4">
                                    {JSON.stringify(profileError, null, 2)}
                                </pre>
                            )}
                            {profileCreationResult && (
                                <div className="mt-4">
                                    <p className="text-yellow-500 font-semibold mb-2">Attempted to create profile:</p>
                                    <pre className="text-sm text-muted-foreground overflow-auto">
                                        {JSON.stringify(profileCreationResult, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Habits Check */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                    <h2 className="text-2xl font-semibold text-white mb-4">Habits</h2>
                    {habitsError ? (
                        <div>
                            <p className="text-red-500 font-semibold mb-2">❌ Error fetching habits</p>
                            <pre className="text-sm text-red-400 overflow-auto">
                                {JSON.stringify(habitsError, null, 2)}
                            </pre>
                        </div>
                    ) : (
                        <div>
                            <p className="text-green-500 font-semibold mb-2">✅ Habits query successful</p>
                            <p className="text-white mb-2">Count: {habits?.length || 0}</p>
                            {habits && habits.length > 0 && (
                                <pre className="text-sm text-muted-foreground overflow-auto">
                                    {JSON.stringify(habits, null, 2)}
                                </pre>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <a href="/calendar" className="px-6 py-3 bg-primary text-black rounded-lg font-semibold hover:bg-primary/90">
                        Go to Calendar
                    </a>
                    <a href="/" className="px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20">
                        Go to Home
                    </a>
                </div>
            </div>
        </div>
    );
}
