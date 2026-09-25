import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import authClient from '../services/authClient.js'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const submit = async (event) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const { data } = await authClient.post('/auth/login', { username, password })
      const token = data?.data?.access_token ?? data?.access_token ?? data?.token
      if (!token) throw new Error('El servidor no devolvió un token de acceso.')

      localStorage.setItem('token', token)
      navigate(location.state?.from?.pathname || '/blueprints/new', { replace: true })
    } catch {
      setError('Credenciales inválidas o servidor no disponible.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="card login-form" onSubmit={submit}>
      <h2 style={{ marginTop: 0 }}>Login</h2>
      <div className="grid cols-2">
        <div>
          <label htmlFor="login-username">Usuario</label>
          <input
            id="login-username"
            className="input"
            autoComplete="username"
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="login-password">Contraseña</label>
          <input
            id="login-password"
            type="password"
            className="input"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
      </div>
      {error && (
        <p className="status-message error-message" role="alert">
          {error}
        </p>
      )}
      <button className="btn primary" style={{ marginTop: 12 }} disabled={isSubmitting}>
        {isSubmitting ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  )
}
