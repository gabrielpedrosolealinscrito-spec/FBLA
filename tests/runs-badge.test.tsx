// Wave 0 RED test — RunsBadge component (does not exist yet).
// This file imports from src/components/RunsBadge.jsx which does NOT exist yet.
// These tests are RED (module-not-found) until Wave 2 ships RunsBadge.
// Do NOT create stub components to make them pass.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RunsBadge from '../src/components/RunsBadge.jsx';

describe('RunsBadge', () => {
  it('renders nothing for free tier (null label)', () => {
    const { container } = render(<RunsBadge tier="free" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders correct label for basic tier', () => {
    render(<RunsBadge tier="basic" />);
    expect(screen.getByText('Basic · 1 of 1 run')).toBeTruthy();
  });

  it('renders correct label for plus tier', () => {
    render(<RunsBadge tier="plus" />);
    expect(screen.getByText('Plus · 2 of 3 runs left')).toBeTruthy();
  });

  it('renders correct label for premium tier', () => {
    render(<RunsBadge tier="premium" />);
    expect(screen.getByText('Premium · unlimited')).toBeTruthy();
  });
});
