import React from 'react';

export interface AutoCardProps {
  title?: string;
  children?: React.ReactNode;
}

export const AutoCard: React.FC<AutoCardProps> = ({ title, children }) => (
  <div className="auto-card border rounded p-4 shadow-sm">
    {title && <h3 className="font-semibold mb-2">{title}</h3>}
    <div>{children}</div>
  </div>
);
