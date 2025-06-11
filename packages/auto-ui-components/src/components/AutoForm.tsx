import React from 'react';
import type { UISchema } from '@auto-ui/core';

export interface AutoFormProps {
  schema: UISchema;
  validation?: Record<string, unknown>;
  onSubmit?: (data: Record<string, unknown>) => void;
  layout?: string;
}

export const AutoForm: React.FC<AutoFormProps> = ({ schema, onSubmit }) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      result[key] = value;
    }
    onSubmit?.(result);
  };

  return (
    <form onSubmit={handleSubmit} className="auto-form space-y-2">
      {schema.components.map((comp) => (
        <label key={comp.id} className="block">
          {comp.id}
          <input name={comp.id} className="border p-1" />
        </label>
      ))}
      <button type="submit" className="px-4 py-2 bg-blue-500 text-white">
        Submit
      </button>
    </form>
  );
};
