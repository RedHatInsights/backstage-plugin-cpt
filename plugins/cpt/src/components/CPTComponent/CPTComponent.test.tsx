import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CPTComponent } from '../CPTComponent';
import { queryTestRunsData } from '../../common/QueryTestRunsData';

// Mock Data
const mockTestRunsData = {
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

// **Mock queryTestRunsData** so it returns different states
jest.mock('../../common/QueryTestRunsData', () => ({
  queryTestRunsData: jest.fn(),
}));

describe('CPTComponent', () => {
  test('displays loading state initially', () => {
    // Mock queryTestRunsData to return loading state
    (queryTestRunsData as jest.Mock).mockReturnValue({
      result: null,
      loaded: false,
      error: null,
    });

    render(<CPTComponent />);

    // Check if loading indicator is displayed
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('displays error message when data fetch fails', () => {
    // Mock queryTestRunsData to return an error
    (queryTestRunsData as jest.Mock).mockReturnValue({
      result: null,
      loaded: true,
      error: new Error('Test error'),
    });

    render(<CPTComponent />);

    // Check for error message
    expect(screen.getByText(/error retrieving data from opensearch/i)).toBeInTheDocument();
  });

  test('renders DataTableComponent when data is loaded', () => {
    // Mock queryTestRunsData to return test data
    (queryTestRunsData as jest.Mock).mockReturnValue({
      result: mockTestRunsData,
      loaded: true,
      error: null,
    });

    render(<CPTComponent />);

    // Check if DataTableComponent is rendered
    expect(screen.getByText(/cpt test runs/i)).toBeInTheDocument(); // Card title
    expect(screen.getByText(/performance testing results/i)).toBeInTheDocument(); // Card subheader

    // Check if test data is displayed
    expect(screen.getByText('Test A')).toBeInTheDocument();
    expect(screen.getByText('Test B')).toBeInTheDocument();
  });
});