-- ========================================
-- COMPLETE AMMA DATABASE SETUP v2
-- This will DROP and RECREATE everything
-- Run this ENTIRE script in Supabase SQL Editor
-- https://supabase.com/dashboard/project/nxibeiykcgxpbmkeadth/sql
-- ========================================

-- ========================================
-- STEP 1: DROP ALL EXISTING TABLES
-- ========================================
DROP TABLE IF EXISTS epic_audit_log CASCADE;
DROP TABLE IF EXISTS epic_patient_data CASCADE;
DROP TABLE IF EXISTS epic_tokens CASCADE;
DROP TABLE IF EXISTS doctor_patients CASCADE;
DROP TABLE IF EXISTS patient_files CASCADE;
DROP TABLE IF EXISTS demo_requests CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ========================================
-- STEP 2: CREATE USERS TABLE
-- ========================================
CREATE TABLE users (
  email TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('patient', 'doctor')),
  patient_key TEXT UNIQUE,
  profile_picture TEXT,
  doctor_photo TEXT,
  clinic_name TEXT,
  clinic_logo TEXT,
  voice_clip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- STEP 3: CREATE USER_SESSIONS TABLE
-- (Column names match what sessionManager.js expects)
-- ========================================
CREATE TABLE user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_type TEXT NOT NULL,
  profile_picture TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- STEP 4: CREATE DOCTOR_PATIENTS TABLE
-- ========================================
CREATE TABLE doctor_patients (
  id SERIAL PRIMARY KEY,
  doctor_email TEXT NOT NULL,
  patient_email TEXT NOT NULL,
  patient_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(doctor_email, patient_email)
);

-- ========================================
-- STEP 5: CREATE PATIENT_FILES TABLE
-- ========================================
CREATE TABLE patient_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_email TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- STEP 6: CREATE DEMO_REQUESTS TABLE (Waitlist)
-- ========================================
CREATE TABLE demo_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL,
  organization TEXT,
  phone TEXT,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- STEP 7: CREATE EPIC INTEGRATION TABLES
-- ========================================
CREATE TABLE epic_tokens (
  id SERIAL PRIMARY KEY,
  doctor_email TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  epic_base_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE epic_patient_data (
  id SERIAL PRIMARY KEY,
  doctor_email TEXT NOT NULL,
  epic_patient_id TEXT NOT NULL,
  epic_mrn TEXT,
  patient_name TEXT,
  patient_dob TEXT,
  clinical_notes TEXT,
  diagnoses JSONB DEFAULT '[]'::jsonb,
  medications JSONB DEFAULT '[]'::jsonb,
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(doctor_email, epic_patient_id)
);

CREATE TABLE epic_audit_log (
  id SERIAL PRIMARY KEY,
  doctor_email TEXT NOT NULL,
  patient_email TEXT,
  epic_patient_id TEXT,
  action TEXT NOT NULL,
  epic_resource_accessed TEXT,
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- STEP 8: DISABLE ROW LEVEL SECURITY (for dev)
-- ========================================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE patient_files DISABLE ROW LEVEL SECURITY;
ALTER TABLE demo_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE epic_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE epic_patient_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE epic_audit_log DISABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 9: GRANT ALL PERMISSIONS
-- ========================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ========================================
-- STEP 10: CREATE INDEXES FOR PERFORMANCE
-- ========================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_patient_key ON users(patient_key);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX idx_user_sessions_email ON user_sessions(user_email);
CREATE INDEX idx_doctor_patients_doctor ON doctor_patients(doctor_email);
CREATE INDEX idx_doctor_patients_patient ON doctor_patients(patient_email);
CREATE INDEX idx_doctor_patients_key ON doctor_patients(patient_key);
CREATE INDEX idx_patient_files_patient ON patient_files(patient_email);
CREATE INDEX idx_demo_requests_email ON demo_requests(email);
CREATE INDEX idx_epic_tokens_doctor ON epic_tokens(doctor_email);
CREATE INDEX idx_epic_patient_data_doctor ON epic_patient_data(doctor_email);

-- ========================================
-- STEP 11: INSERT DEMO PATIENTS
-- These are the pre-built patients for testing
-- ========================================

-- Patient 1: Anish Polakala - Primary demo patient
INSERT INTO users (email, first_name, last_name, user_type, patient_key, profile_picture) VALUES
('anish.polakala@example.com', 'Anish', 'Polakala', 'patient', '630651557', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face');

-- Patient 2: Priya Venkatesh
INSERT INTO users (email, first_name, last_name, user_type, patient_key, profile_picture) VALUES
('priya.venkatesh@example.com', 'Priya', 'Venkatesh', 'patient', '847291536', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face');

-- Patient 3: Kwame Asante
INSERT INTO users (email, first_name, last_name, user_type, patient_key, profile_picture) VALUES
('kwame.asante@example.com', 'Kwame', 'Asante', 'patient', '562839147', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face');

-- Patient 4: Mei Tanaka
INSERT INTO users (email, first_name, last_name, user_type, patient_key, profile_picture) VALUES
('mei.tanaka@example.com', 'Mei', 'Tanaka', 'patient', '391847562', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face');

-- Patient 5: Adaeze Okonkwo
INSERT INTO users (email, first_name, last_name, user_type, patient_key, profile_picture) VALUES
('adaeze.okonkwo@example.com', 'Adaeze', 'Okonkwo', 'patient', '725183946', 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face');

-- Patient 6: Raj Malhotra
INSERT INTO users (email, first_name, last_name, user_type, patient_key, profile_picture) VALUES
('raj.malhotra@example.com', 'Raj', 'Malhotra', 'patient', '483926175', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face');

-- Patient 7: Hana Kim
INSERT INTO users (email, first_name, last_name, user_type, patient_key, profile_picture) VALUES
('hana.kim@example.com', 'Hana', 'Kim', 'patient', '619284753', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face');

-- Patient 8: Chidi Eze
INSERT INTO users (email, first_name, last_name, user_type, patient_key, profile_picture) VALUES
('chidi.eze@example.com', 'Chidi', 'Eze', 'patient', '258374916', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face');

-- Patient 9: Sunita Sharma
INSERT INTO users (email, first_name, last_name, user_type, patient_key, profile_picture) VALUES
('sunita.sharma@example.com', 'Sunita', 'Sharma', 'patient', '847162935', 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face');

-- Patient 10: Tunde Williams
INSERT INTO users (email, first_name, last_name, user_type, patient_key, profile_picture) VALUES
('tunde.williams@example.com', 'Tunde', 'Williams', 'patient', '936582714', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face');

-- Patient 11: Yuki Nakamura
INSERT INTO users (email, first_name, last_name, user_type, patient_key, profile_picture) VALUES
('yuki.nakamura@example.com', 'Yuki', 'Nakamura', 'patient', '174629385', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face');

-- Patient 12: Amara Diallo
INSERT INTO users (email, first_name, last_name, user_type, patient_key, profile_picture) VALUES
('amara.diallo@example.com', 'Amara', 'Diallo', 'patient', '593847261', 'https://images.unsplash.com/photo-1507152832244-10d45c7eda57?w=150&h=150&fit=crop&crop=face');

-- Patient 13: Vikram Patel
INSERT INTO users (email, first_name, last_name, user_type, patient_key, profile_picture) VALUES
('vikram.patel@example.com', 'Vikram', 'Patel', 'patient', '628174953', 'https://images.unsplash.com/photo-1542178243-bc20204b769f?w=150&h=150&fit=crop&crop=face');

-- Patient 14: Nneka Uche
INSERT INTO users (email, first_name, last_name, user_type, patient_key, profile_picture) VALUES
('nneka.uche@example.com', 'Nneka', 'Uche', 'patient', '481726395', 'https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?w=150&h=150&fit=crop&crop=face');

-- ========================================
-- STEP 12: VERIFY SETUP
-- ========================================
SELECT '✅ DATABASE SETUP COMPLETE!' as status;

SELECT 'Tables created:' as info;
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

SELECT 'Demo patients ready to use:' as info;
SELECT 
  first_name || ' ' || last_name as name,
  patient_key as "Patient ID (enter this to add)"
FROM users 
WHERE user_type = 'patient'
ORDER BY first_name;

-- ========================================
-- DEMO PATIENT IDs FOR TESTING:
-- ========================================
-- 
-- Name                 | Patient ID
-- ---------------------|------------
-- Anish Polakala       | 630651557
-- Priya Venkatesh      | 847291536
-- Kwame Asante         | 562839147
-- Mei Tanaka           | 391847562
-- Adaeze Okonkwo       | 725183946
-- Raj Malhotra         | 483926175
-- Hana Kim             | 619284753
-- Chidi Eze            | 258374916
-- Sunita Sharma        | 847162935
-- Tunde Williams       | 936582714
-- Yuki Nakamura        | 174629385
-- Amara Diallo         | 593847261
-- Vikram Patel         | 628174953
-- Nneka Uche           | 481726395
--
-- HOW TO TEST:
-- 1. Login as Doctor (via Google)
-- 2. Click "Sync Patient"
-- 3. Enter any Patient ID above
-- 4. Patient appears in roster!
-- ========================================
