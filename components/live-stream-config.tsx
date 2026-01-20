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
import { getLiveStreamById, createLiveStream, updateLiveStream } from "@/lib/api";

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

  // Cargar configuración existente al montar
  useEffect(() => {
    const loadConfig = async () => {
      try {
        console.log("📡 Cargando configuración existente del live stream...");
        const data = await getLiveStreamById(1);
        console.log("✅ Configuración cargada:", data);
        
        if (data && data.url) {
          setConfig({
            url: data.url || "",
            titulo: data.titulo || "Mi Transmisión",
            descripcion: data.descripcion || "Descripción aquí",
            activo: data.activo ?? true,
          });
          console.log("✅ Formulario actualizado con datos guardados");
        } else {
          console.warn("⚠️ Datos incompletos recibidos:", data);
        }
      } catch (err) {
        console.warn("⚠️ No se pudo cargar configuración existente:", err);
        // Usar valores por defecto
      }
    };
    loadConfig();
  }, []);

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
      // Intentar actualizar con ID 1
      try {
        await updateLiveStream(1, { activo: newState });
      } catch (error) {
        // Si no existe, crear con el nuevo estado
        await createLiveStream({
          url: config.url,
          titulo: config.titulo,
          descripcion: config.descripcion,
          activo: newState,
        });
      }

      // Solo cambiar el estado LOCAL después de guardarlo en BD
      setConfig((prev) => ({
        ...prev,
        activo: newState,
      }));
      // No mostrar mensaje de éxito al cambiar estado
    } catch (err) {
      console.error("❌ Error al guardar estado:", err);
      setError("Error al guardar el estado");
    }
  };

  const handleSave = async () => {
    console.log("🔴 [GUARDAR INICIADO]");
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      console.log("🔴 [1] Validando URL...");
      // Validar URL si no está vacía
      if (config.url && !isValidUrl(config.url)) {
        console.log("🔴 [1] URL inválida:", config.url);
        setError(
          "Por favor ingresa una URL de transmisión válida (YouTube, Twitch, Facebook, etc.)",
        );
        setLoading(false);
        return;
      }

      console.log("🔴 [2] URL válida, preparando datos...");
      console.log("📤 Config actual:", config);

      // Solo enviar los campos que el servidor espera
      const configToSend = {
        url: config.url,
        titulo: config.titulo,
        descripcion: config.descripcion,
        activo: config.activo,
      };
      
      console.log("🔴 [3] Datos a enviar:", configToSend);

      // Intentar actualizar con ID 1
      try {
        console.log("🔴 [4] Intentando PATCH /live-stream/1...");
        console.log("📤 Datos PATCH:", configToSend);
        const result = await updateLiveStream(1, configToSend);
        console.log("✅ [4] PATCH exitoso:", result);
      } catch (error) {
        // Si no existe, crear
        console.log("🔴 [5] PATCH falló, intentando POST /live-stream...");
        console.log("📤 Datos POST:", configToSend);
        const result = await createLiveStream(configToSend);
        console.log("✅ [5] POST exitoso:", result);
      }

      console.log("✅ [FIN] Live stream guardado correctamente");
      setSuccess(true);
      setSaveDialog(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      console.error("❌ [ERROR FINAL]:", err);
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
          onClick={() => {
            console.log("🔘 [CLICK] Botón Guardar clickeado");
            console.log("🔘 [CONFIG ACTUAL]:", config);
            console.log("🔘 [URL VÁLIDA?]:", isValidUrl(config.url));
            setSaveDialog(true)
          }}
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
