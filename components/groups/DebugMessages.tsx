'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'

export function DebugMessages({ groupId }: { groupId: string }) {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [messageCount, setMessageCount] = useState<number>(0)
    const [error, setError] = useState<string | null>(null)
    const [lastMessageId, setLastMessageId] = useState<string | null>(null)

    useEffect(() => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const checkMessages = async () => {
            try {
                // Direct query bypassing RLS wrappers or complex joins first
                const { count, error, data } = await supabase
                    .from('messages')
                    .select('id', { count: 'exact' })
                    .eq('group_id', groupId)
                    .limit(1)

                if (error) {
                    setStatus('error')
                    setError(error.message)
                } else {
                    setStatus('success')
                    setMessageCount(count || 0)
                    setLastMessageId(data?.[0]?.id || 'none')
                }
            } catch (err: any) {
                setStatus('error')
                setError(err.message)
            }
        }

        checkMessages()
    }, [groupId])

    if (process.env.NODE_ENV === 'production' && status === 'success') return null

    return (
        <div className={`p-2 text-xs font-mono mb-2 rounded border ${status === 'error' ? 'bg-red-900/50 border-red-500 text-red-200' :
                status === 'success' ? 'bg-green-900/50 border-green-500 text-green-200' :
                    'bg-blue-900/50 border-blue-500 text-blue-200'
            }`}>
            <p><strong>DEBUG:</strong> Group ID: {groupId.slice(0, 8)}...</p>
            <p>Status: {status}</p>
            {status === 'success' && <p>Messages Found (Direct DB): {messageCount}</p>}
            {lastMessageId && <p>Last Msg ID: {lastMessageId}</p>}
            {error && <p>Error: {error}</p>}
        </div>
    )
}
