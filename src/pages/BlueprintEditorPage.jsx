import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import BlueprintForm from '../components/BlueprintForm.jsx'
import {
  createBlueprint,
  fetchBlueprint,
  updateBlueprint,
} from '../features/blueprints/blueprintsSlice.js'

export default function BlueprintEditorPage() {
  const { author, name } = useParams()
  const isEditing = Boolean(author && name)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const {
    current,
    currentStatus,
    currentError,
    createStatus,
    createError,
    updateStatus,
    updateError,
  } = useSelector((state) => state.blueprints)

  useEffect(() => {
    if (isEditing) dispatch(fetchBlueprint({ author, name }))
  }, [author, name, isEditing, dispatch])

  const currentMatchesRoute = current?.author === author && current?.name === name
  const isBlueprintLoaded =
    currentStatus === 'succeeded' && currentMatchesRoute && Array.isArray(current.points)

  const submitBlueprint = async (blueprint) => {
    const action = isEditing
      ? await dispatch(updateBlueprint({ author, name, blueprint }))
      : await dispatch(createBlueprint(blueprint))

    const thunk = isEditing ? updateBlueprint : createBlueprint
    if (thunk.fulfilled.match(action)) {
      navigate(`/blueprints/${encodeURIComponent(blueprint.author)}/${encodeURIComponent(blueprint.name)}`)
    }
  }

  const retryBlueprint = () => dispatch(fetchBlueprint({ author, name }))

  return (
    <main className="editor-page">
      <div className="editor-page-heading">
        <div>
          <p className="eyebrow">Blueprint workspace</p>
          <h2 className="panel-title">{isEditing ? 'Edit blueprint' : 'Create blueprint'}</h2>
        </div>
        <Link className="btn" to="/">
          Back to library
        </Link>
      </div>

      {isEditing && currentStatus === 'loading' && (
        <p className="status-message" role="status">
          Loading blueprint...
        </p>
      )}
      {isEditing && currentStatus === 'failed' && (
        <div className="status-message error-message retry-banner" role="alert">
          <span>Could not load blueprint: {currentError}</span>
          <button className="btn" type="button" onClick={retryBlueprint}>
            Retry
          </button>
        </div>
      )}

      {(!isEditing || isBlueprintLoaded) && (
        <div className="editor-workspace">
          <BlueprintForm
            key={isEditing ? `${author}/${name}/${currentStatus}` : 'new-blueprint'}
            initialBlueprint={isEditing ? current : undefined}
            readOnlyIdentity={isEditing}
            onSubmit={submitBlueprint}
            status={isEditing ? updateStatus : createStatus}
            error={isEditing ? updateError : createError}
          />
        </div>
      )}
    </main>
  )
}
