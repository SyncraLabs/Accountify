'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'

export function DebugMessages({ groupId }: { groupId: string }) {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [messageCount, setMessageCount] = useState<number>(0)
    const [error, setError] = useState<string | null>(null)
    const [lastMessageId, setLastMessageId] = useState<string | null>(null)

    const [actionStatus, setActionStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [actionCount, setActionCount] = useState<number>(0)
    const [actionError, setActionError] = useState<string | null>(null)

    useEffect(() => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const checkMessages = async () => {
            // Check 1: Direct DB (Client)
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

            // Check 2: Server Action
            try {
                const { data, error } = await getGroupMessages(groupId, 1)
                if (error) {
                    setActionStatus('error')
                    setActionError(error)
                } else {
                    setActionStatus('success')
                    setActionCount(data?.length ? 999 : 0) // We don't get total count from action, just data
                }
            } catch (err: any) {
                setActionStatus('error')
                setActionError(err.message)
            }
        }

        checkMessages()
    }, [groupId])

    return (
        <div className={`p-2 text-xs font-mono mb-2 rounded border relative z-50 ${status === 'error' || actionStatus === 'error' ? 'bg-red-900/50 border-red-500 text-red-200' :
                'bg-blue-900/50 border-blue-500 text-blue-200'
            }`}>
            <p><strong>DEBUG:</strong> Group ID: {groupId.slice(0, 8)}...</p>
            <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                    <p className="font-bold border-b border-white/20">Direct DB (Client)</p>
                    <p>Status: {status}</p>
                    <p>Msg Count: {messageCount}</p>
                    {error && <p className="text-red-300">Err: {error}</p>}
                </div>
                <div>
                    <p className="font-bold border-b border-white/20">Server Action</p>
                    <p>Status: {actionStatus}</p>
                    <p>Data returned: {actionStatus === 'success' ? (actionCount > 0 ? 'YES' : 'NO') : '-'}</p>
                    {actionError && <p className="text-red-300">Err: {actionError}</p>}
                </div>
            </div>
            <p className="mt-1 text-[10px] opacity-70">If 'Direct' works but 'Server' fails, it's a join/profile issue.</p>
        </div>
    )
}
