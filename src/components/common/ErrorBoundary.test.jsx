import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

// Stub child component that throws an error conditionally
const BuggyComponent = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test rendering crash');
  }
  return <div data-testid="child-content">Normal Child Render</div>;
};

describe('ErrorBoundary.jsx unit tests', () => {
  let originalError;

  beforeEach(() => {
    // Suppress console.error in tests to prevent dirty test logs
    originalError = console.error;
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  test('renders children normally when there is no error', () => {
    render(
      <ErrorBoundary>
        <BuggyComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.queryByTestId('error-boundary-fallback')).not.toBeInTheDocument();
  });

  test('catches rendering errors in child and renders fallback UI', () => {
    render(
      <ErrorBoundary>
        <BuggyComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
    expect(screen.getByText(/Component Execution Halted/i)).toBeInTheDocument();
    expect(screen.getByText(/Reference Code: ERR-500-UI/i)).toBeInTheDocument();
  });

  test('attempts recovery when clicking Attempt Recovery button', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <BuggyComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument();

    // Reset shouldThrow flag by rerendering first
    rerender(
      <ErrorBoundary>
        <BuggyComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    // Now click attempt recovery to trigger state change to hasError: false
    fireEvent.click(screen.getByRole('button', { name: /Attempt Recovery/i }));

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.queryByTestId('error-boundary-fallback')).not.toBeInTheDocument();
  });
});
