import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import { Header } from "@/components/header"
import { LogoSection } from "@/components/logo-section"
import Script from "next/dist/client/script"
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
      
       <head>
  <Script
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5288202685612411"
  strategy="afterInteractive"
  crossOrigin="anonymous"
/>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-PDCZYWMEZW"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-PDCZYWMEZW');
            `,
          }}
          
        />
        
      </head>

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
        <div className="flex flex-col lg:flex-row gap-6 px-4 py-4 md:py-8 w-full">
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
