import { useEffect, useState } from 'react'
import BlueprintCanvas from './BlueprintCanvas.jsx'

const emptyBlueprint = { author: '', name: '', points: [] }

export default function BlueprintForm({
  onSubmit,
  status = 'idle',
  error = null,
  initialBlueprint = emptyBlueprint,
  readOnlyIdentity = false,
}) {
  const [author, setAuthor] = useState(initialBlueprint.author || '')
  const [name, setName] = useState(initialBlueprint.name || '')
  const [points, setPoints] = useState(initialBlueprint.points || [])
  const [pointsJSON, setPointsJSON] = useState(JSON.stringify(initialBlueprint.points || []))
  const [formError, setFormError] = useState(null)

  useEffect(() => {
    setAuthor(initialBlueprint.author || '')
    setName(initialBlueprint.name || '')
    setPoints(initialBlueprint.points || [])
    setPointsJSON(JSON.stringify(initialBlueprint.points || []))
    setFormError(null)
  }, [initialBlueprint])

  const appendPoint = (point) => {
    const nextPoints = [...points, point]
    setPoints(nextPoints)
    setPointsJSON(JSON.stringify(nextPoints, null, 2))
    setFormError(null)
  }

  const removePoint = (indexToRemove) => {
    const nextPoints = points.filter((_, index) => index !== indexToRemove)
    setPoints(nextPoints)
    setPointsJSON(JSON.stringify(nextPoints, null, 2))
  }

  const handlePointsJSONChange = (value) => {
    setPointsJSON(value)
    try {
      const parsedPoints = JSON.parse(value)
      if (
        Array.isArray(parsedPoints) &&
        parsedPoints.every(
          (point) => Number.isInteger(point?.x) && Number.isInteger(point?.y),
        )
      ) {
        setPoints(parsedPoints)
        setFormError(null)
      }
    } catch {
      // Keep the user's draft visible until the JSON is valid again.
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setFormError(null)

    try {
      const parsedPoints = JSON.parse(pointsJSON)
      if (!Array.isArray(parsedPoints) || parsedPoints.length === 0) {
        throw new Error('Agrega al menos un punto al plano.')
      }
      if (
        !parsedPoints.every(
          (point) => Number.isInteger(point?.x) && Number.isInteger(point?.y),
        )
      ) {
        throw new Error('Cada punto debe incluir coordenadas x e y numéricas.')
      }
      if (!author.trim() || !name.trim()) {
        throw new Error('El autor y el nombre son obligatorios.')
      }

      onSubmit({ author: author.trim(), name: name.trim(), points: parsedPoints })
    } catch (submitError) {
      setFormError(submitError.message || 'El JSON de puntos no es válido.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card blueprint-form">
      <div className="results-heading">
        <div>
          <p className="eyebrow">Blueprint editor</p>
          <h2 className="panel-title">{readOnlyIdentity ? 'Edit blueprint' : 'Create blueprint'}</h2>
        </div>
        <span className="viewer-point-count">{points.length} points</span>
      </div>

      <div className="grid cols-2">
        <div>
          <label htmlFor="blueprint-author">Autor</label>
          <input
            id="blueprint-author"
            className="input"
            required
            value={author}
            readOnly={readOnlyIdentity}
            onChange={(event) => setAuthor(event.target.value)}
            placeholder="juan.perez"
          />
        </div>
        <div>
          <label htmlFor="blueprint-name">Nombre</label>
          <input
            id="blueprint-name"
            className="input"
            required
            value={name}
            readOnly={readOnlyIdentity}
            onChange={(event) => setName(event.target.value)}
            placeholder="mi-dibujo"
          />
        </div>
      </div>

      <label className="editor-label" htmlFor="blueprint-points">
        Puntos (JSON)
      </label>
      <textarea
        id="blueprint-points"
        className="input editor-points-json"
        rows="5"
        value={pointsJSON}
        onChange={(event) => handlePointsJSONChange(event.target.value)}
      />
      <p className="canvas-caption">También puedes hacer clic en el lienzo para añadir puntos.</p>
      <div className="canvas-shell editor-canvas-shell">
        <BlueprintCanvas points={points} interactive onPointAdd={appendPoint} />
      </div>

      {!!points.length && (
        <ol className="editor-point-list" aria-label="Puntos del blueprint">
          {points.map((point, index) => (
            <li key={`${index}-${point.x}-${point.y}`}>
              <span>
                Punto {index + 1}: ({point.x}, {point.y})
              </span>
              <button
                className="btn btn-danger"
                type="button"
                onClick={() => removePoint(index)}
                disabled={status === 'loading'}
                aria-label={`Eliminar punto ${index + 1}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ol>
      )}

      {formError && (
        <p className="status-message error-message" role="alert">
          {formError}
        </p>
      )}
      {status === 'loading' && (
        <p className="status-message" role="status">
          Saving blueprint...
        </p>
      )}
      {status === 'failed' && (
        <p className="status-message error-message" role="alert">
          Could not save blueprint: {error}
        </p>
      )}
      {status === 'succeeded' && (
        <p className="status-message success-message" role="status">
          Blueprint saved successfully.
        </p>
      )}
      <button
        className="btn btn-primary"
        type="submit"
        disabled={status === 'loading' || !points.length}
      >
        {status === 'loading' ? 'Guardando...' : readOnlyIdentity ? 'Guardar cambios' : 'Guardar'}
      </button>
    </form>
  )
}
