// Vitest + jest-dom setup
// Registers custom DOM matchers (toBeInTheDocument, toHaveValue, etc.)
// Used by all component tests (ResultsView.test.jsx and future UI tests).
import '@testing-library/jest-dom';

// ── jsdom matchMedia mock (appended Phase 2 Plan 02-01) ──
// jsdom does not implement window.matchMedia. QuizShell reads
// window.matchMedia('(prefers-reduced-motion: reduce)') for Framer Motion.
// Without this mock, QuizShell renders throw "window.matchMedia is not a function".
// Appended here (not recreating the file) per plan 02-01 Task 4 instructions.
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
      matches: false,
      media: query,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      onchange: null,
      dispatchEvent() { return false; },
    }),
  });
}
