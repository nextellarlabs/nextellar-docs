import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils'; // or your own `cn` utility

const labelVariants = cva('text-sm font-medium leading-none', {
  variants: {
    intent: {
      default: 'text-gray-900 dark:text-gray-100',
      muted: 'text-gray-500 dark:text-gray-400',
      error: 'text-red-600 dark:text-red-400',
    },
  },
  defaultVariants: {
    intent: 'default',
  },
});

export interface LabelProps
  extends
    React.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, intent, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(labelVariants({ intent }), className)}
        {...props}
      />
    );
  }
);

Label.displayName = 'Label';
