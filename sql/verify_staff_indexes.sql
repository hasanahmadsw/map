-- Verify Staff Indexes
-- Run this query to check if all staff indexes exist

SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('staff', 'staff_translations')
  AND schemaname = 'public'
ORDER BY tablename, indexname;

-- Expected indexes:
-- staff table:
--   - idx_staff_created_desc
--   - idx_staff_role_created_desc
--   - idx_staff_password_changed_at
--   - idx_staff_name_trgm
--
-- staff_translations table:
--   - idx_staff_translations_staff_id (CRITICAL!)
--   - idx_staff_translations_lang_staff
--   - idx_staff_translations_default_per_staff
--   - idx_staff_translations_name_trgm
--   - idx_staff_translations_bio_trgm

