import React from 'react';
import { PolymorphicBox } from './PolymorphicBox';

export interface ButtonProps {
  as?: React.ElementType;
  variant?: 'primary' | 'secondary' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  sweep?: boolean;
  children?: React.ReactNode;
  className?: string;
  [key: string]: any;
}

export const PolymorphicButton = React.forwardRef<any, ButtonProps>(
  ({ as = 'button', variant = 'glass', size = 'md', sweep = true, className = '', children, ...props }, ref) => {
    const sizeClasses: Record<string, string> = {
      sm: 'h-[28px] px-[10px] text-[12px] rounded-[6px]',
      md: 'h-[32px] px-[14px] text-[13px] rounded-[8px]',
      lg: 'h-[40px] px-[18px] text-[14px] rounded-[10px]'
    };

    const variantClasses: Record<string, string> = {
      primary: 'bg-primary text-white font-medium hover:bg-primary/95 shadow-[0_4px_14px_rgba(24,95,165,0.25)] transition-all active:scale-[0.98] relative overflow-hidden mirror-shine group',
      secondary: 'bg-transparent border border-border-light dark:border-border-dark text-text-primary dark:text-white font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
      glass: 'glass-btn text-primary dark:text-white font-medium shadow-[0_4px_16px_0_rgba(31,38,135,0.03)] relative overflow-hidden mirror-shine group'
    };

    const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium tracking-tight select-none focus:outline-none transition-all duration-300 ease-out';
    const combinedClassName = `${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.glass} ${className}`;

    const isSweepEnabled = sweep && (variant === 'primary' || variant === 'glass');

    return (
      <PolymorphicBox
        as={as}
        ref={ref}
        className={combinedClassName}
        {...props}
      >
        {isSweepEnabled && <div className="shiny-sweep" />}
        <span className="relative z-10 flex items-center justify-center gap-2 w-full h-full">
          {children}
        </span>
      </PolymorphicBox>
    );
  }
);

PolymorphicButton.displayName = 'PolymorphicButton';
