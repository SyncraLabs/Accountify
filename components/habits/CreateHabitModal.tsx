"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CalendarIcon, Plus } from "lucide-react"
import { createHabit } from "@/app/actions"
import { toast } from "sonner"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
    title: z.string().min(2, {
        message: "El título debe tener al menos 2 caracteres.",
    }),
    category: z.string().min(1, {
        message: "Selecciona una categoría.",
    }),
    frequency: z.string().min(1, {
        message: "Selecciona una frecuencia.",
    }),
    description: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface CreateHabitModalProps {
    trigger?: React.ReactNode;
    onSuccess?: (data: FormValues) => void;
}

export function CreateHabitModal({ trigger, onSuccess }: CreateHabitModalProps) {
    const [open, setOpen] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            category: "",
            frequency: "daily",
            description: "",
        },
    })

    async function onSubmit(values: FormValues) {
        console.log("Submitting:", values)
        try {
            const result = await createHabit(values)
            if (result.error) {
                console.error(result.error)
                toast.error(result.error)
                return
            }
            toast.success("¡Hábito creado exitosamente!")
            if (onSuccess) onSuccess(values)
            form.reset()
            setOpen(false)
        } catch (e) {
            console.error("Submission failed", e)
            toast.error("Error al crear el hábito")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Nuevo Hábito
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Hábito</DialogTitle>
                    <DialogDescription>
                        Define tu nueva rutina. La consistencia es la clave.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. Leer 30 min, Gym..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Categoría</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona una categoría" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="health">Salud & Fitness</SelectItem>
                                            <SelectItem value="mindset">Mindset & Aprendizaje</SelectItem>
                                            <SelectItem value="productivity">Productividad</SelectItem>
                                            <SelectItem value="finance">Finanzas</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="frequency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Frecuencia</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Frecuencia" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="daily">Diario</SelectItem>
                                            <SelectItem value="weekdays">Lunes a Viernes</SelectItem>
                                            <SelectItem value="weekends">Fines de semana</SelectItem>
                                            <SelectItem value="3x_week">3 veces por semana</SelectItem>
                                            <SelectItem value="4x_week">4 veces por semana</SelectItem>
                                            <SelectItem value="5x_week">5 veces por semana</SelectItem>
                                            <SelectItem value="weekly">1 vez por semana</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Motivación (Opcional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="¿Por qué quieres hacer esto?"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit">Crear Hábito</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
