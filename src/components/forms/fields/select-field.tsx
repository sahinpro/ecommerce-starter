'use client';

import { useStore } from '@tanstack/react-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { FieldDescription, FieldLabel } from '@/components/ui/field';
import {
  useFieldContext,
  FormFieldSet,
  FormField,
  FormFieldError,
  createFormField
} from '@/components/ui/form-context';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type Option = {
  value: string;
  label: string;
  disabled?: boolean;
  disabledReason?: string;
};

interface SelectFieldProps {
  label: string;
  description?: string;
  required?: boolean;
  options: Option[];
  placeholder?: string;
}

export function SelectField({
  label,
  description,
  required,
  options,
  placeholder = 'Select an option'
}: SelectFieldProps) {
  const field = useFieldContext();
  const isTouched = useStore(field.store, (s) => s.meta.isTouched);
  const isValid = useStore(field.store, (s) => s.meta.isValid);
  const value = useStore(field.store, (s) => s.value) as string;

  return (
    <FormFieldSet>
      <FormField>
        <FieldLabel htmlFor={field.name}>
          {label}
          {required && ' *'}
        </FieldLabel>
        <Select
          items={options}
          value={value}
          onValueChange={(v) => field.handleChange(v ?? '')}
          onOpenChange={(open) => {
            if (!open) field.handleBlur();
          }}
        >
          <SelectTrigger id={field.name} aria-invalid={isTouched && !isValid}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className={
                  opt.disabled
                    ? 'data-disabled:pointer-events-auto data-disabled:cursor-not-allowed'
                    : undefined
                }
              >
                {opt.disabled && opt.disabledReason ? (
                  <Tooltip>
                    <TooltipTrigger
                      render={<span className='block w-full cursor-not-allowed text-left' />}
                    >
                      {opt.label}
                    </TooltipTrigger>
                    <TooltipContent side='right' className='max-w-56'>
                      {opt.disabledReason}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  opt.label
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {description && <FieldDescription>{description}</FieldDescription>}
      </FormField>
      <FormFieldError />
    </FormFieldSet>
  );
}

export const FormSelectField = createFormField(SelectField);
