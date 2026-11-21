# Assignment 3: Task Manager with a Reducer

**Name:** Fatıma Sevde Türker  
**Student Number:** 2024502066

## How to Run

```bash
npm install
npm run dev
npm run build
npm test
```

---

## Bonus 1: Undo

To support undo, the reducer state shape is `type State = { tasks: Task[]; filter: Filter; past: Task[][] }`, where `past` acts as a history stack of earlier task arrays. Every action that modifies the task list (`add`, `advance`, `remove`, and `clearDone`) pushes the previous `state.tasks` array onto `past` before updating `tasks`, while `setFilter` leaves `past` untouched so filter changes are not undoable. Dispatching `{ type: 'undo' }` pops the most recent snapshot from `past` back into `tasks` (which also restores tasks removed by `clearDone`), does nothing when `past` is empty, and disables the Undo button in the UI when there is no history.

---

## Bonus 2: Tests

Automated unit tests are implemented with Vitest in `src/taskReducer.test.ts` (covering all reducer actions, three-step `advance` cycling back to `todo`, `Object.freeze` immutability checks, undo behavior, and edge cases like unknown IDs, empty lists, and `clearDone` with no completed tasks) and `src/filter.test.ts` (covering `filterTasks`, `countByFilter`, empty lists, and counts after deletion).

Output of `npm test`:

```text
> task-manager-assignment3@0.0.0 test
> vitest run

 RUN  v5.1.1

 ✓ src/filter.test.ts (6 tests) 6ms
 ✓ src/taskReducer.test.ts (11 tests) 9ms

 Test Files  2 passed (2)
      Tests  17 passed (17)
   Duration  245ms
```

---

## Bonus 3: Explain your reducer

A reducer must be a pure function so that given the same state and action, it always returns the same next state without side effects. React relies on reference equality (`Object.is`) to decide whether state has changed and whether components need to re-render. If a reducer mutates the existing state object or its `tasks` array in place and returns the same reference, React assumes nothing changed and skips updating the screen. Purity also ensures predictable behavior under React Strict Mode, which intentionally invokes reducers twice in development to expose accidental mutations.

For the same reason, the caller generates each task's `id` using `crypto.randomUUID()` before calling `dispatch`, rather than inside the reducer. Creating random values or timestamps inside a reducer breaks determinism, makes unit testing difficult without mocking, and causes different IDs to be produced when React replays the reducer.

The filtered task list and per-status counts are computed as derived state during rendering instead of being stored alongside `tasks`. Keeping only one source of truth prevents synchronization bugs. For example, if `counts` or `filteredTasks` were stored separately in state, forgetting to recalculate them inside `clearDone` or `undo` would leave stale numbers on the filter buttons or display deleted tasks on screen.

Moving `filter` into the reducer state instead of a separate `useState` made state management easier to reason about because every user interaction flows through a single `dispatch` function and can be tested in isolation. The small trade-off was having to ensure actions like `setFilter` do not push entries onto the undo history (`past`).

---

## Bonus 4: Git repository

[https://github.com/sevdeturker00-byte/assignment3](https://github.com/sevdeturker00-byte/assignment3)