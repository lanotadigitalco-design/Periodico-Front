import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import { Header } from "@/components/header"
import { LogoSection } from "@/components/logo-section"
const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "La Nota Digital - Noticias en Vivo",
  description: "La Nota Digital - Tu fuente confiable de noticias en tiempo real con transmisiones en vivo",
  icons: {
    icon: [
      {
        url: "/favicon.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/favicon.png",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          <div className="relative border-b border-border bg-card sticky top-0 z-50">
            <div className="absolute left-16 md:left-20 lg:left-24 top-1/2 -translate-y-1/2 hidden lg:block">
              <LogoSection />
            </div>
            <div className="pl-16 md:pl-28 lg:pl-40">
              <Header />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-6 px-4 py-4 md:py-8 max-w-7xl mx-auto">
            <main className="flex-1">
              {children}
            </main>
          </div>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
