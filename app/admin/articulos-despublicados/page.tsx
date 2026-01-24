"use client"

import { useEffect, useState } from "react"
import { Article } from "@/lib/api"
import { getArchivedArticles, updateArticle } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import Link from "next/link"

export default function ArticulosDespublicadosPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      politica: "Política",
      economia: "Economía",
      deportes: "Deportes",
      cultura: "Cultura",
      mundo: "Mundo",
      cordoba: "Córdoba",
      monteria: "Montería",
      turismo: "Turismo",
      educacion: "Educación",
      colombia: "Colombia",
      judicial: "Judicial",
      opinion: "Opinión",
      tecnologia: "Tecnología",
      salud: "Salud",
      entretenimiento: "Entretenimiento",
      tendencias: "Tendencias",
    }
    return labels[cat] || cat.charAt(0).toUpperCase() + cat.slice(1)
  }

  useEffect(() => {
    loadArticles()
  }, [])

  async function loadArticles() {
    try {
      setLoading(true)
      const data = await getArchivedArticles()
      setArticles(data)
      setError(null)
    } catch (err) {
      setError("Error al cargar los artículos")
    } finally {
      setLoading(false)
    }
  }

  async function handlePublish(id: string) {
    try {
      await updateArticle(id, { publicado: true })
      // Recargar la lista
      loadArticles()
    } catch (err) {
      alert("Error al publicar el artículo")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Artículos Despublicados</h1>
          <p className="text-gray-500 mt-1">
            Total: {articles.length} {articles.length === 1 ? "artículo" : "artículos"}
          </p>
        </div>
        <Link href="/admin">
          <Button variant="outline">Volver al Admin</Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {articles.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            No hay artículos despublicados
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {articles.map((article) => (
            <Card key={article.id}>
              <CardHeader>
                <CardTitle className="text-lg">{article.titulo}</CardTitle>
                <CardDescription>
                  <div className="flex gap-2 text-sm mt-2">
                    <span>Categoría: {getCategoryLabel(article.categoria)}</span>
                    <span>•</span>
                    <span>Autor: {article.autor}</span>
                    {article.creadoEn && (
                      <>
                        <span>•</span>
                        <span>Creado: {new Date(article.creadoEn).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 line-clamp-2 mb-4">
                  {article.resumen || article.contenido.substring(0, 150)}...
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handlePublish(article.id)}
                    variant="default"
                    size="sm"
                  >
                    Publicar
                  </Button>
                  <Link href={`/admin/articulos/${article.id}/editar`}>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
