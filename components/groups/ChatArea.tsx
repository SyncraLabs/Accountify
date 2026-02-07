'use client'

import { useState, useEffect, useRef } from "react"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Paperclip, Loader2, Users, Info } from "lucide-react"
import { sendMessage, getGroupMessages } from "@/app/groups/actions"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { HabitShareMessage } from "@/components/groups/HabitShareMessage"
import { GroupHabitsProgress } from "@/components/groups/GroupHabitsProgress"
import { Play, Settings, Menu } from "lucide-react"
import { GroupDetails } from "./GroupDetails"


export function ChatArea({ groupId, initialMessages, groupName, currentUserId }: { groupId: string, initialMessages?: any[], groupName: string, currentUserId: string }) {
    const [messages, setMessages] = useState<any[]>(initialMessages || [])
    const [profiles, setProfiles] = useState<Record<string, any>>({})
    const [members, setMembers] = useState<any[]>([])
    const [input, setInput] = useState("")
    const scrollRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)
    const [showGroupDetails, setShowGroupDetails] = useState(false)
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
    }, [groupId, supabase, currentUserId])

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
                    const { data, error } = await getGroupMessages(groupId, 50)
                    if (data && data.length > 0) {
                        setMessages(data)
                        setHasMore(data.length >= 50)

                        // Fetch profiles
                        const userIds = Array.from(new Set(data.map((m: any) => m.user_id)));
                        fetchProfiles(userIds as string[]);
                    } else {
                        setHasMore(false)
                    }
                } catch (err) {
                    console.error('[ChatArea] Client-side fetch failed', err)
                }
            }
            fetchInitial()
        }
    }, [initialMessages, groupId])

    return (
        <div className="flex-1 flex flex-col relative h-[100dvh] bg-zinc-950">
            {/* Subtle ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-primary/[0.03] blur-[100px] pointer-events-none" />

            {/* Header */}
            <div className="h-14 border-b border-zinc-800/50 flex items-center justify-between px-5 shrink-0 bg-zinc-900/30 backdrop-blur-sm relative">
                <div className="flex items-center gap-3">
                    <Link href="/groups" className="md:hidden text-zinc-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </Link>
                    <h2 className="font-medium text-sm text-white">{groupName}</h2>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowGroupDetails(true)}
                    className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-full"
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </div>

            <GroupDetails
                isOpen={showGroupDetails}
                onOpenChange={setShowGroupDetails}
                groupId={groupId}
                groupName={groupName}
                currentUserId={currentUserId}
            />

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" onScroll={handleScroll}>
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
                                    <Avatar className="h-8 w-8 border border-zinc-700/50 transition-transform duration-200 hover:scale-105">
                                        <AvatarImage src={profiles[msg.user_id]?.avatar_url} />
                                        <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs">{profiles[msg.user_id]?.username?.slice(0, 2).toUpperCase() || (isMe ? 'TU' : 'U')}</AvatarFallback>
                                    </Avatar>
                                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                                        <span className="text-[10px] text-zinc-500 mb-1 px-1">
                                            {profiles[msg.user_id]?.username || profiles[msg.user_id]?.full_name || (isMe ? 'Tú' : 'Desconocido')}
                                        </span>
                                        <div className={`rounded-2xl px-4 py-3 text-sm transition-all duration-200 ${isMe
                                            ? "bg-primary text-black rounded-tr-sm shadow-[0_2px_15px_rgba(191,245,73,0.15)]"
                                            : "bg-[#1A1A1D] border border-zinc-800/50 text-zinc-100 rounded-tl-sm"
                                            }`}>
                                            {msg.type === 'image' && msg.media_url ? (
                                                <div className="space-y-2">
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
                            <h3 className="text-zinc-300 font-medium mb-1">¡Comienza la conversación!</h3>
                            <p className="text-zinc-500 text-sm max-w-xs">
                                Sé el primero en enviar un mensaje a este grupo.
                            </p>
                        </motion.div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </div>

            <div className="p-4 pb-4 border-t border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm shrink-0">
                <div className="max-w-3xl mx-auto flex gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="shrink-0 text-zinc-500 hover:text-white hover:bg-zinc-800/50 transition-all duration-200"
                    >
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                    </Button>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*,video/*" />

                    <Input
                        placeholder="Escribe un mensaje... Usa @nombre para mencionar"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        className="flex-1 bg-zinc-800/50 border-zinc-700/50 text-sm h-11 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all rounded-xl placeholder:text-zinc-500"
                    />
                    <Button
                        onClick={handleSend}
                        size="icon"
                        className="bg-primary text-black h-11 w-11 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(191,245,73,0.3)] shadow-[0_0_10px_rgba(191,245,73,0.1)]"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div >
    )
}


