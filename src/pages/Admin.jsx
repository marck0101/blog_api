// src/pages/Admin.jsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import { storage } from '../firebase'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import '../theme.css'

const MAX_SIZE_MB = 5

export default function Admin() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    title: '',
    description: '',
    published: false,
  })
  const [existingImages, setExistingImages] = useState([]) // URLs já salvas no Mongo
  const [files, setFiles] = useState([]) // novos arquivos
  const [previews, setPreviews] = useState([]) // previews dos novos
  const [progress, setProgress] = useState({})
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const canSubmit = useMemo(
    () => !!form.title && !loading,
    [form.title, loading]
  )

  // Carrega post quando for edição
  useEffect(() => {
    if (!isEdit) return
    ;(async () => {
      try {
        const { data } = await api.get(`/blogPosts/${id}`)
        setForm({
          title: data.title || '',
          description: data.description || '',
          published: !!data.published,
        })
        const urls =
          Array.isArray(data.imageUrls) && data.imageUrls.length
            ? data.imageUrls
            : data.imageUrl
            ? [data.imageUrl]
            : []
        setExistingImages(urls)
      } catch (err) {
        console.error(err)
        setMsg('Falha ao carregar o post para edição.')
      }
    })()
  }, [id, isEdit])

  // limpa previews na desmontagem
  useEffect(
    () => () => previews.forEach((p) => URL.revokeObjectURL(p)),
    [previews]
  )

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleFiles = (e) => {
    setMsg('')
    setProgress({})
    const list = Array.from(e.target.files || [])
    const valids = []
    const pv = []

    for (const f of list) {
      if (!f.type.startsWith('image/')) {
        setMsg('Selecione apenas imagens.')
        continue
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        setMsg(`"${f.name}" excede ${MAX_SIZE_MB}MB.`)
        continue
      }
      valids.push(f)
      pv.push(URL.createObjectURL(f))
    }

    previews.forEach((p) => URL.revokeObjectURL(p))
    setFiles(valids)
    setPreviews(pv)
  }

  const removeExistingAt = (idx) => {
    setExistingImages((arr) => arr.filter((_, i) => i !== idx))
  }

  async function uploadAll() {
    if (!files.length) return []
    const urls = await Promise.all(
      files.map(
        (file, i) =>
          new Promise((resolve, reject) => {
            const safe = file.name.replace(/\s+/g, '-').toLowerCase()
            const path = `images/${Date.now()}-${i}-${safe}`
            const task = uploadBytesResumable(ref(storage, path), file)
            task.on(
              'state_changed',
              (snap) => {
                const pct = Math.round(
                  (snap.bytesTransferred / snap.totalBytes) * 100
                )
                setProgress((p) => ({ ...p, [i]: pct }))
              },
              reject,
              async () => resolve(await getDownloadURL(task.snapshot.ref))
            )
          })
      )
    )
    return urls
  }

  const resetForm = () => {
    setForm({ title: '', description: '', published: false })
    previews.forEach((p) => URL.revokeObjectURL(p))
    setPreviews([])
    setFiles([])
    setProgress({})
    setExistingImages([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return

    setMsg('')
    setLoading(true)

    try {
      const newUrls = await uploadAll() // novas imagens
      const imageUrls = [...existingImages, ...newUrls] // mantém as que sobraram + novas

      const payload = { ...form, imageUrls }

      if (isEdit) {
        await api.put(`/blogposts/${id}`, payload)
        setMsg('Alterações salvas!')
      } else {
        await api.post('/blogposts', payload)
        setMsg('Publicado com sucesso!')
        resetForm()
      }

      setTimeout(() => navigate('/'), 700)
    } catch (err) {
      const fb = err?.code ? ` (${err.code})` : ''
      setMsg(
        (err?.response?.data?.message || err?.message || 'Falha ao salvar.') +
          fb
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <h1>{isEdit ? 'Editar post' : 'Painel Admin'}</h1>

      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        <button
          onClick={() => {
            if (confirm('Tem certeza que deseja cancelar as alterações?')) {
              navigate('/')
            }
            // navigate('/')
          }}
        >
          Ver posts
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'grid', gap: 12, maxWidth: 640 }}
      >
        <input
          name="title"
          placeholder="Título *"
          value={form.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Descrição"
          rows={5}
          value={form.description}
          onChange={handleChange}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            name="published"
            checked={form.published}
            onChange={handleChange}
          />
          Publicado
        </label>

        {/* Imagens já salvas */}
        {existingImages.length > 0 && (
          <div>
            <p style={{ margin: '8px 0' }}>Imagens atuais:</p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))',
                gap: 12,
              }}
            >
              {existingImages.map((u, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img
                    src={u}
                    alt={`img-${i}`}
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      border: '1px solid #eee',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Tem certeza que deseja remover?')) {
                        removeExistingAt(i)
                      }
                    }}
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      border: 'none',
                      background: '#ef4444',
                      color: '#fff',
                      borderRadius: 6,
                      padding: '4px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Novas imagens */}
        <div style={{ display: 'grid', gap: 8 }}>
          <input type="file" accept="image/*" multiple onChange={handleFiles} />
          {!!previews.length && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))',
                gap: 12,
              }}
            >
              {previews.map((src, i) => (
                <div key={i} style={{ display: 'grid', gap: 6 }}>
                  <img
                    src={src}
                    alt={`preview-${i}`}
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      border: '1px solid #eee',
                    }}
                  />
                  {progress[i] > 0 && progress[i] < 100 && (
                    <div
                      style={{
                        height: 6,
                        background: '#eee',
                        borderRadius: 999,
                      }}
                    >
                      <div
                        style={{
                          width: `${progress[i]}%`,
                          height: '100%',
                          background: '#8b5cf6',
                          borderRadius: 999,
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* <button type="submit" disabled={!canSubmit}>
          {loading
            ? isEdit
              ? 'Salvando...'
              : 'Publicando...'
            : isEdit
            ? 'Salvar alterações'
            : 'Publicar'}
        </button> */}

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={!canSubmit}>
            {loading
              ? isEdit
                ? 'Salvando...'
                : 'Publicando...'
              : isEdit
              ? 'Salvar alterações'
              : 'Publicar'}
          </button>

          {isEdit && (
            <button
              type="button"
              onClick={() => {
                if (confirm('Tem certeza que deseja cancelar as alterações?')) {
                  navigate('/')
                }
              }}
              style={{ background: '#e5e7eb', color: '#000' }}
            >
              Cancelar edição
            </button>
          )}
        </div>
      </form>

      {msg && (
        <p
          style={{
            marginTop: 12,
            color:
              msg.includes('sucesso') || msg.includes('salvas')
                ? 'green'
                : 'crimson',
          }}
        >
          {msg}
        </p>
      )}
    </div>
  )
}
