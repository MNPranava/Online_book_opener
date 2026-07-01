import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-2 text-sm text-ink outline-none placeholder:text-muted transition-colors focus:border-accent/40 focus:bg-slate-950/70',
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
