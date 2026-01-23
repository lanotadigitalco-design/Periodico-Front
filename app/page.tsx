"use client";

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Clock, Twitter, Facebook, Youtube, Instagram, Newspaper, Info, DollarSign, Zap, MapPin, Phone, Mail, Music } from "lucide-react"
import { getPublishedArticles, type Article } from "@/lib/auth"
import Link from "next/link"
import { LiveStreamPlayer } from "@/components/live-stream-player"
import Script from "next/dist/client/script"

interface LiveStreamConfig {
  id?: number;
  url: string;
  titulo: string;
  descripcion: string;
  activo: boolean;
  actualizadoEn?: string;
}

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [liveStreamConfig, setLiveStreamConfig] =
    useState<LiveStreamConfig | null>(null);
  const [isLoadingStream, setIsLoadingStream] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        console.log("📰 Iniciando carga de noticias...");
        const data = await getPublishedArticles();
        console.log("✅ Noticias cargadas:", data);
        setArticles(data || []);
      } catch (error) {
        console.error("❌ Error cargando noticias:", error);
        setArticles([]);
      }
    };
    loadArticles();
  }, []);

  useEffect(() => {
    const loadLiveStream = async () => {
      try {
        console.log("📡 [INICIO] Cargando live stream...");

        let data = null;

        try {
          // Intentar obtener por ID primero
          console.log("📝 [1] Intentando GET /live-stream/1...");
          data = await getLiveStream();
          console.log("📝 [1] Respuesta recibida:", JSON.stringify(data));
        } catch (error) {
          console.warn("⚠️ [1] Error en GET /live-stream/1:", error);
        }

        console.log("📊 [RESULTADO] data:", data);
        console.log("📊 [RESULTADO] data?.url:", data?.url);
        console.log("📊 [RESULTADO] data?.activo:", data?.activo);

        // Mostrar si tiene datos válidos
        if (data && data.url && data.activo === true) {
          console.log("✅ [MOSTRAR] Live stream válido y activo");
          console.log("✅ [MOSTRAR] URL:", data.url);
          setLiveStreamConfig(data);
        } else {
          console.warn("⚠️ [NO MOSTRAR] Falta data, url o no está activo");
          setLiveStreamConfig(null);
        }
      } catch (error) {
        console.error("❌ [ERROR] Error total:", error);
        setLiveStreamConfig(null);
      } finally {
        console.log("⏹️ [FIN] setIsLoadingStream = false");
        setIsLoadingStream(false);
      }
    };

    loadLiveStream();

    // Recargar cada 30 segundos
    const interval = setInterval(loadLiveStream, 30000);
    return () => clearInterval(interval);
  }, []);

 const getCategoryLabel = (cat: string | undefined) => {
  if (!cat) return ""; // o puedes devolver "Sin categoría"
  const labels: Record<string, string> = {
    politica: "Política",
    judicial: "Judicial",
    economia: "Economía",
    deportes: "Deportes",
    cultura: "Cultura",
    mundo: "Mundo",
    opinion: "Opinión",
    tecnologia: "Tecnología",
    salud: "Salud",
    entretenimiento: "Entretenimiento",
    turismo: "Turismo",
    tendencias: "Tendencias",
    colombia: "Colombia",
    cordoba: "Córdoba",
    monteria: "Montería",
  };
  return labels[cat.toLowerCase()] || cat;
};

  // Paginación
  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE,
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto px-4 py-4 md:py-8 max-w-4xl">
        {/* Contenido Principal - Centro */}
        <div>
          {/* Bloque de transmisión en vivo - Centro de la pantalla */}
          <section className="w-full flex flex-col items-center mb-12 md:mb-16">
            {/* DEBUG: Mostrar estado del live stream */}
            <div className="w-full mb-4 p-3 bg-blue-100 border border-blue-300 rounded text-xs font-mono text-blue-900 hidden">
              <div>liveStreamConfig: {JSON.stringify(liveStreamConfig)}</div>
              <div>activo: {liveStreamConfig?.activo?.toString()}</div>
              <div>url: {liveStreamConfig?.url}</div>
            </div>

            {liveStreamConfig?.activo && liveStreamConfig?.url && (
              <div className="w-full">
                <LiveStreamPlayer
                  isActive={true}
                  streamUrl={liveStreamConfig.url}
                  title={liveStreamConfig.titulo || "Transmisión en Vivo"}
                  description={
                    liveStreamConfig.descripcion || "Síguenos en directo"
                  }
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
                    animationDelay: `${index * 150}ms`,
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
                      <Badge variant="outline">
                        {getCategoryLabel(article.categoria)}
                      </Badge>
                      <span>•</span>
                      <span>{article.author}</span>
                    </div>
                    <Link href={`/articulo/${article.id}`}>
                      <h3 className="text-xl font-serif font-bold text-foreground hover:text-primary transition-colors text-balance">
                        {article.title}
                      </h3>
                    </Link>
                    <p className="text-muted-foreground mt-2 text-sm line-clamp-2">
                      {article.excerpt}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Secondary News List */}
        <section>
          <div className="mb-6">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-4 border-b border-border pb-2">
              Más Noticias
            </h2>

            {/* Búsqueda */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar noticias por título, resumen o autor..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setCurrentPage(1);
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
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {paginatedArticles.map((article, index) => (
                  <Card
                    key={article.id}
                    className="p-4 hover:shadow-lg transition-shadow cursor-pointer animate-in fade-in duration-500 slide-in-from-bottom-4"
                    style={{
                      animationDelay: `${index * 150}ms`,
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
                          {getCategoryLabel(article.categoria)}
                        </Badge>
                        <span>{article.author}</span>
                      </div>
                      <Link href={`/articulo/${article.id}`}>
                        <h3 className="font-semibold text-foreground hover:text-primary transition-colors leading-tight text-balance">
                          {article.title}
                        </h3>
                      </Link>
                      <p className="text-muted-foreground text-xs line-clamp-2">
                        {article.excerpt}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-fit text-xs mt-auto"
                        asChild
                      >
                        <Link href={`/articulo/${article.id}`}>Leer más →</Link>
                      </Button>
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
                          onClick={() =>
                            currentPage > 1 && setCurrentPage(currentPage - 1)
                          }
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ),
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            currentPage < totalPages &&
                            setCurrentPage(currentPage + 1)
                          }
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No hay artículos que coincidan con tu búsqueda"
                  : "No hay más artículos disponibles"}
              </p>
            </div>
          )}
        </section>
      </div>

      {articles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No hay artículos publicados aún. Los escritores pueden comenzar a
            crear contenido.
          </p>
        </div>
      )}

      {/* Footer */}
   <footer className="border-t border-border bg-card mt-12 w-full">
  {/* fondo full-bleed */}
  <div className="w-full px-6 py-8">
    {/* contenido centrado y con ancho legible */}
    <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
      <div>
        <h3 className="font-serif font-bold text-lg mb-4">La Nota Digital</h3>
        <p className="text-sm text-muted-foreground">Tu fuente confiable de noticias en tiempo real</p>
      </div>


            <div>
              <h4 className="font-semibold mb-4">Información</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/quienes-somos"
                    className="hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <Info className="w-4 h-4" />
                    Quiénes somos
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contacto"
                    className="hover:text-foreground transition-colors flex items-center gap-2"
                  >
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
                  <a
                    href="https://x.com/Lanotadigitalc"
                    className="hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.facebook.com/notadigitalco"
                    className="hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com/@LaNotaDigitalCo"
                    className="hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <Youtube className="w-4 h-4" />
                    YouTube
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.instagram.com/lanotadigital.co/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.tiktok.com/@lanotadigitalco"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
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
      <Script

/>
      </footer>
    </div>
    
  )
}
