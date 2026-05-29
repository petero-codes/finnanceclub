import React from 'react';

export interface BoxProps {
  as?: React.ElementType;
  children?: React.ReactNode;
  className?: string;
  [key: string]: any;
}

export const PolymorphicBox = React.forwardRef<any, BoxProps>(
  ({ as: Component = 'div', children, ...props }, ref) => {
    return (
      <Component ref={ref} {...props}>
        {children}
      </Component>
    );
  }
);

PolymorphicBox.displayName = 'PolymorphicBox';
