import React, { forwardRef } from 'react';

import CustomSelect from '@/components/select/select';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

jest.mock('next/image', () => {
  const { default: NextImage } = jest.requireActual('next/image');
  const MockImage = forwardRef<HTMLImageElement, React.ComponentProps<typeof NextImage>>(
    (props, ref) => <NextImage unoptimized {...props} ref={ref} />
  );
  MockImage.displayName = 'Image';
  return MockImage;
});

describe('CustomSelect Component', () => {
  const options = [
    { label: 'Option One', value: 'one', icon: '/icon1.png' },
    { label: 'Option Two', value: 'two', icon: '/icon2.png' },
    { label: 'Option Three', value: 'three' },
  ];

  it('renders with default value and optional icon', () => {
    render(
      <CustomSelect
        icon='/main-icon.png'
        options={options}
        defaultValue={options[0]}
        selectIcon
        onChange={jest.fn()}
      />
    );

    expect(screen.getByRole('button')).toHaveTextContent('Option One');
    expect(screen.getByRole('img', { name: /icon/i })).toHaveAttribute('src', '/main-icon.png');
  });

  it('opens dropdown on click and lists options', () => {
    render(<CustomSelect options={options} defaultValue={options[1]} onChange={jest.fn()} />);

    const toggle = screen.getByRole('button');
    fireEvent.click(toggle);

    options.forEach((opt) => {
      const matches = screen.getAllByText(opt.label);
      expect(matches.length).toBeGreaterThan(0);
    });
  });

  it('calls onChange and updates selection when an option is clicked', () => {
    const handleChange = jest.fn();
    render(<CustomSelect options={options} defaultValue={options[2]} onChange={handleChange} />);

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Option One'));

    expect(handleChange).toHaveBeenCalledWith('one');
    expect(screen.getByRole('button')).toHaveTextContent('Option One');
  });
});
