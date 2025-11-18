-- ========================================
-- STORAGE POLICIES - ENABLE FILE ACCESS
-- ========================================
-- This allows uploads and downloads from patient-files bucket
-- Copy ALL and paste into Supabase SQL Editor
-- ========================================

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated downloads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Allow anyone to upload to patient-files bucket
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'patient-files');

-- Allow anyone to download from patient-files bucket  
CREATE POLICY "Allow public downloads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'patient-files');

-- Allow anyone to delete from patient-files bucket
CREATE POLICY "Allow public deletes"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'patient-files');

-- Also allow authenticated users (belt and suspenders)
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'patient-files');

CREATE POLICY "Allow authenticated downloads"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'patient-files');

CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'patient-files');

-- ========================================
-- VERIFICATION
-- ========================================

SELECT '========================================' as " ";
SELECT 'Storage Policies Created:' as " ";
SELECT '========================================' as " ";

SELECT 
  policyname,
  cmd as operation,
  '✅ Active' as status
FROM pg_policies 
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%patient-files%'
ORDER BY policyname;

SELECT '========================================' as " ";
SELECT 'Expected: 6 policies (uploads, downloads & deletes for public & authenticated)' as " ";
SELECT 'If you see 6 policies above, storage will work!' as " ";
SELECT '========================================' as " ";

