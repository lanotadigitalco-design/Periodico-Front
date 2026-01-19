"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { getArticlesByCategory, type Article } from "@/lib/auth"
import Link from "next/link"

const ARTICLES_PER_PAGE = 10

export default function CategoryPage() {
  const params = useParams()
  const categoria = params.categoria as string
  const [articles, setArticles] = useState<Article[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const loadArticles = async () => {
      const data = await getArticlesByCategory(categoria)
      setArticles(data)
    }
    loadArticles()
  }, [categoria])

  // Filtrar artículos por búsqueda
  let filteredArticles = articles
  if (searchTerm) {
    filteredArticles = articles.filter(a =>
      a.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.resumen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.autor?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  // Paginación
  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE)
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE
  )

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
          <p className="text-muted-foreground mb-6">
            Mantente informado sobre las últimas noticias de {getCategoryLabel(categoria).toLowerCase()}
          </p>

          {/* Búsqueda */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar noticias por título, resumen o autor..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10 text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("")
                  setCurrentPage(1)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {paginatedArticles.length > 0 ? (
          <>
            <div className="grid gap-6 mb-6">
              {paginatedArticles.map((article) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <img
                      src={article.imagenUrl || "/logo.png"}
                      alt={article.titulo}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="md:col-span-2 p-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Badge variant="outline">{getCategoryLabel(article.categoria)}</Badge>
                      <span>•</span>
                      <span>Por {article.autor}</span>
                      <span>•</span>
                      <span>{new Date(article.creadoEn).toLocaleDateString("es-ES")}</span>
                    </div>
                    <Link href={`/articulo/${article.id}`}>
                      <h2 className="text-2xl font-serif font-bold text-foreground hover:text-primary transition-colors mb-3 text-balance">
                        {article.titulo}
                      </h2>
                    </Link>
                    <p className="text-muted-foreground mb-4 line-clamp-3">{article.resumen}</p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/articulo/${article.id}`}>Leer artículo completo →</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Card className="p-12">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {searchTerm ? "No hay resultados" : "No hay artículos disponibles"}
              </h2>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? "No encontramos artículos que coincidan con tu búsqueda"
                  : `Aún no hay artículos publicados en la categoría de ${getCategoryLabel(categoria).toLowerCase()}.`
                }
              </p>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
