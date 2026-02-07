'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createMentionNotification, createGroupMessageNotification } from '@/app/notifications/actions'

export type CreateGroupState = {
    error?: string
    success?: boolean
    group?: any
}

export async function createGroup(prevState: CreateGroupState, formData: FormData): Promise<CreateGroupState> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'You must be logged in to create a group.' }

    const name = formData.get('name') as string
    const description = formData.get('description') as string

    if (!name) return { error: 'Group name is required.' }

    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase()
    const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`

    const { data: group, error } = await supabase
        .from('groups')
        .insert({
            name,
            description,
            invite_code: inviteCode,
            avatar_url: avatarUrl,
            created_by: user.id
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating group:', error)
        return { error: error.message }
    }

    // Add creator as admin
    const { error: memberError } = await supabase
        .from('group_members')
        .insert({
            group_id: group.id,
            user_id: user.id,
            role: 'admin'
        })

    if (memberError) {
        console.error('Error adding admin:', memberError)
        return { error: 'Group created but failed to join as admin.' }
    }

    revalidatePath('/groups')
    return { success: true, group }
}

export async function joinGroup(inviteCode: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data: group, error: findError } = await supabase
        .from('groups')
        .select('id')
        .eq('invite_code', inviteCode)
        .single()

    if (findError || !group) return { error: 'Invalid invite code' }

    const { error: joinError } = await supabase
        .from('group_members')
        .insert({
            group_id: group.id,
            user_id: user.id,
            role: 'member'
        })

    if (joinError) {
        if (joinError.code === '23505') return { error: 'You are already a member of this group.' }
        return { error: joinError.message }
    }

    revalidatePath('/groups')
    return { success: true, groupId: group.id }
}

export async function getUserGroups() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('group_members')
        .select(`
            group_id,
            groups (
                id, name, description, avatar_url, invite_code
            )
        `)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error fetching user groups:', error)
        return []
    }

    // Flattens the structure
    return data.map((item: any) => item.groups)
}

export async function sendMessage(
    groupId: string,
    content: string,
    type: 'text' | 'image' | 'video' = 'text',
    mediaUrl: string | null = null,
    mentionedUserIds: string[] = []
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        console.error('[sendMessage] User not authenticated')
        return { error: 'Not authenticated' }
    }

    // Verify user is a member of this group first
    const { data: membership, error: membershipError } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single()

    if (membershipError || !membership) {
        console.error('[sendMessage] User is not a member of group:', groupId, membershipError)
        return { error: 'You are not a member of this group' }
    }

    // Get sender profile for notifications
    const { data: senderProfile } = await supabase
        .from('profiles')
        .select('username, full_name')
        .eq('id', user.id)
        .single()
    const senderName = senderProfile?.username || senderProfile?.full_name || 'Alguien'

    // Get group details for notifications
    const { data: group } = await supabase
        .from('groups')
        .select('name')
        .eq('id', groupId)
        .single()
    const groupName = group?.name || 'Grupo'

    // Insert the message
    const { data: insertedMessage, error } = await supabase
        .from('messages')
        .insert({
            group_id: groupId,
            user_id: user.id,
            content,
            type,
            media_url: mediaUrl
        })
        .select()
        .single()

    if (error) {
        console.error('[sendMessage] Failed to insert message:', error)
        return { error: error.message }
    }

    console.log('[sendMessage] Message inserted successfully:', insertedMessage?.id)

    // Send mention notifications
    for (const mentionedUserId of mentionedUserIds) {
        if (mentionedUserId !== user.id) {
            await createMentionNotification(
                mentionedUserId,
                senderName,
                groupId,
                groupName,
                content
            )
        }
    }

    // Send group message notifications to other members (batched)
    const { data: members } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId)
        .neq('user_id', user.id)

    if (members) {
        for (const member of members) {
            // Skip if already mentioned (they'll get the mention notification instead)
            if (!mentionedUserIds.includes(member.user_id)) {
                await createGroupMessageNotification(
                    member.user_id,
                    groupId,
                    groupName,
                    senderName
                )
            }
        }
    }

    return { success: true }
}

export async function getGroupDetails(groupId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single()

    if (error) return null
    return data
}

export async function getGroupMessages(
    groupId: string,
    limit: number = 50,
    before?: string
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        console.error('[getGroupMessages] User not authenticated')
        return { error: 'Not authenticated', data: [] }
    }

    // Verify user is a member of this group
    const { data: membership } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single()

    if (!membership) {
        console.error('[getGroupMessages] User is not a member of group:', groupId)
        return { error: 'Not a member of this group', data: [] }
    }

    let query = supabase
        .from('messages')
        .select(`
            *,
            profiles:user_id (
                id,
                username,
                full_name,
                avatar_url
            )
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })
        .limit(limit)

    if (before) {
        query = query.lt('created_at', before)
    }

    const { data, error } = await query

    if (error) {
        console.error('[getGroupMessages] Error fetching messages:', error)
        return { error: error.message, data: [] }
    }

    console.log(`[getGroupMessages] Fetched ${data?.length || 0} messages for group ${groupId}`)

    // Return reversed array so it renders chronologically (oldest to newest)
    return { data: data ? data.reverse() : [] }
}

// ========= Group Admin Features =========

export async function getGroupMembers(groupId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated', members: [] }

    const { data, error } = await supabase
        .from('group_members')
        .select(`
            user_id,
            role,
            joined_at,
            profiles (
                id,
                full_name,
                avatar_url
            )
        `)
        .eq('group_id', groupId)
        .order('joined_at', { ascending: true })

    if (error) {
        console.error('Error fetching group members:', error)
        return { error: error.message, members: [] }
    }

    const members = data.map((item: any) => ({
        userId: item.user_id,
        role: item.role,
        joinedAt: item.joined_at,
        profile: item.profiles
    }))

    return { members }
}

export async function isUserGroupAdmin(groupId: string): Promise<boolean> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data, error } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single()

    if (error || !data) return false
    return data.role === 'admin'
}

export async function updateGroupSettings(
    groupId: string,
    updates: { name?: string; description?: string; avatar_url?: string }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // Verify admin status
    const isAdmin = await isUserGroupAdmin(groupId)
    if (!isAdmin) return { error: 'Solo los administradores pueden editar el grupo' }

    const { error } = await supabase
        .from('groups')
        .update(updates)
        .eq('id', groupId)

    if (error) {
        console.error('Error updating group:', error)
        return { error: error.message }
    }

    revalidatePath('/groups')
    return { success: true }
}

export async function promoteToAdmin(groupId: string, userId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const isAdmin = await isUserGroupAdmin(groupId)
    if (!isAdmin) return { error: 'Solo los administradores pueden promover miembros' }

    const { error } = await supabase
        .from('group_members')
        .update({ role: 'admin' })
        .eq('group_id', groupId)
        .eq('user_id', userId)

    if (error) {
        console.error('Error promoting member:', error)
        return { error: error.message }
    }

    revalidatePath('/groups')
    return { success: true }
}

export async function demoteFromAdmin(groupId: string, userId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const isAdmin = await isUserGroupAdmin(groupId)
    if (!isAdmin) return { error: 'Solo los administradores pueden degradar miembros' }

    // Prevent demoting yourself if you're the only admin
    const { data: admins } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId)
        .eq('role', 'admin')

    if (admins && admins.length === 1 && admins[0].user_id === userId) {
        return { error: 'No puedes degradarte, eres el único administrador' }
    }

    const { error } = await supabase
        .from('group_members')
        .update({ role: 'member' })
        .eq('group_id', groupId)
        .eq('user_id', userId)

    if (error) {
        console.error('Error demoting member:', error)
        return { error: error.message }
    }

    revalidatePath('/groups')
    return { success: true }
}

export async function removeMember(groupId: string, userId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const isAdmin = await isUserGroupAdmin(groupId)
    if (!isAdmin) return { error: 'Solo los administradores pueden expulsar miembros' }

    // Prevent removing yourself
    if (user.id === userId) {
        return { error: 'No puedes expulsarte a ti mismo' }
    }

    const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId)

    if (error) {
        console.error('Error removing member:', error)
        return { error: error.message }
    }

    revalidatePath('/groups')
    return { success: true }
}

export async function generateInviteLink(inviteCode: string): Promise<string> {
    // Use window.location.origin for client-side or env var for server
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return `${baseUrl}/groups/join?code=${inviteCode}`
}

export async function uploadGroupImage(groupId: string, file: File) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const isAdmin = await isUserGroupAdmin(groupId)
    if (!isAdmin) return { error: 'Solo los administradores pueden cambiar la imagen' }

    const fileExt = file.name.split('.').pop()
    const fileName = `${groupId}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
        .from('group-images')
        .upload(fileName, file, { upsert: true })

    if (uploadError) {
        console.error('Error uploading image:', uploadError)
        return { error: uploadError.message }
    }

    const { data: { publicUrl } } = supabase.storage
        .from('group-images')
        .getPublicUrl(fileName)

    // Update group with new avatar
    const { error: updateError } = await supabase
        .from('groups')
        .update({ avatar_url: publicUrl })
        .eq('id', groupId)

    if (updateError) {
        console.error('Error updating group avatar:', updateError)
        return { error: updateError.message }
    }

    revalidatePath('/groups')
    return { success: true, url: publicUrl }
}

// ========= Group Challenges Features =========

export async function createChallenge(
    groupId: string,
    data: {
        title: string
        description?: string
        target_value: number
        unit: string
        challenge_type: string
        start_date: string
        end_date: string
    }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const isAdmin = await isUserGroupAdmin(groupId)
    if (!isAdmin) return { error: 'Solo los administradores pueden crear retos' }

    const { data: challenge, error } = await supabase
        .from('group_challenges')
        .insert({
            group_id: groupId,
            created_by: user.id,
            title: data.title,
            description: data.description,
            target_value: data.target_value,
            unit: data.unit,
            challenge_type: data.challenge_type,
            start_date: data.start_date,
            end_date: data.end_date
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating challenge:', error)
        return { error: error.message }
    }

    // Auto-join creator
    await joinChallenge(challenge.id)

    revalidatePath('/groups')
    return { success: true, challenge }
}

export async function getGroupChallenges(groupId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data, error } = await supabase
        .from('group_challenges')
        .select(`
            *,
            participants:challenge_participants(count)
        `)
        .eq('group_id', groupId)
        .eq('is_active', true)
        .order('end_date', { ascending: true })

    if (error) {
        console.error('Error fetching challenges:', error)
        return { error: error.message }
    }

    // Check participation status for current user
    const challengesWithStatus = await Promise.all(data.map(async (c: any) => {
        const { data: participation } = await supabase
            .from('challenge_participants')
            .select('*')
            .eq('challenge_id', c.id)
            .eq('user_id', user.id)
            .single()

        // Get user progress
        let userProgress = 0
        if (participation) {
            const { data: progress } = await supabase
                .from('challenge_progress')
                .select('value')
                .eq('challenge_id', c.id)
                .eq('user_id', user.id)

            userProgress = progress?.reduce((sum, p) => sum + p.value, 0) || 0
        }

        return {
            ...c,
            isJoined: !!participation,
            participantCount: c.participants[0].count,
            userProgress
        }
    }))

    return { challenges: challengesWithStatus }
}

export async function joinChallenge(challengeId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('challenge_participants')
        .insert({
            challenge_id: challengeId,
            user_id: user.id
        })

    if (error) {
        // Ignore duplicate key error (already joined)
        if (error.code === '23505') return { success: true }
        return { error: error.message }
    }

    revalidatePath('/groups')
    return { success: true }
}

export async function leaveChallenge(challengeId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('challenge_participants')
        .delete()
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/groups')
    return { success: true }
}

export async function logChallengeProgress(challengeId: string, value: number, note?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('challenge_progress')
        .insert({
            challenge_id: challengeId,
            user_id: user.id,
            value,
            note
        })

    if (error) return { error: error.message }

    revalidatePath('/groups')
    return { success: true }
}

export async function getChallengeLeaderboard(challengeId: string) {
    const supabase = await createClient()

    // Get all participants
    const { data: participants, error: partError } = await supabase
        .from('challenge_participants')
        .select(`
            user_id,
            joined_at,
            profiles (
                id,
                full_name,
                avatar_url
            )
        `)
        .eq('challenge_id', challengeId)

    if (partError) return { error: partError.message }

    // Get all progress logs for this challenge
    const { data: logs, error: logsError } = await supabase
        .from('challenge_progress')
        .select('user_id, value')
        .eq('challenge_id', challengeId)

    if (logsError) return { error: logsError.message }

    // Calculate total progress per user
    const leaderboard = participants.map((p: any) => {
        const userLogs = logs.filter((l: any) => l.user_id === p.user_id)
        const totalProgress = userLogs.reduce((sum: number, l: any) => sum + l.value, 0)

        return {
            userId: p.user_id,
            profile: p.profiles,
            joinedAt: p.joined_at,
            progress: totalProgress
        }
    }).sort((a: any, b: any) => b.progress - a.progress)

    return { leaderboard }
}

export async function shareHabitCompletion(
    groupId: string,
    habitId: string,
    habitTitle: string,
    streak: number,
    category: string
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // Check if user is member of the group
    const { data: member } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single()

    if (!member) return { error: 'You are not a member of this group' }

    const { error } = await supabase
        .from('messages')
        .insert({
            group_id: groupId,
            user_id: user.id,
            content: `¡He completado mi hábito "${habitTitle}"! 🔥 racha de ${streak} días`,
            type: 'habit_share',
            habit_id: habitId,
            habit_title: habitTitle,
            habit_streak: streak,
            habit_category: category
        })

    if (error) return { error: error.message }
    return { success: true }
}

// ========= Onboarding Features =========

export async function hasCompletedGroupsOnboarding(): Promise<boolean> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return true // Don't show onboarding if not logged in

    const { data, error } = await supabase
        .from('user_onboarding_flags')
        .select('groups_intro_completed')
        .eq('user_id', user.id)
        .single()

    if (error || !data) return false
    return data.groups_intro_completed || false
}

export async function completeGroupsOnboarding() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('user_onboarding_flags')
        .upsert({
            user_id: user.id,
            groups_intro_completed: true,
            groups_intro_completed_at: new Date().toISOString()
        })

    if (error) {
        console.error('Error completing onboarding:', error)
        return { error: error.message }
    }

    return { success: true }
}

// ========= Habit Sharing Settings =========

export async function getHabitSharingSettings(habitId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated', shares: [] }

    let query = supabase
        .from('habit_group_shares')
        .select(`
            id,
            habit_id,
            group_id,
            auto_share,
            groups (
                id,
                name,
                avatar_url
            )
        `)
        .eq('user_id', user.id)

    if (habitId) {
        query = query.eq('habit_id', habitId)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching habit sharing settings:', error)
        return { error: error.message, shares: [] }
    }

    return { shares: data || [] }
}

export async function updateHabitSharingSettings(
    habitId: string,
    groupId: string,
    autoShare: boolean
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    if (autoShare) {
        // Upsert: create or update the sharing setting
        const { error } = await supabase
            .from('habit_group_shares')
            .upsert({
                habit_id: habitId,
                group_id: groupId,
                user_id: user.id,
                auto_share: true
            }, {
                onConflict: 'habit_id,group_id'
            })

        if (error) {
            console.error('Error updating habit sharing:', error)
            return { error: error.message }
        }
    } else {
        // Delete the sharing setting
        const { error } = await supabase
            .from('habit_group_shares')
            .delete()
            .eq('habit_id', habitId)
            .eq('group_id', groupId)
            .eq('user_id', user.id)

        if (error) {
            console.error('Error removing habit sharing:', error)
            return { error: error.message }
        }
    }

    return { success: true }
}

export async function getAutoShareGroups(habitId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('habit_group_shares')
        .select('group_id')
        .eq('habit_id', habitId)
        .eq('user_id', user.id)
        .eq('auto_share', true)

    if (error) {
        console.error('Error fetching auto-share groups:', error)
        return []
    }

    return data.map(d => d.group_id)
}

// ========= Group Progress Features =========

export async function getGroupMembersProgress(groupId: string, date?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated', members: [] }

    const targetDate = date || new Date().toISOString().split('T')[0]

    // Get all group members
    const { data: members, error: membersError } = await supabase
        .from('group_members')
        .select(`
            user_id,
            profiles (
                id,
                full_name,
                avatar_url,
                username
            )
        `)
        .eq('group_id', groupId)

    if (membersError) {
        console.error('Error fetching group members:', membersError)
        return { error: membersError.message, members: [] }
    }

    // Get shared habits for this group
    const { data: sharedHabits, error: habitsError } = await supabase
        .from('habit_group_shares')
        .select(`
            habit_id,
            user_id,
            habits (
                id,
                title,
                category,
                frequency
            )
        `)
        .eq('group_id', groupId)

    if (habitsError) {
        console.error('Error fetching shared habits:', habitsError)
        return { error: habitsError.message, members: [] }
    }

    // Get habit logs for today
    const habitIds = sharedHabits?.map(h => h.habit_id) || []
    let logs: any[] = []

    if (habitIds.length > 0) {
        const { data: logsData } = await supabase
            .from('habit_logs')
            .select('habit_id, completed_date')
            .in('habit_id', habitIds)
            .eq('completed_date', targetDate)

        logs = logsData || []
    }

    // Build member progress data
    const membersProgress = members.map((member: any) => {
        const memberHabits = sharedHabits
            ?.filter((h: any) => h.user_id === member.user_id)
            .map((h: any) => {
                const completedToday = logs.some(
                    (l: any) => l.habit_id === h.habit_id
                )
                return {
                    id: h.habits.id,
                    title: h.habits.title,
                    category: h.habits.category,
                    frequency: h.habits.frequency,
                    completedToday
                }
            }) || []

        const completedCount = memberHabits.filter(h => h.completedToday).length
        const totalCount = memberHabits.length

        return {
            userId: member.user_id,
            profile: member.profiles,
            habits: memberHabits,
            completedCount,
            totalCount,
            progress: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
        }
    })

    // Filter out members with no shared habits and sort by progress
    const filteredMembers = membersProgress
        .filter((m: any) => m.totalCount > 0)
        .sort((a: any, b: any) => b.progress - a.progress)

    return { members: filteredMembers }
}
