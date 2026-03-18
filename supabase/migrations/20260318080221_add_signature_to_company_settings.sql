/*
  # Add Signature Support to Company Settings

  1. Changes
    - Add `signature_url` column to `company_settings` table to store uploaded signature images
    
  2. Details
    - Column is nullable to allow optional signatures
    - Uses text type to store URL from Supabase storage
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company_settings' AND column_name = 'signature_url'
  ) THEN
    ALTER TABLE company_settings ADD COLUMN signature_url text;
  END IF;
END $$;