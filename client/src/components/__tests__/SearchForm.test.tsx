import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchForm } from '../SearchForm';

describe('SearchForm', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
  });

  it('renders search form correctly', () => {
    render(<SearchForm onSearch={mockOnSearch} />);
    
    expect(screen.getByPlaceholderText(/airport code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('calls onSearch when form is submitted with valid data', async () => {
    render(<SearchForm onSearch={mockOnSearch} />);
    
    // Fill in form fields
    const airportInput = screen.getByPlaceholderText(/airport code/i);
    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);
    
    fireEvent.change(airportInput, { target: { value: 'LAX' } });
    fireEvent.change(startDateInput, { target: { value: '2024-01-15' } });
    fireEvent.change(endDateInput, { target: { value: '2024-01-20' } });
    
    // Submit form
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith({
        airportCode: 'LAX',
        startDate: '2024-01-15',
        endDate: '2024-01-20',
        maxDistance: undefined,
        sortBy: 'price',
      });
    });
  });

  it('shows advanced filters when toggle button is clicked', () => {
    render(<SearchForm onSearch={mockOnSearch} />);
    
    const advancedFiltersButton = screen.getByRole('button', { name: /advanced filters/i });
    fireEvent.click(advancedFiltersButton);
    
    expect(screen.getByText(/price range/i)).toBeInTheDocument();
    expect(screen.getByText(/distance/i)).toBeInTheDocument();
    expect(screen.getByText(/amenities/i)).toBeInTheDocument();
  });

  it('validates required fields before submission', async () => {
    render(<SearchForm onSearch={mockOnSearch} />);
    
    // Try to submit without filling required fields
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(mockOnSearch).not.toHaveBeenCalled();
    });
  });

  it('applies advanced filters when they are changed', async () => {
    render(<SearchForm onSearch={mockOnSearch} />);
    
    // Open advanced filters
    const advancedFiltersButton = screen.getByRole('button', { name: /advanced filters/i });
    fireEvent.click(advancedFiltersButton);
    
    // Change price range
    const priceRangeInput = screen.getByLabelText(/max price/i);
    fireEvent.change(priceRangeInput, { target: { value: '100' } });
    
    // Fill required fields and submit
    const airportInput = screen.getByPlaceholderText(/airport code/i);
    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);
    
    fireEvent.change(airportInput, { target: { value: 'LAX' } });
    fireEvent.change(startDateInput, { target: { value: '2024-01-15' } });
    fireEvent.change(endDateInput, { target: { value: '2024-01-20' } });
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          maxPrice: 100,
        })
      );
    });
  });
});
