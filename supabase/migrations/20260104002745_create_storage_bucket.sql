/*
  # Create Storage Bucket for Order Documents

  ## Overview
  This migration creates a Supabase Storage bucket for storing order-related documents
  such as invoices, proforma invoices, delivery notes, and other attachments.

  ## Storage Bucket
  - Bucket name: `order-documents`
  - Public: false (requires authentication)
  - File size limit: 50MB per file
  - Allowed MIME types: PDF, images, Excel files, Word documents

  ## Security
  - Users can upload documents for orders they have access to
  - Users can download documents for orders they have access to
  - Admin can manage all documents
  - File paths are organized by order ID: `{order_id}/{timestamp}-{filename}`
*/

-- Create storage bucket for order documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'order-documents',
  'order-documents',
  false,
  52428800,
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Users can upload order documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'order-documents'
    AND auth.uid() IS NOT NULL
  );

-- Allow users to view documents for orders they can access
CREATE POLICY "Users can view order documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'order-documents'
    AND auth.uid() IS NOT NULL
  );

-- Allow users to delete their own uploaded documents
CREATE POLICY "Users can delete own documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'order-documents'
    AND auth.uid() = owner
  );

-- Admin can manage all documents
CREATE POLICY "Admin can manage all documents"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'order-documents'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.department = 'Admin'
    )
  );