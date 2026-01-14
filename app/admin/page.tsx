"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  getArticles,
  getAdminArticles,
  getArchivedArticles,
  getUsers,
  deleteArticle,
  updateArticle,
  updateUserRole,
  deleteUser,
  type Article,
  type User,
} from "@/lib/api"
import { Trash2, Edit, Eye, EyeOff, Search, X, Shield, FileText, Users, BookOpen } from "lucide-react"
import Link from "next/link"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Input } from "@/components/ui/input"

const USERS_PER_PAGE = 10

export default function AdminPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [archivedArticles, setArchivedArticles] = useState<Article[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [articleFilter, setArticleFilter] = useState<"todos" | "publicados" | "archivados">("todos")
  const [currentUserPage, setCurrentUserPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("todos")
  const [statusFilter, setStatusFilter] = useState<"todos" | "activos" | "desactivados">("todos")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<{ id: string | number; name: string } | null>(null)
  const [deleteArticleDialogOpen, setDeleteArticleDialogOpen] = useState(false)
  const [articleToDelete, setArticleToDelete] = useState<{ id: string; title: string } | null>(null)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user?.role === "admin") {
      const loadData = async () => {
        try {
          console.log("👥 Cargando datos del admin...")
          const articlesData = await getAdminArticles()
          const archivedData = await getArchivedArticles()
          console.log("✅ Artículos cargados:", articlesData.length)
          console.log("✅ Artículos archivados cargados:", archivedData.length)
          
          const usersData = await getUsers()
          console.log("✅ Usuarios cargados:", usersData)
          
          setArticles(articlesData)
          setArchivedArticles(archivedData)
          setUsers(usersData)
        } catch (error) {
          console.error("❌ Error cargando datos:", error)
        }
      }
      loadData()
    }
  }, [user])

  const handleDeleteArticle = async (id: string) => {
    const article = articles.find(a => a.id === id)
    setArticleToDelete({ id, title: article?.title || "Artículo" })
    setDeleteArticleDialogOpen(true)
  }

  const confirmDeleteArticle = async () => {
    if (!articleToDelete) return
    console.log(`🗑️ Eliminando artículo ${articleToDelete.id}`)
    const result = await deleteArticle(articleToDelete.id)
    
    if (result.success) {
      const articlesData = await getAdminArticles()
      const archivedData = await getArchivedArticles()
      setArticles(articlesData)
      setArchivedArticles(archivedData)
    } else {
      alert(`Error: ${result.message}`)
    }
    
    setDeleteArticleDialogOpen(false)
    setArticleToDelete(null)
  }

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    await updateArticle(id, { publicado: !currentStatus })
    // Recargar ambas listas
    const articlesData = await getAdminArticles()
    const archivedData = await getArchivedArticles()
    setArticles(articlesData)
    setArchivedArticles(archivedData)
  }

  const handleRoleChange = async (userId: number | string, newRole: "LECTOR" | "ESCRITOR" | "PERIODISTA" | "ADMIN") => {
    console.log(`🔄 Cambio de rol solicitado para usuario ${userId} a ${newRole}`)
    // Esta funcionalidad requiere que el backend implemente un endpoint para actualizar roles
    alert("La funcionalidad de cambiar roles será implementada cuando el backend lo soporte.")
  }

  const handleDeleteUser = async (userId: number | string) => {
    if (String(userId) === String(user?.id)) {
      alert("No puedes desactivar tu propia cuenta")
      return
    }
    const userToRemove = users.find(u => u.id === userId)
    setUserToDelete({ id: userId, name: userToRemove ? `${userToRemove.nombre} ${userToRemove.apellido}` : "Usuario" })
    setDeleteDialogOpen(true)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return
    console.log(`🗑️ Eliminando usuario ${userToDelete.id}`)
    const result = await deleteUser(String(userToDelete.id))
    
    if (result.success) {
      const usersData = await getUsers()
      setUsers(usersData)
      setCurrentUserPage(1)
    } else {
      alert(`Error: ${result.message}`)
    }
    
    setDeleteDialogOpen(false)
    setUserToDelete(null)
  }

  // Paginación de usuarios
  const totalUserPages = Math.ceil(users.length / USERS_PER_PAGE)
  const paginatedUsers = users.slice(
    (currentUserPage - 1) * USERS_PER_PAGE,
    currentUserPage * USERS_PER_PAGE
  )

  // Filtrado de usuarios
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === "todos" || (u.rol?.nombre || "LECTOR") === roleFilter
    
    const matchesStatus = 
      statusFilter === "todos" || 
      (statusFilter === "activos" && u.activo === true) ||
      (statusFilter === "desactivados" && u.activo === false)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  // Paginación con filtros aplicados
  const filteredTotalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE)
  const filteredPaginatedUsers = filteredUsers.slice(
    (currentUserPage - 1) * USERS_PER_PAGE,
    currentUserPage * USERS_PER_PAGE
  )

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      politica: "Política",
      economia: "Economía",
      deportes: "Deportes",
      cultura: "Cultura",
    }
    return labels[cat] || cat
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      LECTOR: "Lector",
      ESCRITOR: "Escritor",
      PERIODISTA: "Periodista",
      ADMIN: "Administrador",
    }
    return labels[role] || role
  }

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      LECTOR: {
        label: "Lector",
        className: "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200",
        icon: <BookOpen className="w-3 h-3" />,
      },
      ESCRITOR: {
        label: "Escritor",
        className: "bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200",
        icon: <FileText className="w-3 h-3" />,
      },
      PERIODISTA: {
        label: "Periodista",
        className: "bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200",
        icon: <FileText className="w-3 h-3" />,
      },
      ADMIN: {
        label: "Administrador",
        className: "bg-red-100 text-red-800 border-red-300 hover:bg-red-200",
        icon: <Shield className="w-3 h-3" />,
      },
    }

    const config = roleConfig[role] || roleConfig.LECTOR
    return (
      <Badge 
        variant="outline" 
        className={`${config.className} font-semibold flex items-center gap-1.5 px-3 py-1 border`}
      >
        {config.icon}
        <span>{config.label}</span>
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Cargando...</p>
          </Card>
        </main>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-foreground mb-1 sm:mb-2">Panel de Administración</h1>
          <p className="text-xs sm:text-base text-muted-foreground">Gestiona artículos, usuarios y configuraciones</p>
        </div>

        <Tabs defaultValue="articles" className="w-full">
          <TabsList className="grid w-full max-w-md sm:max-w-2xl grid-cols-2 sm:grid-cols-3 h-auto">
            <TabsTrigger value="articles" className="text-xs sm:text-sm">Artículos ({articles.length})</TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm">Usuarios ({users.length})</TabsTrigger>
            <TabsTrigger value="livestream" className="hidden sm:block">Transmisión</TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="mt-6">
            <Card>
              <div className="p-4 sm:p-6 border-b border-border">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <h2 className="text-lg sm:text-2xl font-semibold text-foreground">Gestión de Artículos</h2>
                  <Button size="sm" asChild className="w-full sm:w-auto text-xs sm:text-sm">
                    <Link href="/escritor/nuevo">Crear Nuevo</Link>
                  </Button>
                </div>
                
                {/* Filtro de artículos */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={articleFilter === "todos" ? "default" : "outline"}
                    onClick={() => setArticleFilter("todos")}
                    className="text-xs sm:text-sm"
                  >
                    Todos ({articles.length + archivedArticles.length})
                  </Button>
                  <Button
                    size="sm"
                    variant={articleFilter === "publicados" ? "default" : "outline"}
                    onClick={() => setArticleFilter("publicados")}
                    className="text-xs sm:text-sm"
                  >
                    Publicados ({articles.filter(a => a.publicado).length})
                  </Button>
                  <Button
                    size="sm"
                    variant={articleFilter === "archivados" ? "default" : "outline"}
                    onClick={() => setArticleFilter("archivados")}
                    className="text-xs sm:text-sm"
                  >
                    Archivados ({archivedArticles.length})
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Título</TableHead>
                    <TableHead className="hidden sm:table-cell min-w-[100px]">Categoría</TableHead>
                    <TableHead className="hidden md:table-cell min-w-[100px]">Autor</TableHead>
                    <TableHead className="hidden sm:table-cell min-w-[80px]">Estado</TableHead>
                    <TableHead className="hidden lg:table-cell min-w-[80px]">Fecha</TableHead>
                    <TableHead className="text-right min-w-[80px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    let displayArticles: Article[] = []
                    if (articleFilter === "publicados") {
                      displayArticles = articles.filter(a => a.publicado)
                    } else if (articleFilter === "archivados") {
                      displayArticles = archivedArticles
                    } else {
                      displayArticles = [...articles, ...archivedArticles]
                    }
                    
                    return displayArticles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No hay artículos {articleFilter === "archivados" ? "archivados" : "disponibles"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayArticles.map((article) => (
                        <TableRow key={article.id}>
                          <TableCell className="font-medium max-w-xs sm:max-w-md">
                            <Link href={`/articulo/${article.id}`} className="hover:text-primary transition-colors line-clamp-2">
                              {article.titulo}
                            </Link>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant="outline" className="text-xs">{getCategoryLabel(article.categoria)}</Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm">{article.autor}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant={article.publicado ? "default" : "secondary"} className="text-xs">
                              {article.publicado ? "Publicado" : "Archivado"}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                            {new Date(article.creadoEn).toLocaleDateString("es-ES")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleTogglePublish(article.id, article.publicado)}
                                title={article.publicado ? "Despublicar" : "Publicar"}
                              >
                                {article.publicado ? <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" /> : <Eye className="w-3 h-3 sm:w-4 sm:h-4" />}
                              </Button>
                              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                                <Link href={`/escritor/editar/${article.id}`}>
                                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteArticle(article.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )
                  })()}
                </TableBody>
              </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card>
              <div className="p-4 sm:p-6 border-b border-border">
                <div className="mb-4">
                  <h2 className="text-lg sm:text-2xl font-semibold text-foreground">Gestión de Usuarios</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">Total: {users.length}</p>
                </div>

                {/* Filtros */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                  <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setCurrentUserPage(1)
                      }}
                      className="pl-10 text-sm"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => {
                          setSearchTerm("")
                          setCurrentUserPage(1)
                        }}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <Select 
                    value={roleFilter}
                    onValueChange={(value) => {
                      setRoleFilter(value)
                      setCurrentUserPage(1)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los roles</SelectItem>
                      <SelectItem value="LECTOR">Lector</SelectItem>
                      <SelectItem value="ESCRITOR">Escritor</SelectItem>
                      <SelectItem value="PERIODISTA">Periodista</SelectItem>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select 
                    value={statusFilter}
                    onValueChange={(value) => {
                      setStatusFilter(value as "todos" | "activos" | "desactivados")
                      setCurrentUserPage(1)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los estados</SelectItem>
                      <SelectItem value="activos">Activos</SelectItem>
                      <SelectItem value="desactivados">Desactivados</SelectItem>
                    </SelectContent>
                  </Select>

                  {(searchTerm || roleFilter !== "todos" || statusFilter !== "todos") && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("")
                        setRoleFilter("todos")
                        setStatusFilter("todos")
                        setCurrentUserPage(1)
                      }}
                      className="w-full"
                    >
                      Limpiar filtros
                    </Button>
                  )}
                </div>

                {filteredUsers.length === 0 && (users.length > 0) && (
                  <p className="text-sm text-muted-foreground mt-4">
                    No se encontraron usuarios que coincidan con los filtros
                  </p>
                )}
              </div>

              {users.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p>No hay usuarios registrados aún</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p>No se encontraron usuarios que coincidan con los filtros</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[130px]">Nombre</TableHead>
                        <TableHead className="hidden sm:table-cell min-w-[150px]">Email</TableHead>
                        <TableHead className="hidden md:table-cell min-w-[100px]">Rol</TableHead>
                        <TableHead className="hidden lg:table-cell min-w-[100px]">Estado</TableHead>
                        <TableHead className="hidden xl:table-cell min-w-[100px]">Registro</TableHead>
                        <TableHead className="text-right min-w-[60px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPaginatedUsers.map((u) => (
                        <TableRow key={u.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium text-sm line-clamp-1">{u.nombre} {u.apellido}</TableCell>
                          <TableCell className="hidden sm:table-cell text-sm">{u.email}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {getRoleBadge(u.rol?.nombre || "LECTOR")}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Badge variant={u.activo ? "default" : "secondary"} className="text-xs">
                              {u.activo ? "Activo" : "Desactivado"}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                            {new Date(u.createdAt).toLocaleDateString("es-ES")}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(u.id)}
                              disabled={String(u.id) === String(user?.id)}
                              className="text-destructive hover:text-destructive disabled:opacity-50"
                              title={String(u.id) === String(user?.id) ? "No puedes desactivar tu propia cuenta" : "Desactivar usuario"}
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </div>

                  {filteredTotalPages > 1 && (
                    <div className="p-3 sm:p-6 border-t border-border flex items-center justify-center overflow-x-auto">
                      <Pagination>
                        <PaginationContent className="text-xs sm:text-sm">
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => setCurrentUserPage(Math.max(1, currentUserPage - 1))}
                              className={currentUserPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>

                          {Array.from({ length: filteredTotalPages }, (_, i) => i + 1).map((page) => {
                            if (
                              page === 1 ||
                              page === filteredTotalPages ||
                              (page >= currentUserPage - 1 && page <= currentUserPage + 1)
                            ) {
                              return (
                                <PaginationItem key={page}>
                                  <PaginationLink
                                    onClick={() => setCurrentUserPage(page)}
                                    isActive={page === currentUserPage}
                                    className="cursor-pointer"
                                  >
                                    {page}
                                  </PaginationLink>
                                </PaginationItem>
                              )
                            }
                            if (page === 2 || page === filteredTotalPages - 1) {
                              return <PaginationEllipsis key={page} />
                            }
                            return null
                          })}

                          <PaginationItem>
                            <PaginationNext
                              onClick={() => setCurrentUserPage(Math.min(filteredTotalPages, currentUserPage + 1))}
                              className={currentUserPage === filteredTotalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="livestream" className="mt-6">
            <Card>
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground">Transmisión en Vivo</h2>
                    <p className="text-sm text-muted-foreground mt-1">Configura el link de la transmisión que aparecerá en la página principal</p>
                  </div>
                  <Button asChild>
                    <Link href="/admin/live-stream">Administrar</Link>
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-6 p-4 sm:p-6 bg-muted/50">
          <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Estadísticas</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <div>
              <p className="text-lg sm:text-2xl font-bold text-foreground">{articles.length}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Artículos</p>
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold text-foreground">{articles.filter((a) => a.published).length}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Publicados</p>
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold text-foreground">{users.length}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Usuarios</p>
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold text-foreground">{users.filter((u) => u.role === "writer").length}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Escritores</p>
            </div>
          </div>
        </Card>
      </main>

      {/* Alert Dialog para confirmar desactivación de usuario */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="w-[90vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">Desactivar usuario</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              ¿Estás seguro de que quieres desactivar a <strong>{userToDelete?.name}</strong>? El usuario será desactivado pero sus datos se mantendrán en el sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel className="text-sm">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-sm"
            >
              Desactivar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Dialog para confirmar eliminación de artículo */}
      <AlertDialog open={deleteArticleDialogOpen} onOpenChange={setDeleteArticleDialogOpen}>
        <AlertDialogContent className="w-[90vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">Eliminar artículo</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              ¿Estás seguro de que quieres eliminar <strong>{articleToDelete?.title}</strong>? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel className="text-sm">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteArticle}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-sm"
            >
              Eliminar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
