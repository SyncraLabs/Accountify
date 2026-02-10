'use client'

import { useTranslations } from 'next-intl'

import { useState } from 'react'
import { joinGroup } from '@/app/[locale]/groups/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { UsersRound } from 'lucide-react'
import { toast } from 'sonner'

export function JoinGroupDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const t = useTranslations('groups.join')

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const code = formData.get('code') as string

        const result = await joinGroup(code)
        setLoading(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(t('success'))
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full justify-center gap-2 border-zinc-700/50 bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 hover:text-white h-10 transition-all duration-200 hover:border-zinc-600 font-medium"
                >
                    <UsersRound className="h-4 w-4" />
                    <span className="text-xs">{t('trigger')}</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900/95 backdrop-blur-xl border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <DialogHeader>
                    <DialogTitle className="text-white">{t('title')}</DialogTitle>
                    <DialogDescription className="text-zinc-400">{t('description')}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="code" className="text-zinc-300 text-sm">{t('codeLabel')}</Label>
                        <Input id="code" name="code" placeholder={t('codePlaceholder')} required className="bg-zinc-800/50 border-zinc-700/50 focus:border-primary/50 transition-colors font-mono tracking-wider" />
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-primary text-black hover:bg-primary/90 transition-all duration-200 hover:shadow-[0_0_20px_rgba(191,245,73,0.3)]"
                        >
                            {loading ? t('joining') : t('button')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}


