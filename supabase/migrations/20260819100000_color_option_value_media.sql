-- Color-first media: attach images to a Color option value, not each size/color variant.
-- Apply in the Supabase SQL editor. Safe to re-run.

CREATE TABLE IF NOT EXISTS public.product_option_value_media (
  option_value_id uuid NOT NULL REFERENCES public.product_option_values (id) ON DELETE CASCADE,
  media_asset_id uuid NOT NULL REFERENCES public.media_assets (id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  PRIMARY KEY (option_value_id, media_asset_id)
);

CREATE INDEX IF NOT EXISTS product_option_value_media_asset_idx
  ON public.product_option_value_media (media_asset_id);

ALTER TABLE public.product_option_value_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS product_option_value_media_select ON public.product_option_value_media;
CREATE POLICY product_option_value_media_select
  ON public.product_option_value_media
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS product_option_value_media_write ON public.product_option_value_media;
CREATE POLICY product_option_value_media_write
  ON public.product_option_value_media
  FOR ALL
  TO authenticated
  USING (public.is_dashboard_staff())
  WITH CHECK (public.is_dashboard_staff());

GRANT SELECT ON public.product_option_value_media TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.product_option_value_media TO authenticated;

CREATE OR REPLACE FUNCTION public.set_option_value_media(
  p_option_value_id uuid,
  p_media_asset_ids uuid[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  i integer;
BEGIN
  IF NOT public.is_dashboard_staff() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  IF p_option_value_id IS NULL THEN
    RAISE EXCEPTION 'option value is required';
  END IF;

  DELETE FROM public.product_option_value_media
  WHERE option_value_id = p_option_value_id;

  IF p_media_asset_ids IS NULL THEN
    RETURN;
  END IF;

  FOR i IN 1 .. coalesce(array_length(p_media_asset_ids, 1), 0) LOOP
    INSERT INTO public.product_option_value_media (option_value_id, media_asset_id, sort_order)
    VALUES (p_option_value_id, p_media_asset_ids[i], i - 1)
    ON CONFLICT (option_value_id, media_asset_id) DO UPDATE
      SET sort_order = excluded.sort_order;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_option_value_media(uuid, uuid[]) TO authenticated;

-- Seed color-value media from the union of per-variant media for that color.
DO $$
BEGIN
  IF to_regclass('public.product_variant_media') IS NULL
     OR to_regclass('public.product_variant_option_values') IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.product_option_value_media (option_value_id, media_asset_id, sort_order)
  SELECT
    pov.id,
    pvm.media_asset_id,
    MIN(pvm.sort_order)
  FROM public.product_variant_media pvm
  JOIN public.product_variant_option_values pvov
    ON pvov.variant_id = pvm.variant_id
  JOIN public.product_option_values pov
    ON pov.id = pvov.option_value_id
  JOIN public.product_options po
    ON po.id = pov.option_id
  WHERE lower(btrim(po.name)) = 'color'
    AND pvm.media_asset_id IS NOT NULL
  GROUP BY pov.id, pvm.media_asset_id
  ON CONFLICT (option_value_id, media_asset_id) DO NOTHING;
END $$;
