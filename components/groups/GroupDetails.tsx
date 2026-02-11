'use client'

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Info, LogOut, Trash2, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { GroupHabitsProgress } from "./GroupHabitsProgress"
import { GroupChallenges } from "./GroupChallenges"
import { MemberLeaderboard } from "./MemberLeaderboard"
import { MemberProfileDialog } from "./MemberProfileDialog"
import { InviteDialog } from "./InviteDialog"
import { MembersListDialog } from "./MembersListDialog"
import { GroupSettingsDialog } from "./GroupSettingsDialog"
import { leaveGroup, deleteGroup } from "@/app/[locale]/groups/actions"

interface GroupDetailsProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    groupId: string
    groupName: string
    groupDescription?: string
    groupAvatarUrl?: string
    inviteCode: string
    currentUserId: string
}

export function GroupDetails({
    isOpen,
    onOpenChange,
    groupId,
    groupName,
    groupDescription,
    groupAvatarUrl,
    inviteCode,
    currentUserId
}: GroupDetailsProps) {
    const [, setMembers] = useState<any[]>([])
    const [, setIsLoadingMembers] = useState(false)
    const [selectedMember, setSelectedMember] = useState<any>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)
    const supabase = createClient()
    const router = useRouter()
    const t = useTranslations('groups.details')

    useEffect(() => {
        if (isOpen) {
            fetchMembers()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            const mappedMembers = data.map((m: any) => ({
                id: m.profiles.id,
                username: m.profiles.username,
                fullName: m.profiles.full_name,
                avatarUrl: m.profiles.avatar_url,
                role: m.role
            }))
            setMembers(mappedMembers)

            // Check if current user is admin
            const currentMember = mappedMembers.find(m => m.id === currentUserId)
            setIsAdmin(currentMember?.role === 'admin')
        }
        setIsLoadingMembers(false)
    }

    const handleLeaveGroup = async () => {
        setActionLoading(true)
        const result = await leaveGroup(groupId)
        setActionLoading(false)
        setShowLeaveConfirm(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(t('success.left'))
            onOpenChange(false)
            router.push('/groups')
        }
    }

    const handleDeleteGroup = async () => {
        setActionLoading(true)
        const result = await deleteGroup(groupId)
        setActionLoading(false)
        setShowDeleteConfirm(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(t('success.deleted'))
            onOpenChange(false)
            router.push('/groups')
        }
    }

    return (
        <>
            <Sheet open={isOpen} onOpenChange={onOpenChange}>
                <SheetContent className="bg-zinc-950 border-zinc-800 w-full sm:max-w-md p-0 flex flex-col h-full bg-gradient-to-br from-zinc-950 to-zinc-900/50">
                    <SheetHeader className="px-6 py-5 border-b border-zinc-800/50 bg-zinc-900/20 backdrop-blur-md">
                        <SheetTitle className="text-white text-lg flex items-center gap-2">
                            <Info className="h-5 w-5 text-primary" />
                            {t('title')}
                        </SheetTitle>
                        <SheetDescription className="hidden">
                            {t('desc')}
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
                                    {t('tabs.ranking')}
                                </TabsTrigger>
                                <TabsTrigger value="challenges" className="data-[state=active]:bg-primary data-[state=active]:text-black text-xs">
                                    {t('tabs.challenges')}
                                </TabsTrigger>
                                <TabsTrigger value="progress" className="data-[state=active]:bg-primary data-[state=active]:text-black text-xs">
                                    {t('tabs.progress')}
                                </TabsTrigger>
                                <TabsTrigger value="info" className="data-[state=active]:bg-primary data-[state=active]:text-black text-xs">
                                    {t('tabs.info')}
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="ranking" className="flex-1 overflow-y-auto px-6 py-4 data-[state=inactive]:hidden">
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider text-xs">{t('sections.ranking')}</h3>
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
                                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider text-xs">{t('sections.challenges')}</h3>
                                <GroupChallenges groupId={groupId} isAdmin={isAdmin} />
                            </div>
                        </TabsContent>

                        <TabsContent value="progress" className="flex-1 overflow-y-auto px-6 py-4 data-[state=inactive]:hidden">
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider text-xs">{t('sections.progress')}</h3>
                                <GroupHabitsProgress groupId={groupId} />
                            </div>
                        </TabsContent>

                        <TabsContent value="info" className="flex-1 overflow-y-auto px-6 py-4 data-[state=inactive]:hidden">
                            <div className="space-y-6">
                                {/* Group Info */}
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider text-xs">{t('sections.info')}</h3>
                                    <p className="text-white text-lg font-medium">{groupName}</p>
                                </div>
                                {groupDescription && (
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider text-xs">{t('sections.description')}</h3>
                                        <p className="text-zinc-300 text-sm leading-relaxed bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/50">
                                            {groupDescription}
                                        </p>
                                    </div>
                                )}

                                {/* Group Actions */}
                                <div className="border-t border-zinc-800/50 pt-6">
                                    <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider text-xs mb-4">
                                        {t('sections.actions')}
                                    </h3>
                                    <div className="space-y-2">
                                        {/* Invite Members */}
                                        <InviteDialog inviteCode={inviteCode} groupName={groupName} />

                                        {/* View Members */}
                                        <MembersListDialog
                                            groupId={groupId}
                                            isAdmin={isAdmin}
                                            currentUserId={currentUserId}
                                        />

                                        {/* Settings - Admin only */}
                                        {isAdmin && (
                                            <GroupSettingsDialog
                                                group={{
                                                    id: groupId,
                                                    name: groupName,
                                                    description: groupDescription,
                                                    avatar_url: groupAvatarUrl
                                                }}
                                                onUpdate={() => {
                                                    router.refresh()
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Danger Zone */}
                                <div className="border-t border-red-900/30 pt-6">
                                    <h3 className="text-sm font-medium text-red-400/80 uppercase tracking-wider text-xs mb-4">
                                        {t('sections.danger')}
                                    </h3>
                                    <div className="space-y-2">
                                        {/* Leave Group */}
                                        <Button
                                            variant="ghost"
                                            onClick={() => setShowLeaveConfirm(true)}
                                            className="w-full justify-start gap-2 text-zinc-400 hover:text-red-400 hover:bg-red-900/20 h-9 transition-all duration-200"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            {t('actions.leave')}
                                        </Button>

                                        {/* Delete Group - Admin only */}
                                        {isAdmin && (
                                            <Button
                                                variant="ghost"
                                                onClick={() => setShowDeleteConfirm(true)}
                                                className="w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 h-9 transition-all duration-200"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                {t('actions.delete')}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </SheetContent>
            </Sheet>

            {/* Leave Group Confirmation */}
            <AlertDialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
                <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">{t('dialogs.leaveTitle')}</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                            {t('dialogs.leaveDesc', { name: groupName })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
                            {t('dialogs.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleLeaveGroup}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={actionLoading}
                        >
                            {actionLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {t('dialogs.leaving')}
                                </>
                            ) : t('actions.leave')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Group Confirmation */}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">{t('dialogs.deleteTitle')}</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                            {t('dialogs.deleteDesc', { name: groupName })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
                            {t('dialogs.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteGroup}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={actionLoading}
                        >
                            {actionLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {t('dialogs.deleting')}
                                </>
                            ) : t('dialogs.confirmDelete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
