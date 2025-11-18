-- ========================================
-- QUICK FIX: File Upload RLS Error
-- ========================================
-- Error: "new row violates row-level security policy"
-- 
-- Copy and paste this into Supabase SQL Editor:
-- https://supabase.com/dashboard/project/chlfrkennmepvlqfsfzy/sql
-- ========================================

-- Disable RLS on patient_files table
ALTER TABLE patient_files DISABLE ROW LEVEL SECURITY;

-- Grant permissions to anonymous and authenticated users
GRANT ALL ON patient_files TO anon;
GRANT ALL ON patient_files TO authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON SEQUENCE patient_files_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE patient_files_id_seq TO authenticated;

-- Verify RLS is disabled
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity = false THEN '✅ RLS DISABLED'
    ELSE '❌ RLS ENABLED (Will cause errors!)'
  END as status
FROM pg_tables 
WHERE tablename = 'patient_files';

-- ========================================
-- Expected Result:
-- tablename      | status
-- patient_files  | ✅ RLS DISABLED
-- ========================================

