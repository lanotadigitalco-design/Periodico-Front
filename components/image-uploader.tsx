"use client"

import { useState, useRef } from "react"
import { Upload, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

interface ImageUploaderProps {
  onImageUpload: (url: string) => void
  multiple?: boolean
  maxSize?: number // en MB
}

export function ImageUploader({ 
  onImageUpload, 
  multiple = false,
  maxSize = 5 
}: ImageUploaderProps) {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string>("")
  const [fileName, setFileName] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamaño
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSize) {
      toast({
        title: "Archivo muy grande",
        description: `El archivo no debe exceder ${maxSize}MB`,
        variant: "destructive",
      })
      return
    }

    // Validar que sea imagen
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Archivo inválido",
        description: "Solo se permiten archivos de imagen",
        variant: "destructive",
      })
      return
    }

    // Preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreview(event.target?.result as string)
      setFileName(file.name)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      toast({
        title: "Error",
        description: "Selecciona una imagen",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", fileInputRef.current.files[0])

      const token = localStorage.getItem("access_token")
      if (!token) {
        toast({
          title: "Error",
          description: "No hay sesión activa",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Error al subir la imagen")
      }

      const data = await response.json()
      // Convertir /upload/ a /upload/image/
      let imageUrl = data.url
      if (imageUrl.startsWith('/upload/') && !imageUrl.startsWith('/upload/image/')) {
        imageUrl = imageUrl.replace('/upload/', '/upload/image/')
      }
      const fullUrl = imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${imageUrl}`
      
      onImageUpload(fullUrl)
      
      toast({
        title: "✓ Imagen subida",
        description: "La imagen se ha subido correctamente",
      })

      // Reset
      setPreview("")
      setFileName("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error al subir",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setPreview("")
    setFileName("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="font-semibold">Subir Imagen</h3>

        {preview ? (
          <div className="space-y-3">
            <div className="relative inline-block">
              <img
                src={preview}
                alt="Preview"
                className="max-h-48 rounded-lg border"
              />
            </div>
            <p className="text-sm text-muted-foreground">{fileName}</p>
            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={loading}
                className="gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Subiendo..." : "Confirmar"}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 cursor-pointer transition"
            onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">Selecciona una imagen</p>
            <p className="text-xs text-muted-foreground">PNG, JPG o GIF (máx {maxSize}MB)</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </Card>
  )
}
