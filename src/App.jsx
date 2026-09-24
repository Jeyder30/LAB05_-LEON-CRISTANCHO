import { NavLink, Route, Routes } from 'react-router-dom'
import BlueprintsPage from './pages/BlueprintsPage.jsx'
import BlueprintDetailPage from './pages/BlueprintDetailPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <div className="container">
      <header className="app-header">
        <h1 className="brand-title">ECI - Laboratorio de Blueprints en React</h1>
        <nav className="site-nav">
          <NavLink to="/" end>
            Blueprints
          </NavLink>
          <NavLink to="/login">Login</NavLink>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<BlueprintsPage />} />
        <Route path="/blueprints/:author/:name" element={<BlueprintDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}
