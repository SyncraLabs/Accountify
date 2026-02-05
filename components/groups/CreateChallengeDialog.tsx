'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Loader2, Plus } from "lucide-react"
import { createChallenge } from "@/app/groups/actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface CreateChallengeDialogProps {
    groupId: string
    onChallengeCreated?: () => void
}

export function CreateChallengeDialog({ groupId, onChallengeCreated }: CreateChallengeDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [date, setDate] = useState<Date>()
    const [endDate, setEndDate] = useState<Date>()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!date || !endDate) return toast.error("Selecciona las fechas de inicio y fin")

        setLoading(true)
        const formData = new FormData(e.currentTarget)

        try {
            const result = await createChallenge(groupId, {
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                target_value: Number(formData.get('target_value')),
                unit: formData.get('unit') as string,
                challenge_type: formData.get('challenge_type') as string,
                start_date: date.toISOString(),
                end_date: endDate.toISOString()
            })

            if (result.error) throw new Error(result.error)

            toast.success("Reto creado exitosamente")
            setOpen(false)
            onChallengeCreated?.()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/50">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Reto
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Reto</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>Título del Reto</Label>
                        <Input
                            name="title"
                            placeholder="Ej: 100 Flexiones"
                            className="bg-zinc-900 border-zinc-800"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Descripción</Label>
                        <Textarea
                            name="description"
                            placeholder="Detalles del reto..."
                            className="bg-zinc-900 border-zinc-800 resize-none h-20"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Objetivo</Label>
                            <Input
                                type="number"
                                name="target_value"
                                placeholder="100"
                                className="bg-zinc-900 border-zinc-800"
                                min="1"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Unidad</Label>
                            <Input
                                name="unit"
                                placeholder="Ej: reps, min, km"
                                className="bg-zinc-900 border-zinc-800"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Tipo de Reto</Label>
                        <Select name="challenge_type" defaultValue="count">
                            <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800">
                                <SelectItem value="count">Contador Acumulativo</SelectItem>
                                <SelectItem value="streak">Racha Diaria (Próximamente)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Inicio</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal bg-zinc-900 border-zinc-800",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP", { locale: es }) : <span>Seleccionar</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-800">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label>Fin</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal bg-zinc-900 border-zinc-800",
                                            !endDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {endDate ? format(endDate, "PPP", { locale: es }) : <span>Seleccionar</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-800">
                                    <Calendar
                                        mode="single"
                                        selected={endDate}
                                        onSelect={setEndDate}
                                        initialFocus
                                        disabled={(date) => date < (date || new Date())}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <Button type="submit" className="w-full bg-primary text-black hover:bg-primary/90 mt-4" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Crear Reto
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
