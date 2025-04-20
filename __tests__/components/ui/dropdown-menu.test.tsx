import React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { describe, expect, it, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('@/lib/utils', () => {
  const originalModule = jest.requireActual('@/lib/utils') as Record<string, unknown>;
  return {
    ...originalModule,
    cn: (...inputs: (string | boolean | null | undefined)[]) => inputs.filter(Boolean).join(' '),
  };
});

jest.mock('lucide-react', () => ({
  CheckIcon: () => <svg data-testid='check-icon' />,
  ChevronRightIcon: () => <svg data-testid='chevron-right-icon' />,
  CircleIcon: () => <svg data-testid='circle-icon' />,
}));

describe('DropdownMenu Components', () => {
  it('renders DropdownMenu with Trigger and Content', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger data-testid='trigger'>Open</DropdownMenuTrigger>
        <DropdownMenuContent data-testid='content'>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant='destructive'>
            Log out
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const trigger = screen.getByTestId('trigger');
    expect(trigger).toBeInTheDocument();

    expect(screen.queryByTestId('content')).not.toBeInTheDocument();

    await userEvent.click(trigger);

    const content = screen.getByTestId('content');
    expect(content).toBeInTheDocument();
    expect(screen.getByText('My Account')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Billing')).toBeInTheDocument();
    expect(screen.getByText('Log out')).toBeInTheDocument();
    expect(screen.getByText('⇧⌘Q')).toBeInTheDocument();
    expect(screen.getAllByRole('separator').length).toBe(2);
  });

  it('renders DropdownMenu with Submenu', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger data-testid='trigger'>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger data-testid='sub-trigger'>Invite users</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent data-testid='sub-content'>
                <DropdownMenuItem>Email</DropdownMenuItem>
                <DropdownMenuItem>Message</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await userEvent.click(screen.getByTestId('trigger'));

    const subTrigger = screen.getByTestId('sub-trigger');
    expect(subTrigger).toBeInTheDocument();

    expect(screen.queryByTestId('sub-content')).not.toBeInTheDocument();

    await userEvent.click(subTrigger);

    const subContent = screen.getByTestId('sub-content');
    expect(subContent).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Message')).toBeInTheDocument();
  });
});
