import React from 'react';

export interface AutoListProps {
  items: unknown[];
  renderItem?: (item: unknown, index: number) => React.ReactNode;
}

export const AutoList: React.FC<AutoListProps> = ({ items, renderItem }) => (
  <ul className="auto-list list-disc pl-5 space-y-1">
    {items.map((item, idx) => (
      <li key={idx}>{renderItem ? renderItem(item, idx) : String(item)}</li>
    ))}
  </ul>
);
