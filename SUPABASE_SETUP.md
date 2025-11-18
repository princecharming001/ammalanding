# 🚀 Supabase Setup (5 minutes)

## Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign in with GitHub (free)
4. Click "New Project"
5. Name it "unicorn-notes" (or anything)
6. Set a database password (save it!)
7. Choose region closest to you
8. Click "Create new project" (wait ~2 minutes)

## Step 2: Create Database Table
1. In your project, click "SQL Editor" in left sidebar
2. Paste this SQL and click "Run":

```sql
CREATE TABLE user_notes (
  email TEXT PRIMARY KEY,
  name TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Step 3: Get Your API Keys
1. Click "Settings" (gear icon) in left sidebar
2. Click "API" 
3. Copy:
   - **Project URL** (looks like: https://xxxxx.supabase.co)
   - **anon public** key (long string starting with "eyJ...")

## Step 4: Update Your Code
1. Open `src/supabaseClient.js`
2. Replace:
   - `'YOUR_SUPABASE_URL'` → paste your Project URL
   - `'YOUR_SUPABASE_ANON_KEY'` → paste your anon key

Example:
```javascript
const supabaseUrl = 'https://abcdefgh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

## Step 5: Test It!
1. Restart your dev server: `npm run dev -- --port 5182`
2. Go to http://localhost:5182/login
3. Sign in with Google
4. Type notes in the textbox
5. Click "Save Notes"
6. Refresh the page - your notes should still be there! ✅

## Verify in Supabase:
- Go to "Table Editor" in Supabase dashboard
- Click "user_notes" table
- You should see your email, name, and notes!

---

## 🎉 Done! Your app now:
- ✅ Saves user info to cloud database
- ✅ Persists notes across sessions
- ✅ Each user has their own private notes
- ✅ Ready to deploy publicly!

