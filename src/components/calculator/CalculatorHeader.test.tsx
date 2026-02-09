import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CalculatorHeader } from './CalculatorHeader';

// Mock calculator store
const mockSetMeetingData = vi.fn();
vi.mock('@/lib/store/calculator-store', () => ({
  useCalculatorStore: () => ({
    setMeetingData: mockSetMeetingData,
    meetingData: null,
  }),
}));

// Mock child components to simplify testing
vi.mock('@/components/import/ExcelImportButton', () => ({
  ExcelImportButton: ({ onImport }: { onImport: (data: unknown) => void }) => (
    <button onClick={() => onImport({ meetingCount: 10 })}>
      Import from Excel
    </button>
  ),
}));

vi.mock('@/components/session/SessionManager', () => ({
  SessionManager: () => <div data-testid="session-manager">Session Manager</div>,
}));

describe('CalculatorHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page title', () => {
    render(<CalculatorHeader />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Meeting Audit Calculator'
    );
  });

  it('renders the description', () => {
    render(<CalculatorHeader />);

    expect(
      screen.getByText(/calculate the alignment tax/i)
    ).toBeInTheDocument();
  });

  it('renders the Excel import button', () => {
    render(<CalculatorHeader />);

    expect(
      screen.getByRole('button', { name: /import from excel/i })
    ).toBeInTheDocument();
  });

  it('renders the session manager', () => {
    render(<CalculatorHeader />);

    expect(screen.getByTestId('session-manager')).toBeInTheDocument();
  });

  it('calls setMeetingData when data is imported', async () => {
    render(<CalculatorHeader />);

    const importButton = screen.getByRole('button', { name: /import from excel/i });
    importButton.click();

    expect(mockSetMeetingData).toHaveBeenCalledWith({ meetingCount: 10 });
  });
});
