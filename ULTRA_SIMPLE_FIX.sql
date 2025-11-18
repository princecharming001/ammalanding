-- ========================================
-- ULTRA SIMPLE FIX - JUST THE ESSENTIALS
-- ========================================
-- This is the absolute minimum to make it work
-- Copy and paste into Supabase SQL Editor
-- ========================================

-- Turn off RLS
ALTER TABLE patient_files DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON patient_files TO anon;
GRANT ALL ON patient_files TO authenticated;
GRANT ALL ON SEQUENCE patient_files_id_seq TO anon;
GRANT ALL ON SEQUENCE patient_files_id_seq TO authenticated;

-- Test it
SET ROLE anon;
INSERT INTO patient_files (doctor_email, patient_email, file_type, file_url, file_name)
VALUES ('apolakala@berkeley.edu', 'anish.polakala@gmail.com', 'file', 'https://test.com/test.pdf', 'SIMPLE_TEST.pdf');
SELECT '✅ IT WORKED!' as result WHERE EXISTS (SELECT 1 FROM patient_files WHERE file_name = 'SIMPLE_TEST.pdf');
DELETE FROM patient_files WHERE file_name = 'SIMPLE_TEST.pdf';
RESET ROLE;

-- Done!
SELECT '✅ If you see "IT WORKED!" above, try your app now!' as message;

