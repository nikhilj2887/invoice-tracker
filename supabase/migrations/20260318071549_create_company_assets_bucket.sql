/*
  # Create Storage Bucket for Company Logos

  1. Storage
    - Create 'company-assets' bucket for storing company logos
    - Set bucket to public for easy access to logos in invoices
    
  2. Notes
    - Bucket is public so logo URLs work in PDFs without authentication
    - File naming convention includes user_id to prevent conflicts
*/

-- Create the storage bucket for company assets (public bucket)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-assets', 
  'company-assets', 
  true,
  2097152, -- 2MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];