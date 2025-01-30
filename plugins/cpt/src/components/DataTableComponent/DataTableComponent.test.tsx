import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DataTableComponent } from './DataTableComponent';


const mockData = {
  data: [
    {
      _source: {
        date: '2024-01-25T12:34:56Z',
        version: 'v1.2.3',
        link: 'https://example.com/test1',
        test: 'Test A',
        result: 'PASS',
      },
    },
    {
      _source: {
        date: '2024-01-26T14:30:00Z',
        version: 'v1.2.4',
        link: 'https://example.com/test2',
        test: 'Test B',
        result: 'FAIL',
      },
    },
  ],
};

describe('DataTableComponent', () => {
  test('renders table headers correctly', () => {
    render(<DataTableComponent {...mockData} />);

    expect(screen.getByText(/date\/time/i)).toBeInTheDocument();
    expect(screen.getByText(/image tag/i)).toBeInTheDocument();
    expect(screen.getByText(/test name/i)).toBeInTheDocument();
    expect(screen.getByText(/result/i)).toBeInTheDocument();
  });

  test('renders table rows correctly', () => {
    render(<DataTableComponent {...mockData} />);

    // Check if data is correctly displayed
    expect(screen.getByText('Test A')).toBeInTheDocument();
    expect(screen.getByText('Test B')).toBeInTheDocument();
    expect(screen.getByText('v1.2.3')).toBeInTheDocument();
    expect(screen.getByText('v1.2.4')).toBeInTheDocument();
  });

  test('formats date and time correctly', () => {
    render(<DataTableComponent {...mockData} />);

    // Check formatted dates
    expect(screen.getByText("1/25/2024 @ 12:34:56 PM")).toBeInTheDocument();
  });

  test('renders correct icons for PASS/FAIL results', () => {
    render(<DataTableComponent {...mockData} />);

    // The PASS row should contain a green check icon
    expect(screen.getByTestId('CheckCircleIcon')).toBeInTheDocument();

    // The FAIL row should contain a red close icon
    expect(screen.getByTestId('CloseIcon')).toBeInTheDocument();
  });

  test('handles pagination correctly', () => {
    render(<DataTableComponent {...mockData} />);

    const nextPageButton = screen.getByRole('button', { name: /next page/i });

    // Click next page
    fireEvent.click(nextPageButton);

    // Ensure new data loads correctly (though we only have 2 rows, so no change)
    expect(screen.getByText('Test A')).toBeInTheDocument();
  });

  test('handles changing rows per page correctly', () => {
    render(<DataTableComponent {...mockData} />);
  
    const rowsPerPageButton = screen.getByLabelText(/rows per page/i);
    fireEvent.mouseDown(rowsPerPageButton); // Open dropdown
  
    const option = screen.getByRole('option', { name: '5' }); // Get "5" option
    fireEvent.click(option); // Select it
  
    // Verify that the table updates (mockData has only 2 rows, so both should be present)
    expect(screen.getByText('Test A')).toBeInTheDocument();
    expect(screen.getByText('Test B')).toBeInTheDocument();
  });
});