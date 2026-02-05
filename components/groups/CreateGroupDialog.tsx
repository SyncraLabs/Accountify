'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { createGroup } from '@/app/groups/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { PlusCircle } from 'lucide-react'
import { toast } from 'sonner'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button
            type="submit"
            disabled={pending}
            className="bg-primary text-black hover:bg-primary/90 transition-all duration-200 hover:shadow-[0_0_20px_rgba(191,245,73,0.3)]"
        >
            {pending ? 'Creando...' : 'Crear Grupo'}
        </Button>
    )
}

export function CreateGroupDialog() {
    const [open, setOpen] = useState(false)

    async function actionWrapper(formData: FormData) {
        const result = await createGroup({}, formData)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('¡Grupo creado!')
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full justify-start gap-2 border-zinc-700/50 bg-zinc-800/30 hover:bg-zinc-800/80 text-zinc-300 hover:text-white h-10 transition-all duration-200 hover:border-primary/30 hover:shadow-[0_0_15px_rgba(191,245,73,0.08)]"
                >
                    <PlusCircle className="h-4 w-4 text-primary" />
                    Crear Nuevo Grupo
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900/95 backdrop-blur-xl border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <DialogHeader>
                    <DialogTitle className="text-white">Crear Grupo de Disciplina</DialogTitle>
                    <DialogDescription className="text-zinc-400">Crea un espacio para que tu equipo se mantenga responsable.</DialogDescription>
                </DialogHeader>
                <form action={actionWrapper} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-zinc-300 text-sm">Nombre del Grupo</Label>
                        <Input id="name" name="name" placeholder="ej. Madrugadores" required className="bg-zinc-800/50 border-zinc-700/50 focus:border-primary/50 transition-colors" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-zinc-300 text-sm">Descripción (Opcional)</Label>
                        <Input id="description" name="description" placeholder="¿De qué trata este grupo?" className="bg-zinc-800/50 border-zinc-700/50 focus:border-primary/50 transition-colors" />
                    </div>
                    <DialogFooter>
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}


