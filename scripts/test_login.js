const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://egichnydxtyrelowbslk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnaWNobnlkeHR5cmVsb3dic2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0Mjk3NzMsImV4cCI6MjA4NTAwNTc3M30.jTpxbpPeLhUq4YWTfu_NEp07O7uDSvptuhuxIgempJM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function signIn() {
    console.log('Attempting to login...');
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test.appcountability@gmail.com',
        password: 'TestAccount123!',
    });

    if (error) {
        console.error('Error logging in:', error);
    } else {
        console.log('Login successful!');
        console.log('User ID:', data.user.id);
        console.log('Access Token exists:', !!data.session.access_token);
    }
}

signIn();
