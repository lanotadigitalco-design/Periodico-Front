"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Clock, Twitter, Facebook, Youtube, Instagram, Newspaper, Info, DollarSign, Zap, MapPin, Phone, Mail, Music } from "lucide-react"
import { getPublishedArticles, type Article } from "@/lib/auth"
import Link from "next/link"
import { LiveStreamPlayer } from "@/components/live-stream-player"

interface LiveStreamConfig {
  url: string
  titulo: string
  descripcion: string
  activo: boolean
  actualizadoEn?: string
}

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [liveStreamConfig, setLiveStreamConfig] = useState<LiveStreamConfig | null>(null)
  const [isLoadingStream, setIsLoadingStream] = useState(true)

  useEffect(() => {
    const loadArticles = async () => {
      try {
        console.log("📰 Iniciando carga de noticias...")
        const data = await getPublishedArticles()
        console.log("✅ Noticias cargadas:", data)
        setArticles(data || [])
      } catch (error) {
        console.error("❌ Error cargando noticias:", error)
        setArticles([])
      }
    }
    loadArticles()
  }, [])

  useEffect(() => {
    const loadLiveStream = async () => {
      try {
        console.log("📡 Cargando live stream...")
        const response = await fetch("https://postilioned-symmetrically-margarita.ngrok-free.dev/api/live-stream", {
          headers: {
            "ngrok-skip-browser-warning": "true",
            "Accept": "application/json"
          }
        })
        
        if (!response.ok) {
          console.warn("⚠️ Live stream no disponible:", response.status)
          setIsLoadingStream(false)
          return
        }
        
        // Validar que sea JSON antes de parsear
        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          console.warn("⚠️ Respuesta no es JSON:", contentType)
          setIsLoadingStream(false)
          return
        }
        
        const data = await response.json()
        console.log("✅ Live stream cargado:", data)
        setLiveStreamConfig(data)
      } catch (error) {
        console.error("❌ Error loading live stream config:", error)
      } finally {
        setIsLoadingStream(false)
      }
    }
    loadLiveStream()
  }, [])

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      politica: "Política",
      economia: "Economía",
      deportes: "Deportes",
      cultura: "Cultura",
      tecnologia: "Tecnología",
           
    }
    return labels[cat] || cat
  }

  const featuredArticles = articles.slice(0, 2)
  const secondaryArticles = articles.slice(2, 6)

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto px-4 py-4 md:py-8 max-w-4xl">
        {/* Contenido Principal - Centro */}
        <div>
        {/* Bloque de transmisión en vivo - Centro de la pantalla */}
        <section className="w-full flex flex-col items-center mb-12 md:mb-16">
          {!isLoadingStream && liveStreamConfig && (
            <div className="w-full">
              <LiveStreamPlayer
                isActive={liveStreamConfig.activo}
                streamUrl={liveStreamConfig.url}
                title={liveStreamConfig.titulo}
                description={liveStreamConfig.descripcion}
              />
            </div>
          )}
        </section> 

{/* Breaking News Ticker */}
        <section className="mt-12 mb-8">
          <Card className="bg-black text-white p-4">
            <div className="flex items-center gap-4">
              <Badge variant="destructive" className="shrink-0">
                ÚLTIMA HORA
              </Badge>
              <div className="overflow-hidden">
                <p className="animate-marquee whitespace-nowrap font-medium">
                  {articles.length > 0
                    ? articles.map((a) => a.title).join(" • ")
                    : "Bienvenido a La Nota Digital - Tu fuente de noticias en tiempo real"}
                </p>
              </div>
            </div>
          </Card>
        </section>
        </div>
      </main>

        {/* Featured Articles */}
        <div className="container mx-auto max-w-7xl">
            {/* Featured News Grid */}
            {featuredArticles.length > 0 && (
              <section className="mb-8 md:mb-12">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4 md:mb-6 border-b border-border pb-2">
                  Noticias Destacadas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredArticles.map((article, index) => (
                    <Card 
                      key={article.id} 
                      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer animate-in fade-in duration-500 slide-in-from-bottom-4"
                      style={{
                        animationDelay: `${index * 150}ms`
                      }}
                    >
                      <Link href={`/articulo/${article.id}`} className="block">
                        <img
                          src={article.imageUrl || "/logo.png"}
                          alt={article.title}
                          className="w-full h-64 object-cover hover:opacity-90 transition-opacity"
                        />
                      </Link>
                      <div className="p-6">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Badge variant="outline">{getCategoryLabel(article.category)}</Badge>
                          <span>•</span>
                          <span>{article.author}</span>
                        </div>
                        <Link href={`/articulo/${article.id}`}>
                          <h3 className="text-xl font-serif font-bold text-foreground hover:text-primary transition-colors text-balance">
                        {article.title}
                      </h3>
                    </Link>
                    <p className="text-muted-foreground mt-2 text-sm line-clamp-2">{article.excerpt}</p>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

          {/* Secondary News List */}
          {secondaryArticles.length > 0 && (
            <section>
              <h2 className="text-3xl font-serif font-bold text-foreground mb-6 border-b border-border pb-2">
                Más Noticias
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {secondaryArticles.map((article, index) => (
                  <Card 
                    key={article.id} 
                    className="p-4 hover:shadow-lg transition-shadow cursor-pointer animate-in fade-in duration-500 slide-in-from-bottom-4"
                    style={{
                      animationDelay: `${index * 150}ms`
                    }}
                  >
                    <div className="flex flex-col gap-2">
                      <Link href={`/articulo/${article.id}`} className="block">
                        <img
                          src={article.imageUrl || "/logo.png"}
                          alt={article.title}
                          className="w-full h-32 object-cover rounded mb-2 hover:opacity-90 transition-opacity"
                        />
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">
                          {getCategoryLabel(article.category)}
                        </Badge>
                        <span>{article.author}</span>
                      </div>
                      <Link href={`/articulo/${article.id}`}>
                        <h3 className="font-semibold text-foreground hover:text-primary transition-colors leading-tight text-balance">
                          {article.title}
                        </h3>
                      </Link>
                      <p className="text-muted-foreground text-xs line-clamp-2">{article.excerpt}</p>
                      <Button variant="ghost" size="sm" className="w-fit text-xs mt-auto" asChild>
                        <Link href={`/articulo/${article.id}`}>Leer más →</Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>




        {articles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No hay artículos publicados aún. Los escritores pueden comenzar a crear contenido.
            </p>
          </div>
        )}


      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-serif font-bold text-lg mb-4">La Nota Digital</h3>
              <p className="text-sm text-muted-foreground">Tu fuente confiable de noticias en tiempo real</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Información</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/quienes-somos" className="hover:text-foreground transition-colors flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Quiénes somos
                  </Link>
                </li>
                <li>
                  <Link href="/contacto" className="hover:text-foreground transition-colors flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Contacto
                  </Link>
                </li>

              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Síguenos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="https://x.com/Lanotadigitalc" className="hover:text-foreground transition-colors flex items-center gap-2">
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="https://www.facebook.com/notadigitalco" className="hover:text-foreground transition-colors flex items-center gap-2">
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="https://www.youtube.com/@LaNotaDigitalCo" className="hover:text-foreground transition-colors flex items-center gap-2">
                    <Youtube className="w-4 h-4" />
                    YouTube
                  </a>
                </li>
                <li>
                  <a href="https://www.instagram.com/lanotadigital.co/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-2">
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="https://www.tiktok.com/@lanotadigitalco" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.86 2.86 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0_0_0_4.77_1.52v-3.4a4.85 _ - .54-.05z" />
                    </svg>
                    TikTok
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2026 La Nota Digital. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
