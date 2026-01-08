"use client"

import axios, { 
  AxiosRequestConfig, 
  AxiosResponse,
  InternalAxiosRequestConfig
} from "axios"

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type UserRole = "reader" | "writer" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: string
}

export interface Article {
  id: string
  titulo: string
  contenido: string
  resumen?: string
  categoria: "politica" | "economia" | "deportes" | "cultura" | "mundo" | "opinion" | "tecnologia" | "salud" | "entretenimiento" | "tendencias"
  autor?: string
  autorId?: string
  imagenUrl?: string
  publicado?: boolean
  creadoEn?: string
  actualizadoEn?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
  expiresIn?: number
}

interface RequestOptions {
  method?: string
  data?: any
  params?: Record<string, string>
}

// ============================================================================
// JWT TOKEN MANAGEMENT
// ============================================================================

const TOKEN_KEY = "authToken"
const REFRESH_TOKEN_KEY = "refreshToken"
const USER_KEY = "currentUser"

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

function setToken(token: string, refreshToken?: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(TOKEN_KEY, token)
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }
}

function removeTokens(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

function decodeToken(token: string): any {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error("Error decoding token:", error)
    return null
  }
}

function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) return true
  return decoded.exp * 1000 < Date.now()
}

// ============================================================================
// API CONFIGURATION
// ============================================================================

const API_URL = "https://postilioned-symmetrically-margarita.ngrok-free.dev/api"
const PUBLIC_ROUTES = ["/login", "/register", "/"]

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
})

// ============================================================================
// INTERCEPTORS
// ============================================================================

// Request interceptor: Agregar JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log(
      `API: Making ${config.method?.toUpperCase()} request to ${config.url}`
    )
    return config
  },
  (error: any) => {
    console.error("API: Request interceptor error:", error)
    return Promise.reject(error)
  }
)

// Response interceptor: Manejo de errores y refresh token
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`API: Request successful to ${response.config.url}`)
    return response
  },
  async (error: any | unknown) => {
    const err = error as any
    const originalRequest = err.config

    if (err.response?.status === 401) {
      console.warn(`API: 401 Unauthorized from ${originalRequest.url}`)

      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname
        console.log(`Current page path: ${currentPath}`)

        // Verificar si está en ruta pública
        if (!PUBLIC_ROUTES.some((route) => currentPath.startsWith(route))) {
          removeTokens()
          window.location.href = "/login"
        }
      }
    }

    if (err.response) {
      const status = err.response.status
      const message =
        err.response.data?.message || err.message || "Request failed"

      console.error(`API: Request failed - ${status}: ${message}`)

      if (status === 403) {
        console.warn("API: Forbidden - insufficient permissions")
      } else if (status >= 500) {
        console.error("API: Server error")
      }

      throw new Error(message)
    } else if (err.request) {
      console.error("API: Network error:", err.message)
      throw new Error("Network error - please check your connection")
    } else {
      console.error("API: Request setup error:", err.message)
      throw new Error(err.message || "Request failed")
    }
  }
)

// ============================================================================
// API REQUEST FUNCTION
// ============================================================================

export async function apiRequest(
  endpoint: string,
  options: RequestOptions = {}
) {
  const { method = "GET", data, params } = options

  try {
    const config: AxiosRequestConfig = {
      method: method.toLowerCase() as any,
      url: endpoint,
      params,
      data,
    }

    const response = await apiClient.request(config)
    return response.data
  } catch (error) {
    throw error
  }
}

// API Helper object
export const api = {
  get: (endpoint: string, params?: Record<string, string>) =>
    apiRequest(endpoint, { method: "GET", params }),

  post: (endpoint: string, data?: any) =>
    apiRequest(endpoint, { method: "POST", data }),

  put: (endpoint: string, data?: any) =>
    apiRequest(endpoint, { method: "PUT", data }),

  patch: (endpoint: string, data?: any) =>
    apiRequest(endpoint, { method: "PATCH", data }),

  delete: (endpoint: string) => apiRequest(endpoint, { method: "DELETE" }),
}

// ============================================================================
// ARTICLE MAPPING FUNCTION
// ============================================================================

function mapArticleFromAPI(data: any): Article {
  // Log para debug
  console.log("mapArticleFromAPI: Datos recibidos:", JSON.stringify(data, null, 2))
  
  const mapped = {
    id: data.id || "",
    titulo: data.titulo || data.title || "",
    contenido: data.contenido || data.content || "",
    resumen: data.resumen || data.excerpt || data.summary || "",
    categoria: data.categoria || data.category || "tendencias",
    imagenUrl: data.imagenes && Array.isArray(data.imagenes) && data.imagenes.length > 0 
      ? data.imagenes[0] 
      : data.imagenUrl || data.imageUrl || undefined,
    autor: data.autores && Array.isArray(data.autores) && data.autores.length > 0 
      ? (data.autores[0]?.nombre || data.autores[0]?.name || data.autores[0]) 
      : data.autor || data.author || undefined,
    autorId: data.autores && Array.isArray(data.autores) && data.autores.length > 0 
      ? data.autores[0]?.id 
      : data.autorId || data.authorId || undefined,
    publicado: data.publicado !== undefined ? data.publicado : (data.published !== undefined ? data.published : true),
    creadoEn: data.creadoEn || data.createdAt || new Date().toISOString(),
    actualizadoEn: data.actualizadoEn || data.updatedAt || new Date().toISOString(),
  }
  
  console.log("mapArticleFromAPI: Mapeado a:", JSON.stringify(mapped, null, 2))
  return mapped
}

export async function sendWebhook(data: any, url: string) {
  const token = getToken()
  return await axios.post(url, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
}

// ============================================================================
// AUTHENTICATION FUNCTIONS
// ============================================================================

export const login = async (
  email: string,
  password: string
): Promise<User | null> => {
  if (typeof window === "undefined") return null

  try {
    const response = await apiRequest("/auth/login", {
      method: "POST",
      data: { email, password },
    })

    console.log("Login API response:", JSON.stringify(response, null, 2))

    // Intentar con diferentes formatos de respuesta
    const token = response.access_token || response.accessToken || response.token
    const userData = response.usuario || response.user

    if (token && userData) {
      setToken(token)
      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.nombre || userData.name,
        role: userData.rol?.toLowerCase() === "lector" ? "reader" : userData.rol?.toLowerCase() === "periodista" ? "writer" : userData.rol?.toLowerCase() === "administrador" ? "admin" : "reader",
        createdAt: new Date().toISOString(),
      }
      console.log("Login success, returning user:", user)
      return user
    }

    return null
  } catch (error) {
    console.error("Login error:", error)
    return null
  }
}

export const logout = (): void => {
  if (typeof window === "undefined") return
  removeTokens()
}

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null
  
  // Intentar obtener del token
  const token = getToken()
  console.log("getCurrentUser: token found?", !!token)
  
  if (token) {
    const decoded = decodeToken(token)
    console.log("getCurrentUser: decoded token:", decoded)
    
    if (decoded && decoded.id && decoded.email) {
      // Map the role from API format to internal format
      let role: UserRole = "reader"
      const rawRole = decoded.rol || decoded.role || ""
      console.log("getCurrentUser: rawRole from token:", rawRole)
      
      if (rawRole.toLowerCase() === "administrador") {
        role = "admin"
      } else if (rawRole.toLowerCase() === "periodista") {
        role = "writer"
      } else if (rawRole.toLowerCase() === "lector") {
        role = "reader"
      } else if (rawRole.toLowerCase() === "admin") {
        role = "admin"
      } else if (rawRole.toLowerCase() === "writer") {
        role = "writer"
      }
      
      const user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.nombre || decoded.name || decoded.email.split("@")[0],
        role: role,
        createdAt: new Date().toISOString(),
      }
      console.log("getCurrentUser: returning user:", user)
      return user
    }
  }
  
  return null
}

export const register = async (
  email: string,
  password: string,
  nombre: string,
  apellido: string,
  rol: string = "lector"
): Promise<User | null> => {
  if (typeof window === "undefined") return null

  try {
    const response = await apiRequest("/auth/register", {
      method: "POST",
      data: { email, password, nombre, apellido, rol },
    })

    // Intentar con diferentes formatos de respuesta
    const token = response.access_token || response.accessToken || response.token
    const userData = response.usuario || response.user

    if (token && userData) {
      setToken(token)
      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.nombre || userData.name,
        role: userData.rol?.toLowerCase() === "lector" ? "reader" : userData.rol?.toLowerCase() === "periodista" ? "writer" : userData.rol?.toLowerCase() === "administrador" ? "admin" : "reader",
        createdAt: new Date().toISOString(),
      }
      return user
    }

    return null
  } catch (error) {
    console.error("Register error:", error)
    return null
  }
}

export const refreshAccessToken = async (): Promise<string | null> => {
  if (typeof window === "undefined") return null

  try {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (!refreshToken) return null

    const response = await axios.post(`${API_URL}/auth/refresh`, {
      refreshToken,
    })

    if (response.data.accessToken) {
      setToken(response.data.accessToken, refreshToken)
      return response.data.accessToken
    }

    return null
  } catch (error) {
    console.error("Token refresh error:", error)
    removeTokens()
    return null
  }
}

// ============================================================================
// USER MANAGEMENT FUNCTIONS
// ============================================================================

export const getUsers = async (): Promise<User[]> => {
  if (typeof window === "undefined") return []

  const response = await apiRequest("/usuarios", { method: "GET" })
  return response.users || []
}

export const updateUserRole = async (
  userId: string,
  role: UserRole
): Promise<boolean> => {
  if (typeof window === "undefined") return false

  const response = await apiRequest(`/usuarios/${userId}`, {
    method: "PATCH",
    data: { role },
  })

  return response.success || true
}

export const deleteUser = async (userId: string): Promise<boolean> => {
  if (typeof window === "undefined") return false

  const response = await apiRequest(`/usuarios/${userId}`, { method: "DELETE" })
  return response.success || true
}

// ============================================================================
// ARTICLE MANAGEMENT FUNCTIONS
// ============================================================================

export const getArticles = async (): Promise<Article[]> => {
  if (typeof window === "undefined") return []

  const response = await apiRequest("/articulos", { method: "GET" })
  console.log("getArticles: Respuesta bruta de API:", JSON.stringify(response, null, 2))
  
  // Manejar diferentes formatos de respuesta
  let articles: any[] = []
  if (Array.isArray(response)) {
    articles = response
  } else if (response?.articulos && Array.isArray(response.articulos)) {
    articles = response.articulos
  } else if (response?.data && Array.isArray(response.data)) {
    articles = response.data
  }
  
  console.log(`getArticles: Encontrados ${articles.length} artículos`)
  const mapped = articles.map(mapArticleFromAPI)
  console.log("getArticles: Artículos mapeados:", JSON.stringify(mapped.slice(0, 2), null, 2))
  return mapped
}

export const getPublishedArticles = async (): Promise<Article[]> => {
  const articles = await getArticles()
  // Devolver todos los artículos (incluso los que tienen publicado undefined o true)
  console.log(`getPublishedArticles: Devolviendo ${articles.length} artículos`)
  return articles
}

export const getArticlesByCategory = async (
  categoria: string
): Promise<Article[]> => {
  const articles = await getArticles()
  // Filtrar solo por categoría, permitir todos los estados de publicación
  return articles.filter((a) => a.categoria === categoria)
}

export const getArticleById = async (id: string): Promise<Article | null> => {
  if (typeof window === "undefined") return null

  const response = await apiRequest(`/articulos/${id}`, { method: "GET" })
  // Manejar diferentes formatos de respuesta
  let article: any = null
  if (response?.articulo) {
    article = response.articulo
  } else if (response?.data) {
    article = response.data
  } else if (response?.id) {
    article = response
  }
  return article ? mapArticleFromAPI(article) : null
}

export const createArticle = async (
  article: Omit<Article, "id" | "creadoEn" | "actualizadoEn">
): Promise<Article | null> => {
  if (typeof window === "undefined") return null

  // Filtrar campos que el backend no acepta y transformar imagenUrl a imagenes
  const { resumen, autor, autorId, creadoEn, actualizadoEn, imagenUrl, ...data } = article
  const payload = {
    ...data,
    imagenes: imagenUrl ? [imagenUrl] : [],
  }

  console.log("createArticle: Enviando payload:", JSON.stringify(payload, null, 2))

  const response = await apiRequest("/articulos", {
    method: "POST",
    data: payload,
  })
  
  console.log("createArticle: Respuesta API:", JSON.stringify(response, null, 2))
  
  // Manejar diferentes formatos de respuesta
  let result: any = null
  if (response?.articulo) {
    result = response.articulo
  } else if (response?.data) {
    result = response.data
  } else if (response?.id) {
    result = response
  }
  
  if (!result) {
    console.error("createArticle: No se encontró artículo en la respuesta")
    return null
  }
  
  console.log("createArticle: Artículo mapeado:", JSON.stringify(mapArticleFromAPI(result), null, 2))
  return mapArticleFromAPI(result)
}

export const updateArticle = async (
  id: string,
  updates: Partial<Omit<Article, "id" | "creadoEn">>
): Promise<Article | null> => {
  if (typeof window === "undefined") return null

  // Filtrar campos que el backend no acepta y transformar imagenUrl a imagenes
  const { resumen, autor, autorId, creadoEn, actualizadoEn, imagenUrl, ...data } = updates
  const payload = {
    ...data,
  }
  if (imagenUrl !== undefined) {
    payload.imagenes = imagenUrl ? [imagenUrl] : []
  }

  const response = await apiRequest(`/articulos/${id}`, {
    method: "PATCH",
    data: payload,
  })
  // Manejar diferentes formatos de respuesta
  let result: any = null
  if (response?.articulo) {
    result = response.articulo
  } else if (response?.data) {
    result = response.data
  } else if (response?.id) {
    result = response
  }
  return result ? mapArticleFromAPI(result) : null
}

export const deleteArticle = async (id: string): Promise<boolean> => {
  if (typeof window === "undefined") return false

  const response = await apiRequest(`/articulos/${id}`, { method: "DELETE" })
  return response.success || true
}

// ============================================================================
// FAVORITES MANAGEMENT FUNCTIONS
// ============================================================================

export const getFavorites = async (userId: string): Promise<string[]> => {
  if (typeof window === "undefined") return []

  const response = await apiRequest(`/favorites/${userId}`, { method: "GET" })
  return response.favorites || []
}

export const addFavorite = async (
  userId: string,
  articleId: string
): Promise<boolean> => {
  if (typeof window === "undefined") return false

  const response = await apiRequest(`/favorites/${userId}`, {
    method: "POST",
    data: { articleId },
  })
  return response.success || true
}

export const removeFavorite = async (
  userId: string,
  articleId: string
): Promise<boolean> => {
  if (typeof window === "undefined") return false

  const response = await apiRequest(`/favorites/${userId}/${articleId}`, {
    method: "DELETE",
  })
  return response.success || true
}

export const isFavorite = async (
  userId: string,
  articleId: string
): Promise<boolean> => {
  if (typeof window === "undefined") return false

  const favorites = await getFavorites(userId)
  return favorites.includes(articleId)
}

export const getFavoriteArticles = async (
  userId: string
): Promise<Article[]> => {
  if (typeof window === "undefined") return []

  const response = await apiRequest(`/favorites/${userId}/articles`, {
    method: "GET",
  })
  return response.articles || []
}

export { apiClient }

