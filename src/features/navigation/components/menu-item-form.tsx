'use client';

import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { categoriesQueryOptions } from '@/features/catalog/queries';

import { createMenuItemMutation, updateMenuItemMutation } from '../api/mutations';
import type { MenuItemRecord, MenuLinkType } from '../api/types';
import { LINK_TYPE_OPTIONS, STOREFRONT_PAGES } from '../constants';
import { menuItemFormSchema, type MenuItemFormValues } from '../schemas/menu-item';

export function MenuItemFormSheet({
  menuId,
  parentId,
  sortOrder,
  item,
  open,
  onOpenChange
}: {
  menuId: string;
  parentId: string | null;
  sortOrder: number;
  item?: MenuItemRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = !!item;
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions());

  const categoryOptions = categories.map((category) => ({
    label: category.name,
    value: category.slug
  }));
  const pageOptions = STOREFRONT_PAGES.map((page) => ({
    label: page.label,
    value: page.value
  }));

  const createMutation = useMutation({
    ...createMenuItemMutation,
    onSuccess: () => {
      toast.success('Menu item added');
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to add menu item');
    }
  });

  const updateMutation = useMutation({
    ...updateMenuItemMutation,
    onSuccess: () => {
      toast.success('Menu item saved');
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to save menu item');
    }
  });

  const form = useAppForm({
    defaultValues: {
      label: item?.label ?? '',
      link_type: (item?.link_type ?? 'category') as MenuLinkType,
      link_value: item?.link_value ?? '',
      blurb: item?.blurb ?? ''
    } as MenuItemFormValues,
    validators: {
      onSubmit: menuItemFormSchema
    },
    onSubmit: ({ value }) => {
      const payload = {
        menu_id: menuId,
        parent_id: parentId,
        label: value.label.trim(),
        link_type: value.link_type,
        link_value: value.link_value.trim(),
        blurb: value.blurb?.trim() || null,
        sort_order: sortOrder
      };
      if (isEdit && item) {
        updateMutation.mutate({
          id: item.id,
          values: {
            label: payload.label,
            link_type: payload.link_type,
            link_value: payload.link_value,
            blurb: payload.blurb
          }
        });
      } else {
        createMutation.mutate(payload);
      }
    }
  });

  const { FormTextField, FormRadioGroupField, FormSelectField, FormTextareaField } =
    useFormFields<MenuItemFormValues>();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col sm:max-w-md'>
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Edit menu item' : 'Add menu item'}</SheetTitle>
        </SheetHeader>
        <div className='flex-1 overflow-auto'>
          <form.AppForm>
            <form.Form id='menu-item-form' className='flex flex-col gap-4 p-0'>
              <FormTextField name='label' label='Label' required placeholder='Winter Collection' />
              <FormRadioGroupField
                name='link_type'
                label='Link type'
                required
                options={[...LINK_TYPE_OPTIONS]}
                listeners={{
                  onChange: () => {
                    form.setFieldValue('link_value', '');
                  }
                }}
              />
              <form.Subscribe selector={(state) => state.values.link_type}>
                {(linkType) => {
                  if (linkType === 'category') {
                    return (
                      <FormSelectField
                        name='link_value'
                        label='Category'
                        required
                        options={categoryOptions}
                        placeholder='Select a category'
                      />
                    );
                  }
                  if (linkType === 'page') {
                    return (
                      <FormSelectField
                        name='link_value'
                        label='Page'
                        required
                        options={pageOptions}
                        placeholder='Select a page'
                      />
                    );
                  }
                  return (
                    <FormTextField
                      name='link_value'
                      label='URL'
                      required
                      placeholder='/shop or https://…'
                      description='Internal path or full URL.'
                    />
                  );
                }}
              </form.Subscribe>
              <FormTextareaField
                name='blurb'
                label='Blurb'
                placeholder='Optional mega-menu description'
                rows={3}
              />
            </form.Form>
          </form.AppForm>
        </div>
        <SheetFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type='submit'
            form='menu-item-form'
            isLoading={createMutation.isPending || updateMutation.isPending}
          >
            {isEdit ? 'Save' : 'Add'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
