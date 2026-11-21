import { describe, expect, it } from 'vitest'
import { initialState, taskReducer, type State, type Task } from './taskReducer'

function makeState(tasks: Task[], filter: State['filter'] = 'all', past: Task[][] = []): State {
  return { tasks, filter, past }
}

describe('taskReducer', () => {
  it('adds a new task with status todo and records previous tasks in past', () => {
    const next = taskReducer(initialState, { type: 'add', id: '1', title: 'Read slides' })

    expect(next.tasks).toEqual([{ id: '1', title: 'Read slides', status: 'todo' }])
    expect(next.filter).toBe('all')
    expect(next.past).toEqual([[]])
  })

  it('advances a task through todo -> in-progress -> done -> todo in three steps', () => {
    const start = makeState([{ id: '1', title: 'Task A', status: 'todo' }])

    const step1 = taskReducer(start, { type: 'advance', id: '1' })
    expect(step1.tasks[0].status).toBe('in-progress')

    const step2 = taskReducer(step1, { type: 'advance', id: '1' })
    expect(step2.tasks[0].status).toBe('done')

    const step3 = taskReducer(step2, { type: 'advance', id: '1' })
    expect(step3.tasks[0].status).toBe('todo')
  })

  it('removes a task by id', () => {
    const start = makeState([
      { id: '1', title: 'First', status: 'todo' },
      { id: '2', title: 'Second', status: 'done' },
    ])

    const next = taskReducer(start, { type: 'remove', id: '1' })

    expect(next.tasks).toEqual([{ id: '2', title: 'Second', status: 'done' }])
    expect(next.past).toHaveLength(1)
  })

  it('updates filter without modifying tasks or undo history', () => {
    const start = makeState([{ id: '1', title: 'First', status: 'todo' }], 'all', [[]])

    const next = taskReducer(start, { type: 'setFilter', filter: 'in-progress' })

    expect(next.filter).toBe('in-progress')
    expect(next.tasks).toEqual(start.tasks)
    expect(next.past).toEqual(start.past)
  })

  it('clears all done tasks while keeping the current filter', () => {
    const start = makeState(
      [
        { id: '1', title: 'A', status: 'todo' },
        { id: '2', title: 'B', status: 'done' },
        { id: '3', title: 'C', status: 'in-progress' },
        { id: '4', title: 'D', status: 'done' },
      ],
      'done',
    )

    const next = taskReducer(start, { type: 'clearDone' })

    expect(next.tasks).toEqual([
      { id: '1', title: 'A', status: 'todo' },
      { id: '3', title: 'C', status: 'in-progress' },
    ])
    expect(next.filter).toBe('done')
    expect(next.past).toHaveLength(1)
  })

  it('undoes task changes including clearDone, and ignores setFilter in history', () => {
    let state = taskReducer(initialState, { type: 'add', id: '1', title: 'Write tests' })
    state = taskReducer(state, { type: 'advance', id: '1' })
    state = taskReducer(state, { type: 'advance', id: '1' })
    state = taskReducer(state, { type: 'setFilter', filter: 'done' })
    state = taskReducer(state, { type: 'clearDone' })

    expect(state.tasks).toEqual([])

    const undone = taskReducer(state, { type: 'undo' })
    expect(undone.tasks).toEqual([{ id: '1', title: 'Write tests', status: 'done' }])
    expect(undone.filter).toBe('done')
  })

  it('does nothing when undoing with empty history', () => {
    const next = taskReducer(initialState, { type: 'undo' })
    expect(next).toBe(initialState)
  })

  it('does not mutate the previous state (verified with Object.freeze)', () => {
    const task1: Task = Object.freeze({ id: '1', title: 'Frozen todo', status: 'todo' })
    const task2: Task = Object.freeze({ id: '2', title: 'Frozen done', status: 'done' })
    const frozenTasks = Object.freeze([task1, task2]) as unknown as Task[]
    const frozenPast = Object.freeze([]) as unknown as Task[][]
    const frozenState: State = Object.freeze({
      tasks: frozenTasks,
      filter: 'all',
      past: frozenPast,
    })

    const snapshot = structuredClone(frozenState)

    taskReducer(frozenState, { type: 'add', id: '3', title: 'New' })
    taskReducer(frozenState, { type: 'advance', id: '1' })
    taskReducer(frozenState, { type: 'remove', id: '1' })
    taskReducer(frozenState, { type: 'setFilter', filter: 'todo' })
    taskReducer(frozenState, { type: 'clearDone' })

    expect(frozenState).toEqual(snapshot)
  })

  describe('edge cases', () => {
    it('returns the same state for advance or remove with an unknown id', () => {
      const start = makeState([{ id: '1', title: 'Only task', status: 'todo' }])

      expect(taskReducer(start, { type: 'advance', id: 'missing' })).toBe(start)
      expect(taskReducer(start, { type: 'remove', id: 'missing' })).toBe(start)
    })

    it('returns the same state on clearDone when no tasks are done', () => {
      const start = makeState([
        { id: '1', title: 'Open', status: 'todo' },
        { id: '2', title: 'Working', status: 'in-progress' },
      ])

      const next = taskReducer(start, { type: 'clearDone' })
      expect(next).toBe(start)
    })

    it('handles actions safely on an empty task list', () => {
      expect(taskReducer(initialState, { type: 'advance', id: '1' })).toBe(initialState)
      expect(taskReducer(initialState, { type: 'remove', id: '1' })).toBe(initialState)
      expect(taskReducer(initialState, { type: 'clearDone' })).toBe(initialState)
    })
  })
})