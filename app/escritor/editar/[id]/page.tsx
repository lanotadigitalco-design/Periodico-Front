"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Header } from "@/components/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { getArticleById, updateArticle } from "@/lib/auth";
import { uploadImage, deleteImage, getImageUrl } from "@/lib/api";
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Undo,
  Redo,
  Bold,
  Italic,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";
import Link from "next/link";

export default function EditArticlePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [titulo, setTitulo] = useState("");
  const [resumen, setResumen] = useState("");
  const [contenido, setContenido] = useState("");
  const [categoria, setCategoria] = useState<
    | "politica"
    | "economia"
    | "deportes"
    | "cultura"
    | "mundo"
    | "opinion"
    | "tecnologia"
    | "salud"
    | "entretenimiento"
    | "tendencias"
    | "cordoba"
    | "monteria"
    | "turismo"
    | "educacion"
    | "colombia"
    | "judicial"
  >("politica");
  const [imagenUrl, setImagenUrl] = useState("");
  const [originalImageUrl, setOriginalImageUrl] = useState(""); // Para trackear la imagen original
  const [allImageUrls, setAllImageUrls] = useState<string[]>([]); // Todas las imágenes del artículo
  const [publicado, setPublicado] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [history, setHistory] = useState<string[]>([""]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [contentImages, setContentImages] = useState<Map<string, File>>(
    new Map(),
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (
      !isLoading &&
      (!user || (user.role !== "writer" && user.role !== "admin"))
    ) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      const loadArticle = async () => {
        const article = await getArticleById(id);
        if (article) {
          // Verificar que el usuario sea el autor o admin
          if (article.autorId !== String(user.id) && user.role !== "admin") {
            router.push("/escritor");
            return;
          }

          setTitulo(article.titulo);
          setResumen(article.resumen || "");
          const content = article.contenido;
          setContenido(content);
          setHistory([content]);
          setHistoryIndex(0);
          setCategoria(article.categoria);

          // Manejar imagenUrl como array o string
          const imageUrlArray = Array.isArray(article.imagenUrl)
            ? article.imagenUrl
            : article.imagenUrl
              ? [article.imagenUrl]
              : [];

          setAllImageUrls(imageUrlArray);
          setImagenUrl(imageUrlArray[0] || "");
          setOriginalImageUrl(imageUrlArray[0] || ""); // Guardar URL original
          setPublicado(article.publicado || false);
          setLoading(false);
        } else {
          router.push("/escritor");
        }
      };
      loadArticle();
    }
  }, [user, id, router]);

  // Funciones del editor de texto
  const updateHistory = (newContent: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newContent);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setContenido(newContent);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setContenido(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setContenido(history[newIndex]);
    }
  };

  const getSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea) return { start: 0, end: 0, text: "" };
    return {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
      text: textarea.value.substring(
        textarea.selectionStart,
        textarea.selectionEnd,
      ),
    };
  };

  const insertText = (
    before: string,
    after: string = "",
    placeholder: string = "",
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { start, end, text } = getSelection();
    const selectedText = text || placeholder;
    const newText =
      contenido.substring(0, start) +
      before +
      selectedText +
      after +
      contenido.substring(end);

    updateHistory(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleBold = () => {
    insertText("<strong>", "</strong>", "texto en negrita");
  };

  const handleItalic = () => {
    insertText("<em>", "</em>", "texto en cursiva");
  };

  const handleLink = () => {
    const { text } = getSelection();
    const linkText = text || "texto del enlace";
    insertText(`<a href="https://ejemplo.com">`, "</a>", linkText);

    setTimeout(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const content = textarea.value;
      const urlStart = content.lastIndexOf("https://ejemplo.com");
      if (urlStart !== -1) {
        textarea.setSelectionRange(
          urlStart,
          urlStart + "https://ejemplo.com".length,
        );
        textarea.focus();
      }
    }, 10);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen");
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    const textarea = textareaRef.current;
    if (!textarea) return;

    setContentImages((prev) => {
      const newMap = new Map(prev);
      newMap.set(imageUrl, file);
      return newMap;
    });

    const { start } = getSelection();
    const newText =
      contenido.substring(0, start) +
      `<img src="${imageUrl}" alt="${file.name}" class="max-w-full h-auto rounded" />` +
      contenido.substring(start);
    updateHistory(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos =
        start +
        `<img src="${imageUrl}" alt="${file.name}" class="max-w-full h-auto rounded" />`
          .length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);

    e.target.value = "";
  };

  const handleImage = () => {
    imageInputRef.current?.click();
  };

  const handleVideo = () => {
    insertText(
      `<iframe width="560" height="315" src="https://youtube.com/embed/VIDEO_ID" frameborder="0" allowfullscreen></iframe>`,
      "",
      "",
    );
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    updateHistory(newContent);
  };

  const handleAlign = (alignment: "left" | "center" | "right" | "justify") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { start, end, text } = getSelection();

    if (!text) {
      const lines = contenido.split("\n");
      let currentPos = 0;
      let lineIndex = 0;

      for (let i = 0; i < lines.length; i++) {
        if (currentPos + lines[i].length >= start) {
          lineIndex = i;
          break;
        }
        currentPos += lines[i].length + 1;
      }

      lines[lineIndex] =
        `<div style="text-align: ${alignment}">${lines[lineIndex]}</div>`;
      const newContent = lines.join("\n");
      updateHistory(newContent);

      setTimeout(() => {
        textarea.focus();
      }, 0);
    } else {
      insertText(`<div style="text-align: ${alignment}">`, "</div>", "");
    }
  };

  const renderHTML = (text: string) => {
    let html = text;
    html = html.replace(/\n(?![^<]*>)/g, "<br />");
    return html;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!titulo || !resumen || !contenido) {
      setError("Por favor completa todos los campos obligatorios");
      return;
    }

    try {
      let finalBannerFilename = imagenUrl;
      let updatedContenido = contenido;
      const uploadedContentImages: string[] = []; // Track de filenames subidos

      // Si hay archivo subido para el banner, subirlo primero
      if (uploadedFile) {
        try {
          const uploadResponse = await uploadImage(uploadedFile);
          finalBannerFilename = uploadResponse.filename;

          // Eliminar la imagen anterior si existe y es diferente
          if (originalImageUrl && originalImageUrl !== finalBannerFilename) {
            try {
              const filename = originalImageUrl.split("/").pop();
              if (filename) {
                await deleteImage(filename);
              }
            } catch (deleteError) {}
          }
        } catch (uploadError) {
          throw new Error(
            uploadError instanceof Error
              ? uploadError.message
              : "Error al subir la imagen",
          );
        }
      }

      // Subir todas las imágenes nuevas del contenido (blob URLs)
      if (contentImages.size > 0) {
        for (const [localUrl, file] of contentImages.entries()) {
          try {
            const uploadResponse = await uploadImage(file);
            uploadedContentImages.push(uploadResponse.filename);
            updatedContenido = updatedContenido.replace(
              localUrl,
              uploadResponse.filename,
            );
          } catch (uploadError) {
            console.error(`Error al subir imagen ${file.name}:`, uploadError);
          }
        }
      }

      // Extraer todas las imágenes del contenido final (solo filenames)
      const contentImagesRegex = /<img[^>]+src="([^"]+)"/g;
      const contentImageFilenames = new Set<string>();
      let match;

      while ((match = contentImagesRegex.exec(updatedContenido)) !== null) {
        const src = match[1];
        // Extraer solo el filename, ignorando URLs completas y data URIs
        if (
          !src.startsWith("http://") &&
          !src.startsWith("https://") &&
          !src.startsWith("data:")
        ) {
          // Ya es un filename
          contentImageFilenames.add(src);
        } else if (src.startsWith("http://") || src.startsWith("https://")) {
          // Es una URL completa, extraer el filename
          const filename = src.split("/").pop();
          if (filename) {
            contentImageFilenames.add(filename);
          }
        }
      }

      // Construir array final de imágenes: banner + imágenes del contenido
      const finalImageArray: string[] = [];

      // Agregar banner si existe
      if (finalBannerFilename) {
        // Extraer solo el filename si es una URL
        const bannerFilename = finalBannerFilename.includes("/")
          ? finalBannerFilename.split("/").pop() || finalBannerFilename
          : finalBannerFilename;
        finalImageArray.push(bannerFilename);
      }

      // Agregar imágenes del contenido
      contentImageFilenames.forEach((filename) => {
        if (!finalImageArray.includes(filename)) {
          finalImageArray.push(filename);
        }
      });

      // Detectar imágenes eliminadas y eliminarlas del servidor
      const currentFilenames = allImageUrls.map((url) => {
        // Extraer filename de URL o devolver tal cual si ya es filename
        return url.includes("/") ? url.split("/").pop() || url : url;
      });

      for (const oldFilename of currentFilenames) {
        // Si la imagen ya no está en el array final y no es el banner nuevo
        if (
          !finalImageArray.includes(oldFilename) &&
          oldFilename !== finalBannerFilename
        ) {
          try {
            await deleteImage(oldFilename);
          } catch (deleteError) {}
        }
      }

      // Enviar actualización con array de filenames solamente
      await updateArticle(id, {
        titulo,
        resumen,
        contenido: updatedContenido,
        categoria,
        imagenUrl: finalImageArray, // Enviar como array de filenames
        publicado,
      });

      router.push("/escritor");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar el artículo",
      );
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Por favor sube un archivo de imagen");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("El archivo no debe pesar más de 5MB");
        return;
      }

      setUploadedFile(file);

      // Crear preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const clearUpload = () => {
    setUploadedFile(null);
    setPreviewUrl("");
  };

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

  const handleRemoveImage = async () => {
    // Si hay una imagen cargada, intentar eliminarla del servidor
    if (originalImageUrl) {
      try {
        const filename = originalImageUrl.split("/").pop();
        if (filename) {
          await deleteImage(filename);
          console.log("Imagen eliminada:", filename);
        }
      } catch (deleteError) {
        console.warn("No se pudo eliminar la imagen:", deleteError);
      }
    }
    setImagenUrl("");
    setOriginalImageUrl("");
    clearUpload();
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
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
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href="/escritor">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a mis artículos
          </Link>
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
              Editar Artículo
            </h1>
            <p className="text-muted-foreground">
              Actualiza el contenido de tu artículo
            </p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="titulo">
                  Título <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Escribe un título atractivo para tu artículo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Imagen del Artículo (opcional)</Label>

                {previewUrl || imagenUrl ? (
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden border border-border">
                      <img
                        src={previewUrl || getFullImageUrl(imagenUrl)}
                        alt="Preview"
                        className="w-full h-64 object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveImage}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    {uploadedFile && (
                      <p className="text-sm text-muted-foreground">
                        ✅ Archivo nuevo seleccionado: {uploadedFile?.name}
                      </p>
                    )}
                    {!uploadedFile && imagenUrl && (
                      <p className="text-sm text-muted-foreground">
                        ✅ Imagen actual del artículo
                      </p>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setImagenUrl("");
                        clearUpload();
                      }}
                    >
                      Cambiar imagen
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="imagen-upload"
                      />
                      <label
                        htmlFor="imagen-upload"
                        className="cursor-pointer block"
                      >
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">Sube una imagen</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, GIF hasta 5MB
                        </p>
                      </label>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">
                  Categoría <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={categoria}
                  onValueChange={(value: any) => setCategoria(value)}
                >
                  <SelectTrigger id="categoria">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="politica">Política</SelectItem>
                    <SelectItem value="economia">Economía</SelectItem>
                    <SelectItem value="deportes">Deportes</SelectItem>
                    <SelectItem value="cultura">Cultura</SelectItem>
                    <SelectItem value="mundo">Mundo</SelectItem>
                    <SelectItem value="opinion">Opinión</SelectItem>
                    <SelectItem value="tecnologia">Tecnología</SelectItem>
                    <SelectItem value="salud">Salud</SelectItem>
                    <SelectItem value="entretenimiento">
                      Entretenimiento
                    </SelectItem>
                    <SelectItem value="tendencias">Tendencias</SelectItem>
                    <SelectItem value="cordoba">Córdoba</SelectItem>
                    <SelectItem value="monteria">Montería</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resumen">
                  Resumen <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="resumen"
                  value={resumen}
                  onChange={(e) => setResumen(e.target.value)}
                  placeholder="Escribe un resumen breve del artículo (1-2 frases)"
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="contenido">
                    Contenido <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={!showPreview ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowPreview(false)}
                    >
                      Editor
                    </Button>
                    <Button
                      type="button"
                      variant={showPreview ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowPreview(true)}
                    >
                      Vista Previa
                    </Button>
                  </div>
                </div>

                {/* Hidden image input */}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {!showPreview ? (
                  /* Editor */
                  <div className="border border-border rounded-lg bg-background">
                    {/* Toolbar */}
                    <div className="bg-background border-b border-border px-3 py-2">
                      <div className="flex items-center gap-1 flex-wrap">
                        <button
                          type="button"
                          className="p-2 hover:bg-muted rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Undo (Ctrl+Z)"
                          onClick={handleUndo}
                          disabled={historyIndex === 0}
                        >
                          <Undo className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="p-2 hover:bg-muted rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Redo (Ctrl+Y)"
                          onClick={handleRedo}
                          disabled={historyIndex === history.length - 1}
                        >
                          <Redo className="w-4 h-4" />
                        </button>
                        <div className="w-px h-6 bg-border mx-1" />
                        <button
                          type="button"
                          className="p-2 hover:bg-muted rounded transition-colors"
                          title="Bold (Ctrl+B)"
                          onClick={handleBold}
                        >
                          <Bold className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="p-2 hover:bg-muted rounded transition-colors"
                          title="Italic (Ctrl+I)"
                          onClick={handleItalic}
                        >
                          <Italic className="w-4 h-4" />
                        </button>
                        <div className="w-px h-6 bg-border mx-1" />
                        <button
                          type="button"
                          className="p-2 hover:bg-muted rounded transition-colors"
                          title="Align left"
                          onClick={() => handleAlign("left")}
                        >
                          <AlignLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="p-2 hover:bg-muted rounded transition-colors"
                          title="Align center"
                          onClick={() => handleAlign("center")}
                        >
                          <AlignCenter className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="p-2 hover:bg-muted rounded transition-colors"
                          title="Align right"
                          onClick={() => handleAlign("right")}
                        >
                          <AlignRight className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="p-2 hover:bg-muted rounded transition-colors"
                          title="Justify"
                          onClick={() => handleAlign("justify")}
                        >
                          <AlignJustify className="w-4 h-4" />
                        </button>
                        <div className="w-px h-6 bg-border mx-1" />
                        <button
                          type="button"
                          className="p-2 hover:bg-muted rounded transition-colors"
                          title="Insert link"
                          onClick={handleLink}
                        >
                          <LinkIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="p-2 hover:bg-muted rounded transition-colors"
                          title="Insert image"
                          onClick={handleImage}
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="p-2 hover:bg-muted rounded transition-colors"
                          title="Insert video"
                          onClick={handleVideo}
                        >
                          <Video className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Text Area */}
                    <Textarea
                      ref={textareaRef}
                      id="contenido"
                      value={contenido}
                      onChange={handleContentChange}
                      placeholder="Escribe el contenido completo de tu artículo aquí..."
                      rows={20}
                      required
                      className="border-0 rounded-none focus-visible:ring-0 h-[600px]"
                    />
                  </div>
                ) : (
                  /* Preview */
                  <div className="border border-border rounded-lg overflow-hidden bg-background">
                    <div className="bg-muted/30 border-b border-border px-3 py-2">
                      <span className="text-sm font-medium text-foreground">
                        Vista Previa del Contenido
                      </span>
                    </div>
                    <div
                      className="p-4 min-h-[600px] prose prose-sm max-w-none overflow-auto"
                      dangerouslySetInnerHTML={{
                        __html: processContentImages(
                          renderHTML(contenido),
                          allImageUrls,
                        ),
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="publicado"
                  checked={publicado}
                  onCheckedChange={setPublicado}
                />
                <Label htmlFor="publicado">Publicar artículo</Label>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex flex-col md:flex-row gap-3">
                <Button type="submit" size="lg">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
                <Button type="button" variant="outline" size="lg" asChild>
                  <Link href="/escritor">Cancelar</Link>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
