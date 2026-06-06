// Wave 0 RED test — DemoTierSwitcher component (does not exist yet).
// This file imports from src/components/DemoTierSwitcher.jsx which does NOT exist yet.
// These tests are RED (module-not-found) until Wave 2 ships DemoTierSwitcher.
// Do NOT create stub components to make them pass.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DemoTierSwitcher from '../src/components/DemoTierSwitcher.jsx';

describe('DemoTierSwitcher', () => {
  it('renders nothing when visible is false', () => {
    const { container } = render(
      <DemoTierSwitcher tier="free" onTier={() => {}} visible={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders four tier buttons when visible is true', () => {
    render(
      <DemoTierSwitcher tier="free" onTier={() => {}} visible={true} />
    );
    // Should render buttons for all four tiers
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);
  });
});
