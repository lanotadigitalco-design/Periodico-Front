"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getArticlesByCategory, type Article } from "@/lib/auth"
import Link from "next/link"

export default function CategoryPage() {
  const params = useParams()
  const categoria = params.categoria as string
  const [articles, setArticles] = useState<Article[]>([])

  useEffect(() => {
    const loadArticles = async () => {
      const data = await getArticlesByCategory(categoria)
      setArticles(data)
    }
    loadArticles()
  }, [categoria])

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      politica: "Política",
      economia: "Economía",
      deportes: "Deportes",
      cultura: "Cultura",
    }
    if (labels[cat]) return labels[cat]
    // Capitalizar la primera letra si no está en el diccionario
    return cat.charAt(0).toUpperCase() + cat.slice(1)
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 pt-4 pb-8">
        <div className="mb-8 mt-8">
          <Badge variant="outline" className="mb-4">
            {getCategoryLabel(categoria)}
          </Badge>
          <h1 className="text-4xl font-serif font-bold text-foreground mb-2 text-balance">
            Noticias de {getCategoryLabel(categoria)}
          </h1>
          <p className="text-muted-foreground">
            Mantente informado sobre las últimas noticias de {getCategoryLabel(categoria).toLowerCase()}
          </p>
        </div>

        {articles.length > 0 ? (
          <div className="grid gap-6">
            {articles.map((article) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <img
                      src={article.imageUrl || "/placeholder.svg?height=300&width=400"}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="md:col-span-2 p-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Badge variant="outline">{getCategoryLabel(article.category)}</Badge>
                      <span>•</span>
                      <span>Por {article.author}</span>
                      <span>•</span>
                      <span>{new Date(article.createdAt).toLocaleDateString("es-ES")}</span>
                    </div>
                    <Link href={`/articulo/${article.id}`}>
                      <h2 className="text-2xl font-serif font-bold text-foreground hover:text-primary transition-colors mb-3 text-balance">
                        {article.title}
                      </h2>
                    </Link>
                    <p className="text-muted-foreground mb-4 line-clamp-3">{article.excerpt}</p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/articulo/${article.id}`}>Leer artículo completo →</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Card className="p-12">
              <h2 className="text-xl font-semibold text-foreground mb-2">No hay artículos disponibles</h2>
              <p className="text-muted-foreground">
                Aún no hay artículos publicados en la categoría de {getCategoryLabel(categoria).toLowerCase()}.
              </p>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
