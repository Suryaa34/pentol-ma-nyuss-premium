
-- Extend reviews with rating + photo (consolidate)
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS rating smallint NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS photo_url text;

ALTER TABLE public.reviews ALTER COLUMN content DROP NOT NULL;

DO $$ BEGIN
  ALTER TABLE public.reviews ADD CONSTRAINT reviews_user_menu_unique UNIQUE (user_id, menu_id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; END $$;

-- Function: has user purchased (paid) a given menu?
CREATE OR REPLACE FUNCTION public.has_purchased_menu(_user_id uuid, _menu_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.orders o
    JOIN public.order_items oi ON oi.order_id = o.id
    WHERE o.user_id = _user_id
      AND oi.menu_id = _menu_id
      AND o.status = 'paid'
  )
$$;

-- Replace insert policy to require purchase
DROP POLICY IF EXISTS "Users create own reviews" ON public.reviews;
CREATE POLICY "Buyers create reviews after paid order"
ON public.reviews FOR INSERT
WITH CHECK (auth.uid() = user_id AND public.has_purchased_menu(auth.uid(), menu_id));

-- Storage bucket for review photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('reviews', 'reviews', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Review photos public read" ON storage.objects;
CREATE POLICY "Review photos public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'reviews');

DROP POLICY IF EXISTS "Users upload own review photos" ON storage.objects;
CREATE POLICY "Users upload own review photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'reviews' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users delete own review photos" ON storage.objects;
CREATE POLICY "Users delete own review photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'reviews' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
