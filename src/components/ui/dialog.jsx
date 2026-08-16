import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

const DialogContext = createContext(null);

export function Dialog({ open: controlledOpen, onOpenChange, children }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = (next) => {
    if (!isControlled) setInternalOpen(next);
    if (onOpenChange) onOpenChange(next);
  };

  const value = useMemo(() => ({ open, setOpen }), [open]);
  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
}

export function DialogTrigger({ asChild = false, children }) {
  const ctx = useContext(DialogContext);
  if (!ctx) return children;

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e) => {
        children.props?.onClick?.(e);
        ctx.setOpen(true);
      },
    });
  }

  return <button onClick={() => ctx.setOpen(true)}>{children}</button>;
}

export function DialogContent({ className = '', children }) {
  const ctx = useContext(DialogContext);
  if (!ctx || !ctx.open) return null;

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') ctx.setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [ctx]);

  return createPortal(
    <div className="ui-dialog-overlay" onClick={() => ctx.setOpen(false)}>
      <div className={`ui-dialog-content ${className}`.trim()} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function DialogHeader({ className = '', children }) {
  return <div className={`ui-dialog-header ${className}`.trim()}>{children}</div>;
}

export function DialogTitle({ className = '', children }) {
  return <h2 className={`ui-dialog-title ${className}`.trim()}>{children}</h2>;
}

export function DialogDescription({ className = '', children }) {
  return <p className={`ui-dialog-description ${className}`.trim()}>{children}</p>;
}

