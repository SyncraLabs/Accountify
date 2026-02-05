'use client'

import { useState, useEffect } from 'react'
import { getGroupMembers, promoteToAdmin, demoteFromAdmin, removeMember } from '@/app/groups/actions'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Users, MoreVertical, Shield, ShieldOff, UserMinus, Loader2, Crown } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface Member {
    userId: string
    role: string
    joinedAt: string
    profile: {
        id: string
        full_name: string | null
        avatar_url: string | null
    }
}

interface MembersListDialogProps {
    groupId: string
    isAdmin: boolean
    currentUserId?: string
}

export function MembersListDialog({ groupId, isAdmin, currentUserId }: MembersListDialogProps) {
    const [open, setOpen] = useState(false)
    const [members, setMembers] = useState<Member[]>([])
    const [loading, setLoading] = useState(false)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean
        type: 'promote' | 'demote' | 'remove'
        member: Member | null
    }>({ open: false, type: 'remove', member: null })

    const fetchMembers = async () => {
        setLoading(true)
        const result = await getGroupMembers(groupId)
        if (result.members) {
            setMembers(result.members)
        }
        setLoading(false)
    }

    useEffect(() => {
        if (open) {
            fetchMembers()
        }
    }, [open, groupId])

    const handleAction = async (type: 'promote' | 'demote' | 'remove', member: Member) => {
        setConfirmDialog({ open: true, type, member })
    }

    const executeAction = async () => {
        const { type, member } = confirmDialog
        if (!member) return

        setActionLoading(member.userId)
        setConfirmDialog({ open: false, type: 'remove', member: null })

        let result
        switch (type) {
            case 'promote':
                result = await promoteToAdmin(groupId, member.userId)
                if (result.success) toast.success(`${member.profile.full_name || 'Usuario'} ahora es admin`)
                break
            case 'demote':
                result = await demoteFromAdmin(groupId, member.userId)
                if (result.success) toast.success(`${member.profile.full_name || 'Usuario'} ya no es admin`)
                break
            case 'remove':
                result = await removeMember(groupId, member.userId)
                if (result.success) toast.success(`${member.profile.full_name || 'Usuario'} ha sido expulsado`)
                break
        }

        if (result?.error) {
            toast.error(result.error)
        } else {
            fetchMembers()
        }

        setActionLoading(null)
    }

    const getConfirmMessage = () => {
        const { type, member } = confirmDialog
        const name = member?.profile.full_name || 'este usuario'
        switch (type) {
            case 'promote':
                return `¿Estás seguro de que quieres hacer admin a ${name}?`
            case 'demote':
                return `¿Estás seguro de que quieres quitar los permisos de admin a ${name}?`
            case 'remove':
                return `¿Estás seguro de que quieres expulsar a ${name} del grupo?`
        }
    }

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 h-9 transition-all duration-200"
                    >
                        <Users className="h-4 w-4" />
                        Ver Miembros
                    </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900/95 backdrop-blur-xl border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-white">Miembros del Grupo</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            {members.length} miembro{members.length !== 1 ? 's' : ''}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="max-h-80 overflow-y-auto space-y-1">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 text-zinc-400 animate-spin" />
                            </div>
                        ) : members.length === 0 ? (
                            <p className="text-center text-zinc-500 py-8">No hay miembros</p>
                        ) : (
                            members.map((member) => (
                                <div
                                    key={member.userId}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors group"
                                >
                                    {/* Avatar */}
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
                                        {member.profile.avatar_url ? (
                                            <Image
                                                src={member.profile.avatar_url}
                                                alt={member.profile.full_name || ''}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-500 text-sm font-medium">
                                                {(member.profile.full_name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-white truncate">
                                                {member.profile.full_name || 'Usuario'}
                                            </span>
                                            {member.role === 'admin' && (
                                                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-primary/20 text-primary text-xs rounded">
                                                    <Crown className="h-3 w-3" />
                                                    Admin
                                                </span>
                                            )}
                                            {member.userId === currentUserId && (
                                                <span className="text-xs text-zinc-500">(tú)</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions (Admin only, not for self) */}
                                    {isAdmin && member.userId !== currentUserId && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-white"
                                                    disabled={actionLoading === member.userId}
                                                >
                                                    {actionLoading === member.userId ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <MoreVertical className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                                                {member.role === 'member' ? (
                                                    <DropdownMenuItem
                                                        onClick={() => handleAction('promote', member)}
                                                        className="text-zinc-300 focus:text-white focus:bg-zinc-800"
                                                    >
                                                        <Shield className="h-4 w-4 mr-2" />
                                                        Hacer Admin
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem
                                                        onClick={() => handleAction('demote', member)}
                                                        className="text-zinc-300 focus:text-white focus:bg-zinc-800"
                                                    >
                                                        <ShieldOff className="h-4 w-4 mr-2" />
                                                        Quitar Admin
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem
                                                    onClick={() => handleAction('remove', member)}
                                                    className="text-red-400 focus:text-red-300 focus:bg-zinc-800"
                                                >
                                                    <UserMinus className="h-4 w-4 mr-2" />
                                                    Expulsar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Confirmation Dialog */}
            <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
                <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">¿Confirmar acción?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                            {getConfirmMessage()}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={executeAction}
                            className={confirmDialog.type === 'remove'
                                ? "bg-red-600 hover:bg-red-700 text-white"
                                : "bg-primary text-black hover:bg-primary/90"
                            }
                        >
                            Confirmar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
