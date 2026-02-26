# feat(hooks-d): implement `useClickOutside` hook — closes #75

## Overview
This PR introduces the `useClickOutside` hook for the library, providing a standardized way to handle clicks occurring outside specific elements. This is essential for components like dropdowns, menus, and popovers.

## Key Features
- **Flexible Targets**: Supports both a single ref and an array of refs.
- **Exclusion Logic**: Allows excluding specific elements (via `excludeRefs`) to prevent unwanted closures when clicking on triggers or related UI.
- **Event Handling**: Listens for both `mousedown` and `touchstart` to ensure mobile compatibility.
- **Conditional Activation**: Includes an `enabled` flag to easily toggle the listener without re-rendering the hook logic manually.
- **Auto-Cleanup**: Ensures listeners are properly removed on unmount.

## Changes
- Created `src/hooks-d/use-click-outside.ts`.
- Created `src/hooks-d/use-click-outside.test.ts` with comprehensive unit tests.
- Migrated `src/components/menu.tsx` to use the new hook.
- Migrated `src/components/popover.tsx` to use the new hook.

## Verification
- ✅ **Unit Tests**: 7 test cases covering single/multiple refs, exclusion, enabled flag, and mobile touch events.
- ✅ **Build**: Successfully ran `npm run build`.
