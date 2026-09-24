import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchByAuthor, fetchBlueprint } from '../features/blueprints/blueprintsSlice.js'
import BlueprintCanvas from '../components/BlueprintCanvas.jsx'

export default function BlueprintsPage() {
  const dispatch = useDispatch()
  const { byAuthor, current, status, error, currentStatus, currentError } = useSelector(
    (s) => s.blueprints,
  )
  const [authorInput, setAuthorInput] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState('')
  const items = byAuthor[selectedAuthor] || []

  const totalPoints = useMemo(
    () => items.reduce((acc, blueprint) => acc + (blueprint.points?.length || 0), 0),
    [items],
  )

  const getBlueprints = (event) => {
    event.preventDefault()
    const author = authorInput.trim()
    if (!author || status === 'loading') return
    setSelectedAuthor(author)
    dispatch(fetchByAuthor(author))
  }

  const openBlueprint = (blueprint) => {
    dispatch(fetchBlueprint({ author: blueprint.author, name: blueprint.name }))
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
              disabled={!authorInput.trim() || status === 'loading'}
            >
              Get blueprints
            </button>
          </form>
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

          {status === 'loading' && (
            <p className="status-message" role="status">
              Loading blueprints...
            </p>
          )}
          {status === 'failed' && (
            <p className="status-message error-message" role="alert">
              Could not load blueprints: {error}
            </p>
          )}
          {!selectedAuthor && status !== 'loading' && (
            <p className="empty-message">Enter an author name to see their blueprints.</p>
          )}
          {selectedAuthor && !items.length && status !== 'loading' && status !== 'failed' && (
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
