import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import './checkbox.css';

const Checkbox = React.forwardRef(({ className = '', ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={['ui-checkbox-root', className].filter(Boolean).join(' ')}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="ui-checkbox-indicator">
      <Check strokeWidth={2.5} aria-hidden />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
