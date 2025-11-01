import { NavLink, Outlet } from 'react-router-dom'
import '../theme.css' // vamos criar esse arquivo de estilos
import { useEffect, useState } from 'react'

export default function MainLayout() {
  const link = ({ isActive }) => ({
    padding: '8px 12px',
    borderRadius: 8,
    textDecoration: 'none',
    border: '1px solid #ddd',
    background: isActive ? '#f4f4f4' : 'white',
  })
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark'
  })

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])
  return (
    <div
      className={darkMode ? 'dark-mode' : 'light-mode'}
      style={{ padding: 20, fontFamily: 'system-ui, sans-serif' }}
    >
      <nav
        className="navbar"
        style={{ display: 'flex', gap: 8, marginBottom: 16 }}
      >
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? 'Modo Claro' : 'Modo Escuro'}
        </button>
        <NavLink to="/" className="nav-link" style={link}>
          Posts
        </NavLink>
        <NavLink to="/admin" className="nav-link" style={link}>
          Admin
        </NavLink>
      </nav>
      <Outlet />
    </div>
  )
}
