"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Settings2, Share2, Users, Loader2, ChevronDown, ChevronRight, Check } from "lucide-react"
import { getUserGroups, getHabitSharingSettings, updateHabitSharingSettings } from "@/app/[locale]/groups/actions"
import { getHabits } from "@/app/actions"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

interface HabitSharingSettingsProps {
    className?: string
    triggerClassName?: string
}

interface Habit {
    id: string
    title: string
    category: string
}

interface Group {
    id: string
    name: string
    avatar_url?: string
}

interface ShareSetting {
    habit_id: string
    group_id: string
    auto_share: boolean
}

export function HabitSharingSettings({ className, triggerClassName }: HabitSharingSettingsProps) {
    const [open, setOpen] = useState(false)
    const [habits, setHabits] = useState<Habit[]>([])
    const [groups, setGroups] = useState<Group[]>([])
    const [shareSettings, setShareSettings] = useState<ShareSetting[]>([])
    const [expandedHabits, setExpandedHabits] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(false)
    const [updating, setUpdating] = useState<string | null>(null)

    useEffect(() => {
        if (open) {
            loadData()
        }
    }, [open])

    const loadData = async () => {
        setLoading(true)
        try {
            const [habitsResult, groupsData, sharingData] = await Promise.all([
                getHabits(),
                getUserGroups(),
                getHabitSharingSettings()
            ])

            setHabits(habitsResult?.habits || [])
            setGroups(groupsData || [])
            setShareSettings(sharingData.shares?.map((s: any) => ({
                habit_id: s.habit_id,
                group_id: s.group_id,
                auto_share: s.auto_share
            })) || [])
        } catch (error) {
            toast.error("Error al cargar configuración")
        } finally {
            setLoading(false)
        }
    }

    const toggleExpanded = (habitId: string) => {
        const newExpanded = new Set(expandedHabits)
        if (newExpanded.has(habitId)) {
            newExpanded.delete(habitId)
        } else {
            newExpanded.add(habitId)
        }
        setExpandedHabits(newExpanded)
    }

    const isSharedWithGroup = (habitId: string, groupId: string): boolean => {
        return shareSettings.some(s => s.habit_id === habitId && s.group_id === groupId)
    }

    const getSharedGroupsCount = (habitId: string): number => {
        return shareSettings.filter(s => s.habit_id === habitId).length
    }

    const handleToggleShare = async (habitId: string, groupId: string) => {
        const key = `${habitId}-${groupId}`
        setUpdating(key)

        const currentlyShared = isSharedWithGroup(habitId, groupId)
        const newValue = !currentlyShared

        try {
            const result = await updateHabitSharingSettings(habitId, groupId, newValue)

            if (result.error) {
                toast.error(result.error)
            } else {
                // Update local state
                if (newValue) {
                    setShareSettings(prev => [...prev, { habit_id: habitId, group_id: groupId, auto_share: true }])
                } else {
                    setShareSettings(prev => prev.filter(s => !(s.habit_id === habitId && s.group_id === groupId)))
                }
                toast.success(newValue ? "Auto-compartir activado" : "Auto-compartir desactivado")
            }
        } catch (error) {
            toast.error("Error al actualizar")
        } finally {
            setUpdating(null)
        }
    }

    const getEmoji = (category: string) => {
        const emojiMap: Record<string, string> = {
            health: "💪",
            mindset: "🧘‍♂️",
            productivity: "📚",
            finance: "💰"
        }
        return emojiMap[category] || "⭐"
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    className={cn(
                        "gap-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50",
                        triggerClassName
                    )}
                >
                    <Settings2 className="h-4 w-4" />
                    <span>Configurar Auto-Compartir</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg bg-zinc-950 border-zinc-800">
                <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                        <Share2 className="h-5 w-5 text-primary" />
                        Configurar Auto-Compartir
                    </DialogTitle>
                    <p className="text-sm text-zinc-500 mt-2">
                        Cuando completes un hábito, se compartirá automáticamente con los grupos seleccionados.
                    </p>
                </DialogHeader>

                <ScrollArea className="h-[400px] pr-2 mt-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
                        </div>
                    ) : habits.length === 0 ? (
                        <div className="text-center py-12 text-zinc-500">
                            <div className="text-4xl mb-4">📝</div>
                            <p>No tienes hábitos creados aún.</p>
                        </div>
                    ) : groups.length === 0 ? (
                        <div className="text-center py-12 text-zinc-500">
                            <div className="text-4xl mb-4">👥</div>
                            <p>No perteneces a ningún grupo aún.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {habits.map(habit => {
                                const isExpanded = expandedHabits.has(habit.id)
                                const sharedCount = getSharedGroupsCount(habit.id)

                                return (
                                    <div
                                        key={habit.id}
                                        className="rounded-xl border border-zinc-800 overflow-hidden"
                                    >
                                        {/* Habit header */}
                                        <button
                                            onClick={() => toggleExpanded(habit.id)}
                                            className="w-full flex items-center justify-between p-4 hover:bg-zinc-900/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center text-xl">
                                                    {getEmoji(habit.category)}
                                                </div>
                                                <div className="text-left">
                                                    <h4 className="font-medium text-white">{habit.title}</h4>
                                                    <p className="text-xs text-zinc-500">
                                                        {sharedCount > 0 ? (
                                                            <span className="text-primary">
                                                                Compartiendo con {sharedCount} grupo{sharedCount !== 1 ? 's' : ''}
                                                            </span>
                                                        ) : (
                                                            "No se comparte automáticamente"
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            {isExpanded ? (
                                                <ChevronDown className="h-5 w-5 text-zinc-500" />
                                            ) : (
                                                <ChevronRight className="h-5 w-5 text-zinc-500" />
                                            )}
                                        </button>

                                        {/* Groups list */}
                                        {isExpanded && (
                                            <div className="border-t border-zinc-800 bg-zinc-900/30">
                                                {groups.map(group => {
                                                    const isShared = isSharedWithGroup(habit.id, group.id)
                                                    const isUpdatingThis = updating === `${habit.id}-${group.id}`

                                                    return (
                                                        <div
                                                            key={group.id}
                                                            className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50 last:border-0"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="h-8 w-8 rounded-lg">
                                                                    <AvatarImage src={group.avatar_url} />
                                                                    <AvatarFallback className="rounded-lg bg-zinc-800 text-zinc-400 text-xs">
                                                                        {group.name.substring(0, 2).toUpperCase()}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span className="text-sm text-zinc-300">{group.name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {isUpdatingThis && (
                                                                    <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                                                                )}
                                                                <Switch
                                                                    checked={isShared}
                                                                    onCheckedChange={() => handleToggleShare(habit.id, group.id)}
                                                                    disabled={isUpdatingThis}
                                                                    className="data-[state=checked]:bg-primary"
                                                                />
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </ScrollArea>

                {/* Info footer */}
                <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-xs text-zinc-400">
                        <span className="text-primary font-medium">Tip:</span> Los miembros del grupo podrán ver tu progreso diario en los hábitos que compartas.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
