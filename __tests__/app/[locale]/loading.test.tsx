import React from 'react';

import Loading from '@/app/[locale]/loading';
import { render, screen } from '@testing-library/react';

describe('Loading Component', () => {
  test('renders loading component correctly', () => {
    render(<Loading />);

    const loadingElement = screen.getByTestId('loading') || document.querySelector('.animate-spin');

    expect(loadingElement).toBeInTheDocument();
  });
});
