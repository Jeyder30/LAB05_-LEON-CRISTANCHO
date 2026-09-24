import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore, createSlice } from '@reduxjs/toolkit'
import BlueprintsPage from '../src/pages/BlueprintsPage.jsx'

// Mock de thunks del slice para no requerir backend
vi.mock('../src/features/blueprints/blueprintsSlice.js', () => ({
  fetchAuthors: () => ({ type: 'blueprints/fetchAuthors' }),
  fetchByAuthor: (author) => ({ type: 'blueprints/fetchByAuthor', payload: author }),
  fetchBlueprint: (payload) => ({ type: 'blueprints/fetchBlueprint', payload }),
}))

function makeStore(preloaded) {
  const slice = createSlice({
    name: 'blueprints',
    initialState: {
      authors: [],
      byAuthor: {},
      current: null,
      currentStatus: 'idle',
      currentError: null,
      status: 'idle',
      error: null,
      ...preloaded,
    },
    reducers: {},
  })
  return configureStore({ reducer: { blueprints: slice.reducer } })
}

describe('BlueprintsPage', () => {
  it('dispatches fetchByAuthor when the author search is submitted', () => {
    const store = makeStore()
    const spy = vi.spyOn(store, 'dispatch')
    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    fireEvent.change(screen.getByPlaceholderText(/Author/i), {
      target: { value: '  JohnConnor  ' },
    })
    fireEvent.click(screen.getByText(/Get blueprints/i))

    expect(spy).toHaveBeenCalledWith({ type: 'blueprints/fetchByAuthor', payload: 'JohnConnor' })
  })

  it('shows the plan name and point count and dispatches fetchBlueprint from Open', () => {
    const blueprint = {
      author: 'john',
      name: 'house',
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ],
    }
    const store = makeStore({ byAuthor: { john: [blueprint] }, currentStatus: 'idle' })
    const spy = vi.spyOn(store, 'dispatch')

    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    fireEvent.change(screen.getByPlaceholderText(/Author/i), { target: { value: 'john' } })
    fireEvent.click(screen.getByText(/Get blueprints/i))

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('house')).toBeInTheDocument()
    expect(screen.getByText('2', { selector: '.point-count' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Open' }))

    expect(spy).toHaveBeenCalledWith({
      type: 'blueprints/fetchBlueprint',
      payload: { author: 'john', name: 'house' },
    })
  })
})
