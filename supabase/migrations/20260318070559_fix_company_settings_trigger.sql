/*
  # Fix Company Settings Auto-Creation

  1. Changes
    - Drop the old trigger that may cause issues
    - Remove the auto-creation trigger approach
    - Company settings will be created on first app use instead
  
  2. Notes
    - This prevents signup errors
    - Settings are created when user first accesses the app
*/

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_company_settings_for_user();

-- We'll handle company settings creation in the application code instead
-- This is more reliable than database triggers for auth.users table
