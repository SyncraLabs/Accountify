'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { logChallengeProgress } from "@/app/[locale]/groups/actions"
import { toast } from "sonner"

interface LogProgressDialogProps {
    challenge: {
        id: string
        title: string
        unit: string
    }
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function LogProgressDialog({ challenge, open, onOpenChange, onSuccess }: LogProgressDialogProps) {
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const value = Number(formData.get('value'))
        const note = formData.get('note') as string

        try {
            const result = await logChallengeProgress(challenge.id, value, note)
            if (result.error) throw new Error(result.error)

            toast.success("Progreso registrado")
            onOpenChange(false)
            onSuccess?.()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Registrar Progreso: {challenge.title}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>Cantidad ({challenge.unit})</Label>
                        <Input
                            type="number"
                            name="value"
                            placeholder="0"
                            className="bg-zinc-900 border-zinc-800 text-lg font-medium"
                            autoFocus
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Nota (Opcional)</Label>
                        <Textarea
                            name="note"
                            placeholder="Comentario sobre tu progreso..."
                            className="bg-zinc-900 border-zinc-800 resize-none h-20"
                        />
                    </div>

                    <Button type="submit" className="w-full bg-primary text-black hover:bg-primary/90 mt-2" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar Progreso
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
