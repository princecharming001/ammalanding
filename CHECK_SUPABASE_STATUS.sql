-- ========================================
-- DIAGNOSTIC: Check Supabase Configuration
-- ========================================
-- Run this in Supabase SQL Editor to see what's wrong
-- ========================================

SELECT '========================================' as "Step";
SELECT '1. Checking if tables exist' as "Step";
SELECT '========================================' as "Step";

SELECT 
  tablename,
  CASE WHEN tablename IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'doctor_patients', 'patient_files', 'user_sessions');

SELECT '========================================' as "Step";
SELECT '2. Checking RLS status (should all be DISABLED)' as "Step";
SELECT '========================================' as "Step";

SELECT 
  tablename,
  rowsecurity,
  CASE 
    WHEN rowsecurity = false THEN '✅ DISABLED (Good!)'
    WHEN rowsecurity = true THEN '❌ ENABLED (This is the problem!)'
    ELSE '⚠️  Unknown status'
  END as status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'doctor_patients', 'patient_files', 'user_sessions')
ORDER BY tablename;

SELECT '========================================' as "Step";
SELECT '3. Checking for RLS policies (should be NONE)' as "Step";
SELECT '========================================' as "Step";

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  '❌ POLICY EXISTS - THIS BLOCKS INSERTS!' as warning
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'doctor_patients', 'patient_files', 'user_sessions');

-- If no results, that's good
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ No policies found - Good!'
    ELSE '❌ ' || COUNT(*) || ' policies found - These need to be removed!'
  END as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'doctor_patients', 'patient_files', 'user_sessions');

SELECT '========================================' as "Step";
SELECT '4. Checking permissions for anon role' as "Step";
SELECT '========================================' as "Step";

SELECT 
  table_name,
  privilege_type,
  CASE 
    WHEN privilege_type IN ('INSERT', 'SELECT', 'UPDATE', 'DELETE') THEN '✅ Has permission'
    ELSE '⚠️  ' || privilege_type
  END as status
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN ('users', 'doctor_patients', 'patient_files', 'user_sessions')
  AND grantee = 'anon'
ORDER BY table_name, privilege_type;

-- Check if anon has INSERT specifically
SELECT 
  table_name,
  CASE 
    WHEN COUNT(*) FILTER (WHERE privilege_type = 'INSERT') > 0 THEN '✅ Can INSERT'
    ELSE '❌ Cannot INSERT - THIS IS THE PROBLEM!'
  END as insert_status
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN ('users', 'doctor_patients', 'patient_files', 'user_sessions')
  AND grantee = 'anon'
GROUP BY table_name;

SELECT '========================================' as "Step";
SELECT '5. Checking sequence permissions' as "Step";
SELECT '========================================' as "Step";

SELECT 
  sequence_name,
  CASE 
    WHEN has_sequence_privilege('anon', sequence_schema || '.' || sequence_name, 'USAGE') 
    THEN '✅ anon has USAGE'
    ELSE '❌ anon lacks USAGE - THIS BLOCKS AUTO-INCREMENT!'
  END as anon_usage,
  CASE 
    WHEN has_sequence_privilege('anon', sequence_schema || '.' || sequence_name, 'SELECT') 
    THEN '✅ anon has SELECT'
    ELSE '❌ anon lacks SELECT'
  END as anon_select
FROM information_schema.sequences
WHERE sequence_schema = 'public'
  AND sequence_name IN ('doctor_patients_id_seq', 'patient_files_id_seq');

SELECT '========================================' as "Step";
SELECT '6. Test INSERT as anon user' as "Step";
SELECT '========================================' as "Step";

-- First check if test users exist
SELECT 
  CASE 
    WHEN COUNT(*) >= 2 THEN '✅ Test users exist'
    ELSE '❌ Test users missing - need to create them'
  END as user_status
FROM users
WHERE email IN ('apolakala@berkeley.edu', 'anish.polakala@gmail.com');

-- Try to insert as anon (this simulates your app)
DO $$ 
BEGIN
  -- Switch to anon role
  SET LOCAL ROLE anon;
  
  -- Try insert
  INSERT INTO patient_files (doctor_email, patient_email, file_type, file_url, file_name)
  VALUES ('apolakala@berkeley.edu', 'anish.polakala@gmail.com', 'file', 'https://test.com/diagnostic.pdf', 'DIAGNOSTIC_TEST.pdf');
  
  RAISE NOTICE '✅ INSERT SUCCESSFUL as anon role!';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ INSERT FAILED as anon role: %', SQLERRM;
END $$;

-- Clean up if successful
DELETE FROM patient_files WHERE file_name = 'DIAGNOSTIC_TEST.pdf';

SELECT '========================================' as "Step";
SELECT '7. SUMMARY' as "Step";
SELECT '========================================' as "Step";

SELECT 
  'If all checks show ✅, upload should work' as summary,
  'If any show ❌, run NUCLEAR_FIX_RLS.sql' as action;

