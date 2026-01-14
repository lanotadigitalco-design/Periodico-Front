"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getArticles, getArchivedArticles, deleteArticle, updateArticle, type Article } from "@/lib/api"
import { Trash2, Edit, PlusCircle, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function WriterPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [archivedArticles, setArchivedArticles] = useState<Article[]>([])
  const [articleFilter, setArticleFilter] = useState<"todos" | "publicados" | "archivados">("todos")
  const [deleteArticleDialogOpen, setDeleteArticleDialogOpen] = useState(false)
  const [articleToDelete, setArticleToDelete] = useState<{ id: string; title: string } | null>(null)

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== "writer" && user.role !== "admin"))) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user && (user.role === "writer" || user.role === "admin")) {
      const loadArticles = async () => {
        const allArticles = await getArticles()
        const allArchivedArticles = await getArchivedArticles()
        // Los escritores solo ven sus propios artículos, los admins ven todos
        const userArticles = user.role === "admin" ? allArticles : allArticles.filter((a) => a.authorId === user.id || a.author === user.nombre)
        const userArchived = user.role === "admin" ? allArchivedArticles : allArchivedArticles.filter((a) => a.authorId === user.id || a.author === user.nombre)
        setArticles(userArticles)
        setArchivedArticles(userArchived)
      }
      loadArticles()
    }
  }, [user])

  const handleDeleteArticle = (id: string) => {
    const article = articles.find(a => a.id === id)
    setArticleToDelete({ id, title: article?.titulo || "Artículo" })
    setDeleteArticleDialogOpen(true)
  }

  const confirmDeleteArticle = async () => {
    if (!articleToDelete) return
    const result = await deleteArticle(articleToDelete.id)
    
    if (result.success) {
      const allArticles = await getArticles()
      const allArchivedArticles = await getArchivedArticles()
      const userArticles = user?.role === "admin" ? allArticles : allArticles.filter((a) => a.authorId === user?.id || a.author === user?.nombre)
      const userArchived = user?.role === "admin" ? allArchivedArticles : allArchivedArticles.filter((a) => a.authorId === user?.id || a.author === user?.nombre)
      setArticles(userArticles)
      setArchivedArticles(userArchived)
    } else {
      alert(`Error: ${result.message}`)
    }
    
    setDeleteArticleDialogOpen(false)
    setArticleToDelete(null)
  }

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    await updateArticle(id, { publicado: !currentStatus })
    const allArticles = await getArticles()
    const allArchivedArticles = await getArchivedArticles()
    const userArticles = user?.role === "admin" ? allArticles : allArticles.filter((a) => a.authorId === user?.id || a.author === user?.nombre)
    const userArchived = user?.role === "admin" ? allArchivedArticles : allArchivedArticles.filter((a) => a.authorId === user?.id || a.author === user?.nombre)
    setArticles(userArticles)
    setArchivedArticles(userArchived)
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

  if (!user || (user.role !== "writer" && user.role !== "admin")) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Mis Artículos</h1>
            <p className="text-muted-foreground">Gestiona y publica tu contenido periodístico</p>
          </div>
          <Button size="lg" asChild>
            <Link href="/escritor/nuevo">
              <PlusCircle className="w-5 h-5 mr-2" />
              Nuevo Artículo
            </Link>
          </Button>
        </div>

        <Card>
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-foreground">Mis Artículos</h2>
            </div>
            
            {/* Filtro de artículos */}
            <div className="flex gap-2">
              <Button
                variant={articleFilter === "todos" ? "default" : "outline"}
                onClick={() => setArticleFilter("todos")}
              >
                Todos ({articles.length + archivedArticles.length})
              </Button>
              <Button
                variant={articleFilter === "publicados" ? "default" : "outline"}
                onClick={() => setArticleFilter("publicados")}
              >
                Publicados ({articles.filter(a => a.publicado).length})
              </Button>
              <Button
                variant={articleFilter === "archivados" ? "default" : "outline"}
                onClick={() => setArticleFilter("archivados")}
              >
                Archivados ({archivedArticles.length})
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
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
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <p className="text-muted-foreground">
                          {articleFilter === "publicados" 
                            ? "No tienes artículos publicados" 
                            : articleFilter === "archivados"
                            ? "No tienes artículos archivados"
                            : "Aún no has creado ningún artículo"}
                        </p>
                        <Button asChild>
                          <Link href="/escritor/nuevo">
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Crear tu primer artículo
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  displayArticles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium max-w-md">
                        <Link href={`/articulo/${article.id}`} className="hover:text-primary transition-colors">
                          {article.titulo}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getCategoryLabel(article.categoria)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={article.publicado ? "default" : "secondary"}>
                          {article.publicado ? "Publicado" : "Borrador"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(article.creadoEn || "").toLocaleDateString("es-ES")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTogglePublish(article.id, article.publicado)}
                            title={article.publicado ? "Despublicar" : "Publicar"}
                          >
                            {article.publicado ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                )
              })()}
            </TableBody>
          </Table>
        </Card>

        <Card className="mt-6 p-6 bg-muted/50">
          <h3 className="font-semibold text-foreground mb-2">Tus Estadísticas</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold text-foreground">{articles.length + archivedArticles.length}</p>
              <p className="text-sm text-muted-foreground">Total Artículos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{articles.filter((a) => a.publicado).length}</p>
              <p className="text-sm text-muted-foreground">Publicados</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{archivedArticles.length}</p>
              <p className="text-sm text-muted-foreground">Archivados</p>
            </div>
          </div>
        </Card>

        <AlertDialog open={deleteArticleDialogOpen} onOpenChange={setDeleteArticleDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar artículo?</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que deseas eliminar "{articleToDelete?.title}"? Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteArticle} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Eliminar
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  )
}
