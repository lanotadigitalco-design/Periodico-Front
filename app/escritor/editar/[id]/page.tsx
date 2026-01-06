"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Header } from "@/components/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { getArticleById, updateArticle } from "@/lib/auth"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function EditArticlePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [titulo, setTitulo] = useState("")
  const [resumen, setResumen] = useState("")
  const [contenido, setContenido] = useState("")
  const [categoria, setCategoria] = useState<"politica" | "economia" | "deportes" | "cultura" | "mundo" | "opinion" | "tecnologia" | "salud" | "entretenimiento" | "tendencias">("politica")
  const [imagenUrl, setImagenUrl] = useState("")
  const [publicado, setPublicado] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== "writer" && user.role !== "admin"))) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      const loadArticle = async () => {
        const article = await getArticleById(id)
        if (article) {
          // Verificar que el usuario sea el autor o admin
          if (article.autorId !== user.id && user.role !== "admin") {
            router.push("/escritor")
            return
          }

          setTitulo(article.titulo)
          setResumen(article.resumen || "")
          setContenido(article.contenido)
          setCategoria(article.categoria)
          setImagenUrl(article.imagenUrl || "")
          setPublicado(article.publicado || false)
          setLoading(false)
        } else {
          router.push("/escritor")
        }
      }
      loadArticle()
    }
  }, [user, id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!titulo || !resumen || !contenido) {
      setError("Por favor completa todos los campos obligatorios")
      return
    }

    try {
      await updateArticle(id, {
        titulo,
        resumen,
        contenido,
        categoria,
        imagenUrl: imagenUrl || undefined,
        publicado,
      })

      router.push("/escritor")
    } catch (err) {
      setError("Error al actualizar el artículo")
    }
  }

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
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Editar Artículo</h1>
            <p className="text-muted-foreground">Actualiza el contenido de tu artículo</p>
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
                <Label htmlFor="imagenUrl">URL de Imagen (opcional)</Label>
                <Input
                  id="imagenUrl"
                  type="url"
                  value={imagenUrl}
                  onChange={(e) => setImagenUrl(e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                <p className="text-xs text-muted-foreground">Agrega una URL de imagen para ilustrar tu artículo</p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="publicado" checked={publicado} onCheckedChange={setPublicado} />
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
  )
}
