'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, Check, Flame, Users, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getGroupMembersProgress } from '@/app/[locale]/groups/actions'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface GroupHabitsProgressProps {
    groupId: string
}

interface MemberProgress {
    userId: string
    profile: {
        id: string
        full_name: string
        avatar_url?: string
        username?: string
    }
    habits: {
        id: string
        title: string
        category: string
        frequency: string
        completedToday: boolean
    }[]
    completedCount: number
    totalCount: number
    progress: number
}

export function GroupHabitsProgress({ groupId }: GroupHabitsProgressProps) {
    const [members, setMembers] = useState<MemberProgress[]>([])
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState(true)
    const [expandedMembers, setExpandedMembers] = useState<Set<string>>(new Set())

    useEffect(() => {
        loadProgress()

        // Set up real-time subscription for habit logs
        const supabase = createClient()
        const channel = supabase
            .channel(`group_progress:${groupId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'habit_logs',
                },
                () => {
                    // Refresh progress when any habit log changes
                    loadProgress()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [groupId])

    const loadProgress = async () => {
        try {
            const result = await getGroupMembersProgress(groupId)
            if (result.members) {
                setMembers(result.members)
            }
        } catch (error) {
            console.error('Error loading progress:', error)
        } finally {
            setLoading(false)
        }
    }

    const toggleMemberExpanded = (userId: string) => {
        const newSet = new Set(expandedMembers)
        if (newSet.has(userId)) {
            newSet.delete(userId)
        } else {
            newSet.add(userId)
        }
        setExpandedMembers(newSet)
    }

    const getEmoji = (category: string) => {
        const emojiMap: Record<string, string> = {
            health: "💪",
            mindset: "🧘",
            productivity: "📚",
            finance: "💰"
        }
        return emojiMap[category] || "⭐"
    }

    if (loading) {
        return (
            <div className="space-y-2">
                <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" />
                    Progreso del Grupo
                </h3>
                <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
                </div>
            </div>
        )
    }

    if (members.length === 0) {
        return (
            <div className="space-y-2">
                <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" />
                    Progreso del Grupo
                </h3>
                <div className="p-4 rounded-lg border border-dashed border-zinc-700/50 text-center">
                    <p className="text-xs text-zinc-500">
                        Nadie ha compartido hábitos aún
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            {/* Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between text-xs font-medium text-zinc-500 uppercase tracking-wider hover:text-zinc-400 transition-colors"
            >
                <span className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" />
                    Progreso del Grupo
                </span>
                {expanded ? (
                    <ChevronDown className="h-4 w-4" />
                ) : (
                    <ChevronRight className="h-4 w-4" />
                )}
            </button>

            {/* Content */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-2 pt-1">
                            {members.map((member, index) => {
                                const isExpanded = expandedMembers.has(member.userId)

                                return (
                                    <motion.div
                                        key={member.userId}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="rounded-lg border border-zinc-800/50 overflow-hidden bg-zinc-900/30"
                                    >
                                        {/* Member header */}
                                        <button
                                            onClick={() => toggleMemberExpanded(member.userId)}
                                            className="w-full p-2.5 flex items-center gap-2.5 hover:bg-zinc-800/30 transition-colors"
                                        >
                                            <Avatar className="h-7 w-7 rounded-full">
                                                <AvatarImage src={member.profile.avatar_url} />
                                                <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs">
                                                    {member.profile.full_name?.charAt(0) || '?'}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="flex-1 min-w-0 text-left">
                                                <p className="text-xs font-medium text-white truncate">
                                                    {member.profile.username || member.profile.full_name}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${member.progress}%` }}
                                                            transition={{ duration: 0.5, delay: index * 0.1 }}
                                                            className={cn(
                                                                "h-full rounded-full",
                                                                member.progress === 100 ? "bg-primary" : "bg-primary/60"
                                                            )}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] text-zinc-500 tabular-nums">
                                                        {member.completedCount}/{member.totalCount}
                                                    </span>
                                                </div>
                                            </div>

                                            {isExpanded ? (
                                                <ChevronDown className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                                            ) : (
                                                <ChevronRight className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                                            )}
                                        </button>

                                        {/* Habits list */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: 'auto' }}
                                                    exit={{ height: 0 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="overflow-hidden border-t border-zinc-800/50"
                                                >
                                                    <div className="py-1.5 px-2.5 space-y-1">
                                                        {member.habits.map(habit => (
                                                            <div
                                                                key={habit.id}
                                                                className={cn(
                                                                    "flex items-center gap-2 py-1.5 px-2 rounded-md text-xs",
                                                                    habit.completedToday
                                                                        ? "bg-primary/10"
                                                                        : "bg-zinc-800/30"
                                                                )}
                                                            >
                                                                <span className="text-sm">
                                                                    {getEmoji(habit.category)}
                                                                </span>
                                                                <span className={cn(
                                                                    "flex-1 truncate",
                                                                    habit.completedToday ? "text-white" : "text-zinc-400"
                                                                )}>
                                                                    {habit.title}
                                                                </span>
                                                                {habit.completedToday ? (
                                                                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                                                                ) : (
                                                                    <div className="h-3.5 w-3.5 rounded-full border border-zinc-600 shrink-0" />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
