// packages/@auto-ui/components/src/components/AutoList/AutoList.tsx
import React, { ReactNode } from 'react';

// Allow items to be simple strings/numbers or objects with a render function
export type ListItem = string | number | { id?: string | number; content: ReactNode };

export interface AutoListProps {
  items: ListItem[];
  ordered?: boolean;
  className?: string;
  itemClassName?: string;
  renderItem?: (item: ListItem, index: number) => ReactNode;
}

export const AutoList: React.FC<AutoListProps> = ({
  items,
  ordered = false,
  className = '',
  itemClassName = 'p-2 border-b last:border-b-0',
  renderItem
}) => {
  const ListTag = ordered ? 'ol' : 'ul';

  const defaultRenderItem = (item: ListItem, index: number): ReactNode => {
    if (typeof item === 'object' && item !== null && 'content' in item) {
      return item.content;
    }
    return String(item);
  };

  const effectiveRenderItem = renderItem || defaultRenderItem;

  return (
    <ListTag className={`bg-white rounded-lg shadow ${className}`}>
      {items.map((item, index) => (
        <li key={typeof item === 'object' && item !== null && 'id' in item && item.id !== undefined ? item.id : index} className={itemClassName}>
          {effectiveRenderItem(item, index)}
        </li>
      ))}
    </ListTag>
  );
};
