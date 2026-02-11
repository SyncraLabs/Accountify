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
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('Unexpected error:', error);
        return { error: `Error inesperado: ${error.message}` };
    }
}

// ============================================
// HABIT MANAGEMENT ACTIONS
// ============================================

export async function updateHabit(habitId: string, data: Partial<CreateHabitData>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'No autenticado' };
    }

    // Verify ownership
    const { data: habit, error: fetchError } = await supabase
        .from('habits')
        .select('id')
        .eq('id', habitId)
        .eq('user_id', user.id)
        .single();

    if (fetchError || !habit) {
        return { error: 'Hábito no encontrado' };
    }

    const { error } = await supabase
        .from('habits')
        .update(data)
        .eq('id', habitId)
        .eq('user_id', user.id);

    if (error) {
        console.error('Error updating habit:', error);
        return { error: error.message };
    }

    revalidatePath('/calendar');
    revalidatePath('/coach');
    revalidatePath('/dashboard');
    return { success: true };
}

export async function getHabitsWithRoutines() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { routines: [], standaloneHabits: [], error: 'No autenticado' };
    }

    // Fetch all routines with their habits
    const { data: routines, error: routinesError } = await supabase
        .from('routines')
        .select(`
            id,
            title,
            description,
            category,
            created_at,
            habits (
                id,
                title,
                category,
                frequency,
                description,
                streak,
                habit_logs (completed_date)
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (routinesError) {
        console.error('Error fetching routines:', routinesError);
        return { routines: [], standaloneHabits: [], error: routinesError.message };
    }

    // Fetch standalone habits (no routine_id)
    const { data: standaloneHabits, error: habitsError } = await supabase
        .from('habits')
        .select(`
            id,
            title,
            category,
            frequency,
            description,
            streak,
            habit_logs (completed_date)
        `)
        .eq('user_id', user.id)
        .is('routine_id', null)
        .order('created_at', { ascending: false });

    if (habitsError) {
        console.error('Error fetching standalone habits:', habitsError);
        return { routines: routines || [], standaloneHabits: [], error: habitsError.message };
    }

    return { routines: routines || [], standaloneHabits: standaloneHabits || [], error: null };
}

// ============================================
// CONVERSATIONAL COACH ACTIONS
// ============================================

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    suggestion?: RoutineSuggestion;
}

export async function sendCoachMessage(
    message: string,
    conversationHistory: ChatMessage[],
    currentHabits: any[]
) {
    try {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
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

        const systemPrompt = `Eres un coach de alto rendimiento de élite, combinando la sabiduría de expertos como Andrew Huberman (Salud), James Clear (Hábitos), David Allen (Productividad), David Goggins (Disciplina) y Ryan Holiday (Mindset).

Tu objetivo es CONVERSAR con el usuario para entender sus metas y luego diseñar una RUTINA personalizada.

**MODO DE CONVERSACIÓN:**
- Si el mensaje del usuario es una pregunta, saludo, o necesita clarificación, responde de forma conversacional
- Haz preguntas para entender mejor sus objetivos, horarios, y preferencias
- Sé amigable pero profesional
- Solo genera una rutina cuando tengas suficiente contexto

**MODO DE RUTINA:**
- Cuando estés listo para sugerir, incluye el JSON de la rutina en tu respuesta
- El usuario puede pedir modificaciones después

**CONTEXTO DEL USUARIO:**
- Hábitos actuales: ${currentHabits.map(h => h.title).join(', ') || 'Ninguno'}
- Contexto/Preferencias: "${userContext}"

**FORMATO DE RESPUESTA:**
Responde SIEMPRE en JSON con esta estructura:
{
  "mode": "conversation" | "routine",
  "message": "Tu respuesta conversacional aquí (siempre en español)",
  "suggestion": null | {
    "title": "Nombre de la Rutina",
    "description": "Descripción inspiradora (max 150 chars)",
    "category": "Salud & Fitness | Mindset & Aprendizaje | Productividad | Creatividad | Social",
    "habits": [
      {
        "title": "Nombre del hábito",
        "category": "Categoría",
        "frequency": "Diario | Semanal | Mensual",
        "description": "Instrucción táctica breve",
        "reasoning": "Razón científica/lógica"
      }
    ]
  }
}

**IMPORTANTE:**
- Siempre responde en español
- Sé específico (ej: "500ml de agua con sal" en vez de "tomar agua")
- Sé motivador y profesional
- Si el usuario pide modificar una rutina sugerida, ajusta la sugerencia anterior`;

        // Build messages array with conversation history
        const messages: any[] = [
            { role: "system", content: systemPrompt }
        ];

        // Add conversation history
        for (const msg of conversationHistory) {
            messages.push({
                role: msg.role,
                content: msg.content
            });
        }

        // Add current message
        messages.push({ role: "user", content: message });

        const completion = await openai.chat.completions.create({
            messages,
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
        });

        const response = completion.choices[0].message.content;

        if (!response) {
            return { error: 'La IA no devolvió respuesta' };
        }

        let parsed: { mode: string; message: string; suggestion?: RoutineSuggestion };
        try {
            parsed = JSON.parse(response);
        } catch (parseError) {
            console.error('JSON Parse error:', parseError);
            return { error: 'Error al procesar la respuesta de IA' };
        }

        return {
            mode: parsed.mode,
            message: parsed.message,
            suggestion: parsed.suggestion || null
        };

    } catch (error: any) {
        console.error('Error in sendCoachMessage:', error);
        return { error: `Error interno de IA: ${error.message}` };
    }
}

// ============================================
// DAILY TASKS ACTIONS
// ============================================

export type CreateDailyTaskData = {
    title: string;
    scheduled_date: string;
    priority?: 'low' | 'medium' | 'high';
}

export async function getDailyTasks(date: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { tasks: [], error: 'Not authenticated' };
    }

    const { data: tasks, error } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('scheduled_date', date)
        .order('order_index', { ascending: true });

    if (error) {
        console.error('Error fetching daily tasks:', error);
        return { tasks: [], error: error.message };
    }

    return { tasks: tasks || [], error: null };
}

export async function createDailyTask(data: CreateDailyTaskData) {
    console.log('--- CREATE DAILY TASK ---');
    console.log('Data:', JSON.stringify(data));

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    console.log('User ID:', user?.id);

    if (!user) {
        console.log('ERROR: Not authenticated');
        return { error: 'Not authenticated' };
    }

    if (!data.title) {
        console.log('ERROR: Title is required');
        return { error: 'Title is required' };
    }

    // Get max order_index for this date
    const { data: existingTasks } = await supabase
        .from('daily_tasks')
        .select('order_index')
        .eq('user_id', user.id)
        .eq('scheduled_date', data.scheduled_date)
        .order('order_index', { ascending: false })
        .limit(1);

    const nextOrder = existingTasks && existingTasks.length > 0
        ? (existingTasks[0].order_index || 0) + 1
        : 0;

    console.log('Next order index:', nextOrder);

    const { data: task, error } = await supabase
        .from('daily_tasks')
        .insert({
            user_id: user.id,
            title: data.title,
            scheduled_date: data.scheduled_date,
            priority: data.priority || 'medium',
            order_index: nextOrder
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating daily task:', error);
        return { error: error.message };
    }

    console.log('Task created:', task?.id);
    revalidatePath(`/calendar/day/${data.scheduled_date}`);
    revalidatePath(`/calendar`);
    return { task, success: true };
}

export async function toggleTaskComplete(taskId: string) {
    console.log('--- TOGGLE TASK COMPLETE ---');
    console.log('Task ID:', taskId);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    console.log('User ID:', user?.id);

    if (!user) {
        console.log('ERROR: Not authenticated');
        return { error: 'Not authenticated' };
    }

    // Get current task state
    const { data: task, error: fetchError } = await supabase
        .from('daily_tasks')
        .select('completed, scheduled_date')
        .eq('id', taskId)
        .eq('user_id', user.id)
        .single();

    console.log('Current task state:', task, 'Error:', fetchError);

    if (fetchError || !task) {
        console.log('ERROR: Task not found');
        return { error: 'Task not found' };
    }

    const newCompleted = !task.completed;
    console.log('Setting completed to:', newCompleted);

    const { error } = await supabase
        .from('daily_tasks')
        .update({
            completed: newCompleted,
            completed_at: newCompleted ? new Date().toISOString() : null
        })
        .eq('id', taskId)
        .eq('user_id', user.id);

    if (error) {
        console.error('Error toggling task:', error);
        return { error: error.message };
    }

    console.log('Task toggled successfully! New state:', newCompleted);
    revalidatePath(`/calendar/day/${task.scheduled_date}`);
    revalidatePath(`/calendar`);
    return { success: true, completed: newCompleted };
}

export async function deleteDailyTask(taskId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    // Get task date for revalidation
    const { data: task } = await supabase
        .from('daily_tasks')
        .select('scheduled_date')
        .eq('id', taskId)
        .eq('user_id', user.id)
        .single();

    const { error } = await supabase
        .from('daily_tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);

    if (error) {
        console.error('Error deleting task:', error);
        return { error: error.message };
    }

    if (task) {
        revalidatePath(`/calendar/day/${task.scheduled_date}`);
    }
    return { success: true };
}

export async function createMultipleDailyTasks(tasks: CreateDailyTaskData[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    if (!tasks.length) {
        return { error: 'No tasks provided' };
    }

    const date = tasks[0].scheduled_date;

    // Get max order_index
    const { data: existingTasks } = await supabase
        .from('daily_tasks')
        .select('order_index')
        .eq('user_id', user.id)
        .eq('scheduled_date', date)
        .order('order_index', { ascending: false })
        .limit(1);

    let nextOrder = existingTasks && existingTasks.length > 0
        ? (existingTasks[0].order_index || 0) + 1
        : 0;

    const tasksToInsert = tasks.map((t, idx) => ({
        user_id: user.id,
        title: t.title,
        scheduled_date: t.scheduled_date,
        priority: t.priority || 'medium',
        order_index: nextOrder + idx
    }));

    const { data: createdTasks, error } = await supabase
        .from('daily_tasks')
        .insert(tasksToInsert)
        .select();

    if (error) {
        console.error('Error creating tasks:', error);
        return { error: error.message };
    }

    revalidatePath(`/calendar/day/${date}`);
    revalidatePath('/calendar');
    revalidatePath('/dashboard');
    return { success: true, tasks: createdTasks };
}

interface AIPlannerTask {
    title: string;
    priority: 'low' | 'medium' | 'high';
}

export async function planDayWithAI(userInput: string, date: string, existingHabits: any[]) {
    try {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return { error: 'Error de configuración: OpenAI API Key no configurada.' };
        }

        const OpenAI = (await import('openai')).default;
        const openai = new OpenAI({ apiKey });

        const systemPrompt = `Eres un asistente de productividad que ayuda a planificar el día.

Hábitos existentes del usuario para hoy: ${existingHabits.map(h => h.title).join(', ') || 'Ninguno'}
Fecha: ${date}

Basándote en lo que el usuario describe que necesita hacer hoy, crea una lista de tareas específicas y accionables.
NO dupliques los hábitos existentes.
Prioriza las tareas según su importancia/urgencia.

Responde SOLO en JSON válido:
{
  "tasks": [
    {
      "title": "Nombre de tarea (verbo + acción específica)",
      "priority": "low" | "medium" | "high"
    }
  ],
  "message": "Breve mensaje motivacional en español (1 oración)"
}

IMPORTANTE:
- Máximo 7 tareas
- Sé específico (ej: "Enviar email a María sobre proyecto X" en vez de "Emails")
- Usa español
- Las tareas deben ser completables en un día`;

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userInput }
            ],
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
        });

        const response = completion.choices[0].message.content;

        if (!response) {
            return { error: 'La IA no devolvió respuesta' };
        }

        let parsed: { tasks: AIPlannerTask[]; message: string };
        try {
            parsed = JSON.parse(response);
        } catch (parseError) {
            console.error('JSON Parse error:', parseError);
            return { error: 'Error al procesar la respuesta de IA' };
        }

        if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
            return { error: 'La IA no devolvió tareas válidas' };
        }

        return {
            tasks: parsed.tasks,
            message: parsed.message
        };

    } catch (error: any) {
        console.error('Error in planDayWithAI:', error);
        return { error: `Error interno de IA: ${error.message}` };
    }
}
