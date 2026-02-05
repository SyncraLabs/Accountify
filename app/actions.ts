'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type CreateHabitData = {
    title: string
    category: string
    frequency: string
    description?: string
}

export async function createHabit(data: CreateHabitData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    if (!data.title) {
        return { error: 'Title is required' }
    }

    console.log('Creating habit:', { ...data, userId: user.id })

    const { error } = await supabase
        .from('habits')
        .insert({
            user_id: user.id,
            ...data
        })

    if (error) {
        console.error('Error creating habit:', error)
        return { error: error.message }
    }

    revalidatePath('/calendar')
    revalidatePath('/')
    return { success: true }
}

export async function getHabits() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { habits: [], error: 'Not authenticated' }
    }

    const { data: habits, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching habits:', error)
        return { habits: [], error: error.message }
    }

    return { habits: habits || [], error: null }
}

export async function toggleHabitLog(habitId: string, date: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    console.log('Toggling habit log:', { habitId, date, userId: user.id })

    // Check if log exists
    const { data: existingLog, error: fetchError } = await supabase
        .from('habit_logs')
        .select('id')
        .eq('habit_id', habitId)
        .eq('completed_date', date)
        .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching habit log:', fetchError)
        return { error: `Error: ${fetchError.message}${fetchError.hint ? ` (${fetchError.hint})` : ''}` }
    }

    if (existingLog) {
        // Delete the log
        const { error } = await supabase
            .from('habit_logs')
            .delete()
            .eq('id', existingLog.id)

        if (error) {
            console.error('Error deleting habit log:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            })
            return { error: `Error: ${error.message}${error.hint ? ` (${error.hint})` : ''}` }
        }
    } else {
        // Create the log
        const { error } = await supabase
            .from('habit_logs')
            .insert({
                habit_id: habitId,
                completed_date: date,
            })

        if (error) {
            console.error('Error creating habit log:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            })
            return { error: `Error: ${error.message}${error.hint ? ` (${error.hint})` : ''}` }
        }
    }

    revalidatePath('/calendar')
    return { success: true }
}

export async function deleteHabit(habitId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    console.log('Deleting habit:', { habitId, userId: user.id })

    // Verify the habit belongs to the user before deleting
    const { data: habit, error: fetchError } = await supabase
        .from('habits')
        .select('id')
        .eq('id', habitId)
        .eq('user_id', user.id)
        .single()

    if (fetchError || !habit) {
        return { error: 'Habit not found or access denied' }
    }

    const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting habit:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        })
        return { error: `Error: ${error.message}${error.hint ? ` (${error.hint})` : ''}` }
    }

    revalidatePath('/calendar')
    revalidatePath('/')
    return { success: true }
}

interface RoutineSuggestion {
    title: string;
    description: string;
    category: string;
    habits: {
        title: string;
        category: string;
        frequency: string;
        description: string;
        reasoning: string;
    }[];
}

export async function generateRoutine(prompt: string, currentHabits: any[]) {
    try {
        console.log('--- GENERATING ROUTINE (OPENAI) ---');
        console.log('Prompt:', prompt);

        const apiKey = process.env.OPENAI_API_KEY;
        console.log('API Key configured:', !!apiKey);

        if (!apiKey) {
            console.error('API Key is missing');
            return { error: 'Error de configuración: OpenAI API Key no configurada.' };
        }

        // Fetch user context
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        let userContext = '';

        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('context')
                .eq('id', user.id)
                .single();
            userContext = profile?.context || '';
        }

        const OpenAI = (await import('openai')).default;
        const openai = new OpenAI({ apiKey });

        const systemPrompt = `You are an elite high-performance coach, combining the wisdom of experts like Andrew Huberman (Health), James Clear (Habits), David Allen (Productivity), and Ryan Holiday (Mindset).

Your goal is to design a powerful, cohesive **ROUTINE** (a project of habits) for the user.

Current habits context: ${currentHabits.map(h => h.title).join(', ') || 'None'}
User Detailed Context/Settings: "${userContext}"

User's Goal: "${prompt}"

1. Analyze the user's goal to determine the best "Niche/Persona":
   - **Health/Biohacking**? Use Huberman/Attia protocols.
   - **Productivity/Focus**? Use Deep Work/GTD principles.
   - **Mindset/Discipline**? Use Stoic/Goggins principles.
   - **Learning**? Use Ultra-learning principles.
   - **User Context**: ALWAYS Consider the user's specific context (injuries, preferences, equipment) if provided.

2. Create a **Routine** (a specific protocol, e.g., "Dopamine Detox Protocol" or "Monk Mode Morning").

3. Suggest 3-5 specific **Habits** that form this routine.

Return ONLY valid JSON with this structure:
{
  "title": "Name of the Routine (e.g., 'Morning Cortisol Protocol')",
  "description": "Inspiring description of what this routine achieves (max 150 chars)",
  "category": "One of: Salud & Fitness, Mindset & Aprendizaje, Productividad, Creatividad, Social",
  "habits": [
    {
      "title": "Habit Name (Actionable)",
      "category": "Same categories as above",
      "frequency": "Diario, Semanal, or Mensual",
      "description": "Brief tactical instruction",
      "reasoning": "Scientific/Logical reason why this specific habit works"
    }
  ]
}

**IMPORTANT**:
- Be specific (e.g., instead of "Drink water", say "Hydrate with 500ml water + salt").
- Use Spanish language for all content.
- Make it sound professional and motivating.`;

        console.log('Sending prompt to OpenAI (gpt-4o-mini)...');
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Create a routine for: ${prompt}. Consider my context.` }
            ],
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
        });

        const response = completion.choices[0].message.content;

        console.log('AI Response Raw:', response?.substring(0, 100) + '...');

        if (!response) {
            return { error: 'La IA no devolvió respuesta' };
        }

        let suggestion: RoutineSuggestion;
        try {
            suggestion = JSON.parse(response);
            console.log('Parsed suggestion:', suggestion.title);
        } catch (parseError) {
            console.error('JSON Parse error:', parseError);
            console.error('Failed JSON:', response);
            return { error: 'Error al procesar la respuesta de IA (Formato inválido)' };
        }

        if (!suggestion || !suggestion.habits) {
            console.error('Invalid structure:', suggestion);
            return { error: 'La IA no devolvió una rutina válida' };
        }

        return { suggestion };

    } catch (error: any) {
        console.error('Error generating routine:', error);
        return { error: `Error interno de IA: ${error.message}` };
    }
}

export async function createRoutineWithHabits(suggestion: RoutineSuggestion) {
    console.log('creating routine:', suggestion.title);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'No estás autenticado' };
    }

    try {
        // 1. Create Routine
        const { data: routine, error: routineError } = await supabase
            .from('routines')
            .insert({
                user_id: user.id,
                title: suggestion.title,
                description: suggestion.description,
                category: suggestion.category
            })
            .select()
            .single();

        if (routineError) {
            console.error('Error creating routine:', routineError);
            return { error: `Error al guardar la rutina: ${routineError.message}` };
        }

        console.log('Routine created:', routine.id);

        // 2. Create Habits linked to Routine
        const habitsToCreate = suggestion.habits.map(h => ({
            user_id: user.id,
            routine_id: routine.id,
            title: h.title,
            category: h.category,
            frequency: h.frequency,
            description: h.description,
        }));

        const { error: habitsError } = await supabase
            .from('habits')
            .insert(habitsToCreate);

        if (habitsError) {
            console.error('Error creating habits:', habitsError);
            return { error: `Error al guardar los hábitos: ${habitsError.message}` };
        }

        console.log('Habits created successfully');
        revalidatePath('/calendar');
        revalidatePath('/coach');
        return { success: true };
    } catch (error: any) {
        console.error('Unexpected error:', error);
        return { error: `Error inesperado: ${error.message}` };
    }
}
