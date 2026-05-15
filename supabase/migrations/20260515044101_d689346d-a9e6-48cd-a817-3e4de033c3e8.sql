
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_number text UNIQUE,
  ADD COLUMN IF NOT EXISTS buyer_name text,
  ADD COLUMN IF NOT EXISTS buyer_whatsapp text;

CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  seq int;
  d text;
  m text;
  y text;
BEGIN
  IF NEW.order_number IS NOT NULL AND NEW.order_number <> '' THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(COUNT(*), 0) + 1 INTO seq
  FROM public.orders
  WHERE date_trunc('month', created_at) = date_trunc('month', now());

  d := lpad(extract(day from now())::text, 2, '0');
  m := lpad(extract(month from now())::text, 2, '0');
  y := lpad((extract(year from now())::int % 100)::text, 2, '0');

  NEW.order_number := lpad(seq::text, 2, '0') || d || m || y;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_order_number ON public.orders;
CREATE TRIGGER trg_set_order_number
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.set_order_number();
