const API_URL = import.meta.env.VITE_API_URL || ''

export function api(path) {
  return `${API_URL}${path}`
}
