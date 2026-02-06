'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type NotificationType = 'mention' | 'group_message' | 'habit_reminder' | 'feature_update'

export interface Notification {
    id: string
    user_id: string
    type: NotificationType
    title: string
    body: string | null
    data: Record<string, any> | null
    read: boolean
    created_at: string
    batch_key: string | null
}

export interface NotificationPreferences {
    user_id: string
    mentions_enabled: boolean
    group_messages_enabled: boolean
    group_messages_frequency: 'instant' | 'batched' | 'off'
    habit_reminders_enabled: boolean
    feature_updates_enabled: boolean
}

// ============================================================================
// FETCH NOTIFICATIONS
// ============================================================================

export async function getNotifications(limit = 20, offset = 0) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { notifications: [], error: 'Not authenticated' }

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

    if (error) {
        console.error('Error fetching notifications:', error)
        return { notifications: [], error: error.message }
    }

    return { notifications: data as Notification[], error: null }
}

export async function getUnreadCount() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { count: 0 }

    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false)

    if (error) {
        console.error('Error fetching unread count:', error)
        return { count: 0 }
    }

    return { count: count || 0 }
}

// ============================================================================
// MARK AS READ
// ============================================================================

export async function markAsRead(notificationId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error marking notification as read:', error)
        return { error: error.message }
    }

    revalidatePath('/')
    return { success: true }
}

export async function markAllAsRead() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

    if (error) {
        console.error('Error marking all notifications as read:', error)
        return { error: error.message }
    }

    revalidatePath('/')
    return { success: true }
}

// ============================================================================
// CREATE NOTIFICATIONS (Internal helpers)
// ============================================================================

export async function createMentionNotification(
    mentionedUserId: string,
    mentionerName: string,
    groupId: string,
    groupName: string,
    messagePreview: string
) {
    const supabase = await createClient()

    // Check user preferences
    const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('mentions_enabled')
        .eq('user_id', mentionedUserId)
        .single()

    if (prefs && !prefs.mentions_enabled) return { skipped: true }

    const { error } = await supabase
        .from('notifications')
        .insert({
            user_id: mentionedUserId,
            type: 'mention',
            title: `${mentionerName} te mencionó`,
            body: messagePreview.substring(0, 100),
            data: { group_id: groupId, group_name: groupName }
        })

    if (error) {
        console.error('Error creating mention notification:', error)
        return { error: error.message }
    }

    return { success: true }
}

export async function createGroupMessageNotification(
    userId: string,
    groupId: string,
    groupName: string,
    senderName: string
) {
    const supabase = await createClient()

    // Check user preferences
    const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('group_messages_enabled, group_messages_frequency')
        .eq('user_id', userId)
        .single()

    if (prefs && !prefs.group_messages_enabled) return { skipped: true }
    if (prefs?.group_messages_frequency === 'off') return { skipped: true }

    // For batched mode: check if we already have a recent notification for this group
    if (!prefs || prefs.group_messages_frequency === 'batched') {
        const hourKey = new Date().toISOString().substring(0, 13) // YYYY-MM-DDTHH
        const batchKey = `group_message:${groupId}:${hourKey}`

        // Check if batch notification exists
        const { data: existing } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', userId)
            .eq('batch_key', batchKey)
            .single()

        if (existing) {
            // Already notified for this group this hour
            return { batched: true }
        }

        // Create batched notification
        const { error } = await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                type: 'group_message',
                title: `Nuevo mensaje en ${groupName}`,
                body: `${senderName} envió un mensaje`,
                data: { group_id: groupId, group_name: groupName },
                batch_key: batchKey
            })

        if (error) {
            console.error('Error creating group message notification:', error)
            return { error: error.message }
        }
    } else {
        // Instant mode
        const { error } = await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                type: 'group_message',
                title: `Nuevo mensaje en ${groupName}`,
                body: `${senderName} envió un mensaje`,
                data: { group_id: groupId, group_name: groupName }
            })

        if (error) {
            console.error('Error creating group message notification:', error)
            return { error: error.message }
        }
    }

    return { success: true }
}

// ============================================================================
// PREFERENCES
// ============================================================================

export async function getPreferences() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { preferences: null, error: 'Not authenticated' }

    const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching preferences:', error)
        return { preferences: null, error: error.message }
    }

    // Return defaults if no preferences set
    const defaults: NotificationPreferences = {
        user_id: user.id,
        mentions_enabled: true,
        group_messages_enabled: true,
        group_messages_frequency: 'batched',
        habit_reminders_enabled: true,
        feature_updates_enabled: true
    }

    return { preferences: data || defaults, error: null }
}

export async function updatePreferences(updates: Partial<NotificationPreferences>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('notification_preferences')
        .upsert({
            user_id: user.id,
            ...updates,
            updated_at: new Date().toISOString()
        })

    if (error) {
        console.error('Error updating preferences:', error)
        return { error: error.message }
    }

    return { success: true }
}

// ============================================================================
// DELETE NOTIFICATION
// ============================================================================

export async function deleteNotification(notificationId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting notification:', error)
        return { error: error.message }
    }

    revalidatePath('/')
    return { success: true }
}
