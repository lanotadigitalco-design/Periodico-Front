"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getArticles, deleteArticle, type Article } from "@/lib/auth"
import { Trash2, Edit, PlusCircle } from "lucide-react"
import Link from "next/link"

export default function WriterPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== "writer" && user.role !== "admin"))) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user && (user.role === "writer" || user.role === "admin")) {
      const loadArticles = async () => {
        const allArticles = await getArticles()
        // Los escritores solo ven sus propios artículos, los admins ven todos
        const userArticles = user.role === "admin" ? allArticles : allArticles.filter((a) => a.authorId === user.id)
        setArticles(userArticles)
      }
      loadArticles()
    }
  }, [user])

  const handleDeleteArticle = (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este artículo?")) {
      const removeArticle = async () => {
        await deleteArticle(id)
        const allArticles = await getArticles()
        const userArticles = user?.role === "admin" ? allArticles : allArticles.filter((a) => a.authorId === user?.id)
        setArticles(userArticles)
      }
      removeArticle()
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
              {articles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-4">
                      <p className="text-muted-foreground">Aún no has creado ningún artículo</p>
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

        <Card className="mt-6 p-6 bg-muted/50">
          <h3 className="font-semibold text-foreground mb-2">Tus Estadísticas</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold text-foreground">{articles.length}</p>
              <p className="text-sm text-muted-foreground">Total Artículos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{articles.filter((a) => a.published).length}</p>
              <p className="text-sm text-muted-foreground">Publicados</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{articles.filter((a) => !a.published).length}</p>
              <p className="text-sm text-muted-foreground">Borradores</p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
