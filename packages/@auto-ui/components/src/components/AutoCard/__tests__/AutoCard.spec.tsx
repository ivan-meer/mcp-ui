// packages/@auto-ui/components/src/components/AutoCard/__tests__/AutoCard.spec.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AutoCard } from '../AutoCard';

describe('AutoCard', () => {
  test('renders children correctly', () => {
    render(<AutoCard>Test Content</AutoCard>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('renders with a title', () => {
    render(<AutoCard title="Card Title">Content</AutoCard>);
    expect(screen.getByText('Card Title')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    render(<AutoCard className="custom-class">Content</AutoCard>);
    // The card is the first child of the testing library's container
    // More robustly, check the element containing the children and title.
    const contentElement = screen.getByText('Content');
    expect(contentElement.parentElement).toHaveClass('custom-class');
  });

  test('applies default padding and shadow classes', () => {
    render(<AutoCard>Content</AutoCard>);
    const contentElement = screen.getByText('Content');
    // Default props are padding = 'p-4', shadow = 'shadow-md'
    expect(contentElement.parentElement).toHaveClass('p-4');
    expect(contentElement.parentElement).toHaveClass('shadow-md');
  });

  test('overrides default padding and shadow with props', () => {
    render(<AutoCard padding="p-8" shadow="shadow-lg">Content</AutoCard>);
    const contentElement = screen.getByText('Content');
    expect(contentElement.parentElement).toHaveClass('p-8');
    expect(contentElement.parentElement).toHaveClass('shadow-lg');
    expect(contentElement.parentElement).not.toHaveClass('p-4');
    expect(contentElement.parentElement).not.toHaveClass('shadow-md');
  });
});
