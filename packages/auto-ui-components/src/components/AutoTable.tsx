import React from 'react';
import type { ComponentProps } from '@auto-ui/core';

export interface AutoTableProps {
  data: unknown[];
  metadata?: Record<string, unknown>;
  interactions?: Record<string, unknown>;
  theme?: string;
  accessibility?: Record<string, unknown>;
}

export const AutoTable: React.FC<AutoTableProps> = ({ data }) => {
  // Naive column detection from first record
  const columns = React.useMemo(() => {
    const first = data[0] as Record<string, unknown> | undefined;
    return first ? Object.keys(first) : [];
  }, [data]);

  return (
    <table className="auto-table w-full border-collapse">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col} className="border px-2 py-1 text-left">
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx}>
            {columns.map((col) => (
              <td key={col} className="border px-2 py-1">
                {String((row as Record<string, unknown>)[col] ?? '')}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
