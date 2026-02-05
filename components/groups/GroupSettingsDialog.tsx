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
            <DialogContent className="bg-zinc-900/95 backdrop-blur-xl border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <DialogHeader>
                    <DialogTitle className="text-white">Configuración del Grupo</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Personaliza la información y apariencia del grupo
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center gap-3">
                        <div
                            className="relative w-20 h-20 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700 hover:border-primary/50 cursor-pointer transition-all group"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {avatarUrl ? (
                                <Image
                                    src={avatarUrl}
                                    alt={name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-500 text-2xl font-bold">
                                    {name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                {uploading ? (
                                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                                ) : (
                                    <Camera className="h-5 w-5 text-white" />
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
                        <p className="text-xs text-zinc-500">Haz clic para cambiar la imagen</p>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-zinc-300 text-sm">
                            Nombre del Grupo
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nombre del grupo"
                            required
                            className="bg-zinc-800/50 border-zinc-700/50 focus:border-primary/50 transition-colors"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-zinc-300 text-sm">
                            Descripción
                        </Label>
                        <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="¿De qué trata este grupo?"
                            className="bg-zinc-800/50 border-zinc-700/50 focus:border-primary/50 transition-colors"
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={loading || uploading}
                            className="bg-primary text-black hover:bg-primary/90 transition-all duration-200 hover:shadow-[0_0_20px_rgba(191,245,73,0.3)]"
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
