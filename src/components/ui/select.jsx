import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import './select.css';

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef(({ className = '', children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={['ui-select-trigger', className].filter(Boolean).join(' ')}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon className="ui-select-trigger-icon">
      <ChevronDown className="ui-select-chevron" strokeWidth={2} aria-hidden />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef(
  ({ className = '', children, position = 'popper', ...props }, ref) => (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={['ui-select-content', className].filter(Boolean).join(' ')}
        position={position}
        sideOffset={4}
        {...props}
      >
        <SelectPrimitive.Viewport className="ui-select-viewport">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
);
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectItem = React.forwardRef(({ className = '', children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={['ui-select-item', className].filter(Boolean).join(' ')}
    {...props}
  >
    <span className="ui-select-item-indicator-slot">
      <SelectPrimitive.ItemIndicator>
        <Check className="ui-select-item-check" strokeWidth={2.5} />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectLabel = React.forwardRef(({ className = '', ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={['ui-select-label', className].filter(Boolean).join(' ')}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectSeparator = React.forwardRef(({ className = '', ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={['ui-select-separator', className].filter(Boolean).join(' ')}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
};
