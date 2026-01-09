"use client"

import { Card } from "@/components/ui/card"

interface LiveStreamPlayerProps {
  isActive: boolean
  streamUrl: string
  title?: string
  description?: string
}

export function LiveStreamPlayer({
  isActive,
  streamUrl,
  title = "Transmisión en Vivo",
  description = "Síguenos en directo",
}: LiveStreamPlayerProps) {
  if (!isActive || !streamUrl) {
    return null
  }

  // Detectar si es YouTube, Twitch, Facebook o embed directo
  const isYoutube = streamUrl.includes("youtube.com") || streamUrl.includes("youtu.be")
  const isTwitch = streamUrl.includes("twitch.tv")
  const isFacebook = streamUrl.includes("facebook.com") || streamUrl.includes("fb.watch")

  let embedUrl = streamUrl

  if (isYoutube) {
    // Convertir URL de YouTube a embed
    const videoId = streamUrl.split("v=")[1]?.split("&")[0] || streamUrl.split("/").pop()
    embedUrl = `https://www.youtube.com/embed/${videoId}`
  } else if (isTwitch) {
    // Convertir URL de Twitch a embed
    const channelName = streamUrl.split("twitch.tv/")[1]?.split("/")[0]
    embedUrl = `https://player.twitch.tv/?channel=${channelName}&parent=${typeof window !== "undefined" ? window.location.hostname : ""}`
  } else if (isFacebook) {
    // Convertir URL de Facebook a embed
    // Soporta: facebook.com/video.php?v=ID, facebook.com/watch/?v=ID, facebook.com/pagename/videos/ID
    embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(streamUrl)}&show_text=false&width=500&height=280`
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-red-600 shadow-xl">
        {/* Encabezado */}
        <div className="bg-slate-900 px-4 md:px-6 py-4 border-b border-red-600 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl md:text-2xl font-bold text-white">{title}</h3>
            <p className="text-sm text-slate-400 mt-1">{description}</p>
          </div>
          <div className="flex-shrink-0 ml-4">
            <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-white uppercase tracking-wider">EN VIVO</span>
            </div>
          </div>
        </div>

        {/* Reproductor - Contenedor con aspect ratio 16:9 */}
        <div className="w-full bg-white overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
          {isFacebook ? (
            <div className="w-full h-full flex items-center justify-center bg-white">
              <iframe
                src={embedUrl}
                title={title}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                style={{ border: "none" }}
              />
            </div>
          ) : (
            <iframe
              src={embedUrl}
              title={title}
              className="w-full h-full"
              allowFullScreen
              allow="autoplay; fullscreen; picture-in-picture"
              style={{ border: "none" }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-900 px-4 md:px-6 py-3 border-t border-red-600">
          <p className="text-xs md:text-sm text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
            Seguimiento en tiempo real de los acontecimientos más importantes del día
          </p>
        </div>
      </div>
    </div>
  )
}
