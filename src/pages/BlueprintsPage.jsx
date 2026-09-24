import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import BlueprintForm from '../components/BlueprintForm.jsx'
import BlueprintCanvas from '../components/BlueprintCanvas.jsx'
import {
  createBlueprint,
  fetchAuthors,
  fetchBlueprint,
  fetchByAuthor,
  selectTopFiveBlueprints,
} from '../features/blueprints/blueprintsSlice.js'

export default function BlueprintsPage() {
  const dispatch = useDispatch()
  const {
    byAuthor,
    current,
    authorsStatus,
    authorsError,
    byAuthorStatus,
    byAuthorError,
    currentStatus,
    currentError,
    createStatus,
    createError,
  } = useSelector((s) => s.blueprints)
  const topFiveBlueprints = useSelector(selectTopFiveBlueprints)
  const [authorInput, setAuthorInput] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState('')
  const items = byAuthor[selectedAuthor] || []

  const totalPoints = useMemo(
    () => items.reduce((acc, blueprint) => acc + (blueprint.points?.length || 0), 0),
    [items],
  )

  useEffect(() => {
    dispatch(fetchAuthors())
  }, [dispatch])

  const getBlueprints = (event) => {
    event.preventDefault()
    const author = authorInput.trim()
    if (!author || byAuthorStatus === 'loading') return
    setSelectedAuthor(author)
    dispatch(fetchByAuthor(author))
  }

  const openBlueprint = (blueprint) => {
    dispatch(fetchBlueprint({ author: blueprint.author, name: blueprint.name }))
  }

  const createNewBlueprint = async (blueprint) => {
    const action = await dispatch(createBlueprint(blueprint))
    if (createBlueprint.fulfilled.match(action)) {
      setAuthorInput(blueprint.author)
      setSelectedAuthor(blueprint.author)
    }
  }

  return (
    <main className="blueprints-layout">
      <section className="blueprints-sidebar" aria-label="Blueprint search and results">
        <section className="card search-panel" aria-labelledby="search-title">
          <p className="eyebrow">Blueprint library</p>
          <h2 className="panel-title" id="search-title">
            Find a blueprint
          </h2>
          <form className="search-form" onSubmit={getBlueprints}>
            <div className="search-field">
              <label className="sr-only" htmlFor="author-search">
                Author
              </label>
              <input
                id="author-search"
                className="input"
                placeholder="Enter an author name"
                required
                value={authorInput}
                onChange={(event) => setAuthorInput(event.target.value)}
              />
            </div>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={!authorInput.trim() || byAuthorStatus === 'loading'}
            >
              Get blueprints
            </button>
          </form>
        </section>

        <section className="card ranking-panel" aria-labelledby="ranking-title">
          <div className="results-heading">
            <div>
              <p className="eyebrow">Blueprint overview</p>
              <h2 className="panel-title" id="ranking-title">
                Top 5 by points
              </h2>
            </div>
          </div>
          {authorsStatus === 'loading' && (
            <p className="status-message" role="status">
              Loading blueprint overview...
            </p>
          )}
          {authorsStatus === 'failed' && (
            <p className="status-message error-message" role="alert">
              Could not load the overview: {authorsError}
            </p>
          )}
          {authorsStatus === 'succeeded' && !topFiveBlueprints.length && (
            <p className="empty-message">No blueprints available yet.</p>
          )}
          {!!topFiveBlueprints.length && (
            <ol className="top-blueprint-list">
              {topFiveBlueprints.map((blueprint, index) => (
                <li
                  className="top-blueprint-item"
                  key={`${blueprint.author}-${blueprint.name}`}
                >
                  <span className="rank-number">{index + 1}</span>
                  <div className="top-blueprint-info">
                    <strong>{blueprint.name}</strong>
                    <span>{blueprint.author}</span>
                  </div>
                  <span className="top-blueprint-count">
                    {blueprint.points?.length || 0} <small>pts</small>
                  </span>
                  <button
                    className="btn btn-open"
                    type="button"
                    onClick={() => openBlueprint(blueprint)}
                    disabled={currentStatus === 'loading'}
                  >
                    Open
                  </button>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="card results-panel" aria-labelledby="results-title">
          <div className="results-heading">
            <div>
              <p className="eyebrow">Author results</p>
              <h2 className="panel-title" id="results-title">
                {selectedAuthor ? `${selectedAuthor}'s blueprints` : 'Results'}
              </h2>
            </div>
            {selectedAuthor && (
              <span className="result-count">
                {items.length} {items.length === 1 ? 'blueprint' : 'blueprints'}
              </span>
            )}
          </div>

          {byAuthorStatus === 'loading' && (
            <p className="status-message" role="status">
              Loading blueprints...
            </p>
          )}
          {byAuthorStatus === 'failed' && (
            <p className="status-message error-message" role="alert">
              Could not load blueprints: {byAuthorError}
            </p>
          )}
          {!selectedAuthor && byAuthorStatus !== 'loading' && (
            <p className="empty-message">Enter an author name to see their blueprints.</p>
          )}
          {selectedAuthor &&
            !items.length &&
            byAuthorStatus !== 'loading' &&
            byAuthorStatus !== 'failed' && (
              <p className="empty-message">No blueprints found for this author.</p>
            )}

          {!!items.length && (
            <div className="table-scroll">
              <table className="blueprints-table">
                <caption className="sr-only">Blueprints created by {selectedAuthor}</caption>
                <thead>
                  <tr>
                    <th scope="col">Blueprint name</th>
                    <th className="numeric-cell" scope="col">
                      Number of points
                    </th>
                    <th className="action-cell" scope="col">
                      <span className="sr-only">Open blueprint</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((blueprint) => (
                    <tr key={blueprint.name}>
                      <td className="blueprint-name-cell">{blueprint.name}</td>
                      <td className="numeric-cell">
                        <span className="point-count">{blueprint.points?.length || 0}</span>
                      </td>
                      <td className="action-cell">
                        <button
                          className="btn btn-open"
                          type="button"
                          onClick={() => openBlueprint(blueprint)}
                          disabled={currentStatus === 'loading'}
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <footer className="results-footer">
            <span>Total user points</span>
            <strong>{totalPoints}</strong>
          </footer>
        </section>

        <BlueprintForm onSubmit={createNewBlueprint} status={createStatus} error={createError} />
      </section>

      <section className="card blueprint-viewer" aria-labelledby="current-blueprint-title">
        <div className="viewer-heading">
          <div>
            <p className="eyebrow">Canvas</p>
            <h2 className="panel-title" id="current-blueprint-title">
              Current blueprint
            </h2>
          </div>
          <span className="viewer-point-count">
            {current?.points?.length || 0} {current?.points?.length === 1 ? 'point' : 'points'}
          </span>
        </div>

        <p className="current-blueprint-name" aria-live="polite">
          {current?.name || 'No blueprint selected'}
        </p>
        {currentStatus === 'loading' && (
          <p className="status-message" role="status">
            Loading blueprint...
          </p>
        )}
        {currentStatus === 'failed' && (
          <p className="status-message error-message" role="alert">
            Could not open blueprint: {currentError}
          </p>
        )}
        <div className="canvas-shell">
          <BlueprintCanvas points={current?.points || []} />
        </div>
        <p className="canvas-caption">Blueprint points are connected in their stored order.</p>
      </section>
    </main>
  )
}
