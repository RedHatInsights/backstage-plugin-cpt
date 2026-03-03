import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CPTComponent } from '../CPTComponent';
import { useQueryTestRunsData } from '../../common/QueryTestRunsData';

jest.mock('../../common/QueryTestRunsData', () => ({
  useQueryTestRunsData: jest.fn(),
}));

describe('CPTComponent', () => {
  test('displays loading state initially', () => {
    // Mock useQueryTestRunsData to return loading state
    (useQueryTestRunsData as jest.Mock).mockReturnValue({
      result: null,
      loaded: false,
      error: null,
    });

    render(<CPTComponent />);

    // Check if loading indicator is displayed
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('displays error message when data fetch fails', () => {
    // Mock useQueryTestRunsData to return an error
    (useQueryTestRunsData as jest.Mock).mockReturnValue({
      result: null,
      loaded: true,
      error: new Error('Test error'),
    });

    render(<CPTComponent />);

    // Check for error message
    expect(
      screen.getByText(/error retrieving data from opensearch/i),
    ).toBeInTheDocument();
  });

  test('displays instructions for setting up annotation', () => {
    // Mock useQueryTestRunsData to return empty results
    (useQueryTestRunsData as jest.Mock).mockReturnValue({
      result: [],
      loaded: true,
      error: null,
    });

    render(<CPTComponent />);

    // Check for error message
    expect(
      screen.getByText(/No results found for your query/i),
    ).toBeInTheDocument();
  });

});

