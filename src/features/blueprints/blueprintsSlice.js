import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'
import blueprintsService from '../../services/blueprintsService.js'

export const fetchAuthors = createAsyncThunk('blueprints/fetchAuthors', async () => {
  const blueprints = await blueprintsService.getAll()
  const authors = [...new Set(blueprints.map((blueprint) => blueprint.author))]
  return { authors, blueprints }
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

const selectAllBlueprints = (state) => state.blueprints.all

export const selectTopFiveBlueprints = createSelector([selectAllBlueprints], (blueprints) =>
  [...blueprints]
    .sort(
      (first, second) =>
        (second.points?.length || 0) - (first.points?.length || 0) ||
        first.author.localeCompare(second.author) ||
        first.name.localeCompare(second.name),
    )
    .slice(0, 5),
)

const slice = createSlice({
  name: 'blueprints',
  initialState: {
    authors: [],
    all: [],
    byAuthor: {},
    current: null,
    currentStatus: 'idle',
    currentError: null,
    authorsStatus: 'idle',
    authorsError: null,
    byAuthorStatus: 'idle',
    byAuthorError: null,
    createStatus: 'idle',
    createError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuthors.pending, (s) => {
        s.authorsStatus = 'loading'
        s.authorsError = null
      })
      .addCase(fetchAuthors.fulfilled, (s, a) => {
        s.authorsStatus = 'succeeded'
        s.authors = a.payload.authors
        s.all = a.payload.blueprints
      })
      .addCase(fetchAuthors.rejected, (s, a) => {
        s.authorsStatus = 'failed'
        s.authorsError = a.error.message
      })
      .addCase(fetchByAuthor.fulfilled, (s, a) => {
        s.byAuthor[a.payload.author] = a.payload.items
        s.byAuthorStatus = 'succeeded'
        s.byAuthorError = null
      })
      .addCase(fetchByAuthor.pending, (s, a) => {
        s.byAuthorStatus = 'loading'
        s.byAuthorError = null
        s.byAuthor[a.meta.arg] = []
      })
      .addCase(fetchByAuthor.rejected, (s, a) => {
        s.byAuthorStatus = 'failed'
        s.byAuthorError = a.error.message
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
        const authorBlueprints = s.byAuthor[bp.author] || []
        const existingIndex = authorBlueprints.findIndex((item) => item.name === bp.name)
        if (existingIndex >= 0) authorBlueprints[existingIndex] = bp
        else authorBlueprints.push(bp)
        s.byAuthor[bp.author] = authorBlueprints

        const allIndex = s.all.findIndex(
          (item) => item.author === bp.author && item.name === bp.name,
        )
        if (allIndex >= 0) s.all[allIndex] = bp
        else s.all.push(bp)
        s.createStatus = 'succeeded'
        s.createError = null
      })
      .addCase(createBlueprint.pending, (s) => {
        s.createStatus = 'loading'
        s.createError = null
      })
      .addCase(createBlueprint.rejected, (s, a) => {
        s.createStatus = 'failed'
        s.createError = a.error.message
      })
  },
})

export default slice.reducer
