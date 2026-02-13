"use client";

import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type UserRole = "reader" | "writer" | "admin";

export interface UserRoleObject {
  id: number;
  nombre: "LECTOR" | "ESCRITOR" | "PERIODISTA" | "ADMIN";
}

export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  activo: boolean;
  rol: UserRoleObject;
  createdAt: string;
  updatedAt: string;
}

export interface Article {
  id: string;
  titulo: string;
  title?: string; // Alias para compatibilidad
  contenido: string;
  content?: string; // Alias para compatibilidad
  resumen?: string;
  excerpt?: string; // Alias para compatibilidad
  categoria:
    | "politica"
    | "economia"
    | "deportes"
    | "cultura"
    | "mundo"
    | "opinion"
    | "tecnologia"
    | "salud"
    | "entretenimiento"
    | "tendencias"
    | "turismo"
    | "educacion"
    | "colombia"
    | "judicial";
  autor?: string;
  author?: string; // Alias para compatibilidad
  autorId?: number | string;
  authorId?: number | string; // Alias para compatibilidad
  imagenUrl?: string[];
  imageUrl?: string; // Alias para compatibilidad
  publicado?: boolean;
  published?: boolean; // Alias para compatibilidad
  creadoEn?: string;
  createdAt?: string; // Alias para compatibilidad
  actualizadoEn?: string;
  updatedAt?: string; // Alias para compatibilidad
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

interface RequestOptions {
  method?: string;
  data?: any;
  params?: Record<string, string>;
}

// ============================================================================
// JWT TOKEN MANAGEMENT
// ============================================================================

const TOKEN_KEY = "authToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "currentUser";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string, refreshToken?: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

function removeTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function decodeToken(token: string): any {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  return decoded.exp * 1000 < Date.now();
}

// ============================================================================
// API CONFIGURATION
// ============================================================================

// Usar el proxy de Next.js en cliente y API en servidor (para evitar problemas de CORS)
const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || "https://api.lanotadigital.co/api";
};

const getApiBaseUrl = () => {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
    "https://api.lanotadigital.co"
  );
};

const API_URL = getApiUrl();
const API_BASE_URL = getApiBaseUrl();
const PUBLIC_ROUTES = ["/login", "/register", "/"];

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
  withCredentials: false,
});

// ============================================================================
// INTERCEPTORS
// ============================================================================

// Request interceptor: Agregar JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  },
);

// Response interceptor: Manejo de errores y refresh token
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: any | unknown) => {
    const err = error as any;
    const originalRequest = err.config;

    if (err.response?.status === 401) {
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;

        // Verificar si está en ruta pública
        if (!PUBLIC_ROUTES.some((route) => currentPath.startsWith(route))) {
          removeTokens();
          window.location.href = "/login";
        }
      }
    }

    if (err.response) {
      const status = err.response.status;
      let message = "Request failed";

      // Detectar si la respuesta es HTML en lugar de JSON
      const responseData = err.response.data;
      if (
        typeof responseData === "string" &&
        (responseData.includes("<!DOCTYPE") ||
          responseData.includes("<html") ||
          responseData.includes("<HTML"))
      ) {
        message = `Server error (${status}): The server returned an HTML error page instead of JSON. The server might be down or unreachable.`;
      } else if (typeof responseData === "object" && responseData?.message) {
        message = responseData.message;
      } else if (typeof responseData === "string") {
        message = responseData;
      } else {
        message = err.message || "Request failed";
      }

      if (status === 403) {
        // Forbidden - insufficient permissions
      } else if (status >= 500) {
        // Server error
      }

      throw new Error(message);
    } else if (err.request) {
      throw new Error("Network error - please check your connection");
    } else {
      throw new Error(err.message || "Request failed");
    }
  },
);

// ============================================================================
// API REQUEST FUNCTION
// ============================================================================

export async function apiRequest(
  endpoint: string,
  options: RequestOptions = {},
) {
  const { method = "GET", data, params } = options;

  try {
    const config: AxiosRequestConfig = {
      method: method.toLowerCase() as any,
      url: endpoint,
      params,
      data,
    };

    const response = await apiClient.request(config);

    // Validar que la respuesta sea JSON válido
    let responseData = response.data;
    if (
      typeof responseData === "string" &&
      (responseData.includes("<!DOCTYPE") || responseData.includes("<html"))
    ) {
      throw new Error(
        `Server returned HTML instead of JSON for ${method.toUpperCase()} ${endpoint}. Status: ${response.status}`,
      );
    }

    return responseData;
  } catch (error: any) {
    throw error;
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
};

// ============================================================================
// ARTICLE MAPPING FUNCTION
// ============================================================================

function mapArticleFromAPI(data: any): Article {
  // Extraer imagen del array imagenes o usar logo por defecto
  let imagenUrl =
    (data.imagenes && data.imagenes[0]) ||
    data.imagenUrl ||
    data.imageUrl ||
    data.imagen ||
    "/logo.png";

  const images = [];
  if (data.imagenes.length > 0) {
    console.warn("Array de imágenes encontrado:", data.imagenes);
    for (const img of data.imagenes) {
      console.warn("Procesando imagen:", img);
      const apiBase = "https://api.lanotadigital.co/api";
      images.push(`${apiBase}/upload/image/${img}`);
    }
  }

  // Extraer autor del array autores o usar campos directos
  const autor =
    (data.autores && data.autores[0]?.nombre) ||
    data.autor ||
    data.author ||
    data.autorNombre ||
    "Anónimo";
  const autorId =
    (data.autores && data.autores[0]?.id) ||
    data.autorId ||
    data.authorId ||
    undefined;

  const mapped: Article = {
    id: data.id?.toString() || "",
    titulo: data.titulo || data.title || "",
    title: data.titulo || data.title || "", // Alias
    contenido: data.contenido || data.content || "",
    content: data.contenido || data.content || "", // Alias
    resumen: data.resumen || data.excerpt || data.summary || "",
    excerpt: data.resumen || data.excerpt || data.summary || "", // Alias
    categoria: data.categoria || data.category || "tendencias",
    imagenUrl: images,
    imageUrl: imagenUrl, // Alias
    autor: autor,
    author: autor, // Alias
    autorId: autorId,
    authorId: autorId, // Alias
    publicado:
      data.publicado !== undefined
        ? data.publicado
        : data.published !== undefined
          ? data.published
          : true,
    published:
      data.publicado !== undefined
        ? data.publicado
        : data.published !== undefined
          ? data.published
          : true, // Alias
    creadoEn: data.creadoEn || data.createdAt || new Date().toISOString(),
    createdAt: data.creadoEn || data.createdAt || new Date().toISOString(), // Alias
    actualizadoEn:
      data.actualizadoEn || data.updatedAt || new Date().toISOString(),
    updatedAt: data.actualizadoEn || data.updatedAt || new Date().toISOString(), // Alias
  };

  return mapped;
}

export async function sendWebhook(data: any, url: string) {
  const token = getToken();
  return await axios.post(url, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

// ============================================================================
// AUTHENTICATION FUNCTIONS
// ============================================================================

export const login = async (
  email: string,
  password: string,
): Promise<User | null> => {
  if (typeof window === "undefined") return null;

  try {
    const response = await apiRequest("/auth/login", {
      method: "POST",
      data: { email, password },
    });

    // Intentar con diferentes formatos de respuesta
    const token =
      response.access_token || response.accessToken || response.token;
    const userData = response.usuario || response.user;

    if (token && userData) {
      // Verificar si el usuario está desactivado
      if (userData.activo === false) {
        return {
          id: "DISABLED",
          email: userData.email,
          name: userData.nombre || userData.name,
          role: "reader",
          createdAt: new Date().toISOString(),
        };
      }

      setToken(token);
      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.nombre || userData.name,
        role:
          userData.rol?.toLowerCase() === "lector"
            ? "reader"
            : userData.rol?.toLowerCase() === "periodista"
              ? "writer"
              : userData.rol?.toLowerCase() === "administrador"
                ? "admin"
                : "reader",
        createdAt: new Date().toISOString(),
      };
      return user;
    }

    return null;
  } catch (error: any) {
    // Capturar error de usuario desactivado (401)
    if (error.message && error.message.includes("desactivado")) {
      return {
        id: "DISABLED",
        email: email,
        name: "",
        role: "reader",
        createdAt: new Date().toISOString(),
      };
    }

    return null;
  }
};

export const logout = (): void => {
  if (typeof window === "undefined") return;
  removeTokens();
};

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null;

  // Intentar obtener del token
  const token = getToken();

  if (token) {
    const decoded = decodeToken(token);

    if (decoded && decoded.id && decoded.email) {
      // Map the role from API format to internal format
      let role: UserRole = "reader";
      const rawRole = decoded.rol || decoded.role || "";

      if (rawRole.toLowerCase() === "administrador") {
        role = "admin";
      } else if (rawRole.toLowerCase() === "periodista") {
        role = "writer";
      } else if (rawRole.toLowerCase() === "lector") {
        role = "reader";
      } else if (rawRole.toLowerCase() === "admin") {
        role = "admin";
      } else if (rawRole.toLowerCase() === "writer") {
        role = "writer";
      }

      const user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.nombre || decoded.name || decoded.email.split("@")[0],
        role: role,
        createdAt: new Date().toISOString(),
      };
      return user;
    }
  }

  return null;
};

export const register = async (
  email: string,
  password: string,
  nombre: string,
  apellido: string,
  rol: string = "lector",
): Promise<User | null> => {
  if (typeof window === "undefined") return null;

  try {
    const response = await apiRequest("/auth/register", {
      method: "POST",
      data: { email, password, nombre, apellido, rol },
    });

    // Intentar con diferentes formatos de respuesta
    const token =
      response.access_token || response.accessToken || response.token;
    const userData = response.usuario || response.user;

    if (token && userData) {
      setToken(token);
      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.nombre || userData.name,
        role:
          userData.rol?.toLowerCase() === "lector"
            ? "reader"
            : userData.rol?.toLowerCase() === "periodista"
              ? "writer"
              : userData.rol?.toLowerCase() === "administrador"
                ? "admin"
                : "reader",
        createdAt: new Date().toISOString(),
      };
      return user;
    }

    return null;
  } catch (error) {
    return null;
  }
};

export const refreshAccessToken = async (): Promise<string | null> => {
  if (typeof window === "undefined") return null;

  try {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) return null;

    const response = await axios.post(`${API_URL}/auth/refresh`, {
      refreshToken,
    });

    if (response.data.accessToken) {
      setToken(response.data.accessToken, refreshToken);
      return response.data.accessToken;
    }

    return null;
  } catch (error) {
    removeTokens();
    return null;
  }
};

// ============================================================================
// USER MANAGEMENT FUNCTIONS
// ============================================================================

export const getUsers = async (): Promise<User[]> => {
  if (typeof window === "undefined") return [];

  try {
    const response = await apiRequest("/usuarios", { method: "GET" });

    // Manejar diferentes formatos de respuesta
    let users: any[] = [];
    if (Array.isArray(response)) {
      users = response;
    } else if (response?.usuarios && Array.isArray(response.usuarios)) {
      users = response.usuarios;
    } else if (response?.data && Array.isArray(response.data)) {
      users = response.data;
    }

    // Mapear usuarios para normalizar los roles a mayúsculas
    const mappedUsers = users.map((u: any) => {
      // Normalizar el nombre del rol a mayúsculas
      let normalizedRoleName = "LECTOR"; // default

      if (u.rol?.nombre) {
        const rolName = u.rol.nombre.toUpperCase();

        // Mapear roles variados a los nombres estándar
        if (rolName === "ADMINISTRADOR" || rolName === "ADMIN") {
          normalizedRoleName = "ADMIN";
        } else if (rolName === "PERIODISTA" || rolName === "JOURNALIST") {
          normalizedRoleName = "PERIODISTA";
        } else if (rolName === "ESCRITOR" || rolName === "WRITER") {
          normalizedRoleName = "ESCRITOR";
        } else if (rolName === "LECTOR" || rolName === "READER") {
          normalizedRoleName = "LECTOR";
        }
      }

      return {
        ...u,
        rol: {
          ...u.rol,
          nombre: normalizedRoleName,
        },
      };
    });

    return mappedUsers as User[];
  } catch (error) {
    return [];
  }
};

export const updateUserRole = async (
  userId: number | string,
  roleNombre: "LECTOR" | "ESCRITOR" | "PERIODISTA" | "ADMIN",
): Promise<boolean> => {
  if (typeof window === "undefined") return false;

  try {
    // Convertir nombres de roles al formato que el backend espera (minúsculas)
    const roleMap: Record<string, string> = {
      LECTOR: "lector",
      ESCRITOR: "periodista",
      PERIODISTA: "periodista",
      ADMIN: "administrador",
    };
    const roleValue = roleMap[roleNombre] || roleNombre.toLowerCase();

    const response = await apiRequest(`/usuarios/${userId}/rol`, {
      method: "PATCH",
      data: { rol: roleValue },
    });

    return true;
  } catch (error) {
    return false;
  }
};

export const deleteUser = async (
  userId: string,
): Promise<{ success: boolean; message: string }> => {
  if (typeof window === "undefined")
    return { success: false, message: "Error del servidor" };

  try {
    const response = await apiRequest(`/usuarios/${userId}`, {
      method: "DELETE",
    });
    return { success: true, message: "Usuario desactivado exitosamente" };
  } catch (error: any) {
    const errorMessage = error?.message || String(error);

    return {
      success: false,
      message: errorMessage,
    };
  }
};

export const activateUser = async (
  userId: string,
): Promise<{ success: boolean; message: string }> => {
  if (typeof window === "undefined")
    return { success: false, message: "Error del servidor" };

  try {
    const response = await apiRequest(`/usuarios/${userId}/activate`, {
      method: "PATCH",
    });
    return { success: true, message: "Usuario reactivado exitosamente" };
  } catch (error: any) {
    const errorMessage = error?.message || String(error);

    return {
      success: false,
      message: errorMessage,
    };
  }
};

// ============================================================================
// ARTICLE MANAGEMENT FUNCTIONS
// ============================================================================

export const getArticles = async (): Promise<Article[]> => {
  if (typeof window === "undefined") return [];

  const response = await apiRequest("/articulos", { method: "GET" });

  // Manejar diferentes formatos de respuesta
  let articles: any[] = [];
  if (Array.isArray(response)) {
    articles = response;
  } else if (response?.articulos && Array.isArray(response.articulos)) {
    articles = response.articulos;
  } else if (response?.data && Array.isArray(response.data)) {
    articles = response.data;
  } else if (response && typeof response === "object") {
    // Si es un objeto pero no es array, intenta extraer el primer nivel
    articles = [response];
  }

  const mapped = articles.map(mapArticleFromAPI);
  return mapped;
};

export const getAdminArticles = async (): Promise<Article[]> => {
  if (typeof window === "undefined") return [];

  try {
    // Intentar diferentes parámetros para obtener TODOS los artículosÑ
    let response: any = null;
    const params = [
      "/articulos?published=all",
      "/articulos?includeUnpublished=true",
      "/articulos?estado=todos",
      "/articulos?all=true",
      "/articulos/admin",
    ];

    for (const param of params) {
      try {
        response = await apiRequest(param, { method: "GET" });
        if (
          response &&
          (Array.isArray(response) || response?.articulos || response?.data)
        ) {
          break;
        }
      } catch (error) {
        continue;
      }
    }

    // Si ninguno funcionó, usar el endpoint normal
    if (!response) {
      response = await apiRequest("/articulos", { method: "GET" });
    }

    let articles: any[] = [];
    if (Array.isArray(response)) {
      articles = response;
    } else if (response?.articulos && Array.isArray(response.articulos)) {
      articles = response.articulos;
    } else if (response?.data && Array.isArray(response.data)) {
      articles = response.data;
    }

    return articles.map(mapArticleFromAPI);
  } catch (error) {
    return getArticles();
  }
};

export const getPublishedArticles = async (): Promise<Article[]> => {
  const articles = await getArticles();
  // Devolver todos los artículos (incluso los que tienen publicado undefined o true)
  return articles;
};

export const getArchivedArticles = async (): Promise<Article[]> => {
  if (typeof window === "undefined") return [];

  try {
    // Usar el endpoint específico del backend para artículos archivados
    const response = await apiRequest("/articulos/despublicados", {
      method: "GET",
    });

    let articles: any[] = [];
    if (Array.isArray(response)) {
      articles = response;
    } else if (response?.articulos && Array.isArray(response.articulos)) {
      articles = response.articulos;
    } else if (response?.data && Array.isArray(response.data)) {
      articles = response.data;
    }

    const mapped = articles.map(mapArticleFromAPI);
    return mapped;
  } catch (error) {
    return [];
  }
};

export const getArticlesByCategory = async (
  categoria: string,
): Promise<Article[]> => {
  const articles = await getArticles();
  // Filtrar solo por categoría, permitir todos los estados de publicación
  return articles.filter((a) => a.categoria === categoria);
};

export const getArticleById = async (id: string): Promise<Article | null> => {
  if (typeof window === "undefined") return null;

  const response = await apiRequest(`/articulos/${id}`, { method: "GET" });
  // Manejar diferentes formatos de respuesta
  let article: any = null;
  if (response?.articulo) {
    article = response.articulo;
  } else if (response?.data) {
    article = response.data;
  } else if (response?.id) {
    article = response;
  }
  return article ? mapArticleFromAPI(article) : null;
};

export const createArticle = async (
  article: Omit<Article, "id" | "creadoEn" | "actualizadoEn">,
): Promise<Article | null> => {
  if (typeof window === "undefined") return null;

  // Filtrar campos que el backend no acepta y transformar imagenUrl a imagenes
  const {
    autor,
    autorId,
    creadoEn,
    actualizadoEn,
    imagenUrl,
    imageUrl,
    ...data
  } = article;
  const payload = {
    ...data,
    imagenes: imagenUrl || imageUrl ? [imagenUrl || imageUrl] : [],
  };

  const response = await apiRequest("/articulos", {
    method: "POST",
    data: payload,
  });

  // Manejar diferentes formatos de respuesta
  let result: any = null;
  if (response?.articulo) {
    result = response.articulo;
  } else if (response?.data) {
    result = response.data;
  } else if (response?.id) {
    result = response;
  }

  if (!result) {
    return null;
  }

  return mapArticleFromAPI(result);
};

export const updateArticle = async (
  id: string,
  updates: Partial<Omit<Article, "id" | "creadoEn">>,
): Promise<Article | null> => {
  if (typeof window === "undefined") return null;

  // Filtrar campos que el backend no acepta y transformar imagenUrl a imagenes
  const {
    autor,
    autorId,
    creadoEn,
    actualizadoEn,
    imagenUrl,
    imageUrl,
    published,
    ...data
  } = updates;
  const payload: any = {
    ...data,
  };

  // Si viene "published", transformar a "publicado"
  if (published !== undefined) {
    payload.publicado = published;
  }

  if (imagenUrl !== undefined || imageUrl !== undefined) {
    payload.imagenes = imagenUrl || imageUrl ? [imagenUrl || imageUrl] : [];
  }

  const response = await apiRequest(`/articulos/${id}`, {
    method: "PATCH",
    data: payload,
  });
  // Manejar diferentes formatos de respuesta
  let result: any = null;
  if (response?.articulo) {
    result = response.articulo;
  } else if (response?.data) {
    result = response.data;
  } else if (response?.id) {
    result = response;
  }
  return result ? mapArticleFromAPI(result) : null;
};

export const deleteArticle = async (
  id: string,
): Promise<{ success: boolean; message: string }> => {
  if (typeof window === "undefined")
    return { success: false, message: "Error del servidor" };

  try {
    // Primero obtener el artículo para saber qué imágenes tiene
    let articleImages: string[] = [];
    try {
      const article = await getArticleById(id);
      if (article?.imagenUrl) {
        const filename = article.imagenUrl.split("/").pop();
        if (filename) {
          articleImages.push(filename);
        }
      }
    } catch (error) {
      console.warn("No se pudo obtener las imágenes del artículo:", error);
    }

    // Eliminar el artículo
    const response = await apiRequest(`/articulos/${id}`, { method: "DELETE" });

    // Intentar eliminar las imágenes asociadas
    if (articleImages.length > 0) {
      try {
        for (const filename of articleImages) {
          await deleteImage(filename);
          console.log("Imagen eliminada:", filename);
        }
      } catch (deleteError) {
        console.warn(
          "No se pudieron eliminar todas las imágenes:",
          deleteError,
        );
        // No fallar si las imágenes no se pueden eliminar
      }
    }

    return { success: true, message: "Artículo eliminado exitosamente" };
  } catch (error: any) {
    const errorMessage = error?.message || String(error);

    // Error por clave foránea - el artículo tiene datos relacionados
    if (
      errorMessage.includes("llave foránea") ||
      errorMessage.includes("violates foreign key")
    ) {
      return {
        success: false,
        message:
          "No se puede eliminar este artículo porque tiene datos vinculados. Contacta al administrador del sistema.",
      };
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
};

// ============================================================================
// UPLOAD ENDPOINTS
// ============================================================================

export interface UploadImageResponse {
  url: string;
  filename: string;
}

export interface UploadMultipleImagesResponse {
  urls: string[];
  filenames: string[];
}

/**
 * Sube una única imagen al servidor
 * @param file - El archivo de imagen a subir
 * @returns Información del archivo subido (URL y nombre)
 */
export const uploadImage = async (file: File): Promise<UploadImageResponse> => {
  if (typeof window === "undefined")
    throw new Error("Este método solo funciona en el cliente");

  try {
    const formData = new FormData();
    formData.append("file", file);

    const token = getToken();
    const response = await apiClient.post<UploadImageResponse>(
      "/upload/image",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Error al subir la imagen";
    console.error("Error en uploadImage:", errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Sube múltiples imágenes al servidor
 * @param files - Array de archivos de imagen a subir
 * @returns Información de los archivos subidos (URLs y nombres)
 */
export const uploadMultipleImages = async (
  files: File[],
): Promise<UploadMultipleImagesResponse> => {
  if (typeof window === "undefined")
    throw new Error("Este método solo funciona en el cliente");

  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const token = getToken();
    const response = await apiClient.post<UploadMultipleImagesResponse>(
      "/upload/images",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Error al subir las imágenes";
    console.error("Error en uploadMultipleImages:", errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Obtiene una imagen del servidor por su nombre
 * @param filename - El nombre del archivo a recuperar
 * @returns URL de la imagen
 */
export const getImageUrl = (filename: string): string => {
  return `${API_BASE_URL}/upload/image/${filename}`;
};

/**
 * Obtiene múltiples imágenes del servidor
 * @param filenames - Array de nombres de archivos a recuperar
 * @returns Array de imágenes en base64 con su información
 */
export const getMultipleImages = async (
  filenames: string[],
): Promise<
  Array<{
    filename: string;
    data: string;
    mimetype: string;
  }>
> => {
  if (typeof window === "undefined")
    throw new Error("Este método solo funciona en el cliente");

  try {
    const response = await apiClient.post<
      Array<{
        filename: string;
        data: string;
        mimetype: string;
      }>
    >("/upload/images/multiple", { filenames });

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Error al obtener las imágenes";
    console.error("Error en getMultipleImages:", errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Elimina una imagen del servidor
 * @param filename - El nombre del archivo a eliminar
 * @returns Mensaje de confirmación
 */
export const deleteImage = async (
  filename: string,
): Promise<{ message: string }> => {
  if (typeof window === "undefined")
    throw new Error("Este método solo funciona en el cliente");

  try {
    const token = getToken();
    const response = await apiClient.delete<{ message: string }>(
      `/upload/image/${filename}`,
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Error al eliminar la imagen";
    console.error("Error en deleteImage:", errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Elimina múltiples imágenes del servidor
 * @param filenames - Array de nombres de archivos a eliminar
 * @returns Información sobre los archivos eliminados
 */
export const deleteMultipleImages = async (
  filenames: string[],
): Promise<{
  message: string;
  deleted: string[];
}> => {
  if (typeof window === "undefined")
    throw new Error("Este método solo funciona en el cliente");

  try {
    const token = getToken();
    const response = await apiClient.delete<{
      message: string;
      deleted: string[];
    }>("/upload/images/batch", {
      data: { filenames },
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Error al eliminar las imágenes";
    console.error("Error en deleteMultipleImages:", errorMessage);
    throw new Error(errorMessage);
  }
};

// ============================================================================
// LIVE-STREAM ENDPOINTS
// ============================================================================

export interface LiveStreamConfig {
  url: string;
  titulo: string;
  descripcion: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Obtiene la configuración activa de la transmisión en vivo
 * @returns Configuración de la transmisión
 */
export const getLiveStreamConfig = async (): Promise<LiveStreamConfig> => {
  if (typeof window === "undefined")
    throw new Error("Este método solo funciona en el cliente");

  try {
    const response = await apiClient.get<LiveStreamConfig>("/live-stream");
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Error al obtener configuración de transmisión";
    console.error("Error en getLiveStreamConfig:", errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Obtiene una transmisión por su ID
 * @param id - ID de la transmisión
 * @returns Configuración de la transmisión
 */
export const getLiveStream = async (): Promise<LiveStreamConfig> => {
  if (typeof window === "undefined")
    throw new Error("Este método solo funciona en el cliente");

  try {
    const response = await apiClient.get<LiveStreamConfig>(`/live-stream`);
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Error al obtener transmisión";
    console.error("Error en getLiveStreamById:", errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Crea una nueva configuración de transmisión en vivo
 * @param config - Configuración de la transmisión
 * @returns Configuración creada
 */
export const createLiveStream = async (
  config: Omit<LiveStreamConfig, "id" | "createdAt" | "updatedAt">,
): Promise<LiveStreamConfig> => {
  if (typeof window === "undefined")
    throw new Error("Este método solo funciona en el cliente");

  try {
    const token = getToken();
    if (!token) throw new Error("No hay token de autenticación");

    const response = await apiClient.post<LiveStreamConfig>(
      "/live-stream",
      config,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Error al crear transmisión";
    console.error("Error en createLiveStream:", errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Actualiza la configuración de una transmisión en vivo
 * @param id - ID de la transmisión
 * @param config - Campos a actualizar
 * @returns Configuración actualizada
 */
export const updateLiveStream = async (
  config: Partial<Omit<LiveStreamConfig, "id" | "createdAt" | "updatedAt">>,
): Promise<LiveStreamConfig> => {
  if (typeof window === "undefined")
    throw new Error("Este método solo funciona en el cliente");

  try {
    const token = getToken();
    if (!token) throw new Error("No hay token de autenticación");

    const response = await apiClient.post<LiveStreamConfig>(
      `/live-stream`,
      config,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Error al actualizar transmisión";
    console.error("Error en updateLiveStream:", errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Elimina una transmisión en vivo
 * @param id - ID de la transmisión
 * @returns Mensaje de confirmación
 */
export const deleteLiveStream = async (
  id: number,
): Promise<{ message: string }> => {
  if (typeof window === "undefined")
    throw new Error("Este método solo funciona en el cliente");

  try {
    const token = getToken();
    if (!token) throw new Error("No hay token de autenticación");

    const response = await apiClient.delete<{ message: string }>(
      `/live-stream/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Error al eliminar transmisión";
    console.error("Error en deleteLiveStream:", errorMessage);
    throw new Error(errorMessage);
  }
};

export { apiClient };
