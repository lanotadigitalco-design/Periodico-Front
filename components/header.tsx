"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, User, LogOut, ChevronDown, Menu, X } from "lucide-react"
import { useAuth } from "./auth-provider"
import { logout } from "@/lib/auth"
import { api } from "@/lib/api"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"

interface LiveStreamConfig {
  url: string
  titulo: string
  descripcion: string
  activo: boolean
  actualizadoEn?: string
}

export function Header() {
  const { user, setUser } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [liveStreamConfig, setLiveStreamConfig] = useState<LiveStreamConfig | null>(null)
  const headerRef = useRef<HTMLDivElement>(null)


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
        setIsMobileMenuOpen(false)
      }
    }

    if (isDropdownOpen || isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("touchstart", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [isDropdownOpen, isMobileMenuOpen])

  // Resetear isLoggingOut cuando el usuario cambie
  useEffect(() => {
    setIsLoggingOut(false)
  }, [user])

  // Cargar configuración del live stream
  useEffect(() => {
    const loadLiveStreamConfig = async () => {
      try {
        const response = await fetch("https://api.lanotadigital.co/api/live-stream")
        if (response.ok) {
          const text = await response.text()
          if (text) {
            const data = JSON.parse(text)
            setLiveStreamConfig(data)
          }
        }
      } catch (error) {
        // Error silencioso, usar logo por defecto
      }
    }

    loadLiveStreamConfig()
  }, [])

  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    logout()
    setUser(null)
    setIsLoggingOut(false)
    router.push("/")
  }

  const sections = [
   { name: "Política", href: "/categoria/politica" },
    { name: "Economía", href: "/categoria/economia" },
    { name: "Educacion", href: "/categoria/educacion" },
    { name: "Judicial", href: "/categoria/judicial" },
    { name: "Deportes", href: "/categoria/deportes" },
    { name: "Cultura", href: "/categoria/cultura" },
    { name: "Mundo", href: "/categoria/mundo" },
    { name: "Colombia", href: "/categoria/colombia" },
    { name: "Córdoba", href: "/categoria/cordoba" },
    { name: "Montería", href: "/categoria/monteria" },
    { name: "Turismo", href: "/categoria/turismo" },
    { name: "Opinión", href: "/categoria/opinion" },
    { name: "Tecnología", href: "/categoria/tecnologia" },
    { name: "Salud", href: "/categoria/salud" },
    { name: "Entretenimiento", href: "/categoria/entretenimiento" },
    { name: "Tendencias", href: "/categoria/tendencias" },
  ]

  const mainSections = sections.slice(0, 10)
  const moreSections = sections.slice(10)

  // Mostrar menú hamburguesa en pantallas < md (768px)
  const showMobileMenu = true // Se controla con Tailwind md:hidden

  return (
    <header 
      className={cn(
        "flex-1 relative transition-all duration-300",
        isLoggingOut && "opacity-0"
      )} 
      ref={headerRef}
    >
      <div className="container mx-auto px-2 md:px-4">
        {/* Logo centrado en móvil */}
        <div className="lg:hidden flex items-center gap-1 py-1.5 min-h-10">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 flex-shrink-0"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
          <Link href="/" className="flex items-center justify-center flex-1">
            <Image src="/logo.png" alt="La Nota Digital" width={500} height={100} className="h-10 w-auto" priority />
          </Link>
          <div className="flex items-center gap-2">
            {liveStreamConfig?.activo && (
              <a href={liveStreamConfig.url} target="_blank" rel="noopener noreferrer" className="inline-block">
                <Badge variant="destructive" className="animate-pulse text-xs cursor-pointer hover:opacity-80 transition-opacity">
                  <Play className="w-2 h-2 mr-1" />
                </Badge>
              </a>
            )}
            {user ? (
              <div className="flex items-center gap-1">
                {user.role === "admin" && (
                  <Button size="sm" variant="outline" asChild className="text-xs h-7 px-2">
                    <Link href="/admin">Admin</Link>
                  </Button>
                )}
                {user.role === "writer" && (
                  <Button size="sm" variant="outline" asChild className="text-xs h-7 px-2">
                    <Link href="/escritor">Artículos</Link>
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={handleLogout} className="h-7 w-7">
                  <LogOut className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" asChild className="text-xs h-7 w-7 p-0">
                <Link href="/login">
                  <User className="w-3 h-3" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Header Desktop */}
        <div className="hidden lg:flex items-center justify-between gap-4 py-1 md:py-3 lg:py-4">
          <div className="flex items-center gap-1 md:gap-3 flex-1 min-w-0 overflow-x-auto">
            {/* Navegación de Secciones - Desktop */}
            <nav className="hidden lg:flex gap-2 ml-4 md:ml-6 lg:ml-8 border-l border-border pl-3 md:pl-4 flex-wrap md:flex-nowrap">
              {mainSections.map((section) => {
                const isActive = pathname.includes(section.href.split("/").pop() || "")
                return (
                  <Link
                    key={section.href}
                    href={section.href}
                    className={cn(
                      "text-sm font-medium whitespace-nowrap transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {section.name}
                  </Link>
                )
              })}
              
              {/* Dropdown de más categorías */}
              <div className="relative" ref={useRef(null)}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  Más
                  <ChevronDown className="w-3 h-3" />
                </button>
                
                {isDropdownOpen && (
                  <div className="fixed bg-card border border-border rounded-md shadow-lg z-50 min-w-max" style={{top: '3.5rem', left: 'auto', right: 'auto'}}>
                    {moreSections.map((section) => {
                      const isActive = pathname.includes(section.href.split("/").pop() || "")
                      return (
                        <Link
                          key={section.href}
                          href={section.href}
                          className={cn(
                            "block px-4 py-2 text-sm font-medium transition-colors first:rounded-t-md last:rounded-b-md hover:bg-muted",
                            isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                          )}
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          {section.name}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            </nav>
          </div>

          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            {liveStreamConfig?.activo && (
              <a href={liveStreamConfig.url} target="_blank" rel="noopener noreferrer" className="inline-block">
                <Badge variant="destructive" className="animate-pulse text-xs md:text-sm cursor-pointer hover:opacity-80 transition-opacity">
                  <Play className="w-2 h-2 md:w-3 md:h-3 mr-1" />
                  <span className="hidden md:inline">EN VIVO</span>
                </Badge>
              </a>
            )}

            {user ? (
              <div className="flex items-center gap-1 md:gap-2">
                <div className="text-xs md:text-sm text-foreground font-medium hidden md:block">
                  {user.nombre}
                </div>
                {user.role === "admin" && (
                  <Button size="sm" variant="outline" asChild className="text-xs sm:text-sm">
                    <Link href="/admin">Admin</Link>
                  </Button>
                )}
                {user.role === "writer" && (
                  <Button size="sm" variant="outline" asChild className="text-xs sm:text-sm">
                    <Link href="/escritor">Mis Artículos</Link>
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={handleLogout} className="h-8 w-8 md:h-10 md:w-10">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" asChild className="text-xs md:text-sm">
                <Link href="/login">
                  <User className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  <span className="hidden md:inline">Iniciar Sesión</span>
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Navegación de Secciones - Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed top-14 left-0 right-0 w-full bg-card max-h-[calc(100vh-56px)] overflow-y-auto z-40 border-b border-border rounded-b-lg">
            <nav className="flex flex-col">
              <Link href="/" className="text-sm font-medium text-foreground hover:bg-muted transition-colors py-3 px-4 border-b border-border last:border-b-0">
                Inicio
              </Link>
              {sections.map((section) => {
                const isActive = pathname.includes(section.href.split("/").pop() || "")
                return (
                  <Link
                    key={section.href}
                    href={section.href}
                    className={cn(
                      "text-sm font-medium transition-colors py-3 px-4 border-b border-border last:border-b-0 hover:bg-muted",
                      isActive ? "text-primary bg-muted" : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {section.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        )}

      </div>
    </header>
  )
}
