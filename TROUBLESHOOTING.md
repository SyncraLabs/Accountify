# 🔧 Troubleshooting: Can't Create Habits

## Quick Fix Steps

### Step 1: Visit the Diagnostic Page
Navigate to: **http://localhost:3001/diagnostic**

This page will:
- ✅ Check if your user profile exists
- ✅ Show detailed error messages
- ✅ **Automatically create your profile** if it's missing
- ✅ Display your current habits

### Step 2: Check the Results

#### If Profile is Missing (❌ Profile NOT found):
The diagnostic page will **automatically try to create it**. Refresh the page after seeing the creation result.

#### If Profile Creation Fails:
You'll see the exact error message. Common issues:
- **RLS Policy Error**: Row Level Security is blocking the insert
- **Permission Error**: The user doesn't have permission to insert

### Step 3: Manual Fix (If Auto-Fix Fails)

Go to your Supabase Dashboard and run this SQL:

```sql
-- Insert your profile manually
INSERT INTO public.profiles (id, full_name)
SELECT id, raw_user_meta_data->>'full_name'
FROM auth.users
WHERE id = auth.uid()
ON CONFLICT (id) DO NOTHING;
```

### Step 4: Try Creating a Habit Again

After the profile is created:
1. Go to http://localhost:3001/calendar
2. Click "Nuevo Hábito"
3. Fill in the form
4. Click "Crear Hábito"

You should now see the **actual error message** in the toast notification (not just "Error al guardar el hábito").

---

## Common Errors and Solutions

### Error: "insert or update on table 'habits' violates foreign key constraint"
**Cause**: No profile exists for your user  
**Fix**: Visit /diagnostic to auto-create it

### Error: "new row violates row-level security policy"
**Cause**: RLS policies are too restrictive  
**Fix**: Run the SQL script in `supabase/fix-habits.sql`

### Error: "permission denied for table habits"
**Cause**: RLS is enabled but no policies exist  
**Fix**: Run the RLS policies from `supabase/fix-habits.sql`

---

## Next Steps

1. **Visit**: http://localhost:3001/diagnostic
2. **Check**: The diagnostic results
3. **Try**: Creating a habit again
4. **Report**: The exact error message you see in the toast notification

The error message will now show the actual database error, making it much easier to fix! 🎯
