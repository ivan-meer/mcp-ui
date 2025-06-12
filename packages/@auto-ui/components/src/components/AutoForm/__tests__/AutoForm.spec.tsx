// packages/@auto-ui/components/src/components/AutoForm/__tests__/AutoForm.spec.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AutoForm, FormFieldSchema } from '../AutoForm';

describe('AutoForm', () => {
  const mockSubmit = jest.fn();

  const basicFields: FormFieldSchema[] = [
    { name: 'username', label: 'Username', type: 'text', validation: { required: true } },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'Enter your email' },
    { name: 'age', label: 'Age', type: 'number' },
  ];

  beforeEach(() => {
    mockSubmit.mockClear();
  });

  test('renders form fields based on schema', () => {
    render(<AutoForm fields={basicFields} onSubmit={mockSubmit} />);
    expect(screen.getByLabelText(/Username/)).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Age')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
  });

  test('updates text field value on change', () => {
    render(<AutoForm fields={basicFields} onSubmit={mockSubmit} />);
    const usernameInput = screen.getByLabelText(/Username/) as HTMLInputElement;
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    expect(usernameInput.value).toBe('testuser');
  });

  test('updates number field value on change', () => {
    render(<AutoForm fields={basicFields} onSubmit={mockSubmit} />);
    const ageInput = screen.getByLabelText('Age') as HTMLInputElement;
    fireEvent.change(ageInput, { target: { value: '33' } });
    expect(ageInput.value).toBe('33');
  });

  test('calls onSubmit with form data for valid submission', () => {
    render(<AutoForm fields={basicFields} onSubmit={mockSubmit} />);
    fireEvent.change(screen.getByLabelText(/Username/), { target: { value: 'user1' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user1@example.com' } });
    fireEvent.change(screen.getByLabelText('Age'), { target: { value: '30' } });
    fireEvent.click(screen.getByText('Submit'));

    expect(mockSubmit).toHaveBeenCalledWith({
      username: 'user1',
      email: 'user1@example.com',
      age: '30' // Note: HTML input values are strings by default
    });
  });

  test('shows validation error if required field is empty and prevents submission', async () => {
    render(<AutoForm fields={basicFields} onSubmit={mockSubmit} />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user1@example.com' } });
    fireEvent.click(screen.getByText('Submit'));

    // Check for error message
    expect(await screen.findByText('Username is required.')).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  test('handles checkbox field correctly', () => {
    const checkboxFields: FormFieldSchema[] = [
      { name: 'agreed', label: 'Agree to terms', type: 'checkbox', defaultValue: false, validation: { required: true } },
    ];
    render(<AutoForm fields={checkboxFields} onSubmit={mockSubmit} />);
    const checkbox = screen.getByRole('checkbox', { name: 'Agree to terms *' }) as HTMLInputElement;

    expect(checkbox.checked).toBe(false);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);

    fireEvent.click(screen.getByText('Submit'));
    expect(mockSubmit).toHaveBeenCalledWith({ agreed: true });
  });

  test('handles select field correctly', () => {
    const selectFields: FormFieldSchema[] = [
      {
        name: 'color',
        label: 'Favorite Color',
        type: 'select',
        options: [
          { value: 'red', label: 'Red' },
          { value: 'blue', label: 'Blue' },
        ],
        defaultValue: 'red'
      },
    ];
    render(<AutoForm fields={selectFields} onSubmit={mockSubmit} />);
    const selectInput = screen.getByLabelText('Favorite Color') as HTMLSelectElement;
    expect(selectInput.value).toBe('red');

    fireEvent.change(selectInput, { target: { value: 'blue' } });
    expect(selectInput.value).toBe('blue');

    fireEvent.click(screen.getByText('Submit'));
    expect(mockSubmit).toHaveBeenCalledWith({ color: 'blue' });
  });

   test('displays form title when provided', () => {
    render(<AutoForm fields={[]} onSubmit={mockSubmit} formTitle="Test Form Title" />);
    expect(screen.getByText('Test Form Title')).toBeInTheDocument();
  });

  test('calls onCancel when cancel button is clicked', () => {
    const mockCancel = jest.fn();
    render(<AutoForm fields={[]} onSubmit={mockSubmit} onCancel={mockCancel} cancelButtonText="Go Back" />);

    const cancelButton = screen.getByText('Go Back');
    expect(cancelButton).toBeInTheDocument();
    fireEvent.click(cancelButton);
    expect(mockCancel).toHaveBeenCalledTimes(1);
  });
});
