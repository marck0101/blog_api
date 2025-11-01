import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE, // ex: http://localhost:8081/api
  headers: { "Content-Type": "application/json" }
});
