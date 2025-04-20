import React from 'react';

import ResponseDisplay from '@/components/ResponseDisplay';
import { render, screen } from '@testing-library/react';

describe('ResponseDisplay Component', () => {
  test('renders empty state when no response data is provided', () => {
    render(<ResponseDisplay responseData={null} error={null} />);

    expect(screen.getByText('Response')).toBeInTheDocument();
    expect(
      screen.getByText('Response will appear here after sending a request')
    ).toBeInTheDocument();
    expect(screen.queryByText('Status:')).not.toBeInTheDocument();
  });

  test('displays error message when error prop is provided', () => {
    const errorMessage = 'Network error occurred';
    render(<ResponseDisplay responseData={null} error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(
      screen.getByText('Response will appear here after sending a request')
    ).toBeInTheDocument();
  });

  test('renders successful response data correctly', () => {
    const successResponse = {
      status: 200,
      statusText: 'OK',
      body: JSON.stringify({ message: 'Success', data: { id: 1, name: 'Test' } }),
      time: 123,
    };

    render(<ResponseDisplay responseData={successResponse} error={null} />);

    expect(screen.getByText('Status: 200 OK')).toBeInTheDocument();
    expect(screen.getByText('Time: 123ms')).toBeInTheDocument();
    expect(screen.getByText(/"message": "Success"/)).toBeInTheDocument();
    expect(screen.getByText(/"id": 1/)).toBeInTheDocument();
    expect(screen.getByText(/"name": "Test"/)).toBeInTheDocument();
  });

  test('renders client error response data correctly', () => {
    const clientErrorResponse = {
      status: 404,
      statusText: 'Not Found',
      body: JSON.stringify({ error: 'Resource not found' }),
      time: 50,
    };

    render(<ResponseDisplay responseData={clientErrorResponse} error={null} />);

    expect(screen.getByText('Status: 404 Not Found')).toBeInTheDocument();
    expect(screen.getByText('Time: 50ms')).toBeInTheDocument();
    expect(screen.getByText(/"error": "Resource not found"/)).toBeInTheDocument();
  });

  test('renders server error response data correctly', () => {
    const serverErrorResponse = {
      status: 500,
      statusText: 'Internal Server Error',
      body: JSON.stringify({ error: 'Server error occurred' }),
      time: 200,
    };

    render(<ResponseDisplay responseData={serverErrorResponse} error={null} />);

    expect(screen.getByText('Status: 500 Internal Server Error')).toBeInTheDocument();
    expect(screen.getByText('Time: 200ms')).toBeInTheDocument();
    expect(screen.getByText(/"error": "Server error occurred"/)).toBeInTheDocument();
  });

  test('renders redirect response data correctly', () => {
    const redirectResponse = {
      status: 301,
      statusText: 'Moved Permanently',
      body: '',
      time: 30,
    };

    render(<ResponseDisplay responseData={redirectResponse} error={null} />);

    expect(screen.getByText('Status: 301 Moved Permanently')).toBeInTheDocument();
    expect(screen.getByText('Time: 30ms')).toBeInTheDocument();
  });

  test('handles non-JSON response body', () => {
    const plainTextResponse = {
      status: 200,
      statusText: 'OK',
      body: '<html><body>Hello World</body></html>',
      time: 100,
    };

    render(<ResponseDisplay responseData={plainTextResponse} error={null} />);

    expect(screen.getByText('Status: 200 OK')).toBeInTheDocument();
    expect(screen.getByText('Time: 100ms')).toBeInTheDocument();
    expect(screen.getByText('<html><body>Hello World</body></html>')).toBeInTheDocument();
  });

  test('renders response without timing information', () => {
    const responseWithoutTime = {
      status: 200,
      statusText: 'OK',
      body: JSON.stringify({ data: 'test' }),
    };

    render(<ResponseDisplay responseData={responseWithoutTime} error={null} />);

    expect(screen.getByText('Status: 200 OK')).toBeInTheDocument();
    expect(screen.queryByText(/Time:/)).not.toBeInTheDocument();
    expect(screen.getByText(/"data": "test"/)).toBeInTheDocument();
  });

  test('renders both error and response data when both are provided', () => {
    const errorMessage = 'Warning: Rate limit approaching';
    const successResponseWithWarning = {
      status: 200,
      statusText: 'OK',
      body: JSON.stringify({ data: 'test' }),
      time: 150,
    };

    render(<ResponseDisplay responseData={successResponseWithWarning} error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText('Status: 200 OK')).toBeInTheDocument();
    expect(screen.getByText('Time: 150ms')).toBeInTheDocument();
  });

  test('handles JSON formatting errors gracefully', () => {
    const originalConsoleError = console.error;
    console.error = jest.fn();

    const invalidJsonResponse = {
      status: 200,
      statusText: 'OK',
      body: '{ invalid json',
      time: 100,
    };

    render(<ResponseDisplay responseData={invalidJsonResponse} error={null} />);

    expect(screen.getByText('Status: 200 OK')).toBeInTheDocument();
    expect(screen.getByText('{ invalid json')).toBeInTheDocument();

    console.error = originalConsoleError;
  });
});
