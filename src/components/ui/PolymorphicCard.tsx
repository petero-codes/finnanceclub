import React from 'react';
import { PolymorphicBox } from './PolymorphicBox';

export interface CardProps {
  as?: React.ElementType;
  variant?: 'glass' | 'glow';
  hoverable?: boolean;
  glow?: boolean;
  sweep?: boolean;
  flashy?: boolean;
  children?: React.ReactNode;
  className?: string;
  [key: string]: any;
}

export const PolymorphicCard = React.forwardRef<any, CardProps>(
  ({ as = 'div', variant = 'glass', hoverable = false, glow = false, sweep = true, flashy = false, className = '', children, ...props }, ref) => {
    const isGlow = variant === 'glow' || glow;
    const isFlashy = variant === 'glow' || flashy;
    
    let baseClasses = 'glass-panel rounded-[12px] p-[18px] sm:p-[20px] transition-all duration-400 ease-out relative';
    
    if (isFlashy) {
      baseClasses += ' mirror-effect mirror-border';
    }
    
    if (sweep) {
      baseClasses += ' mirror-shine group';
    }
    
    const hoverClasses = hoverable 
      ? 'hover:translate-y-[-2px] hover:shadow-lg dark:hover:shadow-black/40 hover:border-primary/20 dark:hover:border-white/20 mirror-effect-hover' 
      : '';
    
    const variantClasses: Record<string, string> = {
      glass: '',
      glow: 'mirror-glow relative overflow-hidden before:absolute before:inset-0 before:-z-10 before:p-[1px] before:rounded-[12px] before:bg-gradient-to-br before:from-primary/40 before:via-transparent before:to-income/40 shadow-[0_8px_30px_rgb(0,0,0,0.06)]'
    };

    const combinedClassName = `${baseClasses} ${hoverClasses} ${variantClasses[variant] || variantClasses.glass} ${className}`;

    return (
      <PolymorphicBox
        as={as}
        ref={ref}
        className={combinedClassName}
        {...props}
      >
        {sweep && <div className="shiny-sweep" />}
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      </PolymorphicBox>
    );
  }
);

PolymorphicCard.displayName = 'PolymorphicCard';
