// Wave 0 RED test — LockGate component (does not exist yet).
// This file imports from src/components/LockGate.jsx which does NOT exist yet.
// These tests are RED (module-not-found) until Wave 1 ships LockGate.
// Do NOT create stub components to make them pass.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LockGate from '../src/components/LockGate.jsx';

describe('LockGate unlocked', () => {
  it('renders children when tier meets required tier', () => {
    render(
      <LockGate tier="plus" requiredTier="basic" onUnlock={() => {}}>
        <span data-testid="child-content">Unlocked content</span>
      </LockGate>
    );
    expect(screen.getByTestId('child-content')).toBeTruthy();
  });
});

describe('LockGate locked', () => {
  it('renders padlock svg and blurred wrapper when tier does not meet required tier', () => {
    const { container } = render(
      <LockGate tier="free" requiredTier="basic" onUnlock={() => {}}>
        <span data-testid="child-content">Locked content</span>
      </LockGate>
    );
    // Should render the padlock SVG
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    // Child content should not be directly accessible (blurred/hidden)
    const blurred = container.querySelector('[style*="blur"]');
    expect(blurred).toBeTruthy();
  });
});

describe('LockGate skeleton', () => {
  it('renders FrostedSkeleton when locked and children is null', () => {
    const { container } = render(
      <LockGate tier="free" requiredTier="premium" onUnlock={() => {}}>
        {null}
      </LockGate>
    );
    // Should still render the locked overlay (padlock)
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    // Should render skeleton placeholder (div with skeleton lines)
    const skeletonLines = container.querySelectorAll('[style*="border-radius"]');
    expect(skeletonLines.length).toBeGreaterThan(0);
  });
});
