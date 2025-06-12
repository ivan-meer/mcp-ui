// packages/@auto-ui/components/src/components/AutoCard/AutoCard.tsx
import React, { ReactNode } from 'react';

export interface AutoCardProps {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
  // Basic styling props, more can be added from theme later
  padding?: string | number;
  shadow?: string; // e.g., 'sm', 'md', 'lg' (to be mapped to Tailwind classes)
}

export const AutoCard: React.FC<AutoCardProps> = ({
  title,
  children,
  className = '',
  padding = 'p-4', // Default padding
  shadow = 'shadow-md' // Default shadow
}) => {
  return (
    <div className={`bg-white rounded-lg ${padding} ${shadow} ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold mb-2 border-b pb-2">
          {typeof title === 'string' ? title : <>{title}</>}
        </h3>
      )}
      <div>{children}</div>
    </div>
  );
};
