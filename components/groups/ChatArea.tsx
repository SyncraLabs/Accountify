'use client'

import { useState, useEffect, useRef } from "react"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Paperclip, Send } from 'lucide-react'
import { sendMessage, getGroupMessages } from "@/app/[locale]/groups/actions"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { HabitShareMessage } from "@/components/groups/HabitShareMessage"
import { Menu } from "lucide-react"
import { GroupDetails } from "./GroupDetails"
import { ActiveChallengesDrawer } from "./ActiveChallengesDrawer"
import { MemberProfileDialog } from "./MemberProfileDialog"
import { ChallengeProgressBar } from "./ChallengeProgressBar"
import { Trophy } from "lucide-react"


import { useTranslations } from "next-intl"

export function ChatArea({
    groupId,
    initialMessages,
    groupName,
    groupDescription,
    groupAvatarUrl,
    inviteCode,
    currentUserId
}: {
    groupId: string,
    initialMessages?: any[],
    groupName: string,
    groupDescription?: string,
    groupAvatarUrl?: string,
    inviteCode: string,
    currentUserId: string
}) {
    const t = useTranslations('groups.chat')
    const [messages, setMessages] = useState<any[]>(initialMessages || [])
    const [profiles, setProfiles] = useState<Record<string, any>>({})
    const [members, setMembers] = useState<any[]>([])
    const [input, setInput] = useState("")
    const scrollRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)
    const [showGroupDetails, setShowGroupDetails] = useState(false)
    const [showChallenges, setShowChallenges] = useState(false)
    const [selectedMember, setSelectedMember] = useState<any>(null)
    const supabase = createClient()

    // Fetch profiles function
    const fetchProfiles = async (userIds: string[]) => {
        if (userIds.length === 0) return;
        const { data } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .in('id', userIds);

        if (data) {
            setProfiles(prev => {
                const newProfiles = { ...prev };
                data.forEach((p: any) => {
                    newProfiles[p.id] = p;
                });
                return newProfiles;
            });
        }
    };

    // Initial fetch of profiles
    useEffect(() => {
        const userIds = Array.from(new Set(messages.map(m => m.user_id)));
        fetchProfiles(userIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages.length]);

    // Fetch group members for @ mention suggestions
    useEffect(() => {
        const fetchMembers = async () => {
            const { data } = await supabase
                .from('group_members')
                .select(`
                    user_id,
                    profiles (
                        id,
                        username,
                        full_name
                    )
                `)
                .eq('group_id', groupId)
            if (data) {
                setMembers(data.map((m: any) => ({
                    userId: m.user_id,
                    username: m.profiles?.username,
                    fullName: m.profiles?.full_name
                })))
            }
        }
        fetchMembers()
    }, [groupId, supabase]);

    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [isNearBottom, setIsNearBottom] = useState(true)

    // Check if initial load was full page implies more messages might exist
    useEffect(() => {
        setHasMore((initialMessages?.length ?? 0) >= 50)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Realtime subscription
    useEffect(() => {
        const channel = supabase
            .channel(`group_chat:${groupId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `group_id=eq.${groupId}`
                },
                (payload) => {
                    const newMsg = payload.new
                    setMessages((prev) => {
                        // Check if this exact message already exists
                        if (prev.find(m => m.id === newMsg.id)) return prev

                        // If this message is from the current user, replace any optimistic message
                        if (newMsg.user_id === currentUserId) {
                            // Find and remove optimistic messages (temp IDs) from this user
                            const withoutOptimistic = prev.filter(m =>
                                !(m.isOptimistic && m.user_id === currentUserId)
                            )
                            return [...withoutOptimistic, newMsg]
                        }

                        return [...prev, newMsg]
                    })
                    fetchProfiles([newMsg.user_id]);
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupId, currentUserId])

    // Auto-scroll to bottom when new messages arrive if near bottom
    useEffect(() => {
        if (isNearBottom && scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages.length, isNearBottom])

    const loadMoreMessages = async () => {
        if (isLoadingMore || !hasMore || messages.length === 0) return

        setIsLoadingMore(true)
        const oldestMessage = messages[0]

        try {
            const { data, error } = await getGroupMessages(groupId, 50, oldestMessage.created_at)

            if (error) {
                console.error("Error loading more messages:", error)
                return
            }

            if (data && data.length > 0) {
                setMessages(prev => [...data, ...prev])
                // Fetch profiles for new old messages
                const userIds = Array.from(new Set(data.map((m: any) => m.user_id)));
                fetchProfiles(userIds as string[]);

                if (data.length < 50) {
                    setHasMore(false)
                }
            } else {
                setHasMore(false)
            }
        } catch (err) {
            console.error("Failed to load more messages", err)
        } finally {
            setIsLoadingMore(false)
        }
    }

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget

        // Check if near bottom
        const distanceToBottom = scrollHeight - scrollTop - clientHeight
        setIsNearBottom(distanceToBottom < 100)

        // Load more when scrolled to top
        if (scrollTop < 50 && hasMore && !isLoadingMore) {
            // Save current scroll height to restore position after load
            // This is tricky with infinite scroll going up, usually requires layout effect
            // For now, simpler implementation:
            loadMoreMessages()
        }
    }

    // Parse @mentions from message content
    const parseMentions = (content: string): string[] => {
        const mentionRegex = /@(\w+)/g
        const matches = content.match(mentionRegex)
        if (!matches) return []

        const mentionedIds: string[] = []
        matches.forEach(match => {
            const username = match.slice(1).toLowerCase()
            const member = members.find(m =>
                m.username?.toLowerCase() === username ||
                m.fullName?.toLowerCase().replace(/\s/g, '') === username
            )
            if (member && !mentionedIds.includes(member.userId)) {
                mentionedIds.push(member.userId)
            }
        })
        return mentionedIds
    }

    const handleSend = async () => {
        if (!input.trim()) return
        const content = input

        // Parse mentions before sending
        const mentionedUserIds = parseMentions(content)

        // Optimistically add message
        const tempId = `temp-${Date.now()}`
        const optimisticMsg = {
            id: tempId,
            content,
            user_id: currentUserId,
            created_at: new Date().toISOString(),
            type: 'text',
            isOptimistic: true,
            // Add temp profile for immediate rendering
            profile: { ...profiles[currentUserId] }
        }

        setMessages(prev => [...prev, optimisticMsg])
        setInput("")

        // Don't wait for result to clear input
        // Re-scroll to bottom immediately
        if (scrollRef.current) {
            setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
        }

        const result = await sendMessage(groupId, content, 'text', null, mentionedUserIds)

        if (result.error) {
            console.error("Failed to send message:", result.error)
            setMessages(prev => prev.filter(m => m.id !== tempId))
            alert(`Failed to send message: ${result.error}`)
            setInput(content)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `${groupId}/${fileName}`
            const isVideo = file.type.startsWith('video/')
            const type = isVideo ? 'video' : 'image'

            const { error: uploadError } = await supabase.storage
                .from('group-media')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('group-media')
                .getPublicUrl(filePath)

            await sendMessage(groupId, '', type, publicUrl)
        } catch (error) {
            console.error("Upload failed", error)
            alert("Upload failed. Please ensure 'group-media' bucket exists and is public.")
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }



    // Reset messages when groupId changes or initialMessages updates
    // IMPORTANT: Only update if initialMessages is defined and distinct
    // Reset messages when groupId changes or initialMessages updates
    useEffect(() => {
        console.log('[ChatArea] initialMessages received:', initialMessages?.length, 'for group:', groupId)
        if (initialMessages && initialMessages.length > 0) {
            console.log('[ChatArea] Setting messages from initialMessages')
            setMessages(initialMessages)
            setHasMore(initialMessages.length >= 50)
            // Scroll to bottom on initial load
            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollIntoView({ behavior: 'auto' })
                }
            }, 100)
        } else {
            // Fallback: If no initial messages (SSR failed or empty), fetch client-side
            console.log('[ChatArea] No initialMessages, fetching client-side...')
            setMessages([]) // Clear current
            setHasMore(true) // Assume there might be messages

            const fetchInitial = async () => {
                try {
                    // Manual join strategy to bypass potential schema cache/relationship errors
                    // 1. Fetch messages only (no join yet)
                    const { data: rawMessages, error: msgError } = await supabase
                        .from('messages')
                        .select('*')
                        .eq('group_id', groupId)
                        .order('created_at', { ascending: false })
                        .limit(50)

                    if (msgError) {
                        console.error('[ChatArea] Error fetching raw messages:', msgError)
                        setHasMore(false)
                        return
                    }

                    if (rawMessages && rawMessages.length > 0) {
                        // 2. Fetch profiles for these messages manually
                        const userIds = Array.from(new Set(rawMessages.map((m: any) => m.user_id)))
                        const { data: profiles, error: profileError } = await supabase
                            .from('profiles')
                            .select('id, username, full_name, avatar_url')
                            .in('id', userIds)

                        if (profileError) console.error('[ChatArea] Error fetching profiles:', profileError)

                        // 3. Merge data locally
                        const profileMap = new Map(profiles?.map((p: any) => [p.id, p]))
                        const joinedMessages = rawMessages.map((m: any) => ({
                            ...m,
                            profiles: profileMap.get(m.user_id) || null
                        }))

                        // Sort by created_at ascending (oldest first)
                        const sortedMessages = joinedMessages.sort((a: any, b: any) =>
                            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                        )

                        setMessages(sortedMessages)
                        setHasMore(sortedMessages.length >= 50)
                    } else {
                        setMessages([])
                        setHasMore(false)
                    }
                } catch (err) {
                    console.error('[ChatArea] Client-side fetch failed', err)
                    setHasMore(false)
                }
            }
            fetchInitial()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialMessages, groupId])

    return (
        <div className="chat-layout flex-1 bg-zinc-950">
            {/* Subtle ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-primary/[0.03] blur-[100px] pointer-events-none z-0" />

            {/* Dialogs/Drawers - outside the layout flow */}
            <ActiveChallengesDrawer
                isOpen={showChallenges}
                onOpenChange={setShowChallenges}
                groupId={groupId}
            />
            <MemberProfileDialog
                isOpen={!!selectedMember}
                onOpenChange={(open) => !open && setSelectedMember(null)}
                member={selectedMember}
            />
            <GroupDetails
                isOpen={showGroupDetails}
                onOpenChange={setShowGroupDetails}
                groupId={groupId}
                groupName={groupName}
                groupDescription={groupDescription}
                groupAvatarUrl={groupAvatarUrl}
                inviteCode={inviteCode}
                currentUserId={currentUserId}
            />

            {/* Header - Fixed at top */}
            <div className="chat-header">
                <div className="h-14 border-b border-zinc-800/50 flex items-center justify-between px-4 bg-zinc-900/95 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <Link href="/groups" className="md:hidden text-zinc-400 hover:text-white p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </Link>
                        <h2 className="font-medium text-sm text-white">{groupName}</h2>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowChallenges(true)}
                            className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-full h-9 w-9"
                        >
                            <Trophy className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowGroupDetails(true)}
                            className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-full h-9 w-9"
                        >
                            <Menu className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Challenge progress bar - part of header section */}
                <ChallengeProgressBar
                    groupId={groupId}
                    onOpenChallenges={() => setShowChallenges(true)}
                />
            </div>

            {/* Messages - Scrollable area */}
            <div className="chat-messages p-4 custom-scrollbar" onScroll={handleScroll}>
                {isLoadingMore && (
                    <div className="flex justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                    </div>
                )}
                <div className="space-y-4 max-w-3xl mx-auto pb-4">
                    <AnimatePresence mode="popLayout">
                        {messages.map((msg: any) => {
                            const isMe = msg.user_id === currentUserId
                            return (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}
                                >
                                    <div className="cursor-pointer" onClick={() => setSelectedMember({
                                        id: msg.user_id,
                                        ...profiles[msg.user_id]
                                    })}>
                                        <Avatar className="h-8 w-8 border border-zinc-700/50 transition-transform duration-200 hover:scale-105">
                                            <AvatarImage src={profiles[msg.user_id]?.avatar_url} />
                                            <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs">{profiles[msg.user_id]?.username?.slice(0, 2).toUpperCase() || (isMe ? 'TU' : 'U')}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                                        <span className="text-[10px] text-zinc-500 mb-1 px-1">
                                            {profiles[msg.user_id]?.username || profiles[msg.user_id]?.full_name || (isMe ? t('you') : t('unknown'))}
                                        </span>
                                        <div className={`rounded-2xl px-4 py-3 text-sm transition-all duration-200 ${isMe
                                            ? "bg-primary text-black rounded-tr-sm shadow-[0_2px_15px_rgba(191,245,73,0.15)]"
                                            : "bg-[#1A1A1D] border border-zinc-800/50 text-zinc-100 rounded-tl-sm"
                                            }`}>
                                            {msg.type === 'image' && msg.media_url ? (
                                                <div className="space-y-2">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={msg.media_url} alt="Shared" className="rounded-lg max-w-full max-h-60 object-cover border border-zinc-700/50 hover:scale-[1.02] transition-transform duration-200 cursor-pointer" />
                                                </div>
                                            ) : msg.type === 'habit_share' ? (
                                                <HabitShareMessage
                                                    habitTitle={msg.habit_title}
                                                    streak={msg.habit_streak}
                                                    category={msg.habit_category}
                                                    isMe={isMe}
                                                />
                                            ) : msg.type === 'video' && msg.media_url ? (
                                                <div className="space-y-2">
                                                    <video
                                                        src={msg.media_url}
                                                        controls
                                                        className="rounded-lg max-w-full max-h-60 border border-zinc-700/50"
                                                        preload="metadata"
                                                    />
                                                </div>
                                            ) : (
                                                msg.content
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                    {messages.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-20 text-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-zinc-900/50 border border-zinc-800 flex items-center justify-center mb-4">
                                <span className="text-2xl">👋</span>
                            </div>
                            <h3 className="text-zinc-300 font-medium mb-1">{t('startConversation')}</h3>
                            <p className="text-zinc-500 text-sm max-w-xs">
                                {t('beFirst')}
                            </p>
                        </motion.div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </div>

            {/* Footer - Fixed at bottom */}
            <div className="chat-footer border-t border-zinc-800/50 bg-zinc-900/95 backdrop-blur-md">
                <div className="p-3 pb-safe">
                    <div className="max-w-3xl mx-auto flex gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="shrink-0 text-zinc-500 hover:text-white hover:bg-zinc-800/50 transition-all duration-200 h-10 w-10"
                        >
                            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                        </Button>
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*,video/*" />

                        <Input
                            placeholder={t('placeholder')}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                            className="flex-1 bg-zinc-800/50 border-zinc-700/50 text-sm h-10 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all rounded-xl placeholder:text-zinc-500"
                        />
                        <Button
                            onClick={handleSend}
                            size="icon"
                            className="bg-primary text-black h-10 w-10 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(191,245,73,0.3)] shadow-[0_0_10px_rgba(191,245,73,0.1)]"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
