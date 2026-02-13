"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  getArticles,
  getArchivedArticles,
  deleteArticle,
  updateArticle,
  type Article,
} from "@/lib/api";
import { Trash2, Edit, PlusCircle, Eye, EyeOff, Search, X } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ARTICLES_PER_PAGE = 10;

export default function WriterPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [archivedArticles, setArchivedArticles] = useState<Article[]>([]);
  const [articleFilter, setArticleFilter] = useState<
    "todos" | "publicados" | "archivados"
  >("todos");
  const [deleteArticleDialogOpen, setDeleteArticleDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (
      !isLoading &&
      (!user || (user.role !== "writer" && user.role !== "admin"))
    ) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && (user.role === "writer" || user.role === "admin")) {
      const loadArticles = async () => {
        const allArticles = await getArticles();
        const allArchivedArticles = await getArchivedArticles();
        // Los escritores solo ven sus propios artículos, los admins ven todos
        const userArticles =
          user.role === "admin"
            ? allArticles
            : allArticles.filter(
                (a) => a.authorId === user.id || a.author === user.nombre,
              );
        const userArchived =
          user.role === "admin"
            ? allArchivedArticles
            : allArchivedArticles.filter(
                (a) => a.authorId === user.id || a.author === user.nombre,
              );
        setArticles(userArticles);
        setArchivedArticles(userArchived);
      };
      loadArticles();
    }
  }, [user]);

  const handleDeleteArticle = (id: string) => {
    const article = articles.find((a) => a.id === id);
    setArticleToDelete({ id, title: article?.titulo || "Artículo" });
    setDeleteArticleDialogOpen(true);
  };

  const confirmDeleteArticle = async () => {
    if (!articleToDelete) return;
    const result = await deleteArticle(articleToDelete.id);

    if (result.success) {
      const allArticles = await getArticles();
      const allArchivedArticles = await getArchivedArticles();
      const userArticles =
        user?.role === "admin"
          ? allArticles
          : allArticles.filter(
              (a) => a.authorId === user?.id || a.author === user?.nombre,
            );
      const userArchived =
        user?.role === "admin"
          ? allArchivedArticles
          : allArchivedArticles.filter(
              (a) => a.authorId === user?.id || a.author === user?.nombre,
            );
      setArticles(userArticles);
      setArchivedArticles(userArchived);
    } else {
      alert(`Error: ${result.message}`);
    }

    setDeleteArticleDialogOpen(false);
    setArticleToDelete(null);
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    await updateArticle(id, { publicado: !currentStatus });
    const allArticles = await getArticles();
    const allArchivedArticles = await getArchivedArticles();
    const userArticles =
      user?.role === "admin"
        ? allArticles
        : allArticles.filter(
            (a) => a.authorId === user?.id || a.author === user?.nombre,
          );
    const userArchived =
      user?.role === "admin"
        ? allArchivedArticles
        : allArchivedArticles.filter(
            (a) => a.authorId === user?.id || a.author === user?.nombre,
          );
    setArticles(userArticles);
    setArchivedArticles(userArchived);
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      politica: "Política",
      economia: "Economía",
      deportes: "Deportes",
      cultura: "Cultura",
    };
    return labels[cat] || cat;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Cargando...</p>
          </Card>
        </main>
      </div>
    );
  }

  if (!user || (user.role !== "writer" && user.role !== "admin")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-foreground mb-1 sm:mb-2">
              Mis Artículos
            </h1>
            <p className="text-xs sm:text-base text-muted-foreground">
              Gestiona y publica tu contenido
            </p>
          </div>
          <Button size="sm" asChild className="w-full sm:w-auto">
            <Link href="/escritor/nuevo">
              <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Nuevo
            </Link>
          </Button>
        </div>

        <Card>
          <div className="p-4 sm:p-6 border-b border-border">
            <h2 className="text-lg sm:text-2xl font-semibold text-foreground mb-4">
              Mis Artículos
            </h2>

            {/* Filtro de artículos */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                size="sm"
                variant={articleFilter === "todos" ? "default" : "outline"}
                onClick={() => {
                  setArticleFilter("todos");
                  setCurrentPage(1);
                  setSearchTerm("");
                }}
                className="text-xs sm:text-sm transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Todos ({articles.length + archivedArticles.length})
              </Button>
              <Button
                size="sm"
                variant={articleFilter === "publicados" ? "default" : "outline"}
                onClick={() => {
                  setArticleFilter("publicados");
                  setCurrentPage(1);
                  setSearchTerm("");
                }}
                className="text-xs sm:text-sm transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Publicados ({articles.filter((a) => a.publicado).length})
              </Button>
              <Button
                size="sm"
                variant={articleFilter === "archivados" ? "default" : "outline"}
                onClick={() => {
                  setArticleFilter("archivados");
                  setCurrentPage(1);
                  setSearchTerm("");
                }}
                className="text-xs sm:text-sm transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Archivados ({archivedArticles.length})
              </Button>
            </div>

            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar artículos por título..."
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

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Título</TableHead>
                  <TableHead className="hidden sm:table-cell min-w-[100px]">
                    Categoría
                  </TableHead>
                  <TableHead className="hidden md:table-cell min-w-[80px]">
                    Estado
                  </TableHead>
                  <TableHead className="hidden lg:table-cell min-w-[80px]">
                    Fecha
                  </TableHead>
                  <TableHead className="text-right min-w-[80px]">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  let displayArticles: Article[] = [];
                  if (articleFilter === "publicados") {
                    displayArticles = articles.filter((a) => a.publicado);
                  } else if (articleFilter === "archivados") {
                    displayArticles = archivedArticles;
                  } else {
                    displayArticles = [...articles, ...archivedArticles];
                  }

                  // Aplicar búsqueda
                  if (searchTerm) {
                    displayArticles = displayArticles.filter(
                      (a) =>
                        a.titulo
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        a.title
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase()),
                    );
                  }

                  // Paginación
                  const totalPages = Math.ceil(
                    displayArticles.length / ARTICLES_PER_PAGE,
                  );
                  const paginatedArticles = displayArticles.slice(
                    (currentPage - 1) * ARTICLES_PER_PAGE,
                    currentPage * ARTICLES_PER_PAGE,
                  );

                  return paginatedArticles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center gap-4">
                          <p className="text-muted-foreground">
                            {searchTerm
                              ? "No hay artículos que coincidan con tu búsqueda"
                              : articleFilter === "publicados"
                                ? "No tienes artículos publicados"
                                : articleFilter === "archivados"
                                  ? "No tienes artículos archivados"
                                  : "Aún no has creado ningún artículo"}
                          </p>
                          {!searchTerm && (
                            <Button asChild>
                              <Link href="/escritor/nuevo">
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Crear tu primer artículo
                              </Link>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedArticles.map((article, index) => (
                      <TableRow
                        key={article.id}
                        className="animate-in fade-in duration-300 slide-in-from-left-4"
                        style={{
                          animationDelay: `${index * 50}ms`,
                        }}
                      >
                        <TableCell className="font-medium max-w-xs sm:max-w-md">
                          <Link
                            href={`/articulo/${article.id}`}
                            className="hover:text-primary transition-colors line-clamp-2"
                          >
                            {article.titulo}
                          </Link>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className="text-xs">
                            {getCategoryLabel(article.categoria)}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge
                            variant={
                              article.publicado ? "default" : "secondary"
                            }
                            className="text-xs"
                          >
                            {article.publicado ? "Publicado" : "Archivado"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {new Date(article.creadoEn || "").toLocaleDateString(
                            "es-ES",
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleTogglePublish(
                                  article.id,
                                  article.publicado,
                                )
                              }
                              title={
                                article.publicado ? "Despublicar" : "Publicar"
                              }
                            >
                              {article.publicado ? (
                                <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />
                              ) : (
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="hidden sm:inline-flex"
                            >
                              <Link href={`/escritor/editar/${article.id}`}>
                                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteArticle(article.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  );
                })()}
              </TableBody>
            </Table>
          </div>

          {(() => {
            let displayArticles: Article[] = [];
            if (articleFilter === "publicados") {
              displayArticles = articles.filter((a) => a.publicado);
            } else if (articleFilter === "archivados") {
              displayArticles = archivedArticles;
            } else {
              displayArticles = [...articles, ...archivedArticles];
            }

            if (searchTerm) {
              displayArticles = displayArticles.filter(
                (a) =>
                  a.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  a.title?.toLowerCase().includes(searchTerm.toLowerCase()),
              );
            }

            const totalPages = Math.ceil(
              displayArticles.length / ARTICLES_PER_PAGE,
            );

            return (
              totalPages > 1 && (
                <div className="flex justify-center p-4 border-t border-border">
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
              )
            );
          })()}
        </Card>

        <Card className="mt-6 p-4 sm:p-6 bg-muted/50">
          <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">
            Tus Estadísticas
          </h3>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div>
              <p className="text-xl sm:text-2xl font-bold text-foreground">
                {articles.length + archivedArticles.length}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-foreground">
                {articles.filter((a) => a.publicado).length}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Publicados
              </p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-foreground">
                {archivedArticles.length}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Archivados
              </p>
            </div>
          </div>
        </Card>

        <AlertDialog
          open={deleteArticleDialogOpen}
          onOpenChange={setDeleteArticleDialogOpen}
        >
          <AlertDialogContent className="w-[90vw] max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar artículo?</AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                ¿Estás seguro de que deseas eliminar "{articleToDelete?.title}"?
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel className="text-sm">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteArticle}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-sm"
              >
                Eliminar
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
