import { describe, it, expect } from 'vitest'
import reducer, {
  createBlueprint,
  fetchAuthors,
  fetchBlueprint,
  fetchByAuthor,
  selectTopFiveBlueprints,
} from '../src/features/blueprints/blueprintsSlice.js'

describe('blueprints slice', () => {
  it('initializes the search and current-blueprint state', () => {
    const state = reducer(undefined, { type: '@@INIT' })

    expect(state.authors).toEqual([])
    expect(state.all).toEqual([])
    expect(state.byAuthor).toEqual({})
    expect(state.current).toBeNull()
    expect(state.currentStatus).toBe('idle')
    expect(state.authorsStatus).toBe('idle')
    expect(state.byAuthorStatus).toBe('idle')
    expect(state.createStatus).toBe('idle')
  })

  it('stores the catalogue and returns a memoized top five ordered by point count', () => {
    const blueprints = Array.from({ length: 6 }, (_, index) => ({
      author: 'john',
      name: `plan-${index}`,
      points: Array.from({ length: index }, (_, point) => ({ x: point, y: point })),
    }))
    let state = reducer(undefined, fetchAuthors.pending('request-catalogue'))

    expect(state.authorsStatus).toBe('loading')

    state = reducer(
      state,
      fetchAuthors.fulfilled(
        { authors: ['john'], blueprints },
        'request-catalogue',
      ),
    )

    expect(state.authorsStatus).toBe('succeeded')
    expect(state.all).toEqual(blueprints)
    const storeState = { blueprints: state }
    const topFive = selectTopFiveBlueprints(storeState)

    expect(topFive).toHaveLength(5)
    expect(topFive.map((blueprint) => blueprint.name)).toEqual([
      'plan-5',
      'plan-4',
      'plan-3',
      'plan-2',
      'plan-1',
    ])
    expect(selectTopFiveBlueprints(storeState)).toBe(topFive)
  })

  it('tracks an author search and stores the returned blueprints', () => {
    const blueprint = { author: 'john', name: 'house', points: [{ x: 1, y: 2 }] }
    const pending = fetchByAuthor.pending('request-1', 'john')
    let state = reducer(undefined, pending)

    expect(state.byAuthorStatus).toBe('loading')
    expect(state.byAuthor.john).toEqual([])

    state = reducer(
      state,
      fetchByAuthor.fulfilled({ author: 'john', items: [blueprint] }, 'request-1', 'john'),
    )

    expect(state.byAuthorStatus).toBe('succeeded')
    expect(state.byAuthor.john).toEqual([blueprint])
    expect(state.byAuthorError).toBeNull()
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

  it('tracks create loading, success, and errors while updating the catalogue', () => {
    const blueprint = { author: 'jane', name: 'garden', points: [{ x: 1, y: 2 }] }
    let state = reducer(undefined, createBlueprint.pending('request-3', blueprint))

    expect(state.createStatus).toBe('loading')

    state = reducer(state, createBlueprint.fulfilled(blueprint, 'request-3', blueprint))

    expect(state.createStatus).toBe('succeeded')
    expect(state.byAuthor.jane).toEqual([blueprint])
    expect(state.all).toEqual([blueprint])

    state = reducer(
      state,
      createBlueprint.rejected(new Error('duplicate'), 'request-4', blueprint),
    )

    expect(state.createStatus).toBe('failed')
    expect(state.createError).toBe('duplicate')
  })
})
