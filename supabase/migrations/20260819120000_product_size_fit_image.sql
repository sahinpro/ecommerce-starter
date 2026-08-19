-- Optional Size & Fit image on products. Apply in the Supabase SQL editor.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS size_fit_image_id uuid REFERENCES public.media_assets (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS size_fit_image_url text;

CREATE INDEX IF NOT EXISTS products_size_fit_image_id_idx
  ON public.products (size_fit_image_id)
  WHERE size_fit_image_id IS NOT NULL;
