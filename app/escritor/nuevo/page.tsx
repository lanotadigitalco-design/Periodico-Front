"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { createArticle } from "@/lib/auth"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

export default function NewArticlePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [titulo, setTitulo] = useState("")
  const [resumen, setResumen] = useState("")
  const [contenido, setContenido] = useState("")
  const [categoria, setCategoria] = useState<"politica" | "economia" | "deportes" | "cultura" | "mundo" | "opinion" | "tecnologia" | "salud" | "entretenimiento" | "tendencias">("politica")
  const [imagenUrl, setImagenUrl] = useState("")
  const [imagenFile, setImagenFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [publicado, setPublicado] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== "writer" && user.role !== "admin"))) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    if (!titulo || !resumen || !contenido) {
      setError("Por favor completa todos los campos obligatorios")
      setIsSubmitting(false)
      return
    }

    if (!imagenUrl && !imagenFile) {
      setError("Por favor agrega una imagen (URL o archivo)")
      setIsSubmitting(false)
      return
    }

    if (!user) {
      setError("Debes iniciar sesión para crear un artículo")
      setIsSubmitting(false)
      return
    }

    try {
      let finalImagenUrl = imagenUrl

      // Si se seleccionó un archivo, subirlo primero
      if (imagenFile && !imagenUrl) {
        const formData = new FormData()
        formData.append("file", imagenFile)

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error("Error al subir la imagen")
        }

        const uploadData = await uploadResponse.json()
        finalImagenUrl = uploadData.url
      }

      await createArticle({
        titulo,
        resumen,
        contenido,
        categoria,
        imagenUrl: finalImagenUrl || undefined,
        autor: user.name,
        autorId: user.id,
        publicado,
      })

      router.push("/escritor")
    } catch (err) {
      console.error("Error:", err)
      setError(err instanceof Error ? err.message : "Error al crear el artículo")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar que sea imagen
      if (!file.type.startsWith("image/")) {
        setError("Por favor selecciona un archivo de imagen válido")
        return
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen no debe superar 5MB")
        return
      }

      setImagenFile(file)
      setImagenUrl("") // Limpiar URL si se selecciona archivo

      // Crear preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageUrlChange = (url: string) => {
    setImagenUrl(url)
    setImagenFile(null)
    setPreviewUrl("") // Limpiar preview
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Cargando...</p>
          </Card>
        </main>
      </div>
    )
  }

  if (!user || (user.role !== "writer" && user.role !== "admin")) {
    return null
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
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Crear Nuevo Artículo</h1>
            <p className="text-muted-foreground">Escribe y publica tu contenido periodístico</p>
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
                <Select value={categoria} onValueChange={(value: any) => setCategoria(value)}>
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
                <Label>Imagen <span className="text-destructive">*</span></Label>
                <p className="text-xs text-muted-foreground mb-3">Puedes usar una imagen local o una URL</p>
                
                <div className="space-y-4">
                  {/* Subir archivo */}
                  <div className="space-y-2">
                    <Label htmlFor="imagenFile" className="text-sm">Subir Imagen</Label>
                    <div className="relative">
                      <Input
                        id="imagenFile"
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        disabled={isSubmitting}
                        className="cursor-pointer"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Formatos: JPG, PNG, GIF, WebP. Máximo 5MB</p>
                  </div>

                  {/* Preview de imagen */}
                  {(previewUrl || imagenUrl) && (
                    <div className="relative">
                      <img
                        src={previewUrl || imagenUrl}
                        alt="Vista previa"
                        className="w-full h-48 object-cover rounded-lg border border-border"
                        onError={() => {
                          setError("No se pudo cargar la imagen")
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => {
                          setImagenFile(null)
                          setImagenUrl("")
                          setPreviewUrl("")
                        }}
                      >
                        ✕
                      </Button>
                    </div>
                  )}

                  {/* O usar URL */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-border"></div>
                      <span className="text-xs text-muted-foreground px-2">O</span>
                      <div className="flex-1 h-px bg-border"></div>
                    </div>
                    <Label htmlFor="imagenUrl" className="text-sm">Usar URL de Imagen</Label>
                    <Input
                      id="imagenUrl"
                      type="url"
                      value={imagenUrl}
                      onChange={(e) => handleImageUrlChange(e.target.value)}
                      placeholder="https://ejemplo.com/imagen.jpg"
                      disabled={imagenFile !== null || isSubmitting}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="publicado" checked={publicado} onCheckedChange={setPublicado} />
                <Label htmlFor="publicado">Publicar inmediatamente</Label>
              </div>

              {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</p>}

              <div className="flex gap-3">
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Procesando..." : publicado ? "Publicar Artículo" : "Guardar Borrador"}
                </Button>
                <Button type="button" variant="outline" size="lg" asChild disabled={isSubmitting}>
                  <Link href="/escritor">Cancelar</Link>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  )
}
