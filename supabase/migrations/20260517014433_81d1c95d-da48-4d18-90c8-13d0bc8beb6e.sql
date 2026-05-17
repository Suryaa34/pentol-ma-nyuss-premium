
REVOKE ALL ON FUNCTION public.has_purchased_menu(uuid, uuid) FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "Review photos public read" ON storage.objects;
CREATE POLICY "Review photos auth read"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'reviews');
