import '@testing-library/jest-dom';

declare module '@jest/expect' {
  interface AsymmetricMatchers {
    toBeInTheDocument(): void;
    toHaveTextContent(text: string | RegExp): void;
    toBeVisible(): void;
    toBeDisabled(): void;
    toHaveClass(className: string): void;
    toHaveAttribute(attr: string, value?: string): void;
    toHaveValue(value: string | string[] | number | null): void;
    toHaveFocus(): void;
    toHaveStyle(style: Record<string, string | number>): void;
  }

  interface Matchers<R> {
    toBeInTheDocument(): R;
    toHaveTextContent(text: string | RegExp): R;
    toBeVisible(): R;
    toBeDisabled(): R;
    toHaveClass(className: string): R;
    toHaveAttribute(attr: string, value?: string): R;
    toHaveValue(value: string | string[] | number | null): R;
    toHaveFocus(): R;
    toHaveStyle(style: Record<string, string | number>): R;
  }
}

export {};
