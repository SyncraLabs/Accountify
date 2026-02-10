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

import { useTranslations } from "next-intl";

interface CreateHabitModalProps {
    trigger?: React.ReactNode;
    onSuccess?: (data: any) => void;
}

export function CreateHabitModal({ trigger, onSuccess }: CreateHabitModalProps) {
    const t = useTranslations('habits');
    const tCommon = useTranslations('common');
    const [open, setOpen] = useState(false);

    const formSchema = z.object({
        title: z.string().min(2, {
            message: t('validation.titleMinChars'),
        }),
        category: z.string().min(1, {
            message: t('validation.selectCategory'),
        }),
        frequency: z.string().min(1, {
            message: t('validation.selectFrequency'),
        }),
        description: z.string().optional(),
    })

    type FormValues = z.infer<typeof formSchema>

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
            toast.success(t('habitCreatedSuccess'))
            if (onSuccess) onSuccess(values)
            form.reset()
            setOpen(false)
        } catch (e) {
            console.error("Submission failed", e)
            toast.error(t('habitCreatedError'))
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> {t('newHabit')}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('createNewHabit')}</DialogTitle>
                    <DialogDescription>
                        {t('defineRoutine')}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('title')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('titlePlaceholder')} {...field} />
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
                                    <FormLabel>{t('category')}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('selectCategory')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="health">{tCommon('categories.health')}</SelectItem>
                                            <SelectItem value="mindset">{tCommon('categories.mindset')}</SelectItem>
                                            <SelectItem value="productivity">{tCommon('categories.productivity')}</SelectItem>
                                            <SelectItem value="finance">{t('categories.finance')}</SelectItem>
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
                                    <FormLabel>{t('frequency')}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('frequency')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="daily">{tCommon('frequencies.daily')}</SelectItem>
                                            <SelectItem value="weekdays">{t('frequencies.weekdays')}</SelectItem>
                                            <SelectItem value="weekends">{t('frequencies.weekends')}</SelectItem>
                                            <SelectItem value="3x_week">{t('frequencies.3xWeek')}</SelectItem>
                                            <SelectItem value="4x_week">{t('frequencies.4xWeek')}</SelectItem>
                                            <SelectItem value="5x_week">{t('frequencies.5xWeek')}</SelectItem>
                                            <SelectItem value="weekly">{tCommon('frequencies.weekly')}</SelectItem>
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
                                    <FormLabel>{t('motivation')}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={t('motivationPlaceholder')}
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit">{t('createHabit')}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
