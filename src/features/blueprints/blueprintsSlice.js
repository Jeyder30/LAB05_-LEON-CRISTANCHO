import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../services/apiClient.js'

export const fetchAuthors = createAsyncThunk('blueprints/fetchAuthors', async () => {
  const { data } = await api.get('/blueprints')
  // Expecting API returns array of {author, name, points}
  const authors = [...new Set(data.map((bp) => bp.author))]
  return authors
})

export const fetchByAuthor = createAsyncThunk('blueprints/fetchByAuthor', async (author) => {
  try {
    const response = await api.get(`/v1/blueprints/${encodeURIComponent(author)}`)
    const payload = response.data?.data ?? response.data

    if (!Array.isArray(payload)) {
      throw new Error('La respuesta del servidor no contiene una lista de planos.')
    }

    return { author, items: payload }
  } catch (error) {
    // LAB03 responds with 404 when an author has no blueprints.
    if (error.response?.status === 404) return { author, items: [] }
    throw error
  }
})

export const fetchBlueprint = createAsyncThunk(
  'blueprints/fetchBlueprint',
  async ({ author, name }) => {
    const { data } = await api.get(
      `/blueprints/${encodeURIComponent(author)}/${encodeURIComponent(name)}`,
    )
    return data
  },
)

export const createBlueprint = createAsyncThunk('blueprints/createBlueprint', async (payload) => {
  const { data } = await api.post('/blueprints', payload)
  return data
})

const slice = createSlice({
  name: 'blueprints',
  initialState: {
    authors: [],
    byAuthor: {},
    current: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuthors.pending, (s) => {
        s.status = 'loading'
      })
      .addCase(fetchAuthors.fulfilled, (s, a) => {
        s.status = 'succeeded'
        s.authors = a.payload
      })
      .addCase(fetchAuthors.rejected, (s, a) => {
        s.status = 'failed'
        s.error = a.error.message
      })
      .addCase(fetchByAuthor.fulfilled, (s, a) => {
        s.byAuthor[a.payload.author] = a.payload.items
        s.status = 'succeeded'
        s.error = null
      })
      .addCase(fetchByAuthor.pending, (s, a) => {
        s.status = 'loading'
        s.error = null
        s.byAuthor[a.meta.arg] = []
      })
      .addCase(fetchByAuthor.rejected, (s, a) => {
        s.status = 'failed'
        s.error = a.error.message
      })
      .addCase(fetchBlueprint.fulfilled, (s, a) => {
        s.current = a.payload
      })
      .addCase(createBlueprint.fulfilled, (s, a) => {
        const bp = a.payload
        if (s.byAuthor[bp.author]) s.byAuthor[bp.author].push(bp)
      })
  },
})

export default slice.reducer
