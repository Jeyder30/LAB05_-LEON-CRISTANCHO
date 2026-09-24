import { useState } from 'react'

export default function BlueprintForm({ onSubmit, status = 'idle', error = null }) {
  const [author, setAuthor] = useState('')
  const [name, setName] = useState('')
  const [pointsJSON, setPointsJSON] = useState('[{"x":10,"y":10},{"x":40,"y":60}]')

  const handle = (e) => {
    e.preventDefault()
    try {
      const points = JSON.parse(pointsJSON)
      onSubmit({ author: author.trim(), name: name.trim(), points })
    } catch (e) {
      alert('JSON de puntos inválido')
    }
  }

  return (
    <form onSubmit={handle} className="card">
      <h3 style={{ marginTop: 0 }}>Crear Blueprint</h3>
      <div className="grid cols-2">
        <div>
          <label htmlFor="blueprint-author">Autor</label>
          <input
            id="blueprint-author"
            className="input"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="juan.perez"
          />
        </div>
        <div>
          <label htmlFor="blueprint-name">Nombre</label>
          <input
            id="blueprint-name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="mi-dibujo"
          />
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <label htmlFor="blueprint-points">Puntos (JSON)</label>
        <textarea
          id="blueprint-points"
          className="input"
          rows="5"
          value={pointsJSON}
          onChange={(e) => setPointsJSON(e.target.value)}
        />
      </div>
      <div style={{ marginTop: 12 }}>
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
        <button className="btn primary" disabled={status === 'loading'}>
          Guardar
        </button>
      </div>
    </form>
  )
}
