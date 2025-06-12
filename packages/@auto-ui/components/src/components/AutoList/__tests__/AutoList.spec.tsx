// packages/@auto-ui/components/src/components/AutoList/__tests__/AutoList.spec.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AutoList, ListItem } from '../AutoList';

describe('AutoList', () => {
  const simpleItems: ListItem[] = ['One', 'Two', 'Three'];
  const objectItems: ListItem[] = [
    { id: 'a', content: 'Alpha' },
    { id: 'b', content: 'Beta' },
  ];

  test('renders unordered list by default', () => {
    render(<AutoList items={simpleItems} />);
    const listElement = screen.getByRole('list');
    expect(listElement.tagName).toBe('UL');
    simpleItems.forEach(item => {
      expect(screen.getByText(item as string)).toBeInTheDocument();
    });
  });

  test('renders ordered list when specified', () => {
    render(<AutoList items={simpleItems} ordered />);
    const listElement = screen.getByRole('list');
    expect(listElement.tagName).toBe('OL');
  });

  test('uses custom renderItem function for simple items', () => {
    render(
      <AutoList
        items={simpleItems}
        renderItem={(item, index) => <span>Item {index}: {item as string}</span>}
      />
    );
    expect(screen.getByText('Item 0: One')).toBeInTheDocument();
    expect(screen.getByText('Item 1: Two')).toBeInTheDocument();
  });

  test('uses custom renderItem function for object items', () => {
    render(
      <AutoList
        items={objectItems}
        renderItem={(item) => <span>Custom: {(item as { content: string }).content}</span>}
      />
    );
    expect(screen.getByText('Custom: Alpha')).toBeInTheDocument();
    expect(screen.getByText('Custom: Beta')).toBeInTheDocument();
  });

  test('applies custom className to list and itemClassName to items', () => {
    render(
      <AutoList
        items={simpleItems}
        className="custom-list-class"
        itemClassName="custom-item-class"
      />
    );
    expect(screen.getByRole('list')).toHaveClass('custom-list-class');
    const listItems = screen.getAllByRole('listitem');
    listItems.forEach(listItem => {
      expect(listItem).toHaveClass('custom-item-class');
    });
  });

  test('renders empty list correctly', () => {
    render(<AutoList items={[]} />);
    const listElement = screen.getByRole('list');
    expect(listElement).toBeInTheDocument();
    expect(listElement.children.length).toBe(0);
  });
});
