// src/pages/Posts.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import '../theme.css'

export default function Posts() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Utilitário para pegar imagem de capa
  const getCover = (p) => {
    if (p?.imageUrl) return p.imageUrl
    if (Array.isArray(p?.imageUrls) && p.imageUrls.length > 0) return p.imageUrls[0]
    return null
  }

  // Utilitário para truncar por palavras
  const truncateWords = (text = '', maxWords = 36) => {
    const words = String(text).trim().split(/\s+/)
    if (words.length <= maxWords) return text
    return words.slice(0, maxWords).join(' ') + '…'
  }

  async function load() {
    try {
      const { data } = await api.get('/blogposts')
      setItems(
        [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (id, e) => {
    // evita que o clique no botão propague pro card
    e?.stopPropagation()
    const confirmed = window.confirm(
      'Tem certeza que deseja excluir esta publicação?'
    )
    if (!confirmed) return

    try {
      await api.delete(`/blogpost/soft/${id}`)
      setItems((prev) => prev.filter((p) => p.id !== id))
      alert('Publicação movida para a lixeira.')
    } catch (err) {
      console.error(err)
      alert('Erro ao mover para a lixeira.')
    }
  }

  const goAdmin = () => navigate('/admin')

  return (
    <div>
      {/* estilos locais para a capa */}
      <style>{`
        .post-grid { display: grid; gap: 12px; padding: 0; }
        .post-card { list-style: none; border: 1px solid #eee; border-radius: 12px; padding: 16px; cursor: pointer; }
        .post-cover {
          width: 100%;
          max-width: 520px;
          height: 220px;              /* altura padrão para capa */
          object-fit: cover;          /* recorte elegante */
          border-radius: 8px;
          margin-bottom: 12px;
          display: block;
        }
      `}</style>

      <h1>Todos os posts</h1>

      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        <button onClick={load}>Recarregar</button>
        <button onClick={goAdmin}>Ir para Admin</button>
      </div>

      {loading && <p>Carregando...</p>}

      <ul className="post-grid">
        {items.map((p) => {
          const cover = getCover(p)
          const fullDesc = p?.description || ''
          const shortDesc = truncateWords(fullDesc, 36)

          return (
            <li
              key={p.id}
              onClick={() => navigate(`/post/${p.id}`)}
              title="Ver detalhes"
              className="post-card"
            >
              {/* capa única */}
              {cover && (
                <img
                  src={cover}
                  alt={p.title}
                  className="post-cover"
                  loading="lazy"
                />
              )}

              <h3 style={{ margin: '0 0 8px' }}>{p.title}</h3>

              {/* descrição truncada + tooltip com o conteúdo completo */}
              {fullDesc && (
                <p style={{ margin: 0 }} title={fullDesc}>
                  {shortDesc}
                </p>
              )}

              <small style={{ display: 'block', marginTop: 10, color: '#666' }}>
                Criado em: {new Date(p.createdAt).toLocaleString('pt-BR')}
              </small>

              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/admin/${p.id}`)
                  }}
                >
                  Editar
                </button>

                <button
                  onClick={(e) => handleDelete(p.id, e)}
                  style={{ background: '#ef4444', color: '#fff' }}
                >
                  Excluir
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      {!loading && !items.length && <p>Nenhum post no banco ainda.</p>}
    </div>
  )
}
