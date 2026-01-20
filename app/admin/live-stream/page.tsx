"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { LiveStreamPlayer } from "@/components/live-stream-player";

interface LiveStreamConfig {
  isActive: boolean;
  streamUrl: string;
  title: string;
  description: string;
  updatedAt: string;
}

export default function LiveStreamAdminPage() {
  const [config, setConfig] = useState<LiveStreamConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    isActive: false,
    streamUrl: "",
    title: "Transmisión en Vivo",
    description: "Síguenos en directo",
  });

  // Cargar configuración al montar
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/live-stream");
        if (response.ok) {
          const data = await response.json();
          setConfig(data);
          setFormData({
            isActive: data.isActive,
            streamUrl: data.streamUrl,
            title: data.title,
            description: data.description,
          });
        }
      } catch (error) {
        console.error("Error cargando configuración:", error);
        setMessage({ type: "error", text: "Error al cargar la configuración" });
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch("/live-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setConfig(data);
        setMessage({
          type: "success",
          text: "Configuración guardada correctamente",
        });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({
          type: "error",
          text: "Error al guardar la configuración",
        });
      }
    } catch (error) {
      console.error("Error guardando:", error);
      setMessage({ type: "error", text: "Error al guardar la configuración" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Administrar Transmisión en Vivo
          </h1>
          <p className="text-muted-foreground">
            Configura y controla la transmisión en vivo que aparecerá en la
            página principal
          </p>
        </div>

        {message && (
          <Alert
            variant={message.type === "success" ? "default" : "destructive"}
          >
            <div className="flex items-center gap-2">
              {message.type === "success" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {message.text}
            </div>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Formulario */}
          <Card className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Configuración</h2>
            </div>

            {/* Toggle Activo/Inactivo */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-semibold">
                  Estado de la transmisión
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.isActive ? "✅ Activo" : "⏸️ Inactivo"}
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>

            {/* URL del stream */}
            <div className="space-y-2">
              <Label htmlFor="streamUrl" className="font-semibold">
                URL de la transmisión
              </Label>
              <Input
                id="streamUrl"
                placeholder="https://youtube.com/watch?v=... o https://twitch.tv/... o https://facebook.com/video.php?v=..."
                value={formData.streamUrl}
                onChange={(e) =>
                  setFormData({ ...formData, streamUrl: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Soporta: YouTube, Twitch, Facebook Live o URL de embed directa
              </p>
            </div>

            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title" className="font-semibold">
                Título
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description" className="font-semibold">
                Descripción
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            {/* Info de última actualización */}
            {config && (
              <div className="pt-4 border-t text-sm text-muted-foreground">
                <p>
                  Última actualización:{" "}
                  {new Date(config.updatedAt).toLocaleString("es-ES")}
                </p>
              </div>
            )}

            {/* Botón guardar */}
            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar configuración"
              )}
            </Button>
          </Card>

          {/* Preview */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold mb-4">Vista previa</h2>
            </div>
            <LiveStreamPlayer
              isActive={formData.isActive}
              streamUrl={formData.streamUrl}
              title={formData.title}
              description={formData.description}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
