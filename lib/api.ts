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
  title: string
  content: string
  excerpt: string
  category: "politica" | "economia" | "deportes" | "cultura" | "mundo" | "opinion" | "tecnologia" | "salud" | "entretenimiento" | "tendencias"
  author: string
  authorId: string
  imageUrl?: string
  published: boolean
  createdAt: string
  updatedAt: string
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

const API_URL = "https://9bcda8e247b1.ngrok-free.app/api"
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
    // Intenta con la API si está disponible
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
    } catch (apiError) {
      // Si la API falla, usar datos locales
      console.log("API unavailable, using local authentication", apiError)
    }

    // Fallback a autenticación local
    const usersStr = localStorage.getItem("local_users")
    const passwordsStr = localStorage.getItem("local_passwords")
    
    if (!usersStr || !passwordsStr) {
      return null
    }

    const users: User[] = JSON.parse(usersStr)
    const passwords: Record<string, string> = JSON.parse(passwordsStr)

    const user = users.find((u) => u.email === email)
    if (user && passwords[user.id] === password) {
      // Crear un token JWT simulado para desarrollo
      const mockToken = btoa(JSON.stringify({ id: user.id, email: user.email, role: user.role }))
      setToken(mockToken)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
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
  
  // Fallback a localStorage si existe
  const userStr = localStorage.getItem(USER_KEY)
  console.log("getCurrentUser: fallback to localStorage?", !!userStr)
  return userStr ? JSON.parse(userStr) : null
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
    // Intenta con la API si está disponible
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
    } catch (apiError) {
      console.log("API unavailable, using local registration")
    }

    // Fallback a registro local
    const usersStr = localStorage.getItem("local_users")
    const passwordsStr = localStorage.getItem("local_passwords")

    if (!usersStr || !passwordsStr) {
      return null
    }

    const users: User[] = JSON.parse(usersStr)
    const passwords: Record<string, string> = JSON.parse(passwordsStr)

    // Verificar si el email ya existe
    if (users.some((u) => u.email === email)) {
      return null
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      name: `${nombre} ${apellido}`,
      role: "reader",
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    passwords[newUser.id] = password

    localStorage.setItem("local_users", JSON.stringify(users))
    localStorage.setItem("local_passwords", JSON.stringify(passwords))

    // Crear un token JWT simulado para desarrollo
    const mockToken = btoa(JSON.stringify({ id: newUser.id, email: newUser.email, role: newUser.role }))
    setToken(mockToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))

    return newUser
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

  try {
    const response = await apiRequest("/usuarios", { method: "GET" })
    return response.users || []
  } catch (error) {
    console.log("API unavailable, using local users")
    // Fallback a datos locales
    const usersStr = localStorage.getItem("local_users")
    return usersStr ? JSON.parse(usersStr) : []
  }
}

export const updateUserRole = async (
  userId: string,
  role: UserRole
): Promise<boolean> => {
  if (typeof window === "undefined") return false

  try {
    try {
      const response = await apiRequest(`/usuarios/${userId}`, {
        method: "PATCH",
        data: { role },
      })

      // Actualizar usuario actual si es el mismo
      const currentUser = getCurrentUser()
      if (currentUser?.id === userId) {
        currentUser.role = role
        localStorage.setItem(USER_KEY, JSON.stringify(currentUser))
      }

      return response.success || true
    } catch (apiError) {
      console.log("API unavailable, using local user update")
    }

    // Fallback a actualización local
    const usersStr = localStorage.getItem("local_users")
    if (!usersStr) return false

    const users: User[] = JSON.parse(usersStr)
    const userIndex = users.findIndex((u) => u.id === userId)

    if (userIndex === -1) return false

    users[userIndex].role = role
    localStorage.setItem("local_users", JSON.stringify(users))

    // Actualizar usuario actual si es el mismo
    const currentUser = getCurrentUser()
    if (currentUser?.id === userId) {
      currentUser.role = role
      localStorage.setItem(USER_KEY, JSON.stringify(currentUser))
    }

    return true
  } catch (error) {
    console.error("Update user role error:", error)
    return false
  }
}

export const deleteUser = async (userId: string): Promise<boolean> => {
  if (typeof window === "undefined") return false

  try {
    try {
      const response = await apiRequest(`/usuarios/${userId}`, { method: "DELETE" })
      return response.success || true
    } catch (apiError) {
      console.log("API unavailable, using local user deletion")
    }

    // Fallback a eliminación local
    const usersStr = localStorage.getItem("local_users")
    if (!usersStr) return false

    const users: User[] = JSON.parse(usersStr)
    const filteredUsers = users.filter((u) => u.id !== userId)

    if (filteredUsers.length === users.length) return false

    localStorage.setItem("local_users", JSON.stringify(filteredUsers))

    const passwordsStr = localStorage.getItem("local_passwords")
    if (passwordsStr) {
      const passwords: Record<string, string> = JSON.parse(passwordsStr)
      delete passwords[userId]
      localStorage.setItem("local_passwords", JSON.stringify(passwords))
    }

    return true
  } catch (error) {
    console.error("Delete user error:", error)
    return false
  }
}

// ============================================================================
// ARTICLE MANAGEMENT FUNCTIONS
// ============================================================================

export const getArticles = async (): Promise<Article[]> => {
  if (typeof window === "undefined") return []

  try {
    const response = await apiRequest("/articulos", { method: "GET" })
    // Manejar diferentes formatos de respuesta
    if (Array.isArray(response)) {
      return response
    } else if (response?.articulos && Array.isArray(response.articulos)) {
      return response.articulos
    } else if (response?.data && Array.isArray(response.data)) {
      return response.data
    }
    return []
  } catch (error) {
    console.log("API unavailable, using local articles")
    // Fallback a datos locales
    const articlesStr = localStorage.getItem("local_articles")
    return articlesStr ? JSON.parse(articlesStr) : []
  }
}

export const getPublishedArticles = async (): Promise<Article[]> => {
  const articles = await getArticles()
  return articles.filter((a) => a.published)
}

export const getArticlesByCategory = async (
  category: string
): Promise<Article[]> => {
  const articles = await getArticles()
  return articles
    .filter((a) => a.category === category)
    .filter((a) => a.published)
}

export const getArticleById = async (id: string): Promise<Article | null> => {
  if (typeof window === "undefined") return null

  try {
    const response = await apiRequest(`/articulos/${id}`, { method: "GET" })
    // Manejar diferentes formatos de respuesta
    if (response?.articulo) {
      return response.articulo
    } else if (response?.data) {
      return response.data
    } else if (response?.id) {
      return response
    }
    return null
  } catch (error) {
    console.log("API unavailable, using local articles")
    // Fallback a datos locales
    const articlesStr = localStorage.getItem("local_articles")
    if (!articlesStr) return null
    const articles: Article[] = JSON.parse(articlesStr)
    return articles.find((a) => a.id === id) || null
  }
}

export const createArticle = async (
  article: Omit<Article, "id" | "createdAt" | "updatedAt">
): Promise<Article | null> => {
  if (typeof window === "undefined") return null

  try {
    const response = await apiRequest("/articulos", {
      method: "POST",
      data: article,
    })
    // Manejar diferentes formatos de respuesta
    if (response?.articulo) {
      return response.articulo
    } else if (response?.data) {
      return response.data
    } else if (response?.id) {
      return response
    }
    return null
  } catch (error) {
    console.log("API unavailable, using local article creation")
    // Fallback a creación local
    const articlesStr = localStorage.getItem("local_articles")
    const articles: Article[] = articlesStr ? JSON.parse(articlesStr) : []

    const newArticle: Article = {
      ...article,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    articles.push(newArticle)
    localStorage.setItem("local_articles", JSON.stringify(articles))
    return newArticle
  }
}

export const updateArticle = async (
  id: string,
  updates: Partial<Omit<Article, "id" | "createdAt">>
): Promise<Article | null> => {
  if (typeof window === "undefined") return null

  try {
    const response = await apiRequest(`/articulos/${id}`, {
      method: "PATCH",
      data: updates,
    })
    // Manejar diferentes formatos de respuesta
    if (response?.articulo) {
      return response.articulo
    } else if (response?.data) {
      return response.data
    } else if (response?.id) {
      return response
    }
    return null
  } catch (error) {
    console.log("API unavailable, using local article update")
    // Fallback a actualización local
    const articlesStr = localStorage.getItem("local_articles")
    if (!articlesStr) return null

    const articles: Article[] = JSON.parse(articlesStr)
    const articleIndex = articles.findIndex((a) => a.id === id)

    if (articleIndex === -1) return null

    articles[articleIndex] = {
      ...articles[articleIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    localStorage.setItem("local_articles", JSON.stringify(articles))
    return articles[articleIndex]
  }
}

export const deleteArticle = async (id: string): Promise<boolean> => {
  if (typeof window === "undefined") return false

  try {
    const response = await apiRequest(`/articulos/${id}`, { method: "DELETE" })
    return response.success || true
  } catch (error) {
    console.log("API unavailable, using local article deletion")
    // Fallback a eliminación local
    const articlesStr = localStorage.getItem("local_articles")
    if (!articlesStr) return false

    const articles: Article[] = JSON.parse(articlesStr)
    const filteredArticles = articles.filter((a) => a.id !== id)

    if (filteredArticles.length === articles.length) return false

    localStorage.setItem("local_articles", JSON.stringify(filteredArticles))
    return true
  }
}

// ============================================================================
// FAVORITES MANAGEMENT FUNCTIONS
// ============================================================================

export const getFavorites = async (userId: string): Promise<string[]> => {
  if (typeof window === "undefined") return []

  try {
    const response = await apiRequest(`/favorites/${userId}`, { method: "GET" })
    return response.favorites || []
  } catch (error) {
    console.log("API unavailable, using local favorites")
    // Fallback a favoritos locales
    const favoritesStr = localStorage.getItem(`local_favorites_${userId}`)
    return favoritesStr ? JSON.parse(favoritesStr) : []
  }
}

export const addFavorite = async (
  userId: string,
  articleId: string
): Promise<boolean> => {
  if (typeof window === "undefined") return false

  try {
    const response = await apiRequest(`/favorites/${userId}`, {
      method: "POST",
      data: { articleId },
    })
    return response.success || true
  } catch (error) {
    console.log("API unavailable, using local favorite addition")
    // Fallback a adición local
    const favoritesStr = localStorage.getItem(`local_favorites_${userId}`)
    const favorites: string[] = favoritesStr ? JSON.parse(favoritesStr) : []

    if (favorites.includes(articleId)) return false

    favorites.push(articleId)
    localStorage.setItem(`local_favorites_${userId}`, JSON.stringify(favorites))
    return true
  }
}

export const removeFavorite = async (
  userId: string,
  articleId: string
): Promise<boolean> => {
  if (typeof window === "undefined") return false

  try {
    const response = await apiRequest(`/favorites/${userId}/${articleId}`, {
      method: "DELETE",
    })
    return response.success || true
  } catch (error) {
    console.log("API unavailable, using local favorite removal")
    // Fallback a remoción local
    const favoritesStr = localStorage.getItem(`local_favorites_${userId}`)
    if (!favoritesStr) return false

    const favorites: string[] = JSON.parse(favoritesStr)
    const filteredFavorites = favorites.filter((id) => id !== articleId)

    if (filteredFavorites.length === favorites.length) return false

    localStorage.setItem(`local_favorites_${userId}`, JSON.stringify(filteredFavorites))
    return true
  }
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

  try {
    const response = await apiRequest(`/favorites/${userId}/articles`, {
      method: "GET",
    })
    return response.articles || []
  } catch (error) {
    console.log("API unavailable, using local favorite articles")
    // Fallback a artículos favoritos locales
    const favoriteIds = await getFavorites(userId)
    const articlesStr = localStorage.getItem("local_articles")
    if (!articlesStr) return []

    const articles: Article[] = JSON.parse(articlesStr)
    return articles.filter((article) => favoriteIds.includes(article.id) && article.published)
  }
}

export { apiClient }

