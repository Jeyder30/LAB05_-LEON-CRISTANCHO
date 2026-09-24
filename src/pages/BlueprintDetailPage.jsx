import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import BlueprintCanvas from '../components/BlueprintCanvas.jsx'
import { fetchBlueprint } from '../features/blueprints/blueprintsSlice.js'

export default function BlueprintDetailPage() {
  const { author, name } = useParams()
  const dispatch = useDispatch()
  const { current, currentStatus, currentError } = useSelector((state) => state.blueprints)

  useEffect(() => {
    dispatch(fetchBlueprint({ author, name }))
  }, [author, name, dispatch])

  const currentMatchesRoute = current?.author === author && current?.name === name
  const retry = () => dispatch(fetchBlueprint({ author, name }))

  return (
    <main className="card detail-page">
      <div className="editor-page-heading">
        <div>
          <p className="eyebrow">Blueprint detail</p>
          <h2 className="panel-title">{name}</h2>
        </div>
        <Link className="btn" to="/">
          Back to library
        </Link>
      </div>

      {currentStatus === 'loading' && (
        <p className="status-message" role="status">
          Loading blueprint...
        </p>
      )}
      {currentStatus === 'failed' && (
        <div className="status-message error-message retry-banner" role="alert">
          <span>Could not load blueprint: {currentError}</span>
          <button className="btn" type="button" onClick={retry}>
            Retry
          </button>
        </div>
      )}
      {currentStatus === 'succeeded' && currentMatchesRoute && (
        <>
          <p>
            <strong>Author:</strong> {current.author}
          </p>
          <p>
            <strong>Points:</strong> {current.points?.length || 0}
          </p>
          <div className="canvas-shell">
            <BlueprintCanvas points={current.points || []} />
          </div>
        </>
      )}
    </main>
  )
}
