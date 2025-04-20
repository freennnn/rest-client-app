import React from 'react';

import HydrationErrorHandler from '@/components/HydrationErrorHandler';
import { render } from '@testing-library/react';

describe('HydrationErrorHandler Component', () => {
  let originalQuerySelector: typeof document.querySelector;
  let mockRemoveAttribute: jest.Mock;
  let mockBody: {
    hasAttribute: jest.Mock;
    removeAttribute: jest.Mock;
  };

  beforeEach(() => {
    mockRemoveAttribute = jest.fn();
    mockBody = {
      hasAttribute: jest.fn(),
      removeAttribute: mockRemoveAttribute,
    };

    originalQuerySelector = document.querySelector;

    document.querySelector = jest.fn().mockImplementation((selector) => {
      if (selector === 'body') {
        return mockBody;
      }
      return null;
    });
  });

  afterEach(() => {
    document.querySelector = originalQuerySelector;
    jest.clearAllMocks();
  });

  test('renders without errors and returns null', () => {
    const { container } = render(<HydrationErrorHandler />);
    expect(container.firstChild).toBeNull();
  });

  test('removes data-new-gr-c-s-check-loaded attribute if it exists', () => {
    mockBody.hasAttribute.mockImplementation((attr) => {
      return attr === 'data-new-gr-c-s-check-loaded';
    });

    render(<HydrationErrorHandler />);

    expect(document.querySelector).toHaveBeenCalledWith('body');
    expect(mockBody.hasAttribute).toHaveBeenCalledWith('data-new-gr-c-s-check-loaded');
    expect(mockRemoveAttribute).toHaveBeenCalledWith('data-new-gr-c-s-check-loaded');
  });

  test('removes data-gr-ext-installed attribute if it exists', () => {
    mockBody.hasAttribute.mockImplementation((attr) => {
      return attr === 'data-gr-ext-installed';
    });

    render(<HydrationErrorHandler />);

    expect(document.querySelector).toHaveBeenCalledWith('body');
    expect(mockBody.hasAttribute).toHaveBeenCalledWith('data-gr-ext-installed');
    expect(mockRemoveAttribute).toHaveBeenCalledWith('data-gr-ext-installed');
  });

  test('does nothing if attributes do not exist', () => {
    mockBody.hasAttribute.mockReturnValue(false);

    render(<HydrationErrorHandler />);

    expect(document.querySelector).toHaveBeenCalledWith('body');
    expect(mockBody.hasAttribute).toHaveBeenCalledTimes(2);
    expect(mockRemoveAttribute).not.toHaveBeenCalled();
  });

  test('does nothing if body element is not found', () => {
    (document.querySelector as jest.Mock).mockReturnValue(null);

    render(<HydrationErrorHandler />);

    expect(document.querySelector).toHaveBeenCalledWith('body');
    expect(mockBody.hasAttribute).not.toHaveBeenCalled();
    expect(mockRemoveAttribute).not.toHaveBeenCalled();
  });

  test('handles both attributes existing together', () => {
    mockBody.hasAttribute.mockReturnValue(true);

    render(<HydrationErrorHandler />);

    expect(document.querySelector).toHaveBeenCalledWith('body');
    expect(mockBody.hasAttribute).toHaveBeenCalledTimes(2);
    expect(mockRemoveAttribute).toHaveBeenCalledTimes(2);
    expect(mockRemoveAttribute).toHaveBeenCalledWith('data-new-gr-c-s-check-loaded');
    expect(mockRemoveAttribute).toHaveBeenCalledWith('data-gr-ext-installed');
  });
});
