"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle, AlertCircle } from "lucide-react";

interface LiveStreamConfig {
  url: string;
  titulo: string;
  descripcion: string;
  activo: boolean;
}

export function LiveStreamConfigComponent() {
  const [config, setConfig] = useState<LiveStreamConfig>({
    url: "",
    titulo: "Mi Transmisión",
    descripcion: "Descripción aquí",
    activo: true,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [saveDialog, setSaveDialog] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggleActive = async () => {
    const newState = !config.activo;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("No hay token de autenticación.");
        return;
      }

      // Solo enviar el cambio de estado, sin requerir otros campos válidos
      const configToSend = {
        activo: newState,
      };

      const baseUrl = "https://api.lanotadigital.co/api";

      let response = await fetch(`${baseUrl}/live-stream/1`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(configToSend),
      });

      if (response.status === 404) {
        // Si no existe, crear con todos los datos
        response = await fetch(`${baseUrl}/live-stream`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            url: config.url,
            titulo: config.titulo,
            descripcion: config.descripcion,
            activo: newState,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Error al guardar el estado");
        return;
      }

      // Solo cambiar el estado LOCAL después de guardarlo en BD
      setConfig((prev) => ({
        ...prev,
        activo: newState,
      }));
      // No mostrar mensaje de éxito al cambiar estado
    } catch (err) {
      setError("Error al guardar el estado");
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError(
          "No hay token de autenticación. Por favor, inicia sesión como administrador.",
        );
        return;
      }

      // Solo enviar los campos que el servidor espera
      const configToSend = {
        url: config.url,
        titulo: config.titulo,
        descripcion: config.descripcion,
        activo: config.activo,
      };

      const baseUrl = "https://api.lanotadigital.co/api";

      // Intentar PATCH primero (actualizar con ID 1)
      let response = await fetch(`${baseUrl}/live-stream/1`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(configToSend),
      });

      // Si PATCH retorna 404, intentar POST para crear
      if (response.status === 404) {
        response = await fetch(`${baseUrl}/live-stream`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(configToSend),
        });
      }

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage =
          responseData.message ||
          responseData.error ||
          `Error ${response.status}`;
        throw new Error(errorMessage);
      }

      setSuccess(true);
      setSaveDialog(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const isValidUrl = (url: string) => {
    if (!url) return true; // URL vacía es válida (opcional)
    try {
      new URL(url);
      // Validar que sea una URL de transmisión conocida
      if (
        !url.includes("youtube.com") &&
        !url.includes("youtu.be") &&
        !url.includes("twitch.tv") &&
        !url.includes("facebook.com") &&
        !url.includes("fb.watch")
      ) {
        return false; // Solo aceptar plataformas conocidas
      }
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-6">
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-700">
            Configuración guardada correctamente
          </p>
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
            {config.activo
              ? "La transmisión es visible en la página principal"
              : "La transmisión está oculta"}
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
              ¿Estás seguro de que deseas guardar estos cambios en la
              transmisión en vivo?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel className="text-sm">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSave} className="text-sm">
              Guardar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
