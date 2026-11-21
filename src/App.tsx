// STARTING POINT: the sample Task Manager (state in App with useReducer, passed down as props).
// Assignment 3: change the state shape, add actions, add a filter bar (see the handout).
import { useReducer } from 'react'
import type { Dispatch } from 'react'
import { initialState, taskReducer, type Action, type Task } from './taskReducer'
import { FILTERS, countByFilter, filterTasks, type Filter } from './filter'
import TaskRow from './TaskRow'

const FILTER_LABELS: Record<Filter, string> = {
  all: 'All',
  todo: 'To do',
  'in-progress': 'In progress',
  done: 'Done',
}

function AddForm({ dispatch }: { dispatch: Dispatch<Action> }) {
  function addTask(formData: FormData) {
    const title = String(formData.get('title') ?? '').trim()
    if (title) dispatch({ type: 'add', id: crypto.randomUUID(), title })
  }
  return (
    <form action={addTask} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
      <input name="title" placeholder="New task" style={{ flex: 1, padding: '6px 8px' }} />
      <button type="submit">Add</button>
    </form>
  )
}

type FilterBarProps = {
  activeFilter: Filter
  counts: Record<Filter, number>
  canUndo: boolean
  dispatch: Dispatch<Action>
}

function FilterBar({ activeFilter, counts, canUndo, dispatch }: FilterBarProps) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12, alignItems: 'center' }}>
      {FILTERS.map((filter) => {
        const isActive = filter === activeFilter
        return (
          <button
            key={filter}
            type="button"
            aria-pressed={isActive}
            onClick={() => dispatch({ type: 'setFilter', filter })}
            style={{
              padding: '6px 10px',
              fontWeight: isActive ? 700 : 400,
              backgroundColor: isActive ? '#1f2937' : '#f3f4f6',
              color: isActive ? '#ffffff' : '#111827',
              border: isActive ? '1px solid #1f2937' : '1px solid #d1d5db',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            {FILTER_LABELS[filter]} ({counts[filter]})
          </button>
        )
      })}

      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={() => dispatch({ type: 'undo' })}
          disabled={!canUndo}
          style={{
            padding: '6px 10px',
            borderRadius: 6,
            cursor: !canUndo ? 'not-allowed' : 'pointer',
          }}
        >
          Undo
        </button>

        <button
          type="button"
          onClick={() => dispatch({ type: 'clearDone' })}
          disabled={counts.done === 0}
          style={{
            padding: '6px 10px',
            borderRadius: 6,
            cursor: counts.done === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          Clear done
        </button>
      </div>
    </div>
  )
}

function TaskList({ tasks, dispatch }: { tasks: Task[]; dispatch: Dispatch<Action> }) {
  if (tasks.length === 0) {
    return <p style={{ color: '#6b7280' }}>No tasks here.</p>
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
      {tasks.map((t) => (
        <TaskRow
          key={t.id}
          task={t}
          onNext={() => dispatch({ type: 'advance', id: t.id })}
          onDelete={() => dispatch({ type: 'remove', id: t.id })}
        />
      ))}
    </ul>
  )
}

export default function App() {
  const [state, dispatch] = useReducer(taskReducer, initialState)

  const counts = countByFilter(state.tasks)
  const visibleTasks = filterTasks(state.tasks, state.filter)

  return (
    <main style={{ maxWidth: 640, margin: '24px auto', fontFamily: 'system-ui, sans-serif', padding: '0 16px' }}>
      <h1>Task Manager</h1>
      <AddForm dispatch={dispatch} />
      <FilterBar
        activeFilter={state.filter}
        counts={counts}
        canUndo={state.past.length > 0}
        dispatch={dispatch}
      />
      <TaskList tasks={visibleTasks} dispatch={dispatch} />
    </main>
  )
}