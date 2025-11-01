import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout.jsx'
import Posts from '../pages/Posts.jsx'
import Admin from '../pages/Admin.jsx'
import NotFound from '../pages/NotFound.jsx'
import ProtectedRoute from './ProtectedRoute.jsx' // opcional
import PostDetails from '../pages/PostDetails.jsx'
// import Login from "../pages/Login.jsx";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Posts />} />
          <Route path="/admin/:id" element={<Admin />} /> {/* editar */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="/post/:id" element={<PostDetails />} />
          {/* <Route path="/login" element={<Login />} /> */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
