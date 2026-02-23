import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExcelImportButton } from './ExcelImportButton';

// Mock excel-parser
vi.mock('@/lib/templates/excel-parser', () => ({
  parseExcelTemplate: vi.fn(),
  isValidExcelFile: vi.fn(),
}));

import { parseExcelTemplate, isValidExcelFile } from '@/lib/templates/excel-parser';

describe('ExcelImportButton', () => {
  const mockOnImport = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the import button', () => {
    render(<ExcelImportButton onImport={mockOnImport} />);

    expect(screen.getByText('Import from Excel')).toBeInTheDocument();
  });

  it('has hidden file input', () => {
    render(<ExcelImportButton onImport={mockOnImport} />);

    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveStyle({ display: 'none' });
  });

  it('accepts xlsx files', () => {
    render(<ExcelImportButton onImport={mockOnImport} />);

    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toHaveAttribute('accept', '.xlsx,.xls');
  });

  it('has accessible label', () => {
    render(<ExcelImportButton onImport={mockOnImport} />);

    expect(
      screen.getByLabelText(/import data from excel template/i)
    ).toBeInTheDocument();
  });

  it('shows error for invalid file type', async () => {
    vi.mocked(isValidExcelFile).mockReturnValue(false);

    render(<ExcelImportButton onImport={mockOnImport} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/please select a valid excel file/i)).toBeInTheDocument();
    });
  });

  it('shows preview after successful parse', async () => {
    const mockData = {
      meetingCount: 10,
      averageAttendees: 5,
      averageDuration: 60,
      salaryDistribution: {
        executive: 1,
        senior: 2,
        midLevel: 1,
        entry: 1,
      },
    };

    vi.mocked(isValidExcelFile).mockReturnValue(true);
    vi.mocked(parseExcelTemplate).mockResolvedValue({
      success: true,
      data: mockData,
    });

    render(<ExcelImportButton onImport={mockOnImport} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    Object.defineProperty(file, 'arrayBuffer', {
      value: () => Promise.resolve(new ArrayBuffer(0)),
    });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Import Preview')).toBeInTheDocument();
    });
  });

  it('shows parse errors with details', async () => {
    vi.mocked(isValidExcelFile).mockReturnValue(true);
    vi.mocked(parseExcelTemplate).mockResolvedValue({
      success: false,
      error: {
        code: 'PARSE_ERROR',
        message: 'Invalid data',
        details: ['Meeting count is required'],
      },
    });

    render(<ExcelImportButton onImport={mockOnImport} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    Object.defineProperty(file, 'arrayBuffer', {
      value: () => Promise.resolve(new ArrayBuffer(0)),
    });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Import Error')).toBeInTheDocument();
      expect(screen.getByText('Invalid data')).toBeInTheDocument();
      expect(screen.getByText('Meeting count is required')).toBeInTheDocument();
    });
  });

  it('calls onImport when Apply Data is clicked', async () => {
    const mockData = {
      meetingCount: 10,
      averageAttendees: 5,
      averageDuration: 60,
      salaryDistribution: {
        executive: 1,
        senior: 2,
        midLevel: 1,
        entry: 1,
      },
    };

    vi.mocked(isValidExcelFile).mockReturnValue(true);
    vi.mocked(parseExcelTemplate).mockResolvedValue({
      success: true,
      data: mockData,
    });

    render(<ExcelImportButton onImport={mockOnImport} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    Object.defineProperty(file, 'arrayBuffer', {
      value: () => Promise.resolve(new ArrayBuffer(0)),
    });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Apply Data')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Apply Data'));

    expect(mockOnImport).toHaveBeenCalledWith(mockData);
  });

  it('closes modal on Cancel', async () => {
    const mockData = {
      meetingCount: 10,
      averageAttendees: 5,
      averageDuration: 60,
      salaryDistribution: {
        executive: 1,
        senior: 2,
        midLevel: 1,
        entry: 1,
      },
    };

    vi.mocked(isValidExcelFile).mockReturnValue(true);
    vi.mocked(parseExcelTemplate).mockResolvedValue({
      success: true,
      data: mockData,
    });

    render(<ExcelImportButton onImport={mockOnImport} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    Object.defineProperty(file, 'arrayBuffer', {
      value: () => Promise.resolve(new ArrayBuffer(0)),
    });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancel'));

    await waitFor(() => {
      expect(screen.queryByText('Import Preview')).not.toBeInTheDocument();
    });
  });
});
