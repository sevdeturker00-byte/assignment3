import { describe, expect, it } from 'vitest'
import { countByFilter, filterTasks } from './filter'
import { taskReducer, type State, type Task } from './taskReducer'

const SAMPLE_TASKS: Task[] = [
  { id: '1', title: 'Plan reducer', status: 'done' },
  { id: '2', title: 'Build filter bar', status: 'in-progress' },
  { id: '3', title: 'Write unit tests', status: 'todo' },
  { id: '4', title: 'Review README', status: 'todo' },
]

describe('filterTasks', () => {
  it('returns all tasks when filter is all', () => {
    expect(filterTasks(SAMPLE_TASKS, 'all')).toEqual(SAMPLE_TASKS)
  })

  it('returns only matching tasks for todo, in-progress, and done', () => {
    expect(filterTasks(SAMPLE_TASKS, 'todo').map((t) => t.id)).toEqual(['3', '4'])
    expect(filterTasks(SAMPLE_TASKS, 'in-progress').map((t) => t.id)).toEqual(['2'])
    expect(filterTasks(SAMPLE_TASKS, 'done').map((t) => t.id)).toEqual(['1'])
  })

  it('returns an empty array for an empty task list', () => {
    expect(filterTasks([], 'all')).toEqual([])
    expect(filterTasks([], 'done')).toEqual([])
  })
})

describe('countByFilter', () => {
  it('counts tasks for each filter category accurately', () => {
    expect(countByFilter(SAMPLE_TASKS)).toEqual({
      all: 4,
      todo: 2,
      'in-progress': 1,
      done: 1,
    })
  })

  it('returns all zeros for an empty task list', () => {
    expect(countByFilter([])).toEqual({
      all: 0,
      todo: 0,
      'in-progress': 0,
      done: 0,
    })
  })

  it('updates counts accurately after deleting a task via taskReducer', () => {
    const state: State = { tasks: SAMPLE_TASKS, filter: 'all', past: [] }
    const afterDelete = taskReducer(state, { type: 'remove', id: '3' })

    expect(countByFilter(afterDelete.tasks)).toEqual({
      all: 3,
      todo: 1,
      'in-progress': 1,
      done: 1,
    })
  })
})