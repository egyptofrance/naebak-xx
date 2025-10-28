-- Create complaint_attachments table and storage bucket
-- Migration: 20251028_add_complaint_attachments.sql

-- Create complaint_attachments table
CREATE TABLE IF NOT EXISTS complaint_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  
  -- File information
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Path in storage bucket
  file_size BIGINT NOT NULL, -- Size in bytes
  file_type TEXT NOT NULL, -- MIME type
  
  -- Uploaded by
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_complaint_attachments_complaint_id ON complaint_attachments(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaint_attachments_uploaded_by ON complaint_attachments(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_complaint_attachments_created_at ON complaint_attachments(created_at DESC);

-- Enable RLS
ALTER TABLE complaint_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for complaint_attachments

-- Citizens can view attachments of their own complaints
CREATE POLICY "Citizens can view their complaint attachments"
  ON complaint_attachments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM complaints
      WHERE complaints.id = complaint_attachments.complaint_id
      AND complaints.citizen_id = auth.uid()
    )
  );

-- Deputies can view attachments of assigned complaints
CREATE POLICY "Deputies can view assigned complaint attachments"
  ON complaint_attachments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM complaints
      WHERE complaints.id = complaint_attachments.complaint_id
      AND complaints.assigned_deputy_id = auth.uid()
    )
  );

-- Admins can view all attachments
CREATE POLICY "Admins can view all complaint attachments"
  ON complaint_attachments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'admin')
    )
  );

-- Citizens can insert attachments to their own complaints
CREATE POLICY "Citizens can upload attachments to their complaints"
  ON complaint_attachments
  FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM complaints
      WHERE complaints.id = complaint_attachments.complaint_id
      AND complaints.citizen_id = auth.uid()
    )
  );

-- Citizens can delete their own attachments
CREATE POLICY "Citizens can delete their complaint attachments"
  ON complaint_attachments
  FOR DELETE
  USING (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM complaints
      WHERE complaints.id = complaint_attachments.complaint_id
      AND complaints.citizen_id = auth.uid()
    )
  );

-- Create storage bucket for complaint attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'complaint_attachments',
  'complaint_attachments',
  false, -- Not public, requires authentication
  10485760, -- 10MB limit
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'video/mp4',
    'video/quicktime',
    'audio/mpeg',
    'audio/wav'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for complaint_attachments bucket

-- Citizens can upload files to their own complaints
CREATE POLICY "Citizens can upload to their complaints"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'complaint_attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Citizens can read their own complaint files
CREATE POLICY "Citizens can read their complaint files"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'complaint_attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Deputies can read files of assigned complaints
CREATE POLICY "Deputies can read assigned complaint files"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'complaint_attachments'
    AND EXISTS (
      SELECT 1 FROM complaints
      WHERE complaints.assigned_deputy_id = auth.uid()
      AND complaints.citizen_id::text = (storage.foldername(name))[1]
    )
  );

-- Admins can read all complaint files
CREATE POLICY "Admins can read all complaint files"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'complaint_attachments'
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'admin')
    )
  );

-- Citizens can delete their own files
CREATE POLICY "Citizens can delete their complaint files"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'complaint_attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Add comments
COMMENT ON TABLE complaint_attachments IS 'Attachments for complaints (images, documents, etc.)';
COMMENT ON COLUMN complaint_attachments.file_path IS 'Path in storage bucket: {user_id}/{complaint_id}/{filename}';
COMMENT ON COLUMN complaint_attachments.file_size IS 'File size in bytes';
COMMENT ON COLUMN complaint_attachments.file_type IS 'MIME type of the file';

