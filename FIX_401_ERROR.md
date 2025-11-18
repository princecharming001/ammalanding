# 🚨 FIX 401 ERROR - Supabase Permissions

## The Problem:
**401 = Unauthorized** - Supabase Row Level Security (RLS) is blocking access to your table.

## Quick Fix (2 minutes):

### Step 1: Go to Supabase SQL Editor
1. Open https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in left sidebar
4. Click **"New Query"**

### Step 2: Disable RLS (for testing)
Paste this SQL and click **"Run"**:

```sql
-- Disable Row Level Security to allow access
ALTER TABLE user_notes DISABLE ROW LEVEL SECURITY;
```

### Step 3: Test Your App
1. Refresh your browser at localhost:5182
2. Sign in with Google
3. Try saving notes - should work now! ✅

---

## ✅ Verify It Worked:
1. Type some notes in the textarea
2. Click "Save Notes"
3. Check browser console (F12) - should see "Success!"
4. Refresh page - notes should still be there!

---

## 🔒 For Production (Optional - Add Later):
Once it's working, you can re-enable RLS with proper policies:

```sql
-- Re-enable RLS
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;

-- Allow public access (anyone can read/write)
CREATE POLICY "Allow all access" ON user_notes
FOR ALL USING (true);
```

---

## 🆘 Still Not Working?

**Check console (F12) for errors:**
- If you see "relation 'user_notes' does not exist" → Run the CREATE TABLE SQL from SUPABASE_SETUP.md
- If you see different error → Share it with me!

**Test Supabase connection:**
1. Go to "Table Editor" in Supabase
2. Click "user_notes" table
3. Can you see it? If not, create it first!

