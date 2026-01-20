"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
import { ArrowLeft, Save, Upload, X } from "lucide-react";
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
  >("politica");
  const [imagenUrl, setImagenUrl] = useState("");
  const [publicado, setPublicado] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

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
          if (article.autorId !== user.id && user.role !== "admin") {
            router.push("/escritor");
            return;
          }

          setTitulo(article.titulo);
          setResumen(article.resumen || "");
          setContenido(article.contenido);
          setCategoria(article.categoria);
          setImagenUrl(article.imagenUrl || "");
          setPublicado(article.publicado || false);
          setLoading(false);
        } else {
          router.push("/escritor");
        }
      };
      loadArticle();
    }
  }, [user, id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!titulo || !resumen || !contenido) {
      setError("Por favor completa todos los campos obligatorios");
      return;
    }

    try {
      let finalImageUrl = imagenUrl;

      // Si hay archivo subido, subirlo primero
      if (uploadedFile) {
        const formData = new FormData();
        formData.append("file", uploadedFile);

        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/image`, {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Error al subir la imagen");
        }

        const uploadData = await uploadResponse.json();
        // Convertir /upload/ a /upload/image/
        let imageUrl = uploadData.url;
        if (imageUrl.startsWith('/upload/') && !imageUrl.startsWith('/upload/image/')) {
          imageUrl = imageUrl.replace('/upload/', '/upload/image/');
        }
        finalImageUrl = imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${imageUrl}`;
      }

      await updateArticle(id, {
        titulo,
        resumen,
        contenido,
        categoria,
        imagenUrl: finalImageUrl || undefined,
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
                <Label htmlFor="contenido">
                  Contenido <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="contenido"
                  value={contenido}
                  onChange={(e) => setContenido(e.target.value)}
                  placeholder="Escribe el contenido completo de tu artículo aquí..."
                  rows={15}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Imagen del Artículo (opcional)</Label>

                {previewUrl || imagenUrl ? (
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden border border-border">
                      <img
                        src={previewUrl || imagenUrl}
                        alt="Preview"
                        className="w-full h-64 object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImagenUrl("");
                          clearUpload();
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    {uploadedFile && (
                      <p className="text-sm text-muted-foreground">
                        ✅ Archivo subido: {uploadedFile?.name}
                      </p>
                    )}
                    {!uploadedFile && imagenUrl && (
                      <p className="text-sm text-muted-foreground">
                        ✅ Imagen actual cargada
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

              <div className="flex items-center space-x-2">
                <Switch
                  id="publicado"
                  checked={publicado}
                  onCheckedChange={setPublicado}
                />
                <Label htmlFor="publicado">Publicar artículo</Label>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-3">
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
