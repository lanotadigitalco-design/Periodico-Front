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

export interface UserRoleObject {
  id: number
  nombre: "LECTOR" | "ESCRITOR" | "PERIODISTA" | "ADMIN"
}

export interface User {
  id: number
  email: string
  nombre: string
  apellido: string
  activo: boolean
  rol: UserRoleObject
  createdAt: string
  updatedAt: string
}

export interface Article {
  id: string
  titulo: string
  title?: string // Alias para compatibilidad
  contenido: string
  content?: string // Alias para compatibilidad
  resumen?: string
  excerpt?: string // Alias para compatibilidad
  categoria: "politica" | "economia" | "deportes" | "cultura" | "mundo" | "opinion" | "tecnologia" | "salud" | "entretenimiento" | "tendencias"
  autor?: string
  author?: string // Alias para compatibilidad
  autorId?: string
  authorId?: string // Alias para compatibilidad
  imagenUrl?: string
  imageUrl?: string // Alias para compatibilidad
  publicado?: boolean
  published?: boolean // Alias para compatibilidad
  creadoEn?: string
  createdAt?: string // Alias para compatibilidad
  actualizadoEn?: string
  updatedAt?: string // Alias para compatibilidad
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

// Usar el proxy de Next.js en cliente y ngrok en servidor (para evitar problemas de CORS)
const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || "https://postilioned-symmetrically-margarita.ngrok-free.dev/api"
  
}

const API_URL = getApiUrl()
const PUBLIC_ROUTES = ["/login", "/register", "/"]

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Aumentado para ngrok
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "69420",
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
      let message = "Request failed"
      
      // Detectar si la respuesta es HTML en lugar de JSON
      const responseData = err.response.data
      if (typeof responseData === 'string' && (responseData.includes('<!DOCTYPE') || responseData.includes('<html') || responseData.includes('<HTML'))) {
        console.error(`API: Server returned HTML error page (${status})`)
        message = `Server error (${status}): The server returned an HTML error page instead of JSON. The server might be down or unreachable.`
      } else if (typeof responseData === 'object' && responseData?.message) {
        message = responseData.message
      } else if (typeof responseData === 'string') {
        message = responseData
      } else {
        message = err.message || "Request failed"
      }

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

    console.log(`🔵 API Request: ${method.toUpperCase()} ${API_URL}${endpoint}`)
    const response = await apiClient.request(config)
    
    // Validar que la respuesta sea JSON válido
    let responseData = response.data
    if (typeof responseData === 'string' && (responseData.includes('<!DOCTYPE') || responseData.includes('<html'))) {
      console.error(`❌ API: Response is HTML instead of JSON for ${method.toUpperCase()} ${endpoint}`)
      console.error("First 500 chars of response:", responseData.substring(0, 500))
      throw new Error(`Server returned HTML instead of JSON for ${method.toUpperCase()} ${endpoint}. Status: ${response.status}`)
    }
    
    console.log(`✅ API Response successful: ${method.toUpperCase()} ${endpoint}`)
    return responseData
  } catch (error: any) {
    console.error(`❌ API Error for ${method.toUpperCase()} ${endpoint}:`, error.message)
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
  console.log("🔄 Mapeando artículo:", data)
  
  // Extraer imagen del array imagenes o usar logo por defecto
  let imagenUrl = (data.imagenes && data.imagenes[0]) || data.imagenUrl || data.imageUrl || data.imagen || "/logo.png"
  
  // Si la imagen es un data URI (base64), usarla directamente
  // Si no, asumir que es una URL relativa
  if (!imagenUrl.startsWith("data:") && !imagenUrl.startsWith("http") && !imagenUrl.startsWith("/")) {
    imagenUrl = "/" + imagenUrl
  }
  
  // Extraer autor del array autores o usar campos directos
  const autor = (data.autores && data.autores[0]?.nombre) || data.autor || data.author || data.autorNombre || "Anónimo"
  const autorId = (data.autores && data.autores[0]?.id) || data.autorId || data.authorId || undefined
  
  const mapped: Article = {
    id: data.id?.toString() || "",
    titulo: data.titulo || data.title || "",
    title: data.titulo || data.title || "", // Alias
    contenido: data.contenido || data.content || "",
    content: data.contenido || data.content || "", // Alias
    resumen: data.resumen || data.excerpt || data.summary || "",
    excerpt: data.resumen || data.excerpt || data.summary || "", // Alias
    categoria: data.categoria || data.category || "tendencias",
    imagenUrl: imagenUrl,
    imageUrl: imagenUrl, // Alias
    autor: autor,
    author: autor, // Alias
    autorId: autorId,
    authorId: autorId, // Alias
    publicado: data.publicado !== undefined ? data.publicado : (data.published !== undefined ? data.published : true),
    published: data.publicado !== undefined ? data.publicado : (data.published !== undefined ? data.published : true), // Alias
    creadoEn: data.creadoEn || data.createdAt || new Date().toISOString(),
    createdAt: data.creadoEn || data.createdAt || new Date().toISOString(), // Alias
    actualizadoEn: data.actualizadoEn || data.updatedAt || new Date().toISOString(),
    updatedAt: data.actualizadoEn || data.updatedAt || new Date().toISOString(), // Alias
  }
  
  console.log("✅ Artículo mapeado:", mapped)
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

  try {
    const response = await apiRequest("/usuarios", { method: "GET" })
    console.log("👥 getUsers respuesta completa:", JSON.stringify(response, null, 2))
    
    // Manejar diferentes formatos de respuesta
    let users: any[] = []
    if (Array.isArray(response)) {
      users = response
    } else if (response?.usuarios && Array.isArray(response.usuarios)) {
      users = response.usuarios
    } else if (response?.data && Array.isArray(response.data)) {
      users = response.data
    }
    
    console.log(`✅ getUsers: Encontrados ${users.length} usuarios`)
    console.log("🔍 Primer usuario:", JSON.stringify(users[0], null, 2))
    
    // Mapear usuarios para normalizar los roles a mayúsculas
    const mappedUsers = users.map((u: any) => {
      // Normalizar el nombre del rol a mayúsculas
      let normalizedRoleName = "LECTOR" // default
      
      if (u.rol?.nombre) {
        const rolName = u.rol.nombre.toUpperCase()
        console.log(`🔄 Mapeando usuario ${u.id}: rol original = "${u.rol.nombre}" -> normalizado = "${rolName}"`)
        
        // Mapear roles variados a los nombres estándar
        if (rolName === "ADMINISTRADOR" || rolName === "ADMIN") {
          normalizedRoleName = "ADMIN"
        } else if (rolName === "PERIODISTA" || rolName === "JOURNALIST") {
          normalizedRoleName = "PERIODISTA"
        } else if (rolName === "ESCRITOR" || rolName === "WRITER") {
          normalizedRoleName = "ESCRITOR"
        } else if (rolName === "LECTOR" || rolName === "READER") {
          normalizedRoleName = "LECTOR"
        }
      }
      
      return {
        ...u,
        rol: {
          ...u.rol,
          nombre: normalizedRoleName
        }
      }
    })
    
    return mappedUsers as User[]
  } catch (error) {
    console.error("❌ Error cargando usuarios:", error)
    return []
  }
}

export const updateUserRole = async (
  userId: number | string,
  roleNombre: "LECTOR" | "ESCRITOR" | "PERIODISTA" | "ADMIN"
): Promise<boolean> => {
  if (typeof window === "undefined") return false

  try {
    console.log(`🔄 Actualizando rol del usuario ${userId} a ${roleNombre}`)
    
    // Convertir nombres de roles a valores que el backend espera
    const roleMap: Record<string, string> = {
      "LECTOR": "lector",
      "ESCRITOR": "escritor",
      "PERIODISTA": "periodista",
      "ADMIN": "administrador",
    }
    const roleValue = roleMap[roleNombre] || roleNombre.toLowerCase()
    
    console.log(`📤 Intentando actualizar rol a: ${roleValue}`)
    
    // El backend requiere un endpoint específico para roles que aún no existe
    // Por ahora se muestra un mensaje indicando que esta funcionalidad requiere
    // que el backend implemente un endpoint PATCH /usuarios/{id}/rol o similar
    
    const response = await apiRequest(`/usuarios/${userId}`, {
      method: "PATCH",
      data: { nombre: roleValue }, // Intentar enviar como nombre
    })
    console.log("✅ Rol actualizado:", response)
    return true
  } catch (error) {
    console.error("❌ Error actualizando rol - El backend aún no soporta esta operación:", error)
    alert("La funcionalidad de cambiar roles aún no está disponible en el backend.\nContacta al administrador del sistema.")
    return false
  }
}

export const deleteUser = async (userId: string): Promise<{ success: boolean; message: string }> => {
  if (typeof window === "undefined") return { success: false, message: "Error del servidor" }

  try {
    const response = await apiRequest(`/usuarios/${userId}`, { method: "DELETE" })
    return { success: true, message: "Usuario desactivado exitosamente" }
  } catch (error: any) {
    const errorMessage = error?.message || String(error)
    
    console.warn("⚠️ Error al desactivar usuario:", error)
    return { 
      success: false, 
      message: errorMessage 
    }
  }
}

export const activateUser = async (userId: string): Promise<{ success: boolean; message: string }> => {
  if (typeof window === "undefined") return { success: false, message: "Error del servidor" }

  try {
    const response = await apiRequest(`/usuarios/${userId}/activate`, { method: "PATCH" })
    return { success: true, message: "Usuario reactivado exitosamente" }
  } catch (error: any) {
    const errorMessage = error?.message || String(error)
    
    console.warn("⚠️ Error al reactivar usuario:", error)
    return { 
      success: false, 
      message: errorMessage 
    }
  }
}

// ============================================================================
// ARTICLE MANAGEMENT FUNCTIONS
// ============================================================================

export const getArticles = async (): Promise<Article[]> => {
  if (typeof window === "undefined") return []

  const response = await apiRequest("/articulos", { method: "GET" })
  console.log("🔍 getArticles: Respuesta bruta completa:", response)
  console.log("🔍 Tipo de respuesta:", typeof response)
  console.log("🔍 ¿Es array?:", Array.isArray(response))
  console.log("🔍 Keys disponibles:", Object.keys(response || {}))
  
  // Manejar diferentes formatos de respuesta
  let articles: any[] = []
  if (Array.isArray(response)) {
    articles = response
  } else if (response?.articulos && Array.isArray(response.articulos)) {
    articles = response.articulos
  } else if (response?.data && Array.isArray(response.data)) {
    articles = response.data
  } else if (response && typeof response === 'object') {
    // Si es un objeto pero no es array, intenta extraer el primer nivel
    articles = [response]
  }
  
  console.log(`✅ getArticles: Encontrados ${articles.length} artículos`)
  console.log("🔍 Primer artículo antes de mapear:", articles[0])
  
  const mapped = articles.map(mapArticleFromAPI)
  console.log("✅ Artículos mapeados:", mapped)
  return mapped
}

export const getAdminArticles = async (): Promise<Article[]> => {
  if (typeof window === "undefined") return []

  try {
    // Intentar diferentes parámetros para obtener TODOS los artículosÑ
    let response: any = null
    const params = [
      "/articulos?published=all",
      "/articulos?includeUnpublished=true",
      "/articulos?estado=todos",
      "/articulos?all=true",
      "/articulos/admin",
    ]

    for (const param of params) {
      try {
        console.log(`🔍 Intentando endpoint: ${param}`)
        response = await apiRequest(param, { method: "GET" })
        if (response && (Array.isArray(response) || response?.articulos || response?.data)) {
          console.log(`✅ Éxito con: ${param}`)
          break
        }
      } catch (error) {
        console.log(`⚠️ ${param} no funcionó, intentando siguiente...`)
        continue
      }
    }

    // Si ninguno funcionó, usar el endpoint normal
    if (!response) {
      console.log("⚠️ Ningún endpoint especial funcionó, usando /articulos normal")
      response = await apiRequest("/articulos", { method: "GET" })
    }

    let articles: any[] = []
    if (Array.isArray(response)) {
      articles = response
    } else if (response?.articulos && Array.isArray(response.articulos)) {
      articles = response.articulos
    } else if (response?.data && Array.isArray(response.data)) {
      articles = response.data
    }
    
    console.log(`✅ getAdminArticles: Encontrados ${articles.length} artículos`)
    return articles.map(mapArticleFromAPI)
  } catch (error) {
    console.error("❌ Error en getAdminArticles:", error)
    return getArticles()
  }
}

export const getPublishedArticles = async (): Promise<Article[]> => {
  const articles = await getArticles()
  // Devolver todos los artículos (incluso los que tienen publicado undefined o true)
  console.log(`getPublishedArticles: Devolviendo ${articles.length} artículos`)
  return articles
}

export const getArchivedArticles = async (): Promise<Article[]> => {
  if (typeof window === "undefined") return []

  try {
    // Usar el endpoint específico del backend para artículos archivados
    const response = await apiRequest("/articulos/despublicados", { method: "GET" })
    
    let articles: any[] = []
    if (Array.isArray(response)) {
      articles = response
    } else if (response?.articulos && Array.isArray(response.articulos)) {
      articles = response.articulos
    } else if (response?.data && Array.isArray(response.data)) {
      articles = response.data
    }
    
    console.log(`✅ getArchivedArticles: Encontrados ${articles.length} artículos archivados`)
    const mapped = articles.map(mapArticleFromAPI)
    return mapped
  } catch (error) {
    console.error("❌ Error obteniendo artículos archivados:", error)
    return []
  }
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
  const { autor, autorId, creadoEn, actualizadoEn, imagenUrl, imageUrl, ...data } = article
  const payload = {
    ...data,
    imagenes: imagenUrl || imageUrl ? [imagenUrl || imageUrl] : [],
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
  const { autor, autorId, creadoEn, actualizadoEn, imagenUrl, imageUrl, published, ...data } = updates
  const payload: any = {
    ...data,
  }
  
  // Si viene "published", transformar a "publicado"
  if (published !== undefined) {
    payload.publicado = published
  }
  
  if (imagenUrl !== undefined || imageUrl !== undefined) {
    payload.imagenes = (imagenUrl || imageUrl) ? [imagenUrl || imageUrl] : []
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

export const deleteArticle = async (id: string): Promise<{ success: boolean; message: string }> => {
  if (typeof window === "undefined") return { success: false, message: "Error del servidor" }

  try {
    const response = await apiRequest(`/articulos/${id}`, { method: "DELETE" })
    return { success: true, message: "Artículo eliminado exitosamente" }
  } catch (error: any) {
    const errorMessage = error?.message || String(error)
    
    // Error por clave foránea - el artículo tiene datos relacionados
    if (errorMessage.includes("llave foránea") || errorMessage.includes("violates foreign key")) {
      return { 
        success: false, 
        message: "No se puede eliminar este artículo porque tiene datos vinculados. Contacta al administrador del sistema."
      }
    }
    
    console.warn("⚠️ Error al eliminar artículo:", error)
    return { 
      success: false, 
      message: errorMessage 
    }
  }
}

export { apiClient }

