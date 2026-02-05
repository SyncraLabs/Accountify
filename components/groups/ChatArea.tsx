'use client'

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Paperclip, Loader2 } from "lucide-react"
import { sendMessage } from "@/app/groups/actions"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { HabitShareMessage } from "@/components/groups/HabitShareMessage"

export function ChatArea({ groupId, initialMessages, groupName, currentUserId }: { groupId: string, initialMessages?: any[], groupName: string, currentUserId: string }) {
    const [messages, setMessages] = useState<any[]>(initialMessages || [])
    const [profiles, setProfiles] = useState<Record<string, any>>({})
    const [input, setInput] = useState("")
    const scrollRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)
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
                        if (prev.find(m => m.id === newMsg.id)) return prev
                        return [...prev, newMsg]
                    })
                    fetchProfiles([newMsg.user_id]);
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [groupId, supabase])

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages.length])

    const handleSend = async () => {
        if (!input.trim()) return
        const content = input

        const tempId = `temp-${Date.now()}`
        const optimisticMsg = {
            id: tempId,
            content,
            user_id: currentUserId,
            created_at: new Date().toISOString(),
            type: 'text',
            isOptimistic: true
        }

        setMessages(prev => [...prev, optimisticMsg])
        setInput("")

        const result = await sendMessage(groupId, content)

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

            const { error: uploadError } = await supabase.storage
                .from('group-media')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('group-media')
                .getPublicUrl(filePath)

            await sendMessage(groupId, '', 'image', publicUrl)
        } catch (error) {
            console.error("Upload failed", error)
            alert("Upload failed. Please ensure 'group-media' bucket exists and is public.")
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    return (
        <div className="flex-1 flex flex-col relative h-full bg-zinc-950">
            {/* Subtle ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-primary/[0.03] blur-[100px] pointer-events-none" />

            {/* Header */}
            <div className="h-14 border-b border-zinc-800/50 flex items-center gap-3 px-5 shrink-0 bg-zinc-900/30 backdrop-blur-sm relative">
                <Link href="/groups" className="md:hidden text-zinc-400 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                </Link>
                <h2 className="font-medium text-sm text-white">{groupName}</h2>
            </div>

            <ScrollArea className="flex-1 p-4">
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
                                        <div className={`rounded-xl p-3 text-sm transition-all duration-200 ${isMe
                                            ? "bg-primary text-black rounded-tr-none shadow-[0_2px_15px_rgba(191,245,73,0.15)]"
                                            : "bg-zinc-800/80 text-zinc-200 rounded-tl-none hover:bg-zinc-800"
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
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center text-zinc-500 mt-10 text-sm"
                        >
                            No hay mensajes aún. ¡Di hola! 👋
                        </motion.div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm shrink-0">
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
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*" />

                    <Input
                        placeholder="Escribe un mensaje..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        className="flex-1 bg-zinc-800/30 border-zinc-700/50 text-sm h-10 focus:border-primary/30 transition-colors"
                    />
                    <Button
                        onClick={handleSend}
                        size="icon"
                        className="bg-primary hover:bg-primary/90 text-black h-10 w-10 transition-all duration-200 hover:shadow-[0_0_20px_rgba(191,245,73,0.3)]"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}


