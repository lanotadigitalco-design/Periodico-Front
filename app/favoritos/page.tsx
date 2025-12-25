"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { getFavoriteArticles, type Article } from "@/lib/auth"
import Link from "next/link"
import { Heart, Calendar, User } from "lucide-react"
import { useRouter } from "next/navigation"

export default function FavoritosPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [favorites, setFavorites] = useState<Article[]>([])

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const loadFavorites = async () => {
      const favoriteArticles = await getFavoriteArticles(user.id)
      setFavorites(favoriteArticles)
    }

    loadFavorites()
  }, [user, router])

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      politica: "Política",
      economia: "Economía",
      deportes: "Deportes",
      cultura: "Cultura",
    }
    return labels[cat] || cat
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            <h1 className="text-4xl font-serif font-bold text-foreground">Mis Favoritos</h1>
          </div>
          <p className="text-muted-foreground">Aquí encontrarás todos los artículos que has guardado como favoritos</p>
        </div>

        {favorites.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No tienes favoritos aún</h2>
            <p className="text-muted-foreground mb-6">
              Empieza a guardar artículos haciendo clic en el corazón de cualquier noticia
            </p>
            <Button asChild>
              <Link href="/">Explorar noticias</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((article) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {article.imageUrl && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={article.imageUrl || "/placeholder.svg"}
                      alt={article.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                <div className="p-6">
                  <Badge variant="outline" className="mb-3">
                    {getCategoryLabel(article.category)}
                  </Badge>
                  <h3 className="text-xl font-serif font-bold text-foreground mb-2 line-clamp-2">
                    <Link href={`/articulo/${article.id}`} className="hover:text-primary transition-colors">
                      {article.title}
                    </Link>
                  </h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">{article.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{article.author}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(article.createdAt).toLocaleDateString("es-ES")}</span>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href={`/articulo/${article.id}`}>Leer artículo</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
