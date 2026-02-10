"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Users, Loader2, Check } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getUserGroups, getHabitSharingSettings, updateHabitSharingSettings } from "@/app/[locale]/groups/actions"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface QuickShareToggleProps {
    habitId: string
    className?: string
}

interface Group {
    id: string
    name: string
    avatar_url?: string
}

export function QuickShareToggle({ habitId, className }: QuickShareToggleProps) {
    const [open, setOpen] = useState(false)
    const [groups, setGroups] = useState<Group[]>([])
    const [sharedGroups, setSharedGroups] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(false)
    const [updating, setUpdating] = useState<string | null>(null)

    useEffect(() => {
        if (open) {
            loadData()
        }
    }, [open, habitId])

    const loadData = async () => {
        setLoading(true)
        try {
            const [groupsData, sharingData] = await Promise.all([
                getUserGroups(),
                getHabitSharingSettings(habitId)
            ])

            setGroups(groupsData || [])
            const sharedSet = new Set<string>(
                sharingData.shares?.map((s: any) => s.group_id) || []
            )
            setSharedGroups(sharedSet)
        } catch (error) {
            console.error("Error loading share data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleToggle = async (groupId: string) => {
        setUpdating(groupId)
        const isCurrentlyShared = sharedGroups.has(groupId)
        const newValue = !isCurrentlyShared

        try {
            const result = await updateHabitSharingSettings(habitId, groupId, newValue)

            if (result.error) {
                toast.error(result.error)
            } else {
                const newSet = new Set(sharedGroups)
                if (newValue) {
                    newSet.add(groupId)
                    toast.success("Auto-compartir activado")
                } else {
                    newSet.delete(groupId)
                    toast.success("Auto-compartir desactivado")
                }
                setSharedGroups(newSet)
            }
        } catch (error) {
            toast.error("Error al actualizar")
        } finally {
            setUpdating(null)
        }
    }

    const hasSharing = sharedGroups.size > 0

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-8 w-8 rounded-lg transition-all duration-200",
                        hasSharing
                            ? "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                            : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 hover:text-white",
                        className
                    )}
                    title={hasSharing ? `Compartiendo con ${sharedGroups.size} grupo(s)` : "Configurar auto-compartir"}
                >
                    <Share2 className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-72 p-0 bg-zinc-900 border-zinc-800"
                align="end"
            >
                <div className="p-3 border-b border-zinc-800">
                    <h4 className="font-medium text-white text-sm flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Auto-Compartir
                    </h4>
                    <p className="text-xs text-zinc-500 mt-1">
                        Se compartirá cuando completes este hábito
                    </p>
                </div>

                <div className="max-h-60 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
                        </div>
                    ) : groups.length === 0 ? (
                        <div className="py-8 text-center text-zinc-500 text-sm">
                            No perteneces a ningún grupo
                        </div>
                    ) : (
                        groups.map(group => {
                            const isShared = sharedGroups.has(group.id)
                            const isUpdating = updating === group.id

                            return (
                                <button
                                    key={group.id}
                                    onClick={() => handleToggle(group.id)}
                                    disabled={isUpdating}
                                    className={cn(
                                        "w-full flex items-center justify-between px-3 py-2.5 hover:bg-zinc-800/50 transition-colors",
                                        isShared && "bg-primary/5"
                                    )}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Avatar className="h-7 w-7 rounded-md">
                                            <AvatarImage src={group.avatar_url} />
                                            <AvatarFallback className="rounded-md bg-zinc-800 text-zinc-400 text-xs">
                                                {group.name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm text-zinc-200">{group.name}</span>
                                    </div>
                                    <div className="flex items-center">
                                        {isUpdating ? (
                                            <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                                        ) : isShared ? (
                                            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                                <Check className="h-3 w-3 text-black" />
                                            </div>
                                        ) : (
                                            <div className="h-5 w-5 rounded-full border-2 border-zinc-600" />
                                        )}
                                    </div>
                                </button>
                            )
                        })
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
