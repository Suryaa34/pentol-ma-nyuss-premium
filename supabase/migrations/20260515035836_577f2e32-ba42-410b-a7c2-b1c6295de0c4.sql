ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS sauces text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS with_broth boolean NOT NULL DEFAULT false;