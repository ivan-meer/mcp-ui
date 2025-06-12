// packages/@auto-ui/examples/src/pages/EndToEndDemoPage.tsx
import React, { useState, useCallback, ReactNode } from 'react'; // Added ReactNode
import { AutoUIServer } from '@auto-ui/server'; // Assuming HtmlResourceBlock is exported (it is)
import type { HtmlResourceBlock } from '@auto-ui/server'; // Explicit import for type clarity
import type { UISchema, ComponentDefinition, UIMetadata as CoreUIMetadata } from '@auto-ui/core';
import { AutoCard, AutoList, AutoTable, AutoForm } from '@auto-ui/components';
import type { AutoFormProps } from '@auto-ui/components'; // For AutoForm props if needed

// Instantiate the server (it will use defaults: RuleBasedDataAnalysisEngine and BasicUISchemaGenerator)
const autoUiServer = new AutoUIServer();

const initialJsonData = JSON.stringify(
  {
    users: [
      { id: 1, name: "Alice Wonderland", email: "alice@example.com", age: 30, active: true, role: "Admin" },
      { id: 2, name: "Bob The Builder", email: "bob@example.com", age: 45, active: false, role: "Editor" },
      { id: 3, name: "Charlie Brown", email: "charlie@example.com", age: 8, active: true, role: "Viewer" }
    ],
    product: {
        name: "Super Widget",
        price: 99.99,
        tags: ["gadget", "tech", "popular"],
        description: "An amazing widget that does everything you can imagine, and more!"
    },
    siteSettings: { theme: "dark", notifications: "email", language: "en-US" }
  },
  null, 2
);

const initialMetadata: CoreUIMetadata = {
    title: "Dynamic Dashboard from JSON"
};

// Basic Schema to Component Mapper
const componentRegistry: Record<string, React.ComponentType<any>> = {
  AutoCard,
  AutoList,
  AutoTable,
  AutoForm,
  PageTitle: ({ text, level = 1 }: { text: string; level?: number }) => {
    const Tag = `h${level}` as keyof JSX.IntrinsicElements;
    return <Tag className="text-2xl font-bold mb-4">{text}</Tag>;
  },
  RawDataViewer: ({ data }: {data: any}) => (
    <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
      {JSON.stringify(data, null, 2)}
    </pre>
  ),
  DisplayValue: ({ value }: { value: any }) => ( // Assuming DisplayValue from analyzer's suggestion
    <span className="text-gray-700">{String(value)}</span>
  ),
  // Add other components as they are created
};

const renderSchemaComponent = (compDef: ComponentDefinition): ReactNode => {
  const Component = componentRegistry[compDef.type as string];
  if (!Component) {
    console.warn("Unknown component type in schema:", compDef.type);
    return <div key={compDef.id} className="text-red-500 p-2 my-1 border border-red-300 rounded">Unknown component type: {compDef.type}</div>;
  }

  let props = compDef.props;
  if (compDef.type === 'AutoForm') {
      props = {
          ...compDef.props,
          fields: compDef.props.fields || [],
          onSubmit: (formData: Record<string, any>) => {
              alert("Form Submitted!\n" + JSON.stringify(formData, null, 2));
          },
          // Provide default class names if not in props from generator
          fieldWrapperClassName: compDef.props.fieldWrapperClassName || 'mb-4',
          labelClassName: compDef.props.labelClassName || 'block text-sm font-medium text-gray-700 mb-1',
          inputClassName: compDef.props.inputClassName || 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm',
          buttonContainerClassName: compDef.props.buttonContainerClassName || 'flex items-center justify-end space-x-3 pt-4 border-t mt-6',
          submitButtonClassName: compDef.props.submitButtonClassName || 'inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',

      } as AutoFormProps;
  } else if (compDef.type === 'AutoTable') {
      props = {
          ...compDef.props,
          data: compDef.props.data || [], // Ensure data is an array
      };
  }


  return <Component key={compDef.id} {...props} />;
};

export function EndToEndDemoPage() {
  const [jsonData, setJsonData] = useState<string>(initialJsonData);
  const [metadataJson, setMetadataJson] = useState<string>(JSON.stringify(initialMetadata, null, 2));
  const [uiSchema, setUiSchema] = useState<UISchema | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGenerateUI = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setUiSchema(null);
    try {
      const parsedData = JSON.parse(jsonData);
      const parsedMetadata = JSON.parse(metadataJson) as CoreUIMetadata;

      const resourceBlock: HtmlResourceBlock = await autoUiServer.generateAutoUI(parsedData, parsedMetadata);

      if (resourceBlock.type === 'ui_schema' && resourceBlock.content) {
        const schema = JSON.parse(resourceBlock.content) as UISchema;
        setUiSchema(schema);
      } else if (resourceBlock.content) {
         try {
            const errorObj = JSON.parse(resourceBlock.content);
            if (errorObj && errorObj.error) {
                 setError(`Generation Error: ${errorObj.error} - ${errorObj.details || 'No details'}`);
            } else {
                 setError(`Generated resource is not a UI schema. Type: ${resourceBlock.type}. Content: ${resourceBlock.content.substring(0,100)}...`);
            }
         } catch(e) {
            // Content was not JSON
            setError(`Generated resource is not a UI schema or valid error JSON. Type: ${resourceBlock.type}. Raw Content: ${resourceBlock.content.substring(0,100)}...`);
         }
      } else {
        setError("Generated resource is not a UI schema or content is missing.");
      }
    } catch (e: any) {
      setError(`Failed to parse JSON or generate UI: ${e.message}`);
    }
    setIsLoading(false);
  }, [jsonData, metadataJson]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center">End-to-End UI Generation Demo</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <AutoCard title="Input JSON Data">
          <textarea
            value={jsonData}
            onChange={(e) => setJsonData(e.target.value)}
            rows={15}
            className="w-full p-2 border border-gray-300 rounded font-mono text-sm"
            placeholder="Enter JSON data here..."
          />
        </AutoCard>
        <AutoCard title="Input UI Metadata (JSON)">
          <textarea
            value={metadataJson}
            onChange={(e) => setMetadataJson(e.target.value)}
            rows={15}
            className="w-full p-2 border border-gray-300 rounded font-mono text-sm"
            placeholder="Enter UI Metadata JSON here..."
          />
        </AutoCard>
      </div>

      <div className="text-center">
        <button
          onClick={handleGenerateUI}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded disabled:bg-gray-400"
        >
          {isLoading ? 'Generating...' : 'Generate UI'}
        </button>
      </div>

      {error && (
        <AutoCard title="Error" className="border-red-500 bg-red-50">
          <pre className="text-red-700 whitespace-pre-wrap">{error}</pre>
        </AutoCard>
      )}

      {uiSchema && (
        <AutoCard title="Generated UI Schema" className="mt-6">
          <details>
            <summary className="cursor-pointer text-blue-600 hover:underline">View/Hide Raw Schema</summary>
            <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto mt-2">
              {JSON.stringify(uiSchema, null, 2)}
            </pre>
          </details>
        </AutoCard>
      )}

      {uiSchema && (
        <AutoCard title="Rendered UI" className="mt-6 border-2 border-green-500">
          <div className="p-4 space-y-4">
            {uiSchema.components.map(compDef => renderSchemaComponent(compDef))}
          </div>
        </AutoCard>
      )}
    </div>
  );
}
