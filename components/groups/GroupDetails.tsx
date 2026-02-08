'use client'

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area" // Ensure this is usable or use div
import { Info, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { GroupHabitsProgress } from "./GroupHabitsProgress"
import { GroupChallenges } from "./GroupChallenges"
import { MemberLeaderboard } from "./MemberLeaderboard"
import { MemberProfileDialog } from "./MemberProfileDialog"

interface GroupDetailsProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    groupId: string
    groupName: string
    groupDescription?: string
    currentUserId: string
}

export function GroupDetails({ isOpen, onOpenChange, groupId, groupName, groupDescription, currentUserId }: GroupDetailsProps) {
    const [members, setMembers] = useState<any[]>([])
    const [isLoadingMembers, setIsLoadingMembers] = useState(false)
    const [selectedMember, setSelectedMember] = useState<any>(null)
    const supabase = createClient()

    useEffect(() => {
        if (isOpen) {
            fetchMembers()
        }
    }, [isOpen, groupId])

    const fetchMembers = async () => {
        setIsLoadingMembers(true)
        const { data } = await supabase
            .from('group_members')
            .select(`
                user_id,
                role,
                profiles (
                    id,
                    username,
                    full_name,
                    avatar_url
                )
            `)
            .eq('group_id', groupId)

        if (data) {
            setMembers(data.map((m: any) => ({
                id: m.profiles.id,
                username: m.profiles.username,
                fullName: m.profiles.full_name,
                avatarUrl: m.profiles.avatar_url,
                role: m.role
            })))
        }
        setIsLoadingMembers(false)
    }

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="bg-zinc-950 border-zinc-800 w-full sm:max-w-md p-0 flex flex-col h-full bg-gradient-to-br from-zinc-950 to-zinc-900/50">
                <SheetHeader className="px-6 py-5 border-b border-zinc-800/50 bg-zinc-900/20 backdrop-blur-md">
                    <SheetTitle className="text-white text-lg flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        Detalles del Grupo
                    </SheetTitle>
                    <SheetDescription className="hidden">
                        Información y ajustes del grupo
                    </SheetDescription>
                </SheetHeader>

                <MemberProfileDialog
                    isOpen={!!selectedMember}
                    onOpenChange={(open) => !open && setSelectedMember(null)}
                    member={selectedMember}
                />

                <Tabs defaultValue="ranking" className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-6 pt-4 pb-2">
                        <TabsList className="w-full bg-zinc-900/50 border border-zinc-800/50 p-1 grid grid-cols-4">
                            <TabsTrigger value="ranking" className="data-[state=active]:bg-primary data-[state=active]:text-black text-xs">
                                Ranking
                            </TabsTrigger>
                            <TabsTrigger value="challenges" className="data-[state=active]:bg-primary data-[state=active]:text-black text-xs">
                                Retos
                            </TabsTrigger>
                            <TabsTrigger value="progress" className="data-[state=active]:bg-primary data-[state=active]:text-black text-xs">
                                Progreso
                            </TabsTrigger>
                            <TabsTrigger value="info" className="data-[state=active]:bg-primary data-[state=active]:text-black text-xs">
                                Info
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="ranking" className="flex-1 overflow-y-auto px-6 py-4 data-[state=inactive]:hidden">
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider text-xs">Clasificacion del Grupo</h3>
                            <MemberLeaderboard
                                groupId={groupId}
                                onMemberClick={(member) => setSelectedMember({
                                    id: member.userId,
                                    username: member.profile?.username,
                                    full_name: member.profile?.full_name,
                                    avatar_url: member.profile?.avatar_url,
                                    role: member.role,
                                    joined_at: member.joinedAt
                                })}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="challenges" className="flex-1 overflow-y-auto px-6 py-4 data-[state=inactive]:hidden">
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider text-xs">Retos del Grupo</h3>
                            <GroupChallenges groupId={groupId} isAdmin={members.find(m => m.id === currentUserId)?.role === 'admin'} />
                        </div>
                    </TabsContent>

                    <TabsContent value="progress" className="flex-1 overflow-y-auto px-6 py-4 data-[state=inactive]:hidden">
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider text-xs">Progreso Diario</h3>
                            <GroupHabitsProgress groupId={groupId} />
                        </div>
                    </TabsContent>

                    <TabsContent value="info" className="flex-1 overflow-y-auto px-6 py-4 data-[state=inactive]:hidden">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider text-xs">Nombre del Grupo</h3>
                                <p className="text-white text-lg font-medium">{groupName}</p>
                            </div>
                            {groupDescription && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider text-xs">Descripción</h3>
                                    <p className="text-zinc-300 text-sm leading-relaxed bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/50">
                                        {groupDescription}
                                    </p>
                                </div>
                            )}

                            <div className="pt-8">
                                <Button variant="destructive" className="w-full bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900/50">
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Salir del Grupo
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </SheetContent>
        </Sheet>
    )
}
