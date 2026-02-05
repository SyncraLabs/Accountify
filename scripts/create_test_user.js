const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://egichnydxtyrelowbslk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnaWNobnlkeHR5cmVsb3dic2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0Mjk3NzMsImV4cCI6MjA4NTAwNTc3M30.jTpxbpPeLhUq4YWTfu_NEp07O7uDSvptuhuxIgempJM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function signUp() {
    console.log('Attempting to sign up test user...');
    const { data, error } = await supabase.auth.signUp({
        email: 'test.appcountability@gmail.com',
        password: 'TestAccount123!',
        options: {
            data: {
                full_name: 'Test User',
            },
            // We don't care about the redirect for this script
        },
    });

    if (error) {
        console.error('Error creating user:', error);
    } else {
        console.log('User created successfully:', data);
    }
}

signUp();
