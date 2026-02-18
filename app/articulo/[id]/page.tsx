"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getArticleById, type Article } from "@/lib/auth";
import { getImageUrl } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";

export default function ArticlePage() {
  const params = useParams();
  const id = params.id as string;
  const [article, setArticle] = useState<Article | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadArticle = async () => {
      const articleData = await getArticleById(id);
      setArticle(articleData);
    };
    loadArticle();
  }, [id]);

  // Función para convertir filename a URL completa si es necesario
  const getFullImageUrl = (url: string | undefined): string => {
    if (!url) return "/logo.png";

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

  // Función para procesar el contenido HTML y convertir los src de imágenes
  const processContentImages = (
    content: string,
    imageUrls: string[] = [],
  ): string => {
    return content.replace(/src="([^"]+)"/g, (match, src) => {
      // Si ya es una URL completa o data URI, dejarla como está
      if (
        src.startsWith("http://") ||
        src.startsWith("https://") ||
        src.startsWith("data:") ||
        src.startsWith("blob:")
      ) {
        return match;
      }

      // Extraer solo el nombre del archivo del src (por si tiene path)
      const filename = src.split("/").pop() || src;

      // Buscar si el filename existe en el array de imagenUrl
      const matchingUrl = imageUrls.find((url) => {
        const urlFilename = url.split("/").pop() || url;
        return urlFilename === filename || url === src;
      });

      // Si encontramos match en el array, convertir a URL completa
      if (matchingUrl) {
        return `src="${getFullImageUrl(matchingUrl)}"`;
      }

      // Si no está en el array pero parece un filename, convertirlo de todas formas
      return `src="${getImageUrl(src)}"`;
    });
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

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <Card className="p-12 text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Artículo no encontrado
            </h2>
            <p className="text-muted-foreground mb-6">
              El artículo que buscas no existe o ha sido eliminado.
            </p>
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio
              </Link>
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Link>
          </Button>
        </div>

        <article className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Badge variant="outline" className="mb-4">
              {getCategoryLabel(article.categoria)}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4 text-balance">
              {article.titulo}
            </h1>
            <p className="text-xl text-muted-foreground mb-6 text-pretty">
              {article.resumen || article.excerpt}
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Por {article.autor}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(article.creadoEn || "").toLocaleDateString(
                    "es-ES",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-8 rounded-lg overflow-hidden bg-muted min-h-96 flex items-center justify-center">
            {article.imagenUrl && article.imagenUrl.length > 0 ? (
              <img
                src={getFullImageUrl(article.imagenUrl[0])}
                alt={article.titulo}
                className="w-full h-auto object-cover"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = "/logo.png";
                }}
              />
            ) : (
              <img
                src="/logo.png"
                alt="La Nota Digital"
                className="w-full h-auto object-cover p-8"
              />
            )}
          </div>

          <Card className="p-8">
            <div className="prose prose-lg max-w-none">
              <div
                className="text-foreground leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: processContentImages(
                    article.contenido.replace(/\n/g, "<br/>"),
                    article.imagenUrl || [],
                  ),
                }}
              />
            </div>
          </Card>

          <div className="mt-8 pt-8 border-t border-border">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">
              MÁS EN {getCategoryLabel(article.categoria).toUpperCase()}
            </h3>
            <Button variant="outline" asChild>
              <Link href={`/categoria/${article.categoria}`}>
                Ver más artículos de {getCategoryLabel(article.categoria)}
              </Link>
            </Button>
          </div>
        </article>
      </main>
    </div>
  );
}
