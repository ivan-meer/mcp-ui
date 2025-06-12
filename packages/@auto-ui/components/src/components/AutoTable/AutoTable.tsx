// packages/@auto-ui/components/src/components/AutoTable/AutoTable.tsx
import React, { ReactNode } from 'react';

export interface ColumnDef<T = any> {
  accessorKey: keyof T | string; // Key in the data object, or a custom string for display-only columns
  header: ReactNode | (() => ReactNode);
  cell?: (row: T, rowIndex: number) => ReactNode; // Custom cell rendering
  // Future additions: size, enableSorting, enableFiltering, etc.
}

export interface AutoTableProps<T = any> {
  data: T[];
  columns?: ColumnDef<T>[]; // Optional: if not provided, columns are inferred from data
  className?: string;
  // Styling for table elements
  tableClassName?: string;
  theadClassName?: string;
  tbodyClassName?: string;
  thClassName?: string;
  trClassName?: string;
  tdClassName?: string;
  caption?: ReactNode;
  // Features
  enableVirtualization?: boolean; // For later
  pageSize?: number; // For later pagination
}

// Continuing in packages/@auto-ui/components/src/components/AutoTable/AutoTable.tsx

export const AutoTable = <T extends Record<string, any>>({
  data,
  columns: explicitColumns,
  className = 'overflow-x-auto shadow-md rounded-lg', // Wrapper for scrolling
  tableClassName = 'min-w-full divide-y divide-gray-200 bg-white',
  theadClassName = 'bg-gray-50',
  tbodyClassName = 'divide-y divide-gray-200 bg-white',
  thClassName = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
  trClassName = 'hover:bg-gray-50', // Added hover effect for rows
  tdClassName = 'px-6 py-4 whitespace-nowrap text-sm text-gray-700',
  caption
}: AutoTableProps<T>) => {
  // Infer columns if not provided
  const inferredColumns = React.useMemo((): ColumnDef<T>[] => {
    if (explicitColumns && explicitColumns.length > 0) {
      return explicitColumns;
    }
    if (!data || data.length === 0) {
      return [];
    }
    // Infer from keys of the first data item
    return Object.keys(data[0]).map((key) => ({
      accessorKey: key as keyof T,
      header: key.replace(/([A-Z](?=[a-z]))|_/g, ' $1').replace(/^./, str => str.toUpperCase()), // Basic beautification
    }));
  }, [data, explicitColumns]);

  if (!data || data.length === 0) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        No data available.
      </div>
    );
  }

  const columnsToRender = inferredColumns;

  return (
    <div className={className}>
      <table className={tableClassName}>
        {caption && <caption className="p-2 text-sm text-gray-600">{caption}</caption>}
        <thead className={theadClassName}>
          <tr>
            {columnsToRender.map((col, index) => (
              <th key={`header-${String(col.accessorKey)}-${index}`} scope="col" className={thClassName}>
                {typeof col.header === 'function' ? col.header() : col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={tbodyClassName}>
          {data.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`} className={trClassName}>
              {columnsToRender.map((col, colIndex) => {
                const cellValue = row[col.accessorKey as keyof T];
                return (
                  <td key={`cell-${rowIndex}-${String(col.accessorKey)}-${colIndex}`} className={tdClassName}>
                    {col.cell ? col.cell(row, rowIndex) : (cellValue === null || cellValue === undefined ? '' : String(cellValue))}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
