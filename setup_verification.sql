-- Enable RLS on profiles if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 1. Ensure Columns Exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS business_document_url TEXT,
ADD COLUMN IF NOT EXISTS license_document_url TEXT,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_license_verified BOOLEAN DEFAULT FALSE;

-- 2. Create Storage Buckets (if they don't exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('host-documents', 'host-documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('tourist-licenses', 'tourist-licenses', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Storage Policies (Allow public read, authenticated upload)

-- Host Documents Policies
CREATE POLICY "Public Access Host Docs"
ON storage.objects FOR SELECT
USING ( bucket_id = 'host-documents' );

CREATE POLICY "Auth Upload Host Docs"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'host-documents' AND auth.role() = 'authenticated' );

CREATE POLICY "Owner Update Host Docs"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'host-documents' AND auth.uid() = owner );

-- Tourist Licenses Policies
CREATE POLICY "Public Access Licenses"
ON storage.objects FOR SELECT
USING ( bucket_id = 'tourist-licenses' );

CREATE POLICY "Auth Upload Licenses"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'tourist-licenses' AND auth.role() = 'authenticated' );

CREATE POLICY "Owner Update Licenses"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'tourist-licenses' AND auth.uid() = owner );

-- 4. Set RLS Policies for Profiles Table (if needed)
-- Ensure 'admin' can read all profiles
DROP POLICY IF EXISTS "Admin Read All Profiles" ON profiles;
CREATE POLICY "Admin Read All Profiles"
ON profiles FOR SELECT
USING ( 
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin') 
  OR 
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
);

-- Ensure users can update their own profile (to save the URL)
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING ( auth.uid() = id );
