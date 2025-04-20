import React from 'react';

// Import the component *after* potential mocks if needed, but usually okay here
import RestClientFormClient from '@/app/[locale]/[method]/[[...path]]/RestClientFormClient';
// --- End Explicit Mock Factories ---

// Import the *mocked* components/functions/hooks AFTER jest.mock calls
import RequestForm from '@/components/RequestForm';
// Import the mocked component
import ResponseDisplay from '@/components/ResponseDisplay';
// --- End Explicit Mock Factories ---

// Import the *mocked* functions/hooks/components AFTER jest.mock calls
// Remove imports for components mocked with factories
// import RequestForm from '@/components/RequestForm';
// import ResponseDisplay from '@/components/ResponseDisplay';
import { useCodeGenerator } from '@/hooks/useCodeGenerator';
import { Header, ResponseData } from '@/types/types';
import { sendRequest } from '@/utils/rest-client/httpClient';
import { encodeSegment } from '@/utils/rest-client/urlEncoder';
import {
  hasVariables,
  processBody,
  processHeaders,
  processUrl,
} from '@/utils/variables/variableSubstitution';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

// --- Mocks ---

// Mock dependencies using just the path *for non-problematic ones*
jest.mock('@/hooks/useCodeGenerator');
// jest.mock('next-intl'); // REMOVE simple mock

// --- Explicit Mock Factory for next-intl ---
const mockT = jest.fn((key) => key.split('.').pop() || key);
jest.mock('next-intl', () => ({
  __esModule: true,
  useTranslations: () => mockT,
}));
// --- End Explicit Mock Factory ---

jest.mock('sonner');
jest.mock('@/utils/rest-client/httpClient');
jest.mock('@/utils/rest-client/urlEncoder');
jest.mock('@/utils/variables/variableSubstitution');

// --- Explicit Mock Factories for Components ---
// Define the mock logic directly inside the factory
jest.mock('@/components/RequestForm', () => ({
  __esModule: true,
  default: jest.fn(
    (
      props // Define jest.fn() here
    ) => (
      <div data-testid='mock-request-form'>
        <button onClick={props.onSubmit}>MockSubmit</button>
        {/* Input removed for simplicity in these tests */}
      </div>
    )
  ),
}));

jest.mock('@/components/ResponseDisplay', () => ({
  __esModule: true,
  default: jest.fn(
    (
      props // Define jest.fn() here
    ) => (
      <div data-testid='mock-response-display'>
        {props.responseData ? `Status: ${props.responseData.status}` : 'No Response'}
        {props.error ? `Error: ${props.error}` : ''}
      </div>
    )
  ),
}));

// Import the mocked component

// Typecast imported mocks
const MockRequestForm = RequestForm as jest.Mock;
const MockResponseDisplay = ResponseDisplay as jest.Mock;
const mockUseCodeGenerator = useCodeGenerator as jest.Mock;
// const mockUseTranslations = useTranslations as jest.Mock; // REMOVE Unused
const mockSendRequest = sendRequest as jest.Mock;
const mockEncodeSegment = encodeSegment as jest.Mock;
const mockHasVariables = hasVariables as jest.Mock;
const mockProcessUrl = processUrl as jest.Mock;
const mockProcessHeaders = processHeaders as jest.Mock;
const mockProcessBody = processBody as jest.Mock;
const mockToast = toast as jest.Mocked<typeof toast>;

// Mock Browser APIs
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

const mockReplaceState = jest.fn();
Object.defineProperty(window, 'history', {
  value: {
    replaceState: mockReplaceState,
  },
  writable: true,
});

// --- Test Setup ---
const defaultProps = {
  locale: 'en',
  initialMethod: 'GET',
  initialUrl: 'https://api.example.com/users',
  initialBody: '',
  initialHeaders: [] as Header[],
};

const mockSuccessResponse: ResponseData = {
  status: 200,
  statusText: 'OK',
  headers: { 'content-type': 'application/json' },
  body: '{"users":[]}',
  parsedBody: { users: [] },
  duration: 123,
  size: 15,
};

const mockErrorResponse = new Error('Network Failed');

const renderComponent = (props = defaultProps) => {
  return render(<RestClientFormClient {...props} />);
};

// --- Tests ---
describe('RestClientFormClient', () => {
  let originalConsoleError: (...data: unknown[]) => void;

  beforeAll(() => {
    // Store original console.error
    originalConsoleError = console.error;
    // Silence console.error *only* for the specific act warning
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' &&
        /The current testing environment is not configured to support act\(...\)/.test(args[0])
      ) {
        // Suppress the specific "act" warning
        return;
      }
      // Call the original console.error for everything else
      originalConsoleError(...args);
    };
  });

  afterAll(() => {
    // Restore original console.error after all tests in the suite
    console.error = originalConsoleError;
  });

  // mockT is already defined above the mock factory

  beforeEach(() => {
    jest.clearAllMocks();

    // Set default implementations using the CASTED imported mocks
    MockRequestForm.mockImplementation((props) => (
      <div data-testid='mock-request-form'>
        <button onClick={props.onSubmit}>MockSubmit</button>
      </div>
    ));
    MockResponseDisplay.mockImplementation((props) => (
      <div data-testid='mock-response-display'>
        {props.responseData ? `Status: ${props.responseData.status}` : 'No Response'}
        {props.error ? `Error: ${props.error}` : ''}
      </div>
    ));
    mockUseCodeGenerator.mockReturnValue({
      selectedLanguage: 'curl',
      setSelectedLanguage: jest.fn(),
      generatedCode: 'mock code snippet',
      isLoading: false,
    });
    mockT.mockImplementation((key) => key.split('.').pop() || key);
    // Default to success for most tests - make it properly async
    mockSendRequest.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockSuccessResponse), 0))
    );
    mockEncodeSegment.mockImplementation((segment) => `encoded(${segment})`);
    mockHasVariables.mockReturnValue(false); // Default to no variables
    mockProcessUrl.mockImplementation((url) => `processed(${url})`);
    mockProcessHeaders.mockImplementation((headers) => headers);
    mockProcessBody.mockImplementation((body) => `processed(${body})`);

    // Explicitly clear mocked toast methods
    mockToast.success?.mockClear();
    mockToast.error?.mockClear();
    mockToast.info?.mockClear();
    mockToast.warning?.mockClear();

    // Clear browser API mocks too
    mockLocalStorage.clear();
    mockReplaceState.mockClear();
    mockLocalStorage.setItem.mockClear(); // Clear calls to setItem as well
  });

  it('should render initial state correctly', () => {
    renderComponent();
    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getByTestId('mock-request-form')).toBeInTheDocument();
    expect(screen.getByTestId('mock-response-display')).toBeInTheDocument();
    expect(screen.getByText('No Response')).toBeInTheDocument();
  });

  it('should call sendRequest and update response on submit', async () => {
    renderComponent();
    const submitButton = screen.getByRole('button', { name: 'MockSubmit' });

    // 1. Act: Only wrap the user event
    await act(async () => {
      await userEvent.click(submitButton);
    });
    // NO await mockSendRequest() here

    // 2. Wait & Assert: Use waitFor for async results
    await waitFor(() => {
      // Check that sendRequest was called correctly (once)
      expect(mockSendRequest).toHaveBeenCalledTimes(1);
      expect(mockSendRequest).toHaveBeenCalledWith(
        defaultProps.initialUrl,
        defaultProps.initialMethod,
        defaultProps.initialHeaders,
        '',
        ''
      );
    });

    // Assert side effects *after* waiting
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1);
    expect(mockReplaceState).toHaveBeenCalledTimes(1);
  });

  it('should handle request errors', async () => {
    // Setup: Mock sendRequest to reject - make it properly async
    mockSendRequest.mockImplementation(
      () => new Promise((_, reject) => setTimeout(() => reject(mockErrorResponse), 0))
    );
    renderComponent();
    const submitButton = screen.getByRole('button', { name: 'MockSubmit' });

    // 1. Act: Only wrap the user event
    await act(async () => {
      await userEvent.click(submitButton);
    });
    // NO await mockSendRequest().catch() here

    // 2. Wait & Assert: Use waitFor for async results
    await waitFor(() => {
      // Check sendRequest was called (once)
      expect(mockSendRequest).toHaveBeenCalledTimes(1);
    });

    // Wait for error handling effects (toast and UI update)
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledTimes(1);
      expect(mockT).toHaveBeenCalledWith('Notifications.networkErrorPrefix');
      expect(mockToast.error).toHaveBeenCalledWith(expect.stringContaining('networkErrorPrefix'));
    });

    // Assert side effects NOT called
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    expect(mockReplaceState).not.toHaveBeenCalled();
  });

  it('should use variable processing when variables are detected', async () => {
    // Setup: Enable variable processing
    mockHasVariables.mockReturnValue(true);
    renderComponent();
    const submitButton = screen.getByRole('button', { name: 'MockSubmit' });

    // 1. Act: Only wrap the user event
    await act(async () => {
      await userEvent.click(submitButton);
    });
    // NO await mockSendRequest() here

    // 2. Wait & Assert: Use waitFor for async results
    await waitFor(() => {
      // Check variable processing calls
      expect(mockProcessUrl).toHaveBeenCalledTimes(1);
      expect(mockProcessUrl).toHaveBeenCalledWith(defaultProps.initialUrl);
      expect(mockProcessHeaders).toHaveBeenCalledTimes(1);
      expect(mockProcessHeaders).toHaveBeenCalledWith(defaultProps.initialHeaders);
      expect(mockProcessBody).toHaveBeenCalledTimes(1);
      expect(mockProcessBody).toHaveBeenCalledWith(defaultProps.initialBody);

      // Check sendRequest call with processed args (once)
      expect(mockSendRequest).toHaveBeenCalledTimes(1);
      expect(mockSendRequest).toHaveBeenCalledWith(
        `processed(${defaultProps.initialUrl})`,
        defaultProps.initialMethod,
        defaultProps.initialHeaders, // Mock returns original
        '',
        `processed(${defaultProps.initialBody})`
      );
    });

    // Assert side effects *after* waiting
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1);
    expect(mockReplaceState).toHaveBeenCalledTimes(1);
  });

  // Add more tests for:
  // - Different methods (POST/PUT with body/content-type)
  // - Header interactions
  // - URL/Body updates via the form mock (needs more complex RequestForm mock)
  // - URL encoding errors (mock encodeSegment to throw)
  // - localStorage loading/saving edge cases
});
