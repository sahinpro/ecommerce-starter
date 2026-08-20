/**
 * Concurrent checkout load test against live place_cod_order.
 * Run after applying supabase/migrations/20260820121000_stock_concurrency_guards.sql:
 *   node --env-file=.env.local scripts/stock-concurrency-load-test.mjs
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const TEST_NAME = 'STOCK-CONCURRENCY-TEST-DO-NOT-SHIP';
const TEST_PHONE = '01700000999';

function isStockError(message) {
  return /insufficient stock|INSUFFICIENT_STOCK|sold out/i.test(message || '');
}

async function stockOf(variantId) {
  const { data: variant, error: vErr } = await admin
    .from('product_variants')
    .select('id, stock_quantity')
    .eq('id', variantId)
    .single();
  if (vErr) throw vErr;

  const { data: item } = await admin
    .from('inventory_items')
    .select('id')
    .eq('variant_id', variantId)
    .maybeSingle();

  let onHand = null;
  if (item?.id) {
    const { data: level } = await admin
      .from('inventory_levels')
      .select('on_hand')
      .eq('inventory_item_id', item.id)
      .limit(1)
      .maybeSingle();
    onHand = level?.on_hand ?? null;
  }

  return { stock_quantity: Number(variant.stock_quantity), on_hand: onHand };
}

async function setStock(variantId, qty) {
  const { error: vErr } = await admin
    .from('product_variants')
    .update({ stock_quantity: qty })
    .eq('id', variantId);
  if (vErr) throw vErr;

  const { data: item, error: iErr } = await admin
    .from('inventory_items')
    .select('id')
    .eq('variant_id', variantId)
    .maybeSingle();
  if (iErr) throw iErr;
  if (!item?.id) {
    throw new Error('No inventory_items row for test variant — apply shopify inventory migration first');
  }

  const { error: lErr } = await admin
    .from('inventory_levels')
    .update({ on_hand: qty, committed: 0 })
    .eq('inventory_item_id', item.id);
  if (lErr) throw lErr;
}

async function pickVariant() {
  const { data, error } = await admin
    .from('product_variants')
    .select('id, sku, product_id, stock_quantity, option_combination_key, status')
    .eq('status', 'active')
    .not('option_combination_key', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(50);
  if (error) throw error;

  for (const row of data ?? []) {
    const { data: product } = await admin
      .from('products')
      .select('id, status, deleted_at, name')
      .eq('id', row.product_id)
      .maybeSingle();
    if (product?.status === 'active' && !product.deleted_at) {
      return { ...row, product_name: product.name };
    }
  }
  throw new Error('No active variant on an active product');
}

async function placeOne(variantId, idx) {
  const { data, error } = await admin.rpc('place_cod_order', {
    p_customer_name: TEST_NAME,
    p_customer_phone: TEST_PHONE,
    p_address: `Load test ${idx} — discard`,
    p_shipping_area: 'dhaka_inside',
    p_items: [{ variant_id: variantId, quantity: 1 }]
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, data };
}

async function main() {
  const variant = await pickVariant();
  const original = await stockOf(variant.id);
  console.log('Using variant', variant.id, variant.sku, variant.product_name);
  console.log('Original stock', original);

  let loadPass = false;
  let cancelPass = false;
  let uniquePass = false;

  try {
    await setStock(variant.id, 5);
    const seeded = await stockOf(variant.id);
    console.log('Seeded stock', seeded);
    if (seeded.stock_quantity !== 5 || seeded.on_hand !== 5) {
      throw new Error(`Failed to seed stock=5, got ${JSON.stringify(seeded)}`);
    }

    const results = await Promise.all(
      Array.from({ length: 20 }, (_, i) => placeOne(variant.id, i + 1))
    );

    const succeeded = results.filter((r) => r.ok);
    const failed = results.filter((r) => !r.ok);
    const stockFails = failed.filter((r) => isStockError(r.error));
    const otherFails = failed.filter((r) => !isStockError(r.error));
    const final = await stockOf(variant.id);

    console.log('succeeded', succeeded.length);
    console.log('failed', failed.length, '(stock errors', stockFails.length, ')');
    if (otherFails.length) {
      console.log('non-stock failures', otherFails.map((r) => r.error));
    }
    console.log('sample stock error', stockFails[0]?.error || '(none)');
    console.log('final stock', final);
    console.log(
      'order numbers',
      succeeded.map((r) => r.data?.order_number)
    );

    loadPass =
      succeeded.length === 5 &&
      stockFails.length === 15 &&
      otherFails.length === 0 &&
      final.stock_quantity === 0 &&
      final.on_hand === 0 &&
      final.stock_quantity >= 0 &&
      final.on_hand >= 0;

    console.log(loadPass ? 'LOAD TEST PASS' : 'LOAD TEST FAIL');

    const firstOrderId = succeeded[0]?.data?.id;
    if (firstOrderId) {
      const before = await stockOf(variant.id);
      const first = await admin.rpc('cancel_order_and_restore_stock', {
        p_order_id: firstOrderId
      });
      const mid = await stockOf(variant.id);
      const second = await admin.rpc('cancel_order_and_restore_stock', {
        p_order_id: firstOrderId
      });
      const after = await stockOf(variant.id);
      console.log('cancel1', first.error?.message || first.data);
      console.log('cancel2', second.error?.message || second.data);
      console.log('stock after first cancel', mid, 'after second', after);
      cancelPass =
        !first.error &&
        !second.error &&
        mid.stock_quantity === before.stock_quantity + 1 &&
        after.stock_quantity === mid.stock_quantity &&
        after.on_hand === mid.on_hand;
      console.log(cancelPass ? 'CANCEL IDEMPOTENT PASS' : 'CANCEL IDEMPOTENT FAIL');
    }

    if (variant.option_combination_key) {
      const { data: inserted, error: dupErr } = await admin
        .from('product_variants')
        .insert({
          product_id: variant.product_id,
          sku: `LOAD-TEST-DUP-${Date.now()}`,
          size: 'TEST',
          price: 1,
          stock_quantity: 0,
          status: 'active',
          option_combination_key: variant.option_combination_key
        })
        .select('id')
        .maybeSingle();
      if (inserted?.id) {
        await admin.from('product_variants').delete().eq('id', inserted.id);
      }
      uniquePass = Boolean(
        dupErr &&
          /unique|product_variants_unique_combo|product_variants_active_combination/i.test(
            dupErr.message
          )
      );
      console.log('duplicate insert error', dupErr?.message || '(inserted then deleted — BAD)');
      console.log(uniquePass ? 'UNIQUE COMBO PASS' : 'UNIQUE COMBO FAIL');
    }

    for (const row of succeeded.slice(firstOrderId ? 1 : 0)) {
      const id = row.data?.id;
      if (!id) continue;
      await admin.rpc('cancel_order_and_restore_stock', { p_order_id: id });
    }
  } finally {
    await setStock(variant.id, original.on_hand ?? original.stock_quantity);
    console.log('restored stock', await stockOf(variant.id), 'from', original);
  }

  if (!loadPass || !cancelPass || !uniquePass) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
