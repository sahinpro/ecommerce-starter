-- Harden stock RPCs for concurrent checkout. Does not change pricing or totals.
-- Inventory source of truth is inventory_levels.on_hand (dual-written to
-- product_variants.stock_quantity). Atomicity is the UPDATE ... WHERE clause,
-- not a SELECT followed by UPDATE.

create or replace function public.adjust_variant_inventory(
  p_variant_id uuid,
  p_quantity_delta int,
  p_reason text,
  p_reference_type text default null,
  p_reference_id uuid default null,
  p_actor_id uuid default null,
  p_allow_negative boolean default false
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item_id uuid;
  v_location_id uuid;
  v_prev int;
  v_next int;
begin
  v_item_id := public.ensure_inventory_item(p_variant_id);

  select il.location_id
    into v_location_id
  from public.inventory_levels il
  join public.inventory_locations loc on loc.id = il.location_id
  where il.inventory_item_id = v_item_id
  order by loc.is_default desc
  limit 1;

  if v_location_id is null then
    raise exception 'Inventory level missing for variant %', p_variant_id;
  end if;

  update public.inventory_levels
  set
    on_hand = case
      when p_allow_negative then greatest(0, on_hand + p_quantity_delta)
      else on_hand + p_quantity_delta
    end,
    updated_at = now()
  where inventory_item_id = v_item_id
    and location_id = v_location_id
    and (p_allow_negative or on_hand + p_quantity_delta >= 0)
  returning on_hand into v_next;

  if not found then
    raise exception 'Insufficient stock for variant %', p_variant_id
      using errcode = 'P0001';
  end if;

  v_prev := v_next - p_quantity_delta;
  if v_prev < 0 then
    v_prev := 0;
  end if;

  update public.product_variants
  set
    stock_quantity = v_next,
    updated_at = now()
  where id = p_variant_id;

  insert into public.inventory_adjustments (
    inventory_item_id,
    location_id,
    quantity_delta,
    previous_quantity,
    new_quantity,
    reason,
    reference_type,
    reference_id,
    actor_id
  ) values (
    v_item_id,
    v_location_id,
    p_quantity_delta,
    v_prev,
    v_next,
    p_reason,
    p_reference_type,
    p_reference_id,
    p_actor_id
  );

  return v_next;
end;
$$;

create or replace function public.decrement_variant_stock(p_variant_id uuid, p_quantity int)
returns int
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_quantity is null or p_quantity < 1 then
    raise exception 'Invalid quantity';
  end if;
  return public.adjust_variant_inventory(
    p_variant_id,
    -p_quantity,
    'order_completed',
    'order',
    null,
    null,
    false
  );
end;
$$;

create or replace function public.place_cod_order(
  p_customer_name text,
  p_customer_phone text,
  p_address text,
  p_shipping_area text,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item jsonb;
  v_variant_id uuid;
  v_qty int;
  v_subtotal numeric := 0;
  v_shipping numeric := 0;
  v_total numeric := 0;
  v_order_id uuid;
  v_order_number text;
  v_currency text := 'BDT';
  v_product public.products%rowtype;
  v_variant public.product_variants%rowtype;
  v_color_name text;
  v_options jsonb;
  v_line_total numeric;
  v_attempt int := 0;
begin
  if p_customer_name is null or btrim(p_customer_name) = '' then
    raise exception 'Customer name is required';
  end if;
  if p_customer_phone is null or btrim(p_customer_phone) = '' then
    raise exception 'Phone is required';
  end if;
  if p_address is null or btrim(p_address) = '' then
    raise exception 'Address is required';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Cart is empty';
  end if;

  select coalesce(currency, 'BDT') into v_currency from public.store_settings where id = 1;
  v_shipping := case p_shipping_area
    when 'dhaka_inside' then 90
    when 'dhaka_outside' then 120
    else coalesce((select shipping_cost from public.store_settings where id = 1), 80)
  end;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_variant_id := (v_item->>'variant_id')::uuid;
    v_qty := coalesce((v_item->>'quantity')::int, 0);
    if v_qty <= 0 then
      raise exception 'Invalid quantity';
    end if;

    select *
    into v_variant
    from public.product_variants
    where id = v_variant_id
    for update;

    if v_variant.id is null then
      raise exception 'Variant not found';
    end if;
    if v_variant.status = 'archived' then
      raise exception 'This variant is no longer available';
    end if;

    select * into v_product from public.products where id = v_variant.product_id;
    if v_product.id is null or v_product.deleted_at is not null or v_product.status <> 'active' then
      raise exception 'Product is not available';
    end if;

    v_subtotal := v_subtotal + (v_variant.price * v_qty);
  end loop;

  v_total := v_subtotal + v_shipping;

  loop
    v_attempt := v_attempt + 1;
    v_order_number :=
      'SK-' || to_char(timezone('Asia/Dhaka', now()), 'YYMMDD') || '-' ||
      lpad((floor(random() * 1000000))::int::text, 6, '0');
    begin
      insert into public.orders (
        order_number,
        customer_name,
        customer_phone,
        address,
        shipping_area,
        subtotal,
        shipping_cost,
        shipping,
        total,
        currency,
        payment_method,
        payment_status,
        order_status,
        status,
        stock_restored,
        country
      ) values (
        v_order_number,
        btrim(p_customer_name),
        btrim(p_customer_phone),
        btrim(p_address),
        p_shipping_area,
        v_subtotal,
        v_shipping,
        v_shipping,
        v_total,
        coalesce(v_currency, 'BDT'),
        'cod',
        'pending',
        'pending',
        'pending',
        false,
        'Bangladesh'
      ) returning id into v_order_id;
      exit;
    exception when unique_violation then
      if v_attempt >= 8 then
        raise;
      end if;
    end;
  end loop;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_variant_id := (v_item->>'variant_id')::uuid;
    v_qty := coalesce((v_item->>'quantity')::int, 0);

    select * into v_variant from public.product_variants where id = v_variant_id;
    select * into v_product from public.products where id = v_variant.product_id;

    select pov.name into v_color_name
    from public.product_variant_option_values vov
    join public.product_option_values pov on pov.id = vov.option_value_id
    join public.product_options po on po.id = pov.option_id
    where vov.variant_id = v_variant.id and lower(po.name) = 'color'
    limit 1;

    if v_color_name is null then
      select name into v_color_name from public.product_colors where id = v_variant.color_id;
    end if;

    select coalesce(
      jsonb_agg(jsonb_build_object('name', po.name, 'value', pov.name) order by po.position),
      '[]'::jsonb
    )
      into v_options
    from public.product_variant_option_values vov
    join public.product_option_values pov on pov.id = vov.option_value_id
    join public.product_options po on po.id = pov.option_id
    where vov.variant_id = v_variant.id;

    v_line_total := v_variant.price * v_qty;

    insert into public.order_items (
      order_id,
      product_id,
      variant_id,
      product_name,
      product_name_snapshot,
      sku_snapshot,
      size,
      size_snapshot,
      color,
      color_snapshot,
      price,
      price_snapshot,
      quantity,
      line_total,
      option_values_snapshot
    ) values (
      v_order_id,
      v_product.id,
      v_variant.id,
      v_product.name,
      v_product.name,
      v_variant.sku,
      v_variant.size,
      v_variant.size,
      v_color_name,
      v_color_name,
      v_variant.price,
      v_variant.price,
      v_qty,
      v_line_total,
      v_options
    );

    perform public.decrement_variant_stock(v_variant.id, v_qty);
  end loop;

  return jsonb_build_object(
    'id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'shipping_cost', v_shipping,
    'shipping_area', p_shipping_area,
    'total', v_total,
    'currency', coalesce(v_currency, 'BDT'),
    'payment_method', 'cod',
    'payment_status', 'pending',
    'order_status', 'pending',
    'customer_phone', btrim(p_customer_phone),
    'customer_name', btrim(p_customer_name)
  );
end;
$$;

create or replace function public.cancel_order_and_restore_stock(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_item record;
  v_claimed uuid;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if v_order.id is null then
    raise exception 'Order not found';
  end if;

  update public.orders
  set
    order_status = 'cancelled',
    status = 'cancelled',
    stock_restored = true,
    updated_at = now()
  where id = p_order_id
    and order_status is distinct from 'cancelled'
    and stock_restored is not true
  returning id into v_claimed;

  if v_claimed is null then
    return jsonb_build_object(
      'id', p_order_id,
      'order_status', 'cancelled',
      'stock_restored', true
    );
  end if;

  for v_item in
    select variant_id, quantity
    from public.order_items
    where order_id = p_order_id and variant_id is not null
  loop
    perform public.adjust_variant_inventory(
      v_item.variant_id,
      v_item.quantity,
      'order_cancelled',
      'order',
      p_order_id,
      auth.uid(),
      true
    );
  end loop;

  return jsonb_build_object(
    'id', p_order_id,
    'order_status', 'cancelled',
    'stock_restored', true
  );
end;
$$;

-- product_variants has option_combination_key (not color_option_value_id /
-- size_option_value_id) and no deleted_at. Combo uniqueness is that key.
do $$
begin
  if exists (
    select 1
    from public.product_variants
    where option_combination_key is not null
    group by product_id, option_combination_key
    having count(*) > 1
  ) then
    raise exception
      'product_variants_unique_combo: duplicate (product_id, option_combination_key) rows exist';
  end if;
end $$;

create unique index if not exists product_variants_unique_combo
  on public.product_variants (product_id, option_combination_key)
  where option_combination_key is not null;

grant execute on function public.adjust_variant_inventory(uuid, int, text, text, uuid, uuid, boolean) to service_role;
grant execute on function public.decrement_variant_stock(uuid, int) to service_role;
grant execute on function public.place_cod_order(text, text, text, text, jsonb) to service_role;
grant execute on function public.cancel_order_and_restore_stock(uuid) to authenticated;
grant execute on function public.cancel_order_and_restore_stock(uuid) to service_role;
