'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Copy, Check, Link2, QrCode, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

interface InviteDialogProps {
    inviteCode: string
    groupName: string
}

export function InviteDialog({ inviteCode, groupName }: InviteDialogProps) {
    const [open, setOpen] = useState(false)
    const [copiedCode, setCopiedCode] = useState(false)
    const [copiedLink, setCopiedLink] = useState(false)
    const t = useTranslations('groups.invite')

    const inviteLink = typeof window !== 'undefined'
        ? `${window.location.origin}/groups/join?code=${inviteCode}`
        : `${process.env.NEXT_PUBLIC_APP_URL || ''}/groups/join?code=${inviteCode}`

    const copyCode = () => {
        navigator.clipboard.writeText(inviteCode)
        setCopiedCode(true)
        toast.success(t('copiedCode'))
        setTimeout(() => setCopiedCode(false), 2000)
    }

    const copyLink = () => {
        navigator.clipboard.writeText(inviteLink)
        setCopiedLink(true)
        toast.success(t('copiedLink'))
        setTimeout(() => setCopiedLink(false), 2000)
    }

    const share = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: t('shareTitle', { name: groupName }),
                    text: t('shareText', { name: groupName }),
                    url: inviteLink
                })
            } catch (err) {
                // User cancelled or share failed
            }
        } else {
            copyLink()
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 h-9 transition-all duration-200"
                >
                    <Link2 className="h-4 w-4" />
                    {t('button')}
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900/95 backdrop-blur-xl border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] w-[90vw] max-w-[340px] sm:max-w-sm mx-auto max-h-[85vh] overflow-y-auto rounded-xl">
                <DialogHeader>
                    <DialogTitle className="text-white">{t('title')}</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        {t('desc')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Invite Code */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                            {t('codeLabel')}
                        </label>
                        <div className="flex items-center gap-2">
                            <code className="bg-zinc-800/80 px-3 sm:px-4 py-2.5 rounded-lg text-base sm:text-lg font-mono flex-1 text-center text-primary tracking-[0.2em] sm:tracking-[0.3em] border border-zinc-700/50">
                                {inviteCode}
                            </code>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-10 w-10 flex-shrink-0 text-zinc-400 hover:text-white hover:bg-zinc-700/50"
                                onClick={copyCode}
                            >
                                {copiedCode ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* Invite Link */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                            {t('linkLabel')}
                        </label>
                        <div className="flex items-center gap-2">
                            <div className="bg-zinc-800/80 px-3 py-2 rounded-lg text-xs sm:text-sm flex-1 text-zinc-300 truncate border border-zinc-700/50 min-w-0">
                                {inviteLink}
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-9 w-9 flex-shrink-0 text-zinc-400 hover:text-white hover:bg-zinc-700/50"
                                onClick={copyLink}
                            >
                                {copiedLink ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* QR Code */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                            <QrCode className="h-3.5 w-3.5" />
                            {t('qrLabel')}
                        </label>
                        <div className="relative flex justify-center p-4 sm:p-6 rounded-xl bg-gradient-to-br from-white via-zinc-50 to-zinc-100 border border-zinc-200 shadow-inner">
                            {/* Decorative corners */}
                            <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-primary/40 rounded-tl-sm" />
                            <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-primary/40 rounded-tr-sm" />
                            <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-primary/40 rounded-bl-sm" />
                            <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-primary/40 rounded-br-sm" />

                            <div className="p-2 sm:p-3 bg-white rounded-lg shadow-sm">
                                <QRCodeSVG
                                    value={inviteLink}
                                    size={100}
                                    level="M"
                                    includeMargin={false}
                                    fgColor="#18181b"
                                    bgColor="#ffffff"
                                    className="w-full h-auto max-w-[100px] sm:max-w-[140px]"
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-zinc-500 text-center">
                            {groupName}
                        </p>
                    </div>

                    {/* Share Button */}
                    <Button
                        onClick={share}
                        className="w-full bg-primary text-black hover:bg-primary/90 transition-all duration-200 hover:shadow-[0_0_20px_rgba(191,245,73,0.3)]"
                    >
                        <Share2 className="h-4 w-4 mr-2" />
                        {t('shareButton')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
