import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api"; // baseURL já inclui /api

// Cache simples por ID (reinicia ao recarregar a página)
const CACHE = new Map();

export default function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [{ post, error, loading }, setState] = useState({
    post: null,
    error: "",
    loading: true,
  });

  useEffect(() => {
    let aborted = false;
    const ctrl = new AbortController();

    (async () => {
      try {
        if (CACHE.has(id)) {
          if (!aborted) setState({ post: CACHE.get(id), error: "", loading: false });
          return;
        }
        setState((s) => ({ ...s, loading: true, error: "" }));

        // baseURL já tem /api → não repetir /api aqui
        const { data } = await api.get(`/blogposts/${id}`, { signal: ctrl.signal });

        if (aborted) return;
        CACHE.set(id, data);
        setState({ post: data, error: "", loading: false });
      } catch (e) {
        if (aborted) return;
        const msg =
          e?.response?.data?.message ||
          (e.name === "CanceledError" || e.name === "AbortError" ? "Requisição cancelada." : "Falha ao carregar o post.");
        setState({ post: null, error: msg, loading: false });
      }
    })();

    return () => {
      aborted = true;
      ctrl.abort();
    };
  }, [id]);

  const formattedDate = useMemo(() => {
    if (!post?.createdAt) return "";
    return new Date(post.createdAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  }, [post?.createdAt]);

  if (loading) return <p>Carregando post...</p>;
  if (error) return <p style={{ color: "crimson" }}>{error}</p>;
  if (!post) return <p>Nenhum conteúdo para exibir.</p>;

  const images = Array.isArray(post.imageUrls) ? post.imageUrls : [];
  const safeId = post.id || post._id;

  return (
    <div className="post-card" style={{ padding: 16 }}>
      <style>{`
        .images-grid { display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 12px; }
        @media (min-width: 768px) { .images-grid { grid-template-columns: repeat(2, 1fr); } }
        .images-grid img { width: 100%; height: 250px; object-fit: cover; border-radius: 8px; display: block; }
      `}</style>

      {!!images.length && (
        <div className="images-grid">
          {images.map((src, i) => (
            <img key={i} src={src} alt={`Imagem ${i + 1}`} loading="lazy" />
          ))}
        </div>
      )}

      <h2 style={{ marginTop: 8 }}>{post.title}</h2>
      {post.description && <p style={{ whiteSpace: "pre-line" }}>{post.description}</p>}

      <p style={{ wordBreak: "break-all" }}><strong>ID:</strong> {safeId}</p>
      <small> Criado em: {formattedDate} </small>

      <div style={{ marginTop: 20 }}>
        <button onClick={() => navigate(-1)}>Voltar</button>
      </div>
    </div>
  );
}
