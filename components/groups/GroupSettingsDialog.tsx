'use client'

import { useState, useRef } from 'react'
import { updateGroupSettings } from '@/app/groups/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Settings, Camera, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

interface GroupSettingsDialogProps {
    group: {
        id: string
        name: string
        description?: string
        avatar_url?: string
    }
    onUpdate?: () => void
}

export function GroupSettingsDialog({ group, onUpdate }: GroupSettingsDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [name, setName] = useState(group.name)
    const [description, setDescription] = useState(group.description || '')
    const [avatarUrl, setAvatarUrl] = useState(group.avatar_url || '')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type and size
        if (!file.type.startsWith('image/')) {
            toast.error('Por favor selecciona una imagen')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('La imagen debe ser menor a 5MB')
            return
        }

        setUploading(true)
        try {
            const supabase = createClient()
            const fileExt = file.name.split('.').pop()
            const fileName = `${group.id}-${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('group-images')
                .upload(fileName, file, { upsert: true })

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('group-images')
                .getPublicUrl(fileName)

            setAvatarUrl(publicUrl)
            toast.success('¡Imagen subida!')
        } catch (error: any) {
            console.error('Error uploading image:', error)
            toast.error(error.message || 'Error al subir imagen')
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const result = await updateGroupSettings(group.id, {
            name: name.trim(),
            description: description.trim() || undefined,
            avatar_url: avatarUrl || undefined
        })

        setLoading(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('¡Grupo actualizado!')
            setOpen(false)
            onUpdate?.()
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
                    <Settings className="h-4 w-4" />
                    Configuración
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] sm:max-w-[425px]">
                <DialogHeader className="space-y-3 pb-4 border-b border-zinc-900">
                    <DialogTitle className="text-xl font-semibold text-white tracking-tight">Editar Grupo</DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        Personaliza la imagen, nombre y descripción de tu grupo de disciplina.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center gap-4">
                        <div
                            className="relative w-24 h-24 rounded-full overflow-hidden bg-zinc-900 border-2 border-zinc-800 hover:border-primary cursor-pointer transition-all duration-300 group shadow-xl"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {avatarUrl ? (
                                <Image
                                    src={avatarUrl}
                                    alt={name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-600 bg-zinc-900 group-hover:bg-zinc-800 transition-colors">
                                    <span className="text-3xl font-bold">{name.charAt(0).toUpperCase()}</span>
                                </div>
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-[2px]">
                                {uploading ? (
                                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                                ) : (
                                    <>
                                        <Camera className="h-6 w-6 text-white mb-1" />
                                        <span className="text-[10px] text-zinc-300 font-medium">CAMBIAR</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                        />
                        <div className="text-center">
                            <p className="text-sm font-medium text-white">Imagen del Grupo</p>
                            <p className="text-xs text-zinc-500 mt-0.5">Recomendado: 500x500px</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                                Nombre
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ej. Espartanos 300"
                                required
                                className="bg-zinc-900/50 border-zinc-800 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all h-10"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                                Descripción
                            </Label>
                            <Input
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="¿Cuál es el propósito de este grupo?"
                                className="bg-zinc-900/50 border-zinc-800 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all h-10"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="text-zinc-400 hover:text-white hover:bg-zinc-900"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || uploading}
                            className="bg-primary text-black hover:bg-primary/90 min-w-[120px] transition-all duration-200 hover:shadow-[0_0_20px_rgba(191,245,73,0.2)]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                'Guardar Cambios'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
