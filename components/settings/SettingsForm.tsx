'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { Camera, Loader2, User, Share2 } from 'lucide-react';
import { HabitSharingSettings } from '@/components/habits/HabitSharingSettings';

interface Profile {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    context: string | null;
}

export function SettingsForm({ initialProfile }: { initialProfile: Profile | null }) {
    const [context, setContext] = useState(initialProfile?.context || '');
    const [username, setUsername] = useState(initialProfile?.username || '');
    const [fullName, setFullName] = useState(initialProfile?.full_name || '');
    const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar_url || '');

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const supabase = createClient();

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) {
                return;
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            setUploading(true);

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setAvatarUrl(publicUrl);
            toast.success('Avatar uploaded successfully');
        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            toast.error('Error uploading avatar!');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const updates = {
                id: user.id,
                username,
                full_name: fullName,
                avatar_url: avatarUrl,
                context,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase
                .from('profiles')
                .upsert(updates);

            if (error) {
                if (error.code === '23505') { // Unique violation
                    throw new Error('Username is already taken');
                }
                throw error;
            }

            toast.success('Settings saved successfully');
        } catch (error: any) {
            console.error('Error saving settings:', error);
            toast.error(error.message || 'Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl bg-black/40 border-primary/10 backdrop-blur-md">
            <CardHeader>
                <CardTitle className="text-2xl text-white">Your Profile</CardTitle>
                <CardDescription className="text-muted-foreground">
                    Manage your public profile and AI coach preferences.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center sm:flex-row gap-6">
                    <div className="relative group">
                        <Avatar className="h-24 w-24 border-2 border-primary/20">
                            <AvatarImage src={avatarUrl} alt={username || 'User'} className="object-cover" />
                            <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                                {username?.slice(0, 2).toUpperCase() || <User className="h-8 w-8" />}
                            </AvatarFallback>
                        </Avatar>
                        <div
                            className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {uploading ? (
                                <Loader2 className="h-6 w-6 text-white animate-spin" />
                            ) : (
                                <Camera className="h-6 w-6 text-white" />
                            )}
                        </div>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleAvatarUpload}
                            disabled={uploading}
                        />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-medium text-white">Profile Picture</h3>
                        <p className="text-xs text-muted-foreground">
                            Click on the image to upload a new one. <br />
                            Recommended size: 400x400px.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="username" className="text-white">Username</Label>
                        <Input
                            id="username"
                            placeholder="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="bg-secondary/20 border-primary/20 text-white placeholder:text-muted-foreground/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fullname" className="text-white">Display Name</Label>
                        <Input
                            id="fullname"
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="bg-secondary/20 border-primary/20 text-white placeholder:text-muted-foreground/50"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="context" className="text-white">Coach Context</Label>
                    <Textarea
                        id="context"
                        placeholder="E.g., I want to build muscle but I have a lower back injury..."
                        className="min-h-[150px] bg-secondary/20 border-primary/20 text-white placeholder:text-muted-foreground/50 resize-y"
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                        This information is used by the AI to verify your habits and provide advice.
                    </p>
                </div>

                {/* Habit Sharing Section */}
                <div className="space-y-3 pt-4 border-t border-zinc-800">
                    <div className="space-y-1">
                        <Label className="text-white flex items-center gap-2">
                            <Share2 className="h-4 w-4 text-primary" />
                            Auto-Compartir Hábitos
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            Configura qué hábitos se comparten automáticamente con tus grupos cuando los completas.
                        </p>
                    </div>
                    <HabitSharingSettings
                        triggerClassName="w-full justify-start bg-secondary/20 border border-primary/20 hover:bg-secondary/30"
                    />
                </div>

            </CardContent>
            <CardFooter className="flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={loading || uploading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 shadow-lg shadow-primary/20"
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </Button>
            </CardFooter>
        </Card>
    );
}
