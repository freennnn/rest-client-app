import React from 'react';

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { describe, expect, it, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

jest.mock('@/lib/utils', () => {
  const originalModule = jest.requireActual('@/lib/utils') as Record<string, unknown>;
  return {
    ...originalModule,
    cn: (...inputs: (string | boolean | null | undefined)[]) => inputs.filter(Boolean).join(' '),
  };
});

describe('Card Components', () => {
  it('renders Card with basic structure', () => {
    render(
      <Card data-testid='card'>
        <CardHeader data-testid='card-header'>
          <CardTitle data-testid='card-title'>Card Title</CardTitle>
          <CardDescription data-testid='card-description'>Card Description</CardDescription>
        </CardHeader>
        <CardContent data-testid='card-content'>Card Content</CardContent>
        <CardFooter data-testid='card-footer'>Card Footer</CardFooter>
      </Card>
    );

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('card-header')).toBeInTheDocument();
    expect(screen.getByTestId('card-title')).toHaveTextContent('Card Title');
    expect(screen.getByTestId('card-description')).toHaveTextContent('Card Description');
    expect(screen.getByTestId('card-content')).toHaveTextContent('Card Content');
    expect(screen.getByTestId('card-footer')).toHaveTextContent('Card Footer');
  });

  it('renders CardHeader with CardAction', () => {
    render(
      <Card data-testid='card' className=''>
        <CardHeader data-testid='card-header'>
          <CardTitle data-testid='card-title'>Title</CardTitle>
          <CardDescription data-testid='card-description'>Description</CardDescription>
          <CardAction data-testid='card-action'>Action</CardAction>
        </CardHeader>
      </Card>
    );
    expect(screen.getByTestId('card-action')).toHaveTextContent('Action');
    expect(screen.getByTestId('card-header')).toHaveClass(
      'has-data-[slot=card-action]:grid-cols-[1fr_auto]'
    );
  });

  it('applies custom classNames', () => {
    render(
      <Card data-testid='card' className='custom-card'>
        <CardHeader data-testid='card-header' className='custom-header'>
          <CardTitle data-testid='card-title' className='custom-title'>
            Title
          </CardTitle>
          <CardDescription data-testid='card-description' className='custom-description'>
            Desc
          </CardDescription>
        </CardHeader>
        <CardContent data-testid='card-content' className='custom-content'>
          Content
        </CardContent>
        <CardFooter data-testid='card-footer' className='custom-footer'>
          Footer
        </CardFooter>
      </Card>
    );

    expect(screen.getByTestId('card')).toHaveClass('custom-card');
    expect(screen.getByTestId('card-header')).toHaveClass('custom-header');
    expect(screen.getByTestId('card-title')).toHaveClass('custom-title');
    expect(screen.getByTestId('card-description')).toHaveClass('custom-description');
    expect(screen.getByTestId('card-content')).toHaveClass('custom-content');
    expect(screen.getByTestId('card-footer')).toHaveClass('custom-footer');
  });
});
