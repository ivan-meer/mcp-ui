// packages/@auto-ui/examples/src/pages/ShowcasePage.tsx
import React from 'react';
import { AutoCard, AutoList } from '@auto-ui/components';
import type { ListItem } from '@auto-ui/components'; // Import type if needed

// Optional: Import themes if you want to pass specific values,
// though Tailwind classes in components should work already.
// import { defaultLightTheme } from '@auto-ui/themes';

export function ShowcasePage() {
  const simpleListItems: ListItem[] = ["Apple", "Banana", "Cherry"];

  const objectListItems: ListItem[] = [
    { id: '1', content: <p><strong>Item 1:</strong> With custom JSX content</p> },
    { id: '2', content: <p><em>Item 2:</em> And some emphasis</p> },
    { id: '3', content: <span>Item 3: Just a span</span> },
  ];

  return (
    <div className="p-4 space-y-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-blue-600">Components Showcase</h1>

      <AutoCard title="Simple AutoCard">
        <p>This is the content inside a basic AutoCard. Tailwind styles like padding and shadow should be applied automatically by the component's internal classes.</p>
      </AutoCard>

      <AutoCard title={<span className="text-purple-600">AutoCard with Custom Title & Styling</span>} className="border-2 border-purple-300" padding="p-6" shadow="shadow-xl">
        <p>This card has a custom JSX title and additional styling passed via props.</p>
        <button className="mt-4 bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
          Click Me
        </button>
      </AutoCard>

      <h2 className="text-2xl font-semibold">AutoList Examples</h2>

      <div className="grid md:grid-cols-2 gap-8">
        <AutoCard title="Simple List (Unordered)">
          <AutoList items={simpleListItems} />
        </AutoCard>

        <AutoCard title="Object List (Ordered) with Custom Rendering">
          <AutoList
            items={objectListItems}
            ordered={true}
            itemClassName="p-3 border-b border-gray-300 hover:bg-gray-50"
            renderItem={(item, index) => {
              if (typeof item === 'object' && 'content' in item) {
                return (
                  <div className="flex items-center space-x-3">
                    <span className="text-blue-500 font-bold">{index + 1}.</span>
                    <div>{item.content}</div>
                  </div>
                );
              }
              return null; // Should not happen with objectListItems
            }}
          />
        </AutoCard>
      </div>

      <AutoCard title="Empty List">
        <AutoList items={[]} />
        <p className="mt-2 text-sm text-gray-500">This shows how an empty list is rendered.</p>
      </AutoCard>

    </div>
  );
}
