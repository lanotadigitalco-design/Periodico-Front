"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { CheckCircle, AlertCircle } from "lucide-react"

interface LiveStreamConfig {
  url: string
  titulo: string
  descripcion: string
  activo: boolean
}

export function LiveStreamConfigComponent() {
  const [config, setConfig] = useState<LiveStreamConfig>({
    url: "",
    titulo: "Mi Transmisión",
    descripcion: "Descripción aquí",
    activo: true,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [saveDialog, setSaveDialog] = useState(false)

  // Cargar configuración inicial
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch("http://192.168.1.33:5001/api/live-stream")
        if (response.ok) {
          const data = await response.json()
          setConfig(data)
        }
      } catch (err) {
        console.error("Error cargando configuración:", err)
      }
    }
    loadConfig()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setConfig(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleToggleActive = () => {
    setConfig(prev => ({
      ...prev,
      activo: !prev.activo
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const response = await fetch("http://192.168.1.33:5001/api/live-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        throw new Error("Error al guardar la configuración")
      }

      setSuccess(true)
      setSaveDialog(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  return (
    <div className="space-y-6">
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-700">Configuración guardada correctamente</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="url" className="text-sm font-medium">
            URL de la Transmisión <span className="text-red-500">*</span>
          </Label>
          <Input
            id="url"
            name="url"
            placeholder="https://www.youtube.com/watch?v=xxx"
            value={config.url}
            onChange={handleInputChange}
            className="text-sm"
          />
          {config.url && !isValidUrl(config.url) && (
            <p className="text-xs text-red-500">URL inválida</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="titulo" className="text-sm font-medium">
            Título <span className="text-red-500">*</span>
          </Label>
          <Input
            id="titulo"
            name="titulo"
            placeholder="Mi Transmisión"
            value={config.titulo}
            onChange={handleInputChange}
            className="text-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion" className="text-sm font-medium">
          Descripción
        </Label>
        <Textarea
          id="descripcion"
          name="descripcion"
          placeholder="Descripción de la transmisión"
          value={config.descripcion}
          onChange={handleInputChange}
          className="text-sm min-h-24 resize-none"
        />
      </div>

      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
        <div>
          <p className="font-medium text-sm">Estado de la transmisión</p>
          <p className="text-xs text-muted-foreground mt-1">
            {config.activo ? "La transmisión es visible en la página principal" : "La transmisión está oculta"}
          </p>
        </div>
        <Button
          onClick={handleToggleActive}
          variant={config.activo ? "default" : "outline"}
          size="sm"
        >
          {config.activo ? "Activa" : "Inactiva"}
        </Button>
      </div>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" size="sm">
          Cancelar
        </Button>
        <Button
          onClick={() => setSaveDialog(true)}
          disabled={!config.url || !isValidUrl(config.url) || loading}
          size="sm"
        >
          {loading ? "Guardando..." : "Guardar Configuración"}
        </Button>
      </div>

      <AlertDialog open={saveDialog} onOpenChange={setSaveDialog}>
        <AlertDialogContent className="w-[90vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Guardar configuración</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              ¿Estás seguro de que deseas guardar estos cambios en la transmisión en vivo?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel className="text-sm">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSave}
              className="text-sm"
            >
              Guardar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
