// Fatıma Sevde Türker - 2024502066
import type { Filter } from './filter'

export type Status = 'todo' | 'in-progress' | 'done'
export type Task = { id: string; title: string; status: Status }

export type State = {
  tasks: Task[]
  filter: Filter
  past: Task[][]
}

export const initialState: State = {
  tasks: [],
  filter: 'all',
  past: [],
}

export type Action =
  | { type: 'add'; id: string; title: string }
  | { type: 'advance'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'setFilter'; filter: Filter }
  | { type: 'clearDone' }
  | { type: 'undo' }

const NEXT: Record<Status, Status> = {
  todo: 'in-progress',
  'in-progress': 'done',
  done: 'todo',
}

export function taskReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add':
      return {
        ...state,
        tasks: [...state.tasks, { id: action.id, title: action.title, status: 'todo' }],
        past: [...state.past, state.tasks],
      }
    case 'advance': {
      if (!state.tasks.some((t) => t.id === action.id)) {
        return state
      }
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id ? { ...t, status: NEXT[t.status] } : t,
        ),
        past: [...state.past, state.tasks],
      }
    }
    case 'remove': {
      if (!state.tasks.some((t) => t.id === action.id)) {
        return state
      }
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.id),
        past: [...state.past, state.tasks],
      }
    }
    case 'setFilter':
      return {
        ...state,
        filter: action.filter,
      }
    case 'clearDone': {
      if (!state.tasks.some((t) => t.status === 'done')) {
        return state
      }
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.status !== 'done'),
        past: [...state.past, state.tasks],
      }
    }
    case 'undo': {
      if (state.past.length === 0) {
        return state
      }
      const previousTasks = state.past[state.past.length - 1]
      return {
        ...state,
        tasks: previousTasks,
        past: state.past.slice(0, -1),
      }
    }
    default: {
      const _exhaustive: never = action
      return _exhaustive
    }
  }
}