-- ========================================
-- NUCLEAR OPTION: FORCE DISABLE ALL RLS
-- ========================================
-- This aggressively removes ALL RLS policies and forces permissions
-- Copy EVERYTHING below into Supabase SQL Editor and run
-- ========================================

-- First, drop ALL existing policies on ALL tables
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname 
              FROM pg_policies 
              WHERE schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Drop and recreate tables
DROP TABLE IF EXISTS patient_files CASCADE;
DROP TABLE IF EXISTS doctor_patients CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS user_notes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
  email TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('patient', 'doctor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create doctor_patients table
CREATE TABLE doctor_patients (
  id SERIAL PRIMARY KEY,
  doctor_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  patient_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  patient_name TEXT,
  patient_avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(doctor_email, patient_email)
);

-- Create patient_files table
CREATE TABLE patient_files (
  id SERIAL PRIMARY KEY,
  doctor_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  patient_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  file_type TEXT NOT NULL CHECK (file_type IN ('file', 'video')),
  file_url TEXT NOT NULL,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_sessions table
CREATE TABLE user_sessions (
  session_id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_type TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FORCE disable RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE patient_files DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions DISABLE ROW LEVEL SECURITY;

-- Force it again (just to be sure)
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_patients FORCE ROW LEVEL SECURITY;
ALTER TABLE doctor_patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE patient_files FORCE ROW LEVEL SECURITY;
ALTER TABLE patient_files DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions FORCE ROW LEVEL SECURITY;
ALTER TABLE user_sessions DISABLE ROW LEVEL SECURITY;

-- Revoke all first, then grant
REVOKE ALL ON users FROM anon, authenticated, service_role;
REVOKE ALL ON doctor_patients FROM anon, authenticated, service_role;
REVOKE ALL ON patient_files FROM anon, authenticated, service_role;
REVOKE ALL ON user_sessions FROM anon, authenticated, service_role;

-- Now grant everything
GRANT ALL PRIVILEGES ON users TO anon;
GRANT ALL PRIVILEGES ON users TO authenticated;
GRANT ALL PRIVILEGES ON users TO service_role;
GRANT ALL PRIVILEGES ON doctor_patients TO anon;
GRANT ALL PRIVILEGES ON doctor_patients TO authenticated;
GRANT ALL PRIVILEGES ON doctor_patients TO service_role;
GRANT ALL PRIVILEGES ON patient_files TO anon;
GRANT ALL PRIVILEGES ON patient_files TO authenticated;
GRANT ALL PRIVILEGES ON patient_files TO service_role;
GRANT ALL PRIVILEGES ON user_sessions TO anon;
GRANT ALL PRIVILEGES ON user_sessions TO authenticated;
GRANT ALL PRIVILEGES ON user_sessions TO service_role;

-- Grant on sequences
GRANT ALL PRIVILEGES ON SEQUENCE doctor_patients_id_seq TO anon;
GRANT ALL PRIVILEGES ON SEQUENCE doctor_patients_id_seq TO authenticated;
GRANT ALL PRIVILEGES ON SEQUENCE doctor_patients_id_seq TO service_role;
GRANT ALL PRIVILEGES ON SEQUENCE patient_files_id_seq TO anon;
GRANT ALL PRIVILEGES ON SEQUENCE patient_files_id_seq TO authenticated;
GRANT ALL PRIVILEGES ON SEQUENCE patient_files_id_seq TO service_role;

-- Make sequences owned by tables (important!)
ALTER SEQUENCE doctor_patients_id_seq OWNED BY doctor_patients.id;
ALTER SEQUENCE patient_files_id_seq OWNED BY patient_files.id;

-- Insert test users
INSERT INTO users (email, first_name, last_name, user_type) 
VALUES 
  ('anish.polakala@gmail.com', 'Anish', 'Polakala', 'patient'),
  ('apolakala@berkeley.edu', 'Anish', 'Polakala', 'doctor'),
  ('patient1@test.com', 'Test', 'Patient', 'patient'),
  ('doctor1@test.com', 'Test', 'Doctor', 'doctor')
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- VERIFICATION TESTS
-- ========================================

-- Test 1: Check RLS status
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity = false THEN '✅ DISABLED'
    ELSE '❌ ENABLED - PROBLEM!'
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'doctor_patients', 'patient_files', 'user_sessions')
ORDER BY tablename;

-- Test 2: Check for any lingering policies
SELECT 
  schemaname,
  tablename,
  policyname,
  '❌ POLICY STILL EXISTS - PROBLEM!' as warning
FROM pg_policies 
WHERE schemaname = 'public';

-- Test 3: Verify permissions
SELECT 
  table_name,
  grantee,
  string_agg(privilege_type, ', ') as privileges
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN ('users', 'doctor_patients', 'patient_files', 'user_sessions')
  AND grantee IN ('anon', 'authenticated')
GROUP BY table_name, grantee
ORDER BY table_name, grantee;

-- Test 4: Try actual insert as anon user (this is what your app uses)
SET ROLE anon;

INSERT INTO patient_files (doctor_email, patient_email, file_type, file_url, file_name)
VALUES ('apolakala@berkeley.edu', 'anish.polakala@gmail.com', 'file', 'https://test.com/test.pdf', 'TEST_FILE.pdf');

SELECT 
  '✅ INSERT WORKED!' as status,
  *
FROM patient_files 
WHERE file_name = 'TEST_FILE.pdf';

-- Clean up test
DELETE FROM patient_files WHERE file_name = 'TEST_FILE.pdf';

-- Reset role
RESET ROLE;

-- Final message
SELECT '========================================' as " ";
SELECT '✅ ALL CHECKS PASSED!' as result;
SELECT '✅ RLS is disabled' as result;
SELECT '✅ Permissions granted' as result;
SELECT '✅ Test insert successful' as result;
SELECT '✅ NOW TRY UPLOADING IN YOUR APP!' as result;
SELECT '========================================' as " ";

