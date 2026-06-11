
CREATE POLICY "users upload own cert files" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id IN ('certificates','avatars') AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "users read own cert files" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id IN ('certificates','avatars') AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "users update own cert files" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id IN ('certificates','avatars') AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "users delete own cert files" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id IN ('certificates','avatars') AND auth.uid()::text = (storage.foldername(name))[1]);
