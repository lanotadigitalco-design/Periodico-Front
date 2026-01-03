import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import { Header } from "@/components/header"
import { LogoSection } from "@/components/logo-section"
import { AdvertisingSidebar } from "@/components/advertising-sidebar"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "La Nota Digital - Noticias en Vivo",
  description: "La Nota Digital - Tu fuente confiable de noticias en tiempo real con transmisiones en vivo",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
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
            <div className="absolute left-24 top-1/2 -translate-y-1/2 hidden md:block">
              <LogoSection />
            </div>
            <div className="pl-4 md:pl-40">
              <Header />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-6 px-4 py-4 md:py-8 max-w-7xl mx-auto">
            <main className="flex-1">
              {children}
            </main>
            <div className="ml-auto mr-0 -mr-4 lg:-mr-8">
              <AdvertisingSidebar />
            </div>
          </div>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
