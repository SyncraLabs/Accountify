'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createChallenge } from "@/app/[locale]/groups/actions"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"

interface CreateChallengeDialogProps {
    groupId: string
    onChallengeCreated?: () => void
}

export function CreateChallengeDialog({ groupId, onChallengeCreated }: CreateChallengeDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        target_value: "",
        unit: "veces",
        challenge_type: "count",
        duration_days: "7"
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const startDate = new Date()
            const endDate = new Date()
            endDate.setDate(endDate.getDate() + parseInt(formData.duration_days))

            const result = await createChallenge(groupId, {
                title: formData.title,
                description: formData.description,
                target_value: parseInt(formData.target_value),
                unit: formData.unit,
                challenge_type: formData.challenge_type,
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0]
            })

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Reto creado correctamente")
                setOpen(false)
                setFormData({
                    title: "",
                    description: "",
                    target_value: "",
                    unit: "veces",
                    challenge_type: "count",
                    duration_days: "7"
                })
                onChallengeCreated?.()
            }
        } catch (error) {
            toast.error("Error al crear el reto")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full bg-primary text-black hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Nuevo Reto
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Reto</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Título del Reto</Label>
                        <Input
                            id="title"
                            placeholder="Ej: 100 Flexiones Diarias"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            className="bg-zinc-900 border-zinc-800"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                            id="description"
                            placeholder="Detalles sobre el reto..."
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="bg-zinc-900 border-zinc-800"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="target">Meta</Label>
                            <Input
                                id="target"
                                type="number"
                                min="1"
                                placeholder="Ej: 100"
                                value={formData.target_value}
                                onChange={(e) => setFormData(prev => ({ ...prev, target_value: e.target.value }))}
                                className="bg-zinc-900 border-zinc-800"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="unit">Unidad</Label>
                            <Input
                                id="unit"
                                placeholder="Ej: flexiones"
                                value={formData.unit}
                                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                                className="bg-zinc-900 border-zinc-800"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="duration">Duración</Label>
                        <Select
                            value={formData.duration_days}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, duration_days: value }))}
                        >
                            <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                <SelectValue placeholder="Selecciona duración" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800">
                                <SelectItem value="7">1 Semana</SelectItem>
                                <SelectItem value="14">2 Semanas</SelectItem>
                                <SelectItem value="30">1 Mes</SelectItem>
                                <SelectItem value="90">3 Meses</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading || !formData.title || !formData.target_value}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear Reto"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
