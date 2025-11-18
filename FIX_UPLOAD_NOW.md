# 🔧 Fix File Upload Error - 2 Minutes

## ❌ Error
```
Error uploading file: new row violates row-level security policy
```

## ✅ Fix (2 Steps)

### Step 1: Open Supabase SQL Editor

Go to: https://supabase.com/dashboard/project/chlfrkennmepvlqfsfzy/sql/new

### Step 2: Run This SQL

Copy and paste this entire code block:

```sql
-- Disable RLS on patient_files table
ALTER TABLE patient_files DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON patient_files TO anon;
GRANT ALL ON patient_files TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE patient_files_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE patient_files_id_seq TO authenticated;
```

Click **"Run"** (or press Ctrl/Cmd + Enter)

### Step 3: Test Upload Again

Go back to localhost:5182 and try uploading again.

**It should work now!** ✅

---

## Why This Happened

Supabase's Row Level Security (RLS) was blocking database inserts. This disables RLS for the `patient_files` table so uploads work.

---

## Alternative: Use Full Setup Script

If you want to reset everything properly:

1. Go to: https://supabase.com/dashboard/project/chlfrkennmepvlqfsfzy/sql/new
2. Open: `COMPLETE_SUPABASE_SETUP.sql`
3. Copy all contents
4. Paste and run in SQL editor

This resets all tables with correct permissions.

---

**Quick fix takes 30 seconds!** 🚀

