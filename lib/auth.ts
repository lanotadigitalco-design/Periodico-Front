"use client"

// Re-exportar todo desde api.ts para mantener compatibilidad hacia atrás
export {
  type User,
  type UserRole,
  type Article,
  type AuthTokens,
  login,
  logout,
  getCurrentUser,
  register,
  refreshAccessToken,
  getUsers,
  updateUserRole,
  deleteUser,
  getArticles,
  getPublishedArticles,
  getArticlesByCategory,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
} from "./api"
