# Setup Guide - Authentication & Company Settings

This guide will help you set up authentication and company branding for your invoice tracker.

## Important: Storage Bucket Configuration

For logo uploads to work, you need to create a storage bucket in Supabase:

### Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New Bucket**
4. Set bucket name to: `company-assets`
5. Set the bucket to **Public** (so logos can be displayed on invoices)
6. Click **Create Bucket**

### Step 2: Set Storage Policies

After creating the bucket, you need to set up policies:

1. Click on the `company-assets` bucket
2. Go to **Policies** tab
3. Click **New Policy**

Create these policies:

**For Upload (INSERT):**
```sql
-- Allow authenticated users to upload their logos
CREATE POLICY "Users can upload own logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'company-assets'
  AND (storage.foldername(name))[1] = 'logos'
);
```

**For Read (SELECT):**
```sql
-- Allow public read access to logos
CREATE POLICY "Public can view logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'company-assets');
```

**For Update:**
```sql
-- Allow users to update their own logos
CREATE POLICY "Users can update own logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'company-assets')
WITH CHECK (bucket_id = 'company-assets');
```

**For Delete:**
```sql
-- Allow users to delete their own logos
CREATE POLICY "Users can delete own logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'company-assets');
```

## Email Configuration (Optional)

By default, Supabase requires email verification. For development, you can disable this:

1. Go to **Authentication** → **Settings**
2. Scroll to **Email Auth**
3. Toggle off **Enable email confirmations**

For production, keep email verification enabled for security.

## Getting Started

### 1. Sign Up

1. Start the application
2. Click "Sign Up" on the login page
3. Enter your email and password
4. If email confirmation is enabled, check your email and click the verification link
5. Sign in with your credentials

### 2. Update Company Settings

After logging in:

1. Click **Settings** in the navigation bar
2. Fill in your company information:
   - Company Name
   - Address
   - Email
   - Phone
3. Upload your company logo (PNG, JPG up to 2MB)
4. Click **Save Changes**

### 3. Start Creating Invoices

Your company information and logo will now appear on:
- All invoice detail pages
- Downloaded PDF invoices

## Data Migration

If you created invoices before adding authentication, you'll need to assign them to your user:

```sql
-- Get your user ID
SELECT id, email FROM auth.users;

-- Update existing clients
UPDATE clients SET user_id = 'YOUR-USER-ID-HERE' WHERE user_id IS NULL;

-- Update existing invoices
UPDATE invoices SET user_id = 'YOUR-USER-ID-HERE' WHERE user_id IS NULL;
```

Replace `'YOUR-USER-ID-HERE'` with your actual user ID from the first query.

## Multi-User Support

The application now supports multiple users! Each user:
- Has their own clients, invoices, and company settings
- Can only see and manage their own data
- Has isolated analytics and dashboard data

## Security

- All data is protected by Row Level Security (RLS)
- Users can only access their own records
- Company logos are stored securely in Supabase Storage
- Authentication is handled by Supabase Auth

## Troubleshooting

### Logo Upload Fails

**Problem**: "Failed to upload logo" error
**Solution**: Make sure you've created the `company-assets` storage bucket and set up the policies as described above.

### Can't Create Invoices/Clients

**Problem**: Permission denied errors
**Solution**: Make sure you're logged in and the RLS policies are correctly applied.

### Email Verification Not Working

**Problem**: Not receiving verification emails
**Solution**:
1. Check your Supabase email settings
2. For development, you can disable email confirmation
3. Check spam folder

### Existing Data Not Showing

**Problem**: Old invoices/clients don't appear after adding auth
**Solution**: Run the data migration SQL queries above to assign existing records to your user account.

## Next Steps

1. Customize your company branding in Settings
2. Add your logo for professional invoices
3. Start creating invoices with your personalized information
4. All PDFs will now show your company details and logo

Enjoy your fully branded invoice tracker!
