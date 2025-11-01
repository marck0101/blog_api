import { Navigate, useLocation } from "react-router-dom";

// Troque essa verificação pelo seu auth real
function useAuth() {
  // ex: ler token no localStorage, contexto, etc.
  return { isAuthenticated: true };
}

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
