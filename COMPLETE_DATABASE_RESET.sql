-- ========================================
-- COMPLETE DATABASE RESET - COPY ALL OF THIS
-- ========================================
-- This will delete everything and recreate from scratch
-- Paste into: https://supabase.com/dashboard/project/chlfrkennmepvlqfsfzy/sql/new
-- Then click "Run"
-- ========================================

-- ========================================
-- STEP 1: DELETE EVERYTHING
-- ========================================

DROP TABLE IF EXISTS patient_files CASCADE;
DROP TABLE IF EXISTS doctor_patients CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS user_notes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ========================================
-- STEP 2: CREATE TABLES
-- ========================================

-- Users table
CREATE TABLE users (
  email TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('patient', 'doctor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Doctor-Patient relationships
CREATE TABLE doctor_patients (
  id SERIAL PRIMARY KEY,
  doctor_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  patient_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  patient_name TEXT,
  patient_avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(doctor_email, patient_email)
);

-- Patient files (medical records, PDFs, etc.)
CREATE TABLE patient_files (
  id SERIAL PRIMARY KEY,
  doctor_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  patient_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  file_type TEXT NOT NULL CHECK (file_type IN ('file', 'video')),
  file_url TEXT NOT NULL,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions
CREATE TABLE user_sessions (
  session_id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_type TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- STEP 3: DISABLE ROW LEVEL SECURITY (CRITICAL!)
-- ========================================

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE patient_files DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions DISABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 4: GRANT ALL PERMISSIONS
-- ========================================

-- Grant on tables
GRANT ALL ON users TO anon, authenticated, service_role;
GRANT ALL ON doctor_patients TO anon, authenticated, service_role;
GRANT ALL ON patient_files TO anon, authenticated, service_role;
GRANT ALL ON user_sessions TO anon, authenticated, service_role;

-- Grant on sequences (for auto-increment IDs)
GRANT ALL ON SEQUENCE doctor_patients_id_seq TO anon, authenticated, service_role;
GRANT ALL ON SEQUENCE patient_files_id_seq TO anon, authenticated, service_role;

-- ========================================
-- STEP 5: ADD TEST DATA
-- ========================================

INSERT INTO users (email, first_name, last_name, user_type) 
VALUES 
  ('patient1@test.com', 'John', 'Doe', 'patient'),
  ('doctor1@test.com', 'Jane', 'Smith', 'doctor'),
  ('anish.polakala@gmail.com', 'Anish', 'Polakala', 'patient'),
  ('apolakala@berkeley.edu', 'Anish', 'Polakala', 'doctor')
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check 1: Verify tables exist
SELECT 
  'Tables Created' as check_name,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'doctor_patients', 'patient_files', 'user_sessions');
-- Should show: count = 4

-- Check 2: Verify RLS is DISABLED (critical!)
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity = false THEN '✅ DISABLED (Good!)'
    ELSE '❌ ENABLED (Will cause errors!)'
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'doctor_patients', 'patient_files', 'user_sessions')
ORDER BY tablename;
-- All should show: ✅ DISABLED

-- Check 3: Verify permissions
SELECT 
  grantee,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN ('users', 'doctor_patients', 'patient_files', 'user_sessions')
  AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee;
-- Should show multiple rows with INSERT, SELECT, UPDATE, DELETE permissions

-- Check 4: Verify test data
SELECT * FROM users;
-- Should show 4 test users

-- Check 5: Test insert (this will prove it works!)
INSERT INTO patient_files (doctor_email, patient_email, file_type, file_url, file_name)
VALUES ('apolakala@berkeley.edu', 'anish.polakala@gmail.com', 'file', 'https://test.com/test.pdf', 'test.pdf');

SELECT 'Test insert successful!' as status, * FROM patient_files WHERE file_name = 'test.pdf';
-- Should show the test file

-- Clean up test
DELETE FROM patient_files WHERE file_name = 'test.pdf';

-- ========================================
-- SUCCESS MESSAGE
-- ========================================
-- If you see results from all checks above, you're ready!
-- 
-- Expected results:
-- ✅ Tables Created: 4
-- ✅ RLS Status: All DISABLED
-- ✅ Permissions: Multiple rows
-- ✅ Test Users: 4 users
-- ✅ Test Insert: Success
-- 
-- Now try uploading a file in your app!
-- ========================================

