import React from 'react';

import MockedRestClientFormClient from '@/app/[locale]/[method]/[[...path]]/RestClientFormClient';
import RestClientPage from '@/app/[locale]/[method]/[[...path]]/page';
import * as paths from '@/paths';
import * as urlEncoder from '@/utils/rest-client/urlEncoder';
import { render, screen } from '@testing-library/react';
import * as nextIntlServer from 'next-intl/server';
import * as navigation from 'next/navigation';

// --- Mocks ---

// Mock the client component to check props
// const MockRestClientFormClient = jest.fn(() => (
//   <div data-testid='mock-client-component'>Mock Client</div>
// )); // Define inline below
jest.mock('@/app/[locale]/[method]/[[...path]]/RestClientFormClient', () => ({
  __esModule: true,
  // Define the mock component directly, wrapped in jest.fn() to track calls
  default: jest.fn(() => <div data-testid='mock-client-component'>Mock Client</div>),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Mock next-intl/server
jest.mock('next-intl/server', () => ({
  setRequestLocale: jest.fn(),
}));

// Mock urlEncoder
jest.mock('@/utils/rest-client/urlEncoder', () => ({
  decodeSegment: jest.fn((encoded) => `decoded-${encoded}`),
}));

// Mock paths
jest.mock('@/paths', () => ({
  nonFoundPath: jest.fn(() => '/test-not-found'),
}));

// --- Tests ---

describe('RestClientPage Server Component', () => {
  // Define types for props helper for better type safety
  type TestParams = {
    locale?: string;
    method: string;
    path?: string[];
  };
  type TestSearchParams = { [key: string]: string | string[] | undefined };

  // Helper to create props
  const createProps = (params: TestParams, searchParams: TestSearchParams = {}) => ({
    params: Promise.resolve({ locale: 'en', ...params }),
    searchParams: Promise.resolve(searchParams),
  });

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set locale using setRequestLocale', async () => {
    const props = createProps({ method: 'GET' });
    render(await RestClientPage(props));
    expect(nextIntlServer.setRequestLocale).toHaveBeenCalledWith('en');
  });

  it('should redirect to not found path for invalid method', async () => {
    const props = createProps({ method: 'INVALID' });
    await RestClientPage(props); // Component execution triggers redirect
    expect(navigation.redirect).toHaveBeenCalledWith('/test-not-found');
    expect(paths.nonFoundPath).toHaveBeenCalled();
  });

  it('should decode URL from the first path segment', async () => {
    const props = createProps({ method: 'GET', path: ['encodedUrl123'] });
    render(await RestClientPage(props));
    expect(urlEncoder.decodeSegment).toHaveBeenCalledWith('encodedUrl123');
    expect(MockedRestClientFormClient).toHaveBeenCalledWith(
      expect.objectContaining({ initialUrl: 'decoded-encodedUrl123' }),
      undefined
    );
  });

  it('should decode body from the second path segment for POST/PUT/PATCH', async () => {
    const props = createProps({ method: 'POST', path: ['encodedUrl', 'encodedBody'] });
    render(await RestClientPage(props));
    expect(urlEncoder.decodeSegment).toHaveBeenCalledWith('encodedUrl');
    expect(urlEncoder.decodeSegment).toHaveBeenCalledWith('encodedBody');
    expect(MockedRestClientFormClient).toHaveBeenCalledWith(
      expect.objectContaining({
        initialUrl: 'decoded-encodedUrl',
        initialBody: 'decoded-encodedBody',
      }),
      undefined
    );
  });

  it('should NOT decode body for GET/DELETE/etc even if present', async () => {
    const props = createProps({ method: 'GET', path: ['encodedUrl', 'ignoredBody'] });
    render(await RestClientPage(props));
    expect(urlEncoder.decodeSegment).toHaveBeenCalledWith('encodedUrl');
    expect(urlEncoder.decodeSegment).not.toHaveBeenCalledWith('ignoredBody');
    expect(MockedRestClientFormClient).toHaveBeenCalledWith(
      expect.objectContaining({
        initialUrl: 'decoded-encodedUrl',
        initialBody: '',
      }),
      undefined
    );
  });

  it('should parse headers from searchParams', async () => {
    const props = createProps(
      { method: 'GET', path: ['encodedUrl'] },
      { Header1: 'Value1', 'Content-Type': 'application/json' }
    );
    render(await RestClientPage(props));
    expect(MockedRestClientFormClient).toHaveBeenCalledWith(
      {
        locale: 'en',
        initialMethod: 'GET',
        initialUrl: 'decoded-encodedUrl',
        initialBody: '',
        initialHeaders: expect.arrayContaining([
          expect.objectContaining({ key: 'Header1', value: 'Value1' }),
          expect.objectContaining({ key: 'Content-Type', value: 'application/json' }),
          expect.objectContaining({ id: expect.stringMatching(/^header-initial-/) }),
        ]),
      },
      undefined
    );
  });

  it('should render the client component with correct initial props', async () => {
    const props = createProps(
      { method: 'PUT', path: ['urlABC', 'bodyXYZ'] },
      { Auth: 'Bearer 123' }
    );
    render(await RestClientPage(props));

    expect(screen.getByTestId('mock-client-component')).toBeInTheDocument();
    expect(MockedRestClientFormClient).toHaveBeenCalledTimes(1);
    expect(MockedRestClientFormClient).toHaveBeenCalledWith(
      {
        locale: 'en',
        initialMethod: 'PUT',
        initialUrl: 'decoded-urlABC',
        initialBody: 'decoded-bodyXYZ',
        initialHeaders: [
          expect.objectContaining({ id: 'header-initial-Auth', key: 'Auth', value: 'Bearer 123' }),
        ],
      },
      undefined
    );
  });

  it('should handle missing path segments gracefully', async () => {
    const props = createProps({ method: 'GET' }); // No path
    render(await RestClientPage(props));
    expect(urlEncoder.decodeSegment).not.toHaveBeenCalled();
    expect(MockedRestClientFormClient).toHaveBeenCalledWith(
      expect.objectContaining({
        initialUrl: '',
        initialBody: '',
      }),
      undefined
    );
  });

  it('should handle only URL path segment gracefully', async () => {
    const props = createProps({ method: 'POST', path: ['onlyUrl'] }); // POST but no body segment
    render(await RestClientPage(props));
    expect(urlEncoder.decodeSegment).toHaveBeenCalledWith('onlyUrl');
    expect(urlEncoder.decodeSegment).toHaveBeenCalledTimes(1);
    expect(MockedRestClientFormClient).toHaveBeenCalledWith(
      expect.objectContaining({
        initialUrl: 'decoded-onlyUrl',
        initialBody: '',
      }),
      undefined
    );
  });

  // Optional: Test error handling in decodeSegment if it could throw catchable errors
  // it('should handle errors during decoding', async () => {
  //   mockDecodeSegment.mockImplementationOnce(() => { throw new Error('Decode failed'); });
  //   const props = createProps({ method: 'GET', path: ['badEncode'] });
  //   // Assert that the component throws or handles the error appropriately
  //   await expect(RestClientPage(props)).rejects.toThrow('Decode failed');
  // });
});
