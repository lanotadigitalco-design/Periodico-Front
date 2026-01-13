"use client"

interface BreakingNews {
  label: string
  news: string[]
}

export function BreakingNewsBar() {
  const breaking: BreakingNews = {
    label: "ÚLTIMA HORA",
    news: [
      "Gobierno anuncia reforma electoral para fortalecer la democracia",
      "Nuevas medidas económicas entrarán en vigor el próximo mes",
      "Se esperan cambios significativos en el sector financiero",
    ],
  }

  // Crear un texto continuo con separadores
  const continuousText = breaking.news.join(" • ") + " • " + breaking.news.join(" • ") + " • "

  return (
    <div className="bg-black text-white overflow-hidden">
      <style>{`
        @keyframes ticker {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .ticker-container {
          display: flex;
          animation: ticker 30s linear infinite;
        }
      `}</style>
      <div className="container mx-auto px-4 py-3 flex items-center gap-3">
        <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded flex-shrink-0 whitespace-nowrap">
          {breaking.label}
        </span>
        <div className="flex-1 overflow-hidden">
          <div className="ticker-container whitespace-nowrap text-sm md:text-base">
            {continuousText}
          </div>
        </div>
      </div>
    </div>
  )
}
