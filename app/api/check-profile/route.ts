import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // If no profile, try to create one
    if (!profile && !profileError) {
        const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                full_name: user.user_metadata?.full_name || 'User',
                avatar_url: user.user_metadata?.avatar_url
            })
            .select()
            .single();

        return NextResponse.json({
            message: 'Profile created',
            profile: newProfile,
            error: createError
        });
    }

    return NextResponse.json({
        user: {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name
        },
        profile,
        profileError
    });
}
