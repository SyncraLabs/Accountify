"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Share2, Users, Loader2, Check, Send } from "lucide-react"
import { getUserGroups, shareHabitCompletion } from "@/app/[locale]/groups/actions"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ShareHabitDialogProps {
    habitId: string
    habitTitle: string
    streak: number
    category: string
    className?: string
}

export function ShareHabitDialog({ habitId, habitTitle, streak, category, className }: ShareHabitDialogProps) {
    const [open, setOpen] = useState(false)
    const [groups, setGroups] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [sharing, setSharing] = useState<string | null>(null)

    useEffect(() => {
        if (open && groups.length === 0) {
            setLoading(true)
            getUserGroups()
                .then(data => {
                    setGroups(data)
                    setLoading(false)
                })
                .catch(() => setLoading(false))
        }
    }, [open])

    const handleShare = async (groupId: string, groupName: string) => {
        setSharing(groupId)
        try {
            const result = await shareHabitCompletion(groupId, habitId, habitTitle, streak, category)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(`Compartido en ${groupName}`)
                setOpen(false)
            }
        } catch (error) {
            toast.error("Error al compartir")
        } finally {
            setSharing(null)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={`h-9 w-9 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white rounded-xl border border-white/5 transition-all duration-300 ${className}`}
                    title="Compartir logro"
                >
                    <Share2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-zinc-950 border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                        <Share2 className="h-5 w-5 text-primary" />
                        Compartir Logro
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="rounded-xl bg-white/5 border border-white/5 p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-2xl">
                            {category === 'health' ? '💪' :
                                category === 'mindset' ? '🧘‍♂️' :
                                    category === 'productivity' ? '📚' : '💰'}
                        </div>
                        <div>
                            <h4 className="font-bold text-white">{habitTitle}</h4>
                            <p className="text-sm text-primary">¡Has completado tu hábito hoy!</p>
                        </div>
                    </div>

                    <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                        Selecciona un grupo
                    </div>

                    <ScrollArea className="h-[240px] pr-2">
                        {loading ? (
                            <div className="flex items-center justify-center h-20">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : groups.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No perteneces a ningún grupo aún.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {groups.map(group => (
                                    <button
                                        key={group.id}
                                        onClick={() => handleShare(group.id, group.name)}
                                        disabled={!!sharing}
                                        className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 rounded-lg border border-white/10">
                                                <AvatarImage src={group.avatar_url} />
                                                <AvatarFallback className="rounded-lg bg-zinc-900 text-zinc-400">
                                                    {group.name.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="font-medium text-zinc-200 group-hover:text-white transition-colors">
                                                {group.name}
                                            </div>
                                        </div>
                                        {sharing === group.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                        ) : (
                                            <Send className="h-4 w-4 text-zinc-500 group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    )
}
