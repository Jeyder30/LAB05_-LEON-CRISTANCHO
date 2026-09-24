import { describe, it, expect } from 'vitest'
import reducer, {
  fetchBlueprint,
  fetchByAuthor,
} from '../src/features/blueprints/blueprintsSlice.js'

describe('blueprints slice', () => {
  it('initializes the search and current-blueprint state', () => {
    const state = reducer(undefined, { type: '@@INIT' })

    expect(state.authors).toEqual([])
    expect(state.byAuthor).toEqual({})
    expect(state.current).toBeNull()
    expect(state.currentStatus).toBe('idle')
  })

  it('tracks an author search and stores the returned blueprints', () => {
    const blueprint = { author: 'john', name: 'house', points: [{ x: 1, y: 2 }] }
    const pending = fetchByAuthor.pending('request-1', 'john')
    let state = reducer(undefined, pending)

    expect(state.status).toBe('loading')
    expect(state.byAuthor.john).toEqual([])

    state = reducer(
      state,
      fetchByAuthor.fulfilled({ author: 'john', items: [blueprint] }, 'request-1', 'john'),
    )

    expect(state.status).toBe('succeeded')
    expect(state.byAuthor.john).toEqual([blueprint])
    expect(state.error).toBeNull()
  })

  it('sets the selected blueprint name and points in global state', () => {
    const request = { author: 'john', name: 'house' }
    const blueprint = { ...request, points: [{ x: 1, y: 2 }] }
    let state = reducer(undefined, fetchBlueprint.pending('request-2', request))

    expect(state.current).toEqual({ ...request, points: [] })
    expect(state.currentStatus).toBe('loading')

    state = reducer(state, fetchBlueprint.fulfilled(blueprint, 'request-2', request))

    expect(state.current).toEqual(blueprint)
    expect(state.current.name).toBe('house')
    expect(state.currentStatus).toBe('succeeded')
  })
})
