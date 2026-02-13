import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { Header } from "@/components/header";
import { LogoSection } from "@/components/logo-section";
import Link from "next/link";
import {
  Info,
  Mail,
  Twitter,
  Facebook,
  Youtube,
  Instagram,
} from "lucide-react";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://lanotadigital.co"),
  title: {
    default: "La Nota Digital - Noticias en Vivo",
    template: "%s | La Nota Digital",
  },
  description:
    "La Nota Digital - Tu fuente confiable de noticias en tiempo real con transmisiones en vivo. Noticias de Montería, Colombia y el mundo.",
  keywords: [
    "Noticias",
    "Montería",
    "Colombia",
    "Córdoba",
    "Noticias en Vivo",
    "La Nota Digital",
  ],
  authors: [{ name: "La Nota Digital" }],
  creator: "La Nota Digital",
  publisher: "La Nota Digital",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "https://lanotadigital.co",
    siteName: "La Nota Digital",
    title: "La Nota Digital - Noticias en Vivo",
    description:
      "Tu fuente confiable de noticias en tiempo real con transmisiones en vivo. Noticias de Montería, Colombia y el mundo.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "La Nota Digital",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@Lanotadigitalc",
    creator: "@Lanotadigitalc",
    title: "La Nota Digital - Noticias en Vivo",
    description:
      "Tu fuente confiable de noticias en tiempo real con transmisiones en vivo",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "G-PDCZYWMEZW",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
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
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-PDCZYWMEZW"
        ></script>
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
            <div className="absolute left-16 md:left-20 lg:left-24 top-1/2 -translate-y-1/2 hidden lg:block">
              <LogoSection />
            </div>
            <div className="pl-16 md:pl-28 lg:pl-40">
              <Header />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-6 px-4 py-4 md:py-8 max-w-7xl mx-auto min-h-[calc(100vh-400px)]">
            <main className="flex-1">{children}</main>
          </div>

          {/* Footer */}
          <footer className="border-t border-border bg-card mt-12 w-full">
            <div className="w-full px-4 py-8">
              <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-3 gap-8">
                  <div>
                    <h3 className="font-serif font-bold text-lg mb-4">
                      La Nota Digital
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Tu fuente confiable de noticias en tiempo real
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Información</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>
                        <Link
                          href="/quienes-somos"
                          className="hover:text-foreground transition-colors flex items-center gap-2"
                        >
                          <Info className="w-4 h-4" />
                          Quiénes somos
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/contacto"
                          className="hover:text-foreground transition-colors flex items-center gap-2"
                        >
                          <Mail className="w-4 h-4" />
                          Contacto
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Síguenos</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>
                        <a
                          href="https://x.com/Lanotadigitalc"
                          className="hover:text-foreground transition-colors flex items-center gap-2"
                        >
                          <Twitter className="w-4 h-4" />
                          Twitter
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://www.facebook.com/notadigitalco"
                          className="hover:text-foreground transition-colors flex items-center gap-2"
                        >
                          <Facebook className="w-4 h-4" />
                          Facebook
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://www.youtube.com/@LaNotaDigitalCo"
                          className="hover:text-foreground transition-colors flex items-center gap-2"
                        >
                          <Youtube className="w-4 h-4" />
                          YouTube
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://www.instagram.com/lanotadigital.co/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-foreground transition-colors flex items-center gap-2"
                        >
                          <Instagram className="w-4 h-4" />
                          Instagram
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://www.tiktok.com/@lanotadigitalco"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-foreground transition-colors flex items-center gap-2"
                        >
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.86 2.86 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0_0_0_4.77_1.52v-3.4a4.85 _ - .54-.05z" />
                          </svg>
                          TikTok
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
                  <p>
                    &copy; 2026 La Nota Digital. Todos los derechos reservados.
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
