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
  category: "politica" | "economia" | "deportes" | "cultura"
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
const PUBLIC_ROUTES = ["/login", "/register", "/"]

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
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
    const response = await apiRequest("/auth/login", {
      method: "POST",
      data: { email, password },
    })

    if (response.tokens) {
      setToken(response.tokens.accessToken, response.tokens.refreshToken)
      localStorage.setItem(USER_KEY, JSON.stringify(response.user))
      return response.user
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
  const userStr = localStorage.getItem(USER_KEY)
  return userStr ? JSON.parse(userStr) : null
}

export const register = async (
  email: string,
  password: string,
  name: string
): Promise<User | null> => {
  if (typeof window === "undefined") return null

  try {
    const response = await apiRequest("/auth/register", {
      method: "POST",
      data: { email, password, name },
    })

    if (response.tokens) {
      setToken(response.tokens.accessToken, response.tokens.refreshToken)
      localStorage.setItem(USER_KEY, JSON.stringify(response.user))
      return response.user
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
  try {
    const response = await apiRequest("/users", { method: "GET" })
    return response.users || []
  } catch (error) {
    console.error("Get users error:", error)
    return []
  }
}

export const updateUserRole = async (
  userId: string,
  role: UserRole
): Promise<boolean> => {
  try {
    const response = await apiRequest(`/users/${userId}/role`, {
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
  } catch (error) {
    console.error("Update user role error:", error)
    return false
  }
}

export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    const response = await apiRequest(`/users/${userId}`, { method: "DELETE" })
    return response.success || true
  } catch (error) {
    console.error("Delete user error:", error)
    return false
  }
}

// ============================================================================
// ARTICLE MANAGEMENT FUNCTIONS
// ============================================================================

export const getArticles = async (): Promise<Article[]> => {
  try {
    const response = await apiRequest("/articles", { method: "GET" })
    return response.articles || []
  } catch (error) {
    console.error("Get articles error:", error)
    return []
  }
}

export const getPublishedArticles = async (): Promise<Article[]> => {
  try {
    const response = await apiRequest("/articles?published=true", {
      method: "GET",
    })
    return response.articles || []
  } catch (error) {
    console.error("Get published articles error:", error)
    return []
  }
}

export const getArticlesByCategory = async (
  category: string
): Promise<Article[]> => {
  try {
    const response = await apiRequest(`/articles?category=${category}`, {
      method: "GET",
    })
    return response.articles || []
  } catch (error) {
    console.error("Get articles by category error:", error)
    return []
  }
}

export const getArticleById = async (id: string): Promise<Article | null> => {
  try {
    const response = await apiRequest(`/articles/${id}`, { method: "GET" })
    return response.article || null
  } catch (error) {
    console.error("Get article error:", error)
    return null
  }
}

export const createArticle = async (
  article: Omit<Article, "id" | "createdAt" | "updatedAt">
): Promise<Article | null> => {
  try {
    const response = await apiRequest("/articles", {
      method: "POST",
      data: article,
    })
    return response.article || null
  } catch (error) {
    console.error("Create article error:", error)
    return null
  }
}

export const updateArticle = async (
  id: string,
  updates: Partial<Omit<Article, "id" | "createdAt">>
): Promise<Article | null> => {
  try {
    const response = await apiRequest(`/articles/${id}`, {
      method: "PUT",
      data: updates,
    })
    return response.article || null
  } catch (error) {
    console.error("Update article error:", error)
    return null
  }
}

export const deleteArticle = async (id: string): Promise<boolean> => {
  try {
    const response = await apiRequest(`/articles/${id}`, { method: "DELETE" })
    return response.success || true
  } catch (error) {
    console.error("Delete article error:", error)
    return false
  }
}

// ============================================================================
// FAVORITES MANAGEMENT FUNCTIONS
// ============================================================================

export const getFavorites = async (userId: string): Promise<string[]> => {
  try {
    const response = await apiRequest(`/favorites/${userId}`, { method: "GET" })
    return response.favorites || []
  } catch (error) {
    console.error("Get favorites error:", error)
    return []
  }
}

export const addFavorite = async (
  userId: string,
  articleId: string
): Promise<boolean> => {
  try {
    const response = await apiRequest(`/favorites/${userId}`, {
      method: "POST",
      data: { articleId },
    })
    return response.success || true
  } catch (error) {
    console.error("Add favorite error:", error)
    return false
  }
}

export const removeFavorite = async (
  userId: string,
  articleId: string
): Promise<boolean> => {
  try {
    const response = await apiRequest(`/favorites/${userId}/${articleId}`, {
      method: "DELETE",
    })
    return response.success || true
  } catch (error) {
    console.error("Remove favorite error:", error)
    return false
  }
}

export const isFavorite = async (
  userId: string,
  articleId: string
): Promise<boolean> => {
  try {
    const favorites = await getFavorites(userId)
    return favorites.includes(articleId)
  } catch (error) {
    console.error("Is favorite error:", error)
    return false
  }
}

export const getFavoriteArticles = async (
  userId: string
): Promise<Article[]> => {
  try {
    const response = await apiRequest(`/favorites/${userId}/articles`, {
      method: "GET",
    })
    return response.articles || []
  } catch (error) {
    console.error("Get favorite articles error:", error)
    return []
  }
}

export { apiClient }

