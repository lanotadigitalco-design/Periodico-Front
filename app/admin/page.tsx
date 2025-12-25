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
  getArticles,
  getUsers,
  deleteArticle,
  updateArticle,
  updateUserRole,
  deleteUser,
  type Article,
  type User,
  type UserRole,
} from "@/lib/auth"
import { Trash2, Edit, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

export default function AdminPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user?.role === "admin") {
      const loadData = async () => {
        const articlesData = await getArticles()
        const usersData = await getUsers()
        setArticles(articlesData)
        setUsers(usersData)
      }
      loadData()
    }
  }, [user])

  const handleDeleteArticle = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este artículo?")) {
      await deleteArticle(id)
      const articlesData = await getArticles()
      setArticles(articlesData)
    }
  }

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    await updateArticle(id, { published: !currentStatus })
    const articlesData = await getArticles()
    setArticles(articlesData)
  }

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    await updateUserRole(userId, newRole)
    const usersData = await getUsers()
    setUsers(usersData)
  }

  const handleDeleteUser = async (userId: string) => {
    if (userId === user?.id) {
      alert("No puedes eliminar tu propia cuenta")
      return
    }
    if (confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      await deleteUser(userId)
      const usersData = await getUsers()
      setUsers(usersData)
    }
  }

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      politica: "Política",
      economia: "Economía",
      deportes: "Deportes",
      cultura: "Cultura",
    }
    return labels[cat] || cat
  }

  const getRoleLabel = (role: UserRole) => {
    const labels: Record<UserRole, string> = {
      admin: "Administrador",
      writer: "Escritor",
      reader: "Lector",
    }
    return labels[role]
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
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Panel de Administración</h1>
          <p className="text-muted-foreground">Gestiona artículos, usuarios y configuraciones del periódico</p>
        </div>

        <Tabs defaultValue="articles" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="articles">Artículos ({articles.length})</TabsTrigger>
            <TabsTrigger value="users">Usuarios ({users.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="mt-6">
            <Card>
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-foreground">Gestión de Artículos</h2>
                  <Button asChild>
                    <Link href="/escritor/nuevo">Crear Nuevo Artículo</Link>
                  </Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Autor</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No hay artículos disponibles
                      </TableCell>
                    </TableRow>
                  ) : (
                    articles.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell className="font-medium max-w-md">
                          <Link href={`/articulo/${article.id}`} className="hover:text-primary transition-colors">
                            {article.title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getCategoryLabel(article.category)}</Badge>
                        </TableCell>
                        <TableCell>{article.author}</TableCell>
                        <TableCell>
                          <Badge variant={article.published ? "default" : "secondary"}>
                            {article.published ? "Publicado" : "Borrador"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(article.createdAt).toLocaleDateString("es-ES")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTogglePublish(article.id, article.published)}
                              title={article.published ? "Despublicar" : "Publicar"}
                            >
                              {article.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/escritor/editar/${article.id}`}>
                                <Edit className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteArticle(article.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card>
              <div className="p-6 border-b border-border">
                <h2 className="text-2xl font-semibold text-foreground">Gestión de Usuarios</h2>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Fecha de Registro</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Select
                          value={u.role}
                          onValueChange={(value) => handleRoleChange(u.id, value as UserRole)}
                          disabled={u.id === user.id}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="reader">Lector</SelectItem>
                            <SelectItem value="writer">Escritor</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString("es-ES")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={u.id === user.id}
                          className="text-destructive hover:text-destructive disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-6 p-6 bg-muted/50">
          <h3 className="font-semibold text-foreground mb-2">Estadísticas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-2xl font-bold text-foreground">{articles.length}</p>
              <p className="text-sm text-muted-foreground">Total Artículos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{articles.filter((a) => a.published).length}</p>
              <p className="text-sm text-muted-foreground">Publicados</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{users.length}</p>
              <p className="text-sm text-muted-foreground">Total Usuarios</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{users.filter((u) => u.role === "writer").length}</p>
              <p className="text-sm text-muted-foreground">Escritores</p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
