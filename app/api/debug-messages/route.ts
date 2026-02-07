'use server'

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const results: any = {
        userId: user.id,
        groupId,
        checks: {}
    }

    // Check 1: Can we read group_members?
    const { data: membership, error: membershipError } = await supabase
        .from('group_members')
        .select('*')
        .eq('user_id', user.id)

    results.checks.groupMembers = {
        success: !membershipError,
        error: membershipError?.message,
        count: membership?.length || 0,
        data: membership
    }

    // Check 2: Can we read messages for a specific group?
    if (groupId) {
        const { data: messages, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .eq('group_id', groupId)
            .order('created_at', { ascending: false })
            .limit(10)

        results.checks.messages = {
            success: !messagesError,
            error: messagesError?.message,
            count: messages?.length || 0,
            data: messages
        }

        // Check 3: Can we read groups?
        const { data: group, error: groupError } = await supabase
            .from('groups')
            .select('*')
            .eq('id', groupId)
            .single()

        results.checks.group = {
            success: !groupError,
            error: groupError?.message,
            data: group
        }
    }

    // Check 4: Count all messages in DB (might fail due to RLS)
    const { count, error: countError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })

    results.checks.totalMessages = {
        success: !countError,
        error: countError?.message,
        count
    }

    return NextResponse.json(results, { status: 200 })
}
