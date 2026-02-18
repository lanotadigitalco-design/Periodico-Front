"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { getPublishedArticles, type Article } from "@/lib/auth";
import { getLiveStream, getImageUrl } from "@/lib/api";
import Link from "next/link";
import { LiveStreamPlayer } from "@/components/live-stream-player";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ARTICLES_PER_PAGE = 8;

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
        const data = await getPublishedArticles();
        setArticles(data || []);
      } catch (error) {
        setArticles([]);
      }
    };
    loadArticles();
  }, []);

  useEffect(() => {
    const loadLiveStream = async () => {
      try {
        let data = null;

        try {
          // Intentar obtener por ID primero
          data = await getLiveStream();
        } catch (error) {}

        // Mostrar si tiene datos válidos
        if (data && data.url && data.activo === true) {
          setLiveStreamConfig(data);
        } else {
          setLiveStreamConfig(null);
        }
      } catch (error) {
        setLiveStreamConfig(null);
      } finally {
        setIsLoadingStream(false);
      }
    };

    loadLiveStream();

    // Recargar cada 30 segundos
    const interval = setInterval(loadLiveStream, 30000);
    return () => clearInterval(interval);
  }, []);

  // Función para convertir filename a URL completa si es necesario
  const getFullImageUrl = (url: string | undefined): string => {
    if (!url || url.trim() === "") return "/logo.png";

    // Si ya es una URL completa (http/https), retornarla tal cual
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    // Si es un data URI, retornarla tal cual
    if (url.startsWith("data:")) {
      return url;
    }

    // Si no, es un filename - construir URL completa
    return getImageUrl(url);
  };

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
    };
    return labels[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  const featuredArticles = articles.slice(0, 2);

  console.warn("ARTÍCULOS CARGADOS:", articles);

  // Filtrar artículos por búsqueda
  let filteredArticles = articles.slice(2);
  if (searchTerm) {
    filteredArticles = filteredArticles.filter((a) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (a.title && a.title.toLowerCase().includes(searchLower)) ||
        (a.excerpt && a.excerpt.toLowerCase().includes(searchLower)) ||
        (a.author && a.author.toLowerCase().includes(searchLower)) ||
        (a.authorSurname && a.authorSurname.toLowerCase().includes(searchLower))
      );
    });
  }

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
                      src={
                        article.imagenUrl?.[0]
                          ? article.imagenUrl[0]
                          : "/logo.png"
                      }
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
                      <span>{article.author}{article.authorSurname && ` ${article.authorSurname}`}</span>
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
                          src={
                            article.imagenUrl?.[0]
                              ? article.imagenUrl[0]
                              : "/logo.png"
                          }
                          alt={article.title}
                          className="w-full h-32 object-cover rounded mb-2 hover:opacity-90 transition-opacity"
                        />
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">
                          {getCategoryLabel(article.categoria)}
                        </Badge>
                        <span>{article.author}{article.authorSurname && ` ${article.authorSurname}`}</span>
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

                      {(() => {
                        const pages = [];
                        const maxVisible = 10;
                        let startPage = Math.max(1, currentPage - 5);
                        let endPage = Math.min(
                          totalPages,
                          startPage + maxVisible - 1,
                        );

                        // Ajustar si estamos cerca del final
                        if (endPage - startPage < maxVisible - 1) {
                          startPage = Math.max(1, endPage - maxVisible + 1);
                        }

                        // Generar páginas visibles
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <PaginationItem key={i}>
                              <PaginationLink
                                onClick={() => setCurrentPage(i)}
                                isActive={currentPage === i}
                                className="cursor-pointer"
                              >
                                {i}
                              </PaginationLink>
                            </PaginationItem>,
                          );
                        }

                        // Agregar puntos suspensivos y última página si es necesario
                        if (endPage < totalPages) {
                          pages.push(
                            <PaginationItem key="ellipsis">
                              <span className="px-4 py-2">...</span>
                            </PaginationItem>,
                          );
                          pages.push(
                            <PaginationItem key={totalPages}>
                              <PaginationLink
                                onClick={() => setCurrentPage(totalPages)}
                                isActive={currentPage === totalPages}
                                className="cursor-pointer"
                              >
                                {totalPages}
                              </PaginationLink>
                            </PaginationItem>,
                          );
                        }

                        return pages;
                      })()}

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
    </div>
  );
}
