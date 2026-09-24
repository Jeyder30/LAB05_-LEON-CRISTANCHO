import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import blueprintsService from '../../services/blueprintsService.js'

export const fetchAuthors = createAsyncThunk('blueprints/fetchAuthors', async () => {
  const blueprints = await blueprintsService.getAll()
  const authors = [...new Set(blueprints.map((blueprint) => blueprint.author))]
  return authors
})

export const fetchByAuthor = createAsyncThunk('blueprints/fetchByAuthor', async (author) => {
  const items = await blueprintsService.getByAuthor(author)
  return { author, items }
})

export const fetchBlueprint = createAsyncThunk(
  'blueprints/fetchBlueprint',
  async ({ author, name }) => {
    const blueprint = await blueprintsService.getByAuthorAndName(author, name)

    if (!blueprint || !Array.isArray(blueprint.points)) {
      throw new Error('La respuesta del servidor no contiene los puntos del plano.')
    }

    return blueprint
  },
)

export const createBlueprint = createAsyncThunk('blueprints/createBlueprint', async (payload) => {
  return blueprintsService.create(payload)
})

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
        s.currentStatus = 'succeeded'
        s.currentError = null
      })
      .addCase(fetchBlueprint.pending, (s, a) => {
        s.current = { ...a.meta.arg, points: [] }
        s.currentStatus = 'loading'
        s.currentError = null
      })
      .addCase(fetchBlueprint.rejected, (s, a) => {
        s.currentStatus = 'failed'
        s.currentError = a.error.message
      })
      .addCase(createBlueprint.fulfilled, (s, a) => {
        const bp = a.payload
        if (s.byAuthor[bp.author]) s.byAuthor[bp.author].push(bp)
      })
  },
})

export default slice.reducer
