import axios from "axios"

const api = axios.create({
  baseURL: "/api",
})

api.interceptors.response.use(
  res => res,
  error => {
    return Promise.reject(
      error.response?.data?.message || "Terjadi kesalahan"
    )
  }
)

export default api