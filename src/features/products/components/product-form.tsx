'use client';

import { useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import {
  PRODUCT_BADGE_OPTIONS,
  PRODUCT_STATUS_OPTIONS,
  skuFromProductName,
  slugifyProductName
} from '@/features/products/constants/product-options';
import { productFormSchema, type ProductFormValues } from '@/features/products/schemas/product';

import { createProductMutation, updateProductMutation } from '../api/mutations';
import { categoriesQueryOptions } from '../api/queries';
import type { Product, ProductMutationPayload } from '../api/types';
import { ProductNestedSections } from './product-nested-sections';

function toMutationPayload(value: ProductFormValues): ProductMutationPayload {
  return {
    name: value.name.trim(),
    slug: value.slug.trim() || slugifyProductName(value.name),
    sku: value.sku.trim() || skuFromProductName(value.name),
    description: value.description.trim() || null,
    category_id: value.category_id || null,
    product_type: value.product_type.trim() || null,
    badge: value.badge || null,
    featured: value.featured,
    status: value.status,
    price: Number(value.price),
    compare_at_price:
      value.compare_at_price === '' || value.compare_at_price == null
        ? null
        : Number(value.compare_at_price),
    composition: value.composition.trim() || null,
    care: value.care.trim() || null,
    size_fit: value.size_fit.trim() || null
  };
}

export default function ProductForm({
  initialData,
  pageTitle
}: {
  initialData: Product | null;
  pageTitle: string;
}) {
  const router = useRouter();
  const isEdit = !!initialData;
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions());
  const slugTouchedRef = useRef(isEdit);
  const skuTouchedRef = useRef(isEdit);

  const categoryOptions = useMemo(
    () => [
      { label: 'No category', value: '' },
      ...categories.map((category) => ({ label: category.name, value: category.id }))
    ],
    [categories]
  );

  const badgeOptions = useMemo(
    () => PRODUCT_BADGE_OPTIONS.map((option) => ({ label: option.label, value: option.value })),
    []
  );

  const statusOptions = useMemo(
    () => PRODUCT_STATUS_OPTIONS.map((option) => ({ label: option.label, value: option.value })),
    []
  );

  const createMutation = useMutation({
    ...createProductMutation,
    onSuccess: (product) => {
      toast.success('Product created — add images, options, and variants');
      router.push(`/dashboard/product/${product.slug}`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create product');
    }
  });

  const updateMutation = useMutation({
    ...updateProductMutation,
    onSuccess: (product) => {
      toast.success('Product updated');
      if (product.slug && product.slug !== initialData?.slug) {
        router.replace(`/dashboard/product/${product.slug}`);
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update product');
    }
  });

  const form = useAppForm({
    defaultValues: {
      name: initialData?.name ?? '',
      slug: initialData?.slug ?? '',
      sku: initialData?.sku ?? '',
      description: initialData?.description ?? '',
      category_id: initialData?.category_id ?? '',
      product_type: initialData?.product_type ?? '',
      badge: initialData?.badge ?? '',
      featured: initialData?.featured ?? false,
      status: initialData?.status ?? 'draft',
      price: initialData?.price ?? '',
      compare_at_price: initialData?.compare_at_price ?? '',
      composition: initialData?.composition ?? '',
      care: initialData?.care ?? '',
      size_fit: initialData?.size_fit ?? ''
    } as ProductFormValues,
    validators: {
      onSubmit: productFormSchema
    },
    onSubmit: ({ value }) => {
      const payload = toMutationPayload(value);
      if (isEdit && initialData) {
        updateMutation.mutate({ id: initialData.id, values: payload });
      } else {
        createMutation.mutate(payload);
      }
    }
  });

  const { FormTextField, FormSelectField, FormTextareaField, FormSwitchField } =
    useFormFields<ProductFormValues>();

  return (
    <div className='mx-auto w-full'>
      <form.AppForm>
        <form.Form className='flex flex-col gap-4 p-0'>
          <div className='grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]'>
            <div className='flex flex-col gap-4'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-base font-medium'>{pageTitle}</CardTitle>
                </CardHeader>
                <CardContent className='flex flex-col gap-5'>
                  <FormTextField
                    name='name'
                    label='Title'
                    required
                    placeholder='Linen shirt'
                    listeners={{
                      onChange: ({ value }) => {
                        const nextName = String(value ?? '');
                        if (!slugTouchedRef.current) {
                          form.setFieldValue('slug', slugifyProductName(nextName));
                        }
                        if (!skuTouchedRef.current) {
                          form.setFieldValue('sku', skuFromProductName(nextName));
                        }
                      }
                    }}
                    validators={{
                      onBlur: z.string().trim().min(1, 'Name is required')
                    }}
                  />
                  <FormTextField
                    name='slug'
                    label='URL slug'
                    required
                    description='Filled from the product name. Used in admin and storefront URLs.'
                    placeholder='linen-shirt'
                    listeners={{
                      onChange: () => {
                        slugTouchedRef.current = true;
                      }
                    }}
                    validators={{
                      onBlur: z
                        .string()
                        .trim()
                        .min(1, 'Slug is required')
                        .regex(
                          /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                          'Use lowercase letters, numbers, and hyphens only'
                        )
                    }}
                  />
                  <FormTextField
                    name='sku'
                    label='SKU'
                    required
                    description='One SKU for this product. All size and color variants share it.'
                    placeholder='LINEN-SHIRT'
                    listeners={{
                      onChange: () => {
                        skuTouchedRef.current = true;
                      }
                    }}
                    validators={{
                      onBlur: z.string().trim().min(1, 'SKU is required')
                    }}
                  />
                  <FormTextareaField
                    name='description'
                    label='Description'
                    placeholder='Product description'
                    rows={5}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='text-base font-medium'>Pricing</CardTitle>
                </CardHeader>
                <CardContent className='grid grid-cols-1 gap-5 sm:grid-cols-2'>
                  <FormTextField
                    name='price'
                    label='Price'
                    required
                    type='number'
                    min={0}
                    step={0.01}
                    placeholder='0.00'
                    validators={{
                      onBlur: z.number({ message: 'Price is required' }).nonnegative()
                    }}
                  />
                  <FormTextField
                    name='compare_at_price'
                    label='Compare at price'
                    type='number'
                    min={0}
                    step={0.01}
                    placeholder='Optional'
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='text-base font-medium'>Details</CardTitle>
                </CardHeader>
                <CardContent className='flex flex-col gap-5'>
                  <FormTextField name='product_type' label='Product type' placeholder='Shirts' />
                  <FormSelectField
                    name='badge'
                    label='Badge'
                    options={badgeOptions}
                    placeholder='None'
                  />
                  <div className='grid grid-cols-1 gap-5 sm:grid-cols-3'>
                    <FormTextareaField
                      name='composition'
                      label='Composition'
                      placeholder='100% linen'
                      rows={3}
                    />
                    <FormTextareaField name='care' label='Care' placeholder='Cold wash' rows={3} />
                    <FormTextareaField
                      name='size_fit'
                      label='Size & fit'
                      placeholder='True to size'
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {initialData ? <ProductNestedSections product={initialData} /> : null}

              {!initialData ? (
                <p className='text-muted-foreground text-sm'>
                  After creating the product you can add images, options, and variants.
                </p>
              ) : null}
            </div>

            <aside className='flex flex-col gap-4 lg:sticky lg:top-16'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-base font-medium'>Organization</CardTitle>
                </CardHeader>
                <CardContent className='flex flex-col gap-5'>
                  <FormSelectField
                    name='status'
                    label='Status'
                    required
                    options={statusOptions}
                    placeholder='Select status'
                  />
                  <FormSelectField
                    name='category_id'
                    label='Category'
                    options={categoryOptions}
                    placeholder='Select category'
                  />
                  <FormSwitchField name='featured' label='Featured product' />
                </CardContent>
              </Card>

              <div className='bg-card flex justify-end gap-2 rounded-lg border p-3'>
                <Button type='button' variant='outline' onClick={() => router.back()}>
                  Back
                </Button>
                <form.SubmitButton>{isEdit ? 'Save' : 'Create product'}</form.SubmitButton>
              </div>
            </aside>
          </div>
        </form.Form>
      </form.AppForm>
    </div>
  );
}
