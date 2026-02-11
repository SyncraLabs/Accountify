"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Plus } from "lucide-react";
import { createDailyTask } from "@/app/actions";
import { toast } from "sonner";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
    title: z.string().min(2, {
        message: "El título debe tener al menos 2 caracteres",
    }),
    priority: z.enum(['low', 'medium', 'high']),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateTaskDialogProps {
    dateStr: string;
    trigger?: React.ReactNode;
    onSuccess?: () => void;
}

export function CreateTaskDialog({ dateStr, trigger, onSuccess }: CreateTaskDialogProps) {
    const [open, setOpen] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            priority: "medium",
        },
    });

    async function onSubmit(values: FormValues) {
        try {
            const result = await createDailyTask({
                title: values.title,
                scheduled_date: dateStr,
                priority: values.priority,
            });

            if (result.error) {
                toast.error(result.error);
                return;
            }

            toast.success("Tarea creada");
            if (onSuccess) onSuccess();
            form.reset();
            setOpen(false);
        } catch (e) {
            toast.error("Error al crear la tarea");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Nueva Tarea
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Nueva Tarea</DialogTitle>
                    <DialogDescription>
                        Agrega una tarea para completar hoy
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tarea</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ej: Enviar informe al cliente"
                                            {...field}
                                            autoFocus
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="priority"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Prioridad</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona prioridad" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="high">
                                                <span className="flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-red-500" />
                                                    Alta
                                                </span>
                                            </SelectItem>
                                            <SelectItem value="medium">
                                                <span className="flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-yellow-500" />
                                                    Media
                                                </span>
                                            </SelectItem>
                                            <SelectItem value="low">
                                                <span className="flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-zinc-500" />
                                                    Baja
                                                </span>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={form.formState.isSubmitting}
                                className="w-full"
                            >
                                {form.formState.isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creando...
                                    </>
                                ) : (
                                    "Crear Tarea"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
