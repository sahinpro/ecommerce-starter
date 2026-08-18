'use client';

import { useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { CloudinaryImageUpload } from '@/features/media/components/cloudinary-image-upload';
import { slugifyProductName } from '@/features/products/constants/product-options';

import { createCategoryMutation, updateCategoryMutation } from '../mutations';
import { categoryFormSchema, type CategoryFormValues } from '../schemas/category';
import type { AdminCategory } from '../service';

export function CategoryFormSheet({
  category,
  open,
  onOpenChange
}: {
  category?: AdminCategory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = !!category;
  const slugTouchedRef = useRef(isEdit);

  const createMutation = useMutation({
    ...createCategoryMutation,
    onSuccess: () => {
      toast.success('Category created');
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create category');
    }
  });

  const updateMutation = useMutation({
    ...updateCategoryMutation,
    onSuccess: () => {
      toast.success('Category updated');
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update category');
    }
  });

  const form = useAppForm({
    defaultValues: {
      name: category?.name ?? '',
      slug: category?.slug ?? '',
      image_url: category?.image_url ?? '',
      image_public_id: category?.image_public_id ?? '',
      sort_order: category?.sort_order ?? 0
    } as CategoryFormValues,
    validators: {
      onSubmit: categoryFormSchema
    },
    onSubmit: ({ value }) => {
      const payload = {
        name: value.name.trim(),
        slug: value.slug.trim() || slugifyProductName(value.name),
        image_url: value.image_url.trim() || null,
        image_public_id: value.image_public_id.trim() || null,
        sort_order: Number(value.sort_order) || 0
      };
      if (isEdit && category) {
        updateMutation.mutate({ id: category.id, values: payload });
      } else {
        createMutation.mutate(payload);
      }
    }
  });

  const { FormTextField } = useFormFields<CategoryFormValues>();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col sm:max-w-md'>
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Edit category' : 'Add category'}</SheetTitle>
        </SheetHeader>
        <div className='flex-1 overflow-auto'>
          <form.AppForm>
            <form.Form id='category-sheet-form' className='flex flex-col gap-4 p-0'>
              <FormTextField
                name='name'
                label='Name'
                required
                placeholder='Palestine'
                listeners={{
                  onChange: ({ value }) => {
                    if (slugTouchedRef.current) return;
                    form.setFieldValue('slug', slugifyProductName(String(value ?? '')));
                  }
                }}
              />
              <FormTextField
                name='slug'
                label='URL slug'
                required
                placeholder='palestine'
                listeners={{
                  onChange: () => {
                    slugTouchedRef.current = true;
                  }
                }}
              />
              <FormTextField name='sort_order' label='Sort order' type='number' min={0} step={1} />
              <form.Subscribe selector={(state) => state.values}>
                {(values) => (
                  <div className='flex flex-col gap-2'>
                    <p className='text-sm font-medium'>Image</p>
                    <CloudinaryImageUpload
                      folderKey='categories'
                      value={
                        values.image_url
                          ? {
                              publicId: values.image_public_id,
                              secureUrl: values.image_url,
                              resourceType: 'image',
                              format: '',
                              width: 0,
                              height: 0,
                              bytes: 0
                            }
                          : null
                      }
                      onChange={(asset) => {
                        form.setFieldValue('image_url', asset?.secureUrl ?? '');
                        form.setFieldValue('image_public_id', asset?.publicId ?? '');
                      }}
                    />
                  </div>
                )}
              </form.Subscribe>
            </form.Form>
          </form.AppForm>
        </div>
        <SheetFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type='submit'
            form='category-sheet-form'
            isLoading={createMutation.isPending || updateMutation.isPending}
          >
            {isEdit ? 'Save' : 'Create'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
