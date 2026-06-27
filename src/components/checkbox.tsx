import React, { useState, useId } from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, id, ...props }, ref) => {
    const [isChecked, setIsChecked] = useState(props.defaultChecked || false);
    const autoId = useId();
    const inputId = id ?? autoId;

    return (
      <div className="relative">
        <input
          type="checkbox"
          id={inputId}
          className="peer sr-only"
          ref={ref}
          {...props}
          onChange={() => {
            setIsChecked(!isChecked);
          }}
        />
        <div
          className={`
            w-5 h-5 rounded-md border-2 border-border
            peer-checked:bg-primary peer-checked:border-primary
            transition-all flex items-center justify-center
            ${props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${className}
          `}
        >
          {isChecked && (
            <Check
              className="w-3 h-3 text-background peer-checked:opacity-100 transition-opacity duration-200"
              strokeWidth={3}
            />
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
