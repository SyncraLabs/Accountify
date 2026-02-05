
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase URL or Key')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSignup() {
    console.log('Testing Signup...')
    const email = `test-${Date.now()}@example.com`
    const password = 'password123'
    const fullName = 'Test Debugger'

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    })

    if (error) {
        console.error('❌ Signup Error:', JSON.stringify(error, null, 2))
        return
    }

    console.log('✅ Signup Success:', data)
}

testSignup()
