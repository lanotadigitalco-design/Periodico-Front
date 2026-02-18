"use client";

import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Switch } from "@/components/ui/switch";

import {
  Save,
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
  X,
  Upload,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createArticle, uploadImage, deleteImage } from "@/lib/api";

export default function NewArticlePage() {
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [history, setHistory] = useState<string[]>([""]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [resumen, setResumen] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState(""); // Para trackear la imagen original
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [publicado, setPublicado] = useState(false);
  const [contentImages, setContentImages] = useState<Map<string, File>>(
    new Map(),
  ); // Map de URL local -> File
  const [showPreview, setShowPreview] = useState(false);
  const [isDraggingBanner, setIsDraggingBanner] = useState(false);

  const router = useRouter();
  const { user } = useAuth();
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
  const [error, setError] = useState("");

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

    // Restaurar el foco y la posición del cursor
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

    // Seleccionar la URL para que el usuario pueda editarla fácilmente
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

    // Crear URL local para la imagen
    const imageUrl = URL.createObjectURL(file);
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Guardar el file asociado a la URL local
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

    // Reset input
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

    // Si no hay texto seleccionado, envolver toda la línea actual
    if (!text) {
      const lines = contenido.split("\n");
      let currentPos = 0;
      let lineIndex = 0;

      // Encontrar la línea actual
      for (let i = 0; i < lines.length; i++) {
        if (currentPos + lines[i].length >= start) {
          lineIndex = i;
          break;
        }
        currentPos += lines[i].length + 1; // +1 por el \n
      }

      // Envolver la línea actual
      lines[lineIndex] =
        `<div style="text-align: ${alignment}">${lines[lineIndex]}</div>`;
      const newContent = lines.join("\n");
      updateHistory(newContent);

      setTimeout(() => {
        textarea.focus();
      }, 0);
    } else {
      // Si hay texto seleccionado, envolverlo
      insertText(`<div style="text-align: ${alignment}">`, "</div>", "");
    }
  };

  const clearUpload = () => {
    setUploadedFile(null);
    setPreviewUrl("");
    setImagenFile(null);
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
      setImagenFile(file); // Guardar el archivo para subirlo después

      // Crear preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError("");
    }
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

  // Funciones para drag and drop del banner
  const handleBannerDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingBanner(true);
  };

  const handleBannerDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingBanner(false);
  };

  const handleBannerDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingBanner(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      processBannerImage(file);
    }
  };

  const handleBannerClick = () => {
    bannerInputRef.current?.click();
  };

  const handleBannerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processBannerImage(file);
    }
  };

  const processBannerImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona un archivo de imagen");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("El archivo no debe pesar más de 5MB");
      return;
    }

    setUploadedFile(file);
    setImagenFile(file);

    // Crear preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    setError("");
  };

  // Renderizar HTML puro (sin conversión markdown)
  const renderHTML = (text: string) => {
    // El texto ya está en HTML puro, solo convertir saltos de línea que no estén dentro de tags HTML
    let html = text;

    // Convertir saltos de línea simples a <br /> solo si no están dentro de tags HTML
    html = html.replace(/\n(?![^<]*>)/g, "<br />");

    return html;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!titulo || !resumen || !contenido) {
      setError("Por favor completa todos los campos obligatorios");
      setIsSubmitting(false);
      return;
    }

    if (!user) {
      setError("Debes iniciar sesión para crear un artículo");
      setIsSubmitting(false);
      return;
    }

    try {
      const imageUrls: string[] = [];
      let finalImagenUrl = imagenUrl;
      let updatedContenido = contenido;

      // 1. Subir la imagen principal primero
      if (imagenFile && !imagenUrl) {
        try {
          const uploadResponse = await uploadImage(imagenFile);
          finalImagenUrl = uploadResponse.filename;
          console.warn("Imagen principal subida:", finalImagenUrl);
        } catch (uploadError) {
          throw new Error(
            uploadError instanceof Error
              ? uploadError.message
              : "Error al subir la imagen principal",
          );
        }
      }

      // Agregar la imagen principal al array (si existe)
      if (finalImagenUrl) {
        imageUrls.push(finalImagenUrl);
      }

      // 2. Subir todas las imágenes del contenido
      if (contentImages.size > 0) {
        for (const [localUrl, file] of contentImages.entries()) {
          try {
            const uploadResponse = await uploadImage(file);

            // Agregar el filename al array de URLs para el backend
            imageUrls.push(uploadResponse.filename);

            // Reemplazar la URL local blob por la URL completa del servidor en el contenido
            updatedContenido = updatedContenido.replace(
              localUrl,
              uploadResponse.filename,
            );
          } catch (uploadError) {
            console.error(`Error al subir imagen ${file.name}:`, uploadError);
            throw new Error(
              `Error al subir la imagen ${file.name}: ${uploadError instanceof Error ? uploadError.message : "Error desconocido"}`,
            );
          }
        }
      }

      await createArticle({
        titulo,
        resumen,
        contenido: updatedContenido,
        categoria,
        imagenUrl: imageUrls,
        autorId: user.id,
        publicado,
      });

      console.log("Imágenes subidas:", imageUrls);
      console.log("Contenido actualizado:", updatedContenido);

      router.push("/escritor");
    } catch (err) {
      console.error("Error:", err);
      setError(
        err instanceof Error ? err.message : "Error al crear el artículo",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (
      confirm(
        "¿Estás seguro de que deseas cancelar? Se perderán todos los cambios.",
      )
    ) {
      setTitulo("");
      setContenido("");
      setFiles([]);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Crear Nuevo Artículo
          </h1>
          <p className="text-muted-foreground">
            Escribe y publica tu contenido
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
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
              <Label htmlFor="resumen">
                Resumen <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="resumen"
                value={resumen}
                onChange={(e) => setResumen(e.target.value)}
                placeholder="Escribe un resumen atractivo para tu artículo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Imagen Principal del Artículo (Opcional)</Label>

              {/* Input oculto para el explorador de archivos */}
              <input
                ref={bannerInputRef}
                type="file"
                accept="* "
                onChange={handleBannerInputChange}
                className="hidden"
              />

              {/* Área de drag and drop */}
              {!previewUrl ? (
                <div
                  onClick={handleBannerClick}
                  onDragOver={handleBannerDragOver}
                  onDragLeave={handleBannerDragLeave}
                  onDrop={handleBannerDrop}
                  className={`
                    border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                    transition-all duration-200 ease-in-out
                    ${
                      isDraggingBanner
                        ? "border-primary bg-primary/10 scale-[1.02]"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }
                  `}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className={`
                      p-4 rounded-full transition-colors
                      ${isDraggingBanner ? "bg-primary/20" : "bg-muted"}
                    `}
                    >
                      <Upload
                        className={`w-8 h-8 ${isDraggingBanner ? "text-primary" : "text-muted-foreground"}`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">
                        {isDraggingBanner
                          ? "Suelta la imagen aquí"
                          : "Arrastra una imagen o haz clic para seleccionar"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, GIF hasta 5MB
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Vista previa de la imagen */
                <div className="relative border-2 border-border rounded-lg overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Vista previa"
                    className="w-full h-auto max-h-96 object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors shadow-lg"
                    title="Eliminar imagen"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
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
                  <SelectItem value="entretenimiento">Entretenimiento</SelectItem>
                  <SelectItem value="tendencias">Tendencias</SelectItem>
                  <SelectItem value="cordoba">Córdoba</SelectItem>
                  <SelectItem value="monteria">Montería</SelectItem>
                  <SelectItem value="turismo">Turismo</SelectItem>
                  <SelectItem value="educacion">Educación</SelectItem>
                  <SelectItem value="colombia">Colombia</SelectItem>
                  <SelectItem value="judicial">Judicial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Editor de texto rico */}
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
                    dangerouslySetInnerHTML={{ __html: renderHTML(contenido) }}
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

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button type="submit" className="gap-2">
                <Save className="w-4 h-4" />
                Save changes
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
