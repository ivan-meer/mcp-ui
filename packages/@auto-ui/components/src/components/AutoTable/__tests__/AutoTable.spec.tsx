// packages/@auto-ui/components/src/components/AutoTable/__tests__/AutoTable.spec.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AutoTable, ColumnDef } from '../AutoTable';

describe('AutoTable', () => {
  const testData = [
    { id: 1, name: 'Alice Wonderland', age: 30 },
    { id: 2, name: 'Bob The Builder', age: 25 },
  ];

  test('renders with inferred columns and beautified headers', () => {
    render(<AutoTable data={testData} />);
    // Regex in component: key.replace(/([A-Z](?=[a-z]))|_/g, ' $1').replace(/^./, str => str.toUpperCase())
    // id -> Id
    // name -> Name
    // age -> Age
    expect(screen.getByText('Id')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument(); // was 'Name'
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('Alice Wonderland')).toBeInTheDocument();
    expect(screen.getByText('Bob The Builder')).toBeInTheDocument();
  });

  test('renders with explicit columns and custom cell content', () => {
    const columns: ColumnDef<typeof testData[0]>[] = [
      { accessorKey: 'name', header: 'Full Name' },
      { accessorKey: 'age', header: 'Years', cell: (row) => `${row.age} years old` },
    ];
    render(<AutoTable data={testData} columns={columns} />);
    expect(screen.getByText('Full Name')).toBeInTheDocument();
    expect(screen.getByText('30 years old')).toBeInTheDocument();
    expect(screen.getByText('25 years old')).toBeInTheDocument();
    expect(screen.queryByText('Id')).not.toBeInTheDocument(); // Should not render inferred 'Id'
  });

  test('renders "No data available." when data is empty', () => {
    render(<AutoTable data={[]} />);
    expect(screen.getByText('No data available.')).toBeInTheDocument();
  });

  test('renders "No data available." when data is null', () => {
    render(<AutoTable data={null as any} />);
    expect(screen.getByText('No data available.')).toBeInTheDocument();
  });

  test('renders "No data available." when data is undefined', () => {
    render(<AutoTable data={undefined as any} />);
    expect(screen.getByText('No data available.')).toBeInTheDocument();
  });

  test('renders caption when provided', () => {
    render(<AutoTable data={testData} caption="User Data Table" />);
    expect(screen.getByText('User Data Table')).toBeInTheDocument();
    expect(screen.getByRole('table').querySelector('caption')).toHaveTextContent('User Data Table');
  });

  test('applies custom classNames to table elements', () => {
    render(
      <AutoTable
        data={testData}
        className="custom-wrapper"
        tableClassName="custom-table"
        theadClassName="custom-thead"
        tbodyClassName="custom-tbody"
        thClassName="custom-th"
        trClassName="custom-tr" // Will apply to all <tr> in tbody
        tdClassName="custom-td"
      />
    );
    expect(screen.getByRole('table').parentElement).toHaveClass('custom-wrapper');
    expect(screen.getByRole('table')).toHaveClass('custom-table');
    expect(screen.getByRole('table').querySelector('thead')).toHaveClass('custom-thead');
    expect(screen.getByRole('table').querySelector('tbody')).toHaveClass('custom-tbody');

    screen.getAllByRole('columnheader').forEach(th => {
      expect(th).toHaveClass('custom-th');
    });
    // Get all rows in tbody
    const table = screen.getByRole('table') as HTMLTableElement;
    const tbody = table.tBodies[0];
    Array.from(tbody.rows).forEach(tr => {
         expect(tr).toHaveClass('custom-tr'); // Check each body row
    });
    screen.getAllByRole('cell').forEach(td => {
      expect(td).toHaveClass('custom-td');
    });
  });
});
