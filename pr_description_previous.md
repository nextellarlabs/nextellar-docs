# feat(hooks-d): implement `usePrevious` hook — closes #76

## Overview
This PR introduces the `usePrevious` hook, which allows tracking the value of a prop or state from the previous render. This is particularly useful for comparing changes, detecting trends (e.g., scroll direction), or implementing logic that relies on state transitions.

## Key Features
- **Generic Support**: Preserves the type of the input value.
- **Render Cycle Alignment**: Updates via `useEffect` to ensure it captures the value *after* the render is committed, making it available on the *next* render.
- **Initial State**: Returns `undefined` on the first render, consistent with standard "previous" hook implementations.
- **Zero Dependencies**: Lightweight implementation using only standard React hooks.

## Changes
- Created `src/hooks-d/use-previous.ts`.
- Created `src/hooks-d/use-previous.test.ts` with comprehensive unit tests.
- Added JSDoc documentation with a practical example for detecting scroll direction.

## Verification
- ✅ **Unit Tests**: 5 test cases passing (initial state, updates, primitive types, objects).
- ✅ **Build**: Successfully ran `npm run build`.
