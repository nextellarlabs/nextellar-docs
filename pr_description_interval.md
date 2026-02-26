# feat(hooks-d): implement `useInterval` hook — closes #79

## Overview
This PR introduces the `useInterval` hook, a declarative way to handle interval timers in React. It's designed to be robust, type-safe, and easy to use for scenarios like polling APIs, auto-refreshing data, or managing recurring UI updates.

## Key Features
- **Declarative API**: Set up intervals using a simple hook call that follows the React lifecycle.
- **Dynamic Delays**: Automatically pauses when the delay is set to `null` and restarts when a new number is provided.
- **Immediate Execution**: Supports an `immediate` option to trigger the callback as soon as the hook mounts or the delay changes.
- **Resilient Callbacks**: Uses a ref to always execute the latest version of the callback without forcing an interval reset unless the delay itself changes.
- **Automatic Cleanup**: Ensures `clearInterval` is called on unmount or whenever the interval needs to be re-created.

## Changes
- Created `src/hooks-d/use-interval.ts`.
- Created `src/hooks-d/use-interval.test.ts` with 100% test coverage using fake timers.
- Added JSDoc documentation with polling and conditional pause examples.

## Verification
- ✅ **Unit Tests**: 7 test cases covering null delays, immediate triggers, callback updates, and cleanup.
- ✅ **Build**: Successfully verified with `npm run build`.
