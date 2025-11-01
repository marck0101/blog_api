// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'
// import Admin from './pages/Admin.jsx'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     {/* <App /> */}
//     <Admin />
//   </StrictMode>
// )
import React from "react";
import ReactDOM from "react-dom/client";
import AppRoutes from "./routes/AppRoutes.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(<AppRoutes />);